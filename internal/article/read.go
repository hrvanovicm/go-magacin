package article

import (
	"context"
	apperrors "hrvanovicm/magacin/errors"

	"github.com/jmoiron/sqlx"
)

// FindAllCategories
func FindAllCategories(ctx context.Context, tx *sqlx.Tx) []string {
	return []string{CategoryProduct, CategoryCommercial, CategoryRawMaterial}
}

// FindAll
func FindAll(ctx context.Context, tx *sqlx.Tx) ([]Article, error) {
	articles := []Article{}

	query := `SELECT a.id, a.category, a.code, a.name, a.in_stock_amount, a.in_stock_warning_amount, a.tags,
					 COALESCE(um.id, 0) "unit_measure.id",
					 COALESCE(um.name, '') "unit_measure.name",
					 COALESCE(um.is_integer, 1) "unit_measure.is_integer"
			  FROM articles a
			  LEFT JOIN unit_measurements um ON um.id = a.unit_measure_id
			  ORDER BY a.id DESC
	`
	if err := tx.SelectContext(ctx, &articles, query); err != nil {
		return articles, apperrors.NewSQLError(query, err)
	}

	// QuickFix: return nil for unit measure if is not associated.
	// TODO
	for i := range articles {
		if articles[i].UnitMeasure.ID == 0 {
			articles[i].UnitMeasure = nil
		}
	}

	return articles, nil
}

// FindAllRecipes
func FindAllRecipes(ctx context.Context, tx *sqlx.Tx, id int64) ([]Recipe, error) {
	unitMeasurements := []Recipe{}

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
	if err := tx.SelectContext(ctx, &unitMeasurements, query, id); err != nil {
		return unitMeasurements, apperrors.NewSQLError(query, err)
	}

	return unitMeasurements, nil
}
