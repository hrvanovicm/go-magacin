package article

import (
	"context"

	"github.com/jmoiron/sqlx"
)

// GetAllCategories retrieves all available category constants from predefined values.
// Returns a slice of category strings and an error if retrieval fails.
func GetAllCategories(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	return []string{CategoryProduct, CategoryCommercial, CategoryRawMaterial}, nil
}

// GetAll retrieves all articles from the database, including optional unit measure details, using the provided context and transaction.
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

// GetRecipes retrieves a list of Recipe objects associated with a specific article identified by the given id.
// It executes a database query within the provided transaction to fetch the raw materials and their details.
func GetRecipes(ctx context.Context, tx *sqlx.Tx, id int64) ([]Recipe, error) {
	var unitMeasurements []Recipe

	query := `
				SELECT 
				    rm.id "raw_material.id", rm.name "raw_material.name", rm.code "raw_material.code", ar.amount,
				    COALESCE(um.id, 0) "raw_material.unit_measure.id", 
					COALESCE(um.name, '') "raw_material.unit_measure.name", 
					COALESCE(um.is_integer, 1) "raw_material.unit_measure.is_integer"
				FROM article_has_recipes ar
				JOIN articles rm ON rm.id = ar.raw_material_id
				JOIN unit_measurements um ON um.id = rm.unit_measure_id
				WHERE ar.article_id = $1
	`
	err := tx.SelectContext(ctx, &unitMeasurements, query, id)

	return unitMeasurements, err
}
