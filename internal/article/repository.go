package article

import (
	"context"

	"github.com/jmoiron/sqlx"
)

func GetAllCategories(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	return []string{CategoryProduct, CategoryCommercial, CategoryRawMaterial}, nil
}

func GetAll(ctx context.Context, tx *sqlx.Tx) ([]Article, error) {
	var articles []Article

	query := `SELECT a.id, a.category, a.code, a.name, a.in_stock_amount, a.in_stock_warning_amount, a.tags,
					 COALESCE(um.id, 0) "unit_measure.id", 
					 COALESCE(um.name, '') "unit_measure.name", 
					 COALESCE(um.is_integer, 1) "unit_measure.is_integer"
			  FROM articles a
			  LEFT JOIN unit_measurements um ON um.id = a.unit_measure_id
	`
	err := tx.SelectContext(ctx, &articles, query)

	for i := range articles {
		if articles[i].UnitMeasure.ID == 0 {
			articles[i].UnitMeasure = nil
		}
	}

	return articles, err
}

func GetReceptions(ctx context.Context, tx *sqlx.Tx, id int64) ([]Reception, error) {
	var unitMeasurements []Reception

	query := `
				SELECT 
				    rm.id "raw_material.id", rm.name "raw_material.name", rm.code "raw_material.code", ar.amount,
				    COALESCE(um.id, 0) "raw_material.unit_measure.id", 
					COALESCE(um.name, '') "raw_material.unit_measure.name", 
					COALESCE(um.is_integer, 1) "raw_material.unit_measure.is_integer"
				FROM article_has_reception ar
				JOIN articles rm ON rm.id = ar.raw_material_id
				JOIN unit_measurements um ON um.id = rm.unit_measure_id
				WHERE ar.article_id = $1
	`
	err := tx.SelectContext(ctx, &unitMeasurements, query, id)

	return unitMeasurements, err
}

func SaveReceptions(ctx context.Context, tx *sqlx.Tx, articleId int64, receptions []Reception) error {
	var ids = make([]int64, len(receptions))

	for i, reception := range receptions {
		ids[i] = reception.RawMaterial.ID

		query := `INSERT INTO article_has_reception (article_id, raw_material_id, amount) VALUES ($1, $2, $3)
				  ON CONFLICT (article_id, raw_material_id) DO UPDATE SET amount = EXCLUDED.amount`
		_, err := tx.ExecContext(ctx, query, articleId, reception.RawMaterial.ID, reception.Amount)
		if err != nil {
			return err
		}
	}

	query, args, err := sqlx.In(`DELETE FROM article_has_reception WHERE article_id = ? AND raw_material_id NOT IN (?)`, articleId, ids)
	query = tx.Rebind(query)
	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}

func Save(ctx context.Context, tx *sqlx.Tx, product *Article) error {
	if product.ID == 0 {
		query := `
			INSERT INTO articles (category, code, name, in_stock_amount, in_stock_warning_amount, unit_measure_id, tags) 
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`
		args := []interface{}{
			product.Category, product.Code, product.Name, product.InStockAmount, product.InStockWarningAmount, product.UnitMeasure.ID, product.Tags,
		}

		result, err := tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}

		id, err := result.LastInsertId()
		if err != nil {
			return err
		}

		product.ID = id
	} else {
		query := `UPDATE articles SET 
                    category = $1, code = $2, name = $3, in_stock_amount = $4, in_stock_warning_amount = $5, unit_measure_id = $6, tags = $7
                	WHERE id = $8`
		args := []interface{}{
			product.Category, product.Code, product.Name, product.InStockAmount, product.InStockWarningAmount, product.UnitMeasure.ID, product.Tags, product.ID,
		}

		_, err := tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}

func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	query := `DELETE FROM articles WHERE id = $1`
	_, err := tx.ExecContext(ctx, query, id)

	return err
}
