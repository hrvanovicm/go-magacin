package report

import (
	"context"
	apperrors "hrvanovicm/magacin/errors"
	"hrvanovicm/magacin/internal/article"

	"github.com/jmoiron/sqlx"
)

// Save
func Save(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	var query string

	args := map[string]any{
		"type":               report.Type,
		"code":               report.Code,
		"signed_at":          report.Date,
		"signed_at_location": report.PlaceOfPublish,
		"signed_by":          report.SignedByName,
	}

	if report.ID != 0 {
		query = `
			UPDATE reports
			SET type = :type, code = :code, signed_at = :signed_at, signed_at_location = :signed_at_location,
				signed_by = :signed_by
			WHERE id = :id RETURNING id
		`
		args["id"] = report.ID
	} else {
		query = `
			INSERT INTO reports (type, code, signed_at, signed_at_location, signed_by)
			VALUES (:type, :code, :signed_at, :signed_at_location, :signed_by) RETURNING id
		`
	}

	query, argsSlice, err := sqlx.Named(query, args)
	if err != nil {
		return apperrors.NewSQLError(query, err)
	}
	query = tx.Rebind(query)

	if err := tx.QueryRowxContext(ctx, query, argsSlice...).Scan(&report.ID); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	switch report.Type {
	case TypeReceipt:
		return saveReceipt(ctx, tx, report)
	case TypeShipment:
		return saveShipment(ctx, tx, report)
	default:
		return NewReportTypeUnknownError(string(report.Type))
	}
}

// saveReceipt
func saveReceipt(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	var exists bool

	query := `SELECT EXISTS(SELECT 1 FROM receipts WHERE report_id = ?)`
	if err := tx.GetContext(ctx, &exists, query, report.ID); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	args := map[string]any{
		"supplier_company_name": report.Receipt.SupplierCompany.Name,
		"supplier_report_code":  report.Receipt.SupplierReportCode,
		"report_id":             report.ID,
	}

	if !exists {
		query = `
				INSERT INTO receipts (supplier_company_name, supplier_report_code, report_id)
				VALUES (:supplier_company_name, :supplier_report_code, :report_id)
		`
	} else {
		query = `
				UPDATE receipts
				SET supplier_company_name = :supplier_company_name, supplier_report_code = :supplier_report_code
				WHERE report_id = :report_id
		`
	}

	query, argsSlice, err := sqlx.Named(query, args)
	if err != nil {
		return apperrors.NewSQLError(query, err)
	}
	query = tx.Rebind(query)

	if _, err := tx.ExecContext(ctx, query, argsSlice...); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return nil
}

// saveShipment
func saveShipment(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	args := map[string]any{
		"receipt_company_name": report.Shipment.ReceiptCompany.Name,
		"report_id":            report.ID,
	}

	query := `
			INSERT INTO shipments (receipt_company_name, report_id)
			VALUES (:receipt_company_name, :report_id)
			ON CONFLICT (report_id)
			DO UPDATE SET receipt_company_name = EXCLUDED.receipt_company_name
	`

	query, argsSlice, err := sqlx.Named(query, args)
	if err != nil {
		return apperrors.NewSQLError(query, err)
	}
	query = tx.Rebind(query)

	if _, err := tx.ExecContext(ctx, query, argsSlice...); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return nil
}

// SaveArticles
func SaveArticles(ctx context.Context, tx *sqlx.Tx, rep *Report, reportArticles []ReportArticle) error {
	var usedIDs = make([]int64, len(reportArticles))

	if err := resetStockAmount(ctx, tx, rep); err != nil {
		return err
	}

	for i, a := range reportArticles {
		usedIDs[i] = a.Article.ID

		query := `
				INSERT INTO report_has_articles (report_id, article_id, amount)
				VALUES (?, ?, ?)
				ON CONFLICT (report_id, article_id)
				DO UPDATE SET amount = EXCLUDED.amount
		`
		if _, err := tx.ExecContext(ctx, query, rep.ID, a.Article.ID, a.Amount); err != nil {
			return apperrors.NewSQLError(query, err)
		}

		if err := saveRecipes(ctx, tx, rep.ID, a.Article.ID, a.Recipes); err != nil {
			return apperrors.NewSQLError(query, err)
		}
	}

	if len(usedIDs) == 0 {
		query := `DELETE FROM report_has_articles WHERE report_id = $1`
		if _, err := tx.ExecContext(ctx, query, rep.ID); err != nil {
			return apperrors.NewSQLError(query, err)
		}
	} else {
		query := `DELETE FROM report_has_articles WHERE report_id = ? AND article_id NOT IN (?)`
		query, args, err := sqlx.In(query, rep.ID, usedIDs)
		if err != nil {
			return apperrors.NewSQLError(query, err)
		}
		query = tx.Rebind(query)
		if _, err = tx.ExecContext(ctx, query, args...); err != nil {
			return apperrors.NewSQLError(query, err)
		}
	}

	if err := updateStockAmounts(ctx, tx, rep, &reportArticles); err != nil {
		return err
	}

	return nil
}

// saveRecipes
func saveRecipes(ctx context.Context, tx *sqlx.Tx, reportId int64, articleId int64, rcp []ReportRecipe) error {
	var usedIDs = make([]int64, len(rcp))

	for i, recipe := range rcp {
		usedIDs[i] = recipe.RawMaterial.ID

		args := map[string]any{
			"report_id":       reportId,
			"article_id":      articleId,
			"raw_material_id": recipe.RawMaterial.ID,
			"amount":          recipe.Amount,
		}

		query := `
			INSERT INTO report_has_recipes (report_id, article_id, raw_material_id, amount)
			VALUES (:report_id, :article_id, :raw_material_id, :amount)
			ON CONFLICT (report_id, article_id, raw_material_id)
			DO UPDATE SET amount = EXCLUDED.amount;
		`

		query, argsSlice, err := sqlx.Named(query, args)
		if err != nil {
			return apperrors.NewSQLError(query, err)
		}
		query = tx.Rebind(query)

		if _, err := tx.ExecContext(ctx, query, argsSlice...); err != nil {
			return apperrors.NewSQLError(query, err)
		}
	}

	args := map[string]any{
		"report_id":  reportId,
		"article_id": articleId,
	}

	var query string
	if len(usedIDs) == 0 {
		query = `
				DELETE FROM report_has_recipes
				WHERE report_id = ? AND article_id = ?
		`
		if _, err := tx.ExecContext(ctx, query, args); err != nil {
			return apperrors.NewSQLError(query, err)
		}
	} else {
		query = `
				DELETE FROM report_has_recipes
				WHERE report_id = ? AND article_id = ? AND raw_material_id NOT IN (?)
		`

		args["raw_material_id"] = usedIDs
		query, bindings, err := sqlx.In(query, args)
		if err != nil {
			return apperrors.NewSQLError(query, err)
		}

		query = tx.Rebind(query)
		if _, err := tx.ExecContext(ctx, query, bindings); err != nil {
			return apperrors.NewSQLError(query, err)
		}
	}

	return nil
}

// Delete
func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	query := `DELETE FROM reports WHERE id = $1`
	if _, err := tx.ExecContext(ctx, query, id); err != nil {
		return err
	}

	return nil
}

// resetStockAmount
func resetStockAmount(ctx context.Context, tx *sqlx.Tx, rep *Report) error {
	existingRepArticles, err := FindArticlesByReportId(ctx, tx, rep.ID)
	if err != nil {
		return err
	}

	for _, arc := range existingRepArticles {
		switch rep.Type {
		case TypeReceipt:
			if err := article.DecreaseStock(ctx, tx, &arc.Article, arc.Amount); err != nil {
				return err
			}
		case TypeShipment:
			if err := article.IncreaseStock(ctx, tx, &arc.Article, arc.Amount); err != nil {
				return err
			}
		default:
			return NewReportTypeUnknownError(string(rep.Type))
		}

		for _, rec := range arc.Recipes {
			if err := article.IncreaseStock(ctx, tx, &rec.RawMaterial, rec.Amount); err != nil {
				return err
			}
		}
	}

	return nil
}

// updateStockAmounts
func updateStockAmounts(ctx context.Context, tx *sqlx.Tx, rep *Report, repArticles *[]ReportArticle) error {
	for i := range *repArticles {
		repArticle := &(*repArticles)[i]

		switch rep.Type {
		case TypeReceipt:
			if err := article.IncreaseStock(ctx, tx, &repArticle.Article, repArticle.Amount); err != nil {
				return err
			}
		case TypeShipment:
			if err := article.DecreaseStock(ctx, tx, &repArticle.Article, repArticle.Amount); err != nil {
				return err
			}
		default:
			return NewReportTypeUnknownError(string(rep.Type))
		}

		if !rep.CanUseRecipes() && len(repArticle.Recipes) >= 1 {
			return NewReportRecipeInvalidUseError(*rep)
		}

		if rep.CanUseRecipes() {
			for j := range repArticle.Recipes {
				rec := &repArticle.Recipes[j]
				if err := article.DecreaseStock(ctx, tx, &rec.RawMaterial, rec.Amount); err != nil {
					return err
				}
			}
		}
	}

	return nil
}
