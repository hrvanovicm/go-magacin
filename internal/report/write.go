package report

import (
	"context"

	"github.com/jmoiron/sqlx"
)

func Save(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	if report.ID != 0 {
		query := `
			UPDATE reports 
			SET type = $1, code = $2, signed_at = $3, signed_at_location = $4, signed_by = $5 
            WHERE id = $6
		`
		_, err := tx.ExecContext(ctx, query, report.Type, report.Code, report.Date, report.PlaceOfPublish, report.SignedByName, report.ID)
		if err != nil {
			return err
		}
	} else {
		query := `
			INSERT INTO reports (type, code, signed_at, signed_at_location, signed_by) 
			VALUES ($1, $2, $3, $4, $5)
		`
		result, err := tx.ExecContext(ctx, query, report.Type, report.Code, report.Date, report.PlaceOfPublish, report.SignedByName)
		if err != nil {
			return err
		}

		id, err := result.LastInsertId()
		if err != nil {
			return err
		}

		report.ID = id
	}

	if report.Type == TypeReceipt {
		return saveReceipt(ctx, tx, report)
	} else if report.Type == TypeShipment {
		return saveShipment(ctx, tx, report)
	} else {
		panic("unknown report type")
	}
}

func saveReceipt(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	var isExists bool
	err := tx.GetContext(ctx, &isExists, `SELECT EXISTS(SELECT 1 FROM receipts WHERE report_id = $1)`, report.ID)
	if err != nil {
		return err
	}

	if !isExists {
		args := []interface{}{report.Receipt.SupplierCompany.Name, report.Receipt.SupplierReportCode, report.ID}
		query := `INSERT INTO receipts (supplier_company_name, supplier_report_code, report_id) VALUES ($1, $2, $3)`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	} else {
		args := []interface{}{report.Receipt.SupplierCompany.Name, report.Receipt.SupplierReportCode, report.ID}
		query := `UPDATE receipts SET supplier_company_name = $1, supplier_report_code = $2 WHERE report_id = $3`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}

func saveShipment(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	var isExists bool
	err := tx.GetContext(ctx, &isExists, `SELECT EXISTS(SELECT 1 FROM shipments WHERE report_id = $1)`, report.ID)
	if err != nil {
		return err
	}

	if !isExists {
		args := []interface{}{report.Shipment.ReceiptCompany.Name, report.ID}
		query := `INSERT INTO shipments (receipt_company_name, report_id) VALUES ($1, $2)`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	} else {
		args := []interface{}{report.Shipment.ReceiptCompany.Name, report.ID}
		query := `UPDATE shipments SET receipt_company_name = $1 WHERE report_id = $2`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}

func SaveArticles(ctx context.Context, tx *sqlx.Tx, reportId int64, art []ReportArticle) error {
	var ids = make([]int64, len(art))

	for _, a := range art {
		ids = append(ids, a.Article.ID)

		var isExists bool

		query := `SELECT EXISTS(SELECT 1 FROM report_has_articles WHERE report_id = $1 AND article_id = $2)`
		err := tx.GetContext(ctx, &isExists, query, reportId, a.Article.ID)
		if err != nil {
			return err
		}

		if !isExists {
			query = `INSERT INTO report_has_articles (report_id, article_id, amount) VALUES ($1, $2, $3)`
			_, err := tx.ExecContext(ctx, query, reportId, a.Article.ID, a.Amount)
			if err != nil {
				return err
			}
		} else {
			query = `UPDATE report_has_articles SET amount = $3 WHERE report_id = $1 AND article_id = $2`
			_, err := tx.ExecContext(ctx, query, reportId, a.Article.ID, a.Amount)
			if err != nil {
				return err
			}
		}

		err = saveRecipes(ctx, tx, reportId, a.Article.ID, a.Recipes)
		if err != nil {
			return err
		}
	}

	query, args, err := sqlx.In(`DELETE FROM report_has_articles WHERE report_id = ? AND article_id NOT IN (?)`, reportId, ids)
	query = tx.Rebind(query)
	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}

func saveRecipes(ctx context.Context, tx *sqlx.Tx, reportId int64, articleId int64, rcp []ReportRecipe) error {
	var ids = make([]int64, len(rcp)+1)

	for i, recipe := range rcp {
		var isExists bool
		ids[i] = recipe.RawMaterial.ID

		query := `SELECT EXISTS(SELECT 1 FROM report_has_recipes WHERE report_id = $1 AND article_id = $2 AND raw_material_id = $3)`
		err := tx.GetContext(ctx, &isExists, query, reportId, articleId, recipe.RawMaterial.ID)
		if err != nil {
			return err
		}

		if !isExists {
			query = `INSERT INTO report_has_recipes (report_id, article_id, raw_material_id, amount) VALUES ($1, $2, $3, $4)`
			_, err := tx.ExecContext(ctx, query, reportId, articleId, recipe.RawMaterial.ID, recipe.Amount)
			if err != nil {
				return err
			}
		} else {
			query = `UPDATE report_has_recipes SET amount = $4 WHERE report_id = $1 AND article_id = $2 AND raw_material_id = $3`
			_, err := tx.ExecContext(ctx, query, reportId, articleId, recipe.RawMaterial.ID, recipe.Amount)
			if err != nil {
				return err
			}
		}
	}

	// Fix query error on empty array.
	if len(rcp) == 0 {
		ids[0] = 0
	}

	query, args, err := sqlx.In(`DELETE FROM report_has_recipes WHERE report_id = ? AND article_id = ? AND raw_material_id NOT IN (?)`, reportId, articleId, ids)
	query = tx.Rebind(query)
	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}

func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	query := `DELETE FROM reports WHERE id = $1`
	_, err := tx.ExecContext(ctx, query, id)
	return err
}
