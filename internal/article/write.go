package article

import (
	"context"
	apperrors "hrvanovicm/magacin/errors"

	"github.com/jmoiron/sqlx"
)

// SaveRecipes
func SaveRecipes(ctx context.Context, tx *sqlx.Tx, articleId int64, recipes []Recipe) error {
	var usedIDs = make([]int64, len(recipes))

	for i, recipe := range recipes {
		usedIDs[i] = recipe.RawMaterial.ID

		query := `
				INSERT INTO article_has_recipes (article_id, raw_material_id, amount)
				VALUES (?, ?, ?)
				ON CONFLICT (article_id, raw_material_id)
				DO UPDATE SET amount = EXCLUDED.amount
		`
		_, err := tx.ExecContext(ctx, query, articleId, recipe.RawMaterial.ID, recipe.Amount)
		if err != nil {
			return apperrors.NewSQLError(query, err)
		}
	}

	query, args, err := sqlx.In(
		`DELETE FROM article_has_recipes WHERE article_id = ? AND raw_material_id NOT IN (?)`,
		articleId, usedIDs,
	)
	query = tx.Rebind(query)
	if _, err = tx.ExecContext(ctx, query, args...); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return nil
}

// Save
func Save(ctx context.Context, tx *sqlx.Tx, product *Article) error {
	var unitMeasureID *int64

	if product.UnitMeasure != nil {
		unitMeasureID = &product.UnitMeasure.ID
	}

	args := map[string]any{
		"category":                product.Category,
		"code":                    product.Code,
		"name":                    product.Name,
		"in_stock_amount":         product.InStockAmount,
		"in_stock_warning_amount": product.InStockWarningAmount,
		"unit_measure_id":         unitMeasureID,
		"tags":                    product.Tags,
	}

	query := ""
	if product.ID == 0 {
		query = `
			INSERT INTO articles
				(category, code, name, in_stock_amount, in_stock_warning_amount, unit_measure_id, tags)
			VALUES
				(:category, :code, :name, :in_stock_amount, :in_stock_warning_amount, :unit_measure_id, :tags)
			RETURNING id
		`
	} else {
		query = `
			UPDATE articles
			SET category = :category,
				code = :code,
				name = :name,
				in_stock_amount = :in_stock_amount,
				in_stock_warning_amount = :in_stock_warning_amount,
				unit_measure_id = :unit_measure_id,
				tags = :tags
			WHERE id = :id
			RETURNING id
		`
		args["id"] = product.ID
	}

	query, argsSlices, err := sqlx.Named(query, args)
	if err != nil {
		return apperrors.NewSQLError(query, err)
	}
	query = tx.Rebind(query)

	if err := tx.QueryRowxContext(ctx, query, argsSlices...).Scan(&product.ID); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return nil
}

// Delete
func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	query := `DELETE FROM articles WHERE id = ?`
	if _, err := tx.ExecContext(ctx, query, id); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return nil
}

// IncreaseStock
func IncreaseStock(ctx context.Context, tx *sqlx.Tx, arc *Article, increasedAmount float32) error {
	query := `
			UPDATE articles
			SET in_stock_amount = (in_stock_amount + ?)
			WHERE id = ?
			RETURNING in_stock_amount
	`
	if err := tx.QueryRowxContext(ctx, query, increasedAmount, arc.ID).Scan(&arc.InStockAmount); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return nil
}

// DecreaseStock
func DecreaseStock(ctx context.Context, tx *sqlx.Tx, arc *Article, decreasedAmount float32) error {
	query := `
			UPDATE articles SET in_stock_amount = (in_stock_amount - ?)
			WHERE id = ?
			RETURNING in_stock_amount
	`
	if err := tx.GetContext(ctx, &arc.InStockAmount, query, decreasedAmount, arc.ID); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return nil
}
