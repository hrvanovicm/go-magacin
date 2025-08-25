package article

import (
	"context"

	"github.com/jmoiron/sqlx"
)

func GetAllCategories(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	return []string{CategoryProduct, CategoryCommercial, CategoryRawMaterial}, nil
}

func GetAll(ctx context.Context, tx *sqlx.Tx) ([]Article, error) {
	var unitMeasurements []Article

	query := `
				SELECT 
				    a.id, a.category, a.code, a.name, a.in_stock_amount, a.in_stock_warning_amount, a.tags,
					um.id "unit_measure.id", um.name "unit_measure.name", um.is_integer "unit_measure.is_integer"
				FROM articles a
				LEFT JOIN unit_measurements um ON um.id = a.unit_measure_id
	`
	err := tx.SelectContext(ctx, &unitMeasurements, query)

	return unitMeasurements, err
}

func GetReceptions(ctx context.Context, tx *sqlx.Tx, id int64) ([]Reception, error) {
	var unitMeasurements []Reception

	query := `
				SELECT 
				    rm.id "raw_material.id", rm.name "raw_material.name", rm.code "raw_material.code",
					ar.amount
				FROM article_has_reception ar
				JOIN articles a ON a.id = ar.article_id
				JOIN articles rm ON rm.id = ar.raw_material_id
				WHERE ar.article_id = $1
	`
	err := tx.SelectContext(ctx, &unitMeasurements, query, id)

	return unitMeasurements, err
}

func SaveReceptions(ctx context.Context, tx *sqlx.Tx, articleId int64, receptions []Reception) error {
	existingReceptions, err := GetReceptions(ctx, tx, articleId)
	if err != nil {
		return err
	}

	for _, reception := range receptions {
		query := `SELECT EXISTS(SELECT 1 FROM article_has_reception WHERE article_id = $1 AND raw_material_id = $2)`

		var exists bool
		err := tx.GetContext(ctx, &exists, query, articleId, reception.RawMaterial.ID)
		if err != nil {
			return err
		}

		if exists {
			query = `UPDATE article_has_reception SET amount = $1 WHERE article_id = $2 AND raw_material_id = $3`
			_, err := tx.ExecContext(ctx, query, reception.Amount, articleId, reception.RawMaterial.ID)
			if err != nil {
				return err
			}
		} else {
			query = `INSERT INTO article_has_reception (article_id, raw_material_id, amount) VALUES ($1, $2, $3)`
			_, err := tx.ExecContext(ctx, query, articleId, reception.RawMaterial.ID, reception.Amount)
			if err != nil {
				return err
			}
		}
	}

	for _, existingReception := range existingReceptions {
		var exists bool = false

		for _, reception := range receptions {
			if existingReception.RawMaterial.ID == reception.RawMaterial.ID {
				exists = true
				break
			}
		}

		if !exists {
			query := `DELETE FROM article_has_reception WHERE article_id = $1 AND raw_material_id = $2`
			_, err := tx.ExecContext(ctx, query, articleId, existingReception.RawMaterial.ID)
			if err != nil {
				return err
			}
		}
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
		print(product.ID)
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
