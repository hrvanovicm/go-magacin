package report

import (
	"context"
	"fmt"
	apperrors "hrvanovicm/magacin/errors"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// FindAllTypes
func FindAllTypes() []ReportType {
	return []ReportType{TypeReceipt, TypeShipment}
}

// FindAllPublishLocations
func FindAllPublishLocations(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	locations := []string{}

	query := `SELECT DISTINCT signed_at_location FROM reports WHERE signed_at_location IS NOT NULL`
	if err := tx.SelectContext(ctx, &locations, query); err != nil {
		return locations, apperrors.NewSQLError(query, err)
	}

	return locations, nil
}

// FindAllSignUsers
func FindAllSignUsers(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	users := []string{}

	query := `SELECT DISTINCT signed_by FROM reports WHERE signed_by IS NOT NULL`
	if err := tx.SelectContext(ctx, &users, query); err != nil {
		return users, apperrors.NewSQLError(query, err)
	}

	return users, nil
}

// FindNextReportCode
func FindNextReportCode(ctx context.Context, tx *sqlx.Tx) (string, error) {
	var lastCode string

	query := `SELECT COALESCE(MAX(code), '') FROM reports`
	err := tx.GetContext(ctx, &lastCode, query)
	if err != nil {
		return lastCode, err
	}

	year := time.Now().Year() % 100
	if lastCode == "" {
		return fmt.Sprintf("%02d/1", year), err
	}

	re := regexp.MustCompile(`\D+`)
	parts := re.Split(lastCode, -1)
	if len(parts) == 0 {
		return fmt.Sprintf("%02d/1", year), err
	}

	lastNumStr := parts[len(parts)-1]
	lastNum, err := strconv.Atoi(lastNumStr)
	if err != nil {
		return "", nil
	}
	lastNum++

	separators := re.FindAllString(lastCode, -1)
	var newCode strings.Builder
	for i := 0; i < len(parts)-1; i++ {
		newCode.WriteString(parts[i])
		if i < len(separators) {
			newCode.WriteString(separators[i])
		}
	}
	newCode.WriteString(strconv.Itoa(lastNum))

	return newCode.String(), nil
}

// FindAllReports
func FindAllReports(ctx context.Context, tx *sqlx.Tx) ([]Report, error) {
	reports := []Report{}

	query := `SELECT
				r.id, r.type, r.code, r.signed_at, r.signed_at_location, r.signed_by,

				rec.supplier_report_code "receipt.supplier_report_code",
				rec.supplier_company_name "receipt.supplier_company.name",
				CASE
					WHEN EXISTS (SELECT 1 FROM in_house_companies ihc1 WHERE ihc1.name = rec.supplier_company_name)
					THEN TRUE
					ELSE FALSE
				END "receipt.supplier_company.in_house_production",

				shp.receipt_company_name "shipment.receipt_company.name",
				CASE
					WHEN EXISTS (SELECT 1 FROM in_house_companies ihc2 WHERE ihc2.name = shp.receipt_company_name)
					THEN TRUE
					ELSE FALSE
				END "shipment.receipt_company.in_house_production"

					FROM reports r
					LEFT JOIN receipts rec ON rec.report_id = r.id
					LEFT JOIN shipments shp ON shp.report_id = r.id

					ORDER BY r.id DESC
	`
	if err := tx.SelectContext(ctx, &reports, query); err != nil {
		return reports, apperrors.NewSQLError(query, err)
	}

	return reports, nil
}

// FindArticlesByReportId
func FindArticlesByReportId(ctx context.Context, tx *sqlx.Tx, reportId int64) ([]ReportArticle, error) {
	articles := []ReportArticle{}

	query := `
		SELECT a.id "article.id", a.category "article.category", a.code "article.code",
									a.name "article.name", a.in_stock_amount "article.in_stock_amount",
									a.in_stock_warning_amount "article.in_stock_warning_amount", a.tags "article.tags",
						COALESCE(um.id, 0) "article.unit_measure.id",
						COALESCE(um.name, '') "article.unit_measure.name",
						COALESCE(um.is_integer, 1) "article.unit_measure.is_integer",
						ra.amount
		FROM report_has_articles ra
		JOIN articles a ON ra.article_id = a.id
		LEFT JOIN unit_measurements um ON a.unit_measure_id = um.id
		WHERE report_id = ?
	`
	if err := tx.SelectContext(ctx, &articles, query, reportId); err != nil {
		return nil, apperrors.NewSQLError(query, err)
	}

	for i, a := range articles {
		query = `SELECT ra.id "raw_material.id", ra.category "raw_material.category", ra.code "raw_material.code",
									ra.name "raw_material.name", ra.in_stock_amount "raw_material.in_stock_amount",
									ra.in_stock_warning_amount "raw_material.in_stock_warning_amount", ra.tags "raw_material.tags",
						COALESCE(um.id, 0) "raw_material.unit_measure.id",
						COALESCE(um.name, '') "raw_material.unit_measure.name",
						COALESCE(um.is_integer, 1) "raw_material.unit_measure.is_integer",
						rr.amount
				FROM report_has_recipes rr
				JOIN articles ra ON rr.raw_material_id = ra.id
				JOIN unit_measurements um ON ra.unit_measure_id = um.id
				WHERE rr.report_id = ? AND rr.article_id = ?
		`
		if err := tx.SelectContext(ctx, &articles[i].Recipes, query, reportId, a.Article.ID); err != nil {
			return articles, apperrors.NewSQLError(query, err)
		}
	}

	return articles, nil
}
