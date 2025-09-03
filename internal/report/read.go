package report

import (
	"context"

	"github.com/jmoiron/sqlx"
)

func GetAllTypes() []ReportType {
	return []ReportType{TypeReceipt, TypeShipment}
}

func GetAllPublishLocations(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	var result []string

	query := `SELECT DISTINCT signed_at_location FROM reports`
	err := tx.SelectContext(ctx, &result, query)
	if err != nil {
		return result, err
	}

	return result, nil
}

func GetAllSignUsers(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	var result []string

	query := `SELECT DISTINCT signed_by FROM reports`
	err := tx.SelectContext(ctx, &result, query)
	if err != nil {
		return result, err
	}

	return result, nil
}

func GetNextReportCode(ctx context.Context, tx *sqlx.Tx) (string, error) {
	var result string

	query := `SELECT COALESCE(MAX(code), '') FROM reports`
	err := tx.GetContext(ctx, &result, query)
	if err != nil {
		return result, err
	}

	return result, nil
}

func GetAllReports(ctx context.Context, tx *sqlx.Tx) ([]Report, error) {
	var reports []Report

	query := `SELECT 
				r.id, r.type, r.code, r.signed_at, r.signed_at_location, r.signed_by,
				rec.supplier_report_code "receipt.supplier_report_code",
				rec.supplier_company_name "receipt.supplier_company.name",
				CASE 
					WHEN EXISTS (SELECT 1 FROM in_house_companies ihc WHERE ihc.name = rec.supplier_company_name) 
					THEN TRUE 
					ELSE FALSE 
				END as "receipt.supplier_company.in_house_production",
				shp.receipt_company_name "shipment.receipt_company.name",
				CASE 
					WHEN EXISTS (SELECT 1 FROM in_house_companies ihc WHERE ihc.name = shp.receipt_company_name) 
					THEN TRUE 
					ELSE FALSE 
				END as "shipment.receipt_company.in_house_production"
			  FROM reports r
			  LEFT JOIN receipts rec ON rec.report_id = r.id
			  LEFT JOIN shipments shp ON shp.report_id = r.id
	`
	err := tx.SelectContext(ctx, &reports, query)
	if err != nil {
		return nil, err
	}

	return reports, nil
}

func GetArticlesByReportId(ctx context.Context, tx *sqlx.Tx, reportId int64) ([]ReportArticle, error) {
	var articles []ReportArticle

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
		JOIN unit_measurements um ON a.unit_measure_id = um.id
		WHERE report_id = $1
	`
	err := tx.SelectContext(ctx, &articles, query, reportId)
	if err != nil {
		return nil, err
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
			 WHERE rr.report_id = $1 AND rr.article_id = $2
		`
		err = tx.SelectContext(ctx, &articles[i].Recipes, query, reportId, a.Article.ID)
		if err != nil {
			return nil, err
		}
	}

	return articles, nil
}
