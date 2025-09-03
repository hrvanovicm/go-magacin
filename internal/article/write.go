package article

import (
	"context"

	"github.com/jmoiron/sqlx"
)

// SaveRecipes updates or inserts recipes linked to an article, and deletes non-referenced recipes in a database transaction.
// ctx is the context for request scope, tx is the database transaction, articleId is the article's identifier,
// and receptions is the list of Recipe objects. Returns an error if any database operation fails.
func SaveRecipes(ctx context.Context, tx *sqlx.Tx, articleId int64, receptions []Recipe) error {
	var ids = make([]int64, len(receptions))

	for i, reception := range receptions {
		ids[i] = reception.RawMaterial.ID

		query := `INSERT INTO article_has_recipes (article_id, raw_material_id, amount) VALUES ($1, $2, $3)
				  ON CONFLICT (article_id, raw_material_id) DO UPDATE SET amount = EXCLUDED.amount`
		_, err := tx.ExecContext(ctx, query, articleId, reception.RawMaterial.ID, reception.Amount)
		if err != nil {
			return err
		}
	}

	query, args, err := sqlx.In(`DELETE FROM article_has_recipes WHERE article_id = ? AND raw_material_id NOT IN (?)`, articleId, ids)
	query = tx.Rebind(query)
	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}

// IncreateStock increments the in-stock amount of an article by the specified amount using the provided ID in a database transaction.
func IncreateStock(ctx context.Context, tx *sqlx.Tx, id int64, amount int64) error {
	query := `UPDATE articles SET in_stock_amount = in_stock_amount + $1 WHERE id = $2`
	_, err := tx.ExecContext(ctx, query, amount, id)

	return err
}

// DecreaseStock reduces the in-stock amount of an article by a given amount based on its ID within a transaction.
func DecreaseStock(ctx context.Context, tx *sqlx.Tx, id int64, amount int64) error {
	query := `UPDATE articles SET in_stock_amount = in_stock_amount - $1 WHERE id = $2`
	_, err := tx.ExecContext(ctx, query, amount, id)

	return err
}

// Save inserts or updates an Article record in the database using the provided transaction and context.
// If the Article ID is 0, a new record is inserted; otherwise, the existing record is updated.
// Returns an error if the operation fails.
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

// Delete removes a record from the "articles" table based on the provided ID.
// It expects a context, a transaction, and the ID of the record to be deleted. Returns an error if any occurs.
func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	query := `DELETE FROM articles WHERE id = $1`
	_, err := tx.ExecContext(ctx, query, id)

	return err
}
