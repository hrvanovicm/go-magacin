package unit

import (
	"context"
	apperrors "hrvanovicm/magacin/errors"

	"github.com/jmoiron/sqlx"
)

// FindAll
func FindAll(ctx context.Context, tx *sqlx.Tx) ([]UnitMeasure, error) {
	unitMeasurements := []UnitMeasure{}

	query := `SELECT id, name, is_integer FROM unit_measurements`
	if err := tx.SelectContext(ctx, &unitMeasurements, query); err != nil {
		return unitMeasurements, apperrors.NewSQLError(query, err)
	}

	return unitMeasurements, nil
}

// Save
func Save(ctx context.Context, tx *sqlx.Tx, um *UnitMeasure) error {
	if um.ID == 0 {
		query := `INSERT INTO unit_measurements (name, is_integer) VALUES (?, ?) RETURNING id`
		if err := tx.QueryRowxContext(ctx, query, um.Name, um.IsInteger).Scan(&um.ID); err != nil {
			return apperrors.NewSQLError(query, err)
		}
	} else {
		query := `UPDATE unit_measurements SET name = ?, is_integer = ? WHERE id = ?`
		_, err := tx.ExecContext(ctx, query, um.Name, um.IsInteger, um.ID)
		if err != nil {
			return apperrors.NewSQLError(query, err)
		}
	}

	return nil
}

// CountProducts
func CountProducts(ctx context.Context, tx *sqlx.Tx, id int64) (int64, error) {
	var count int64 = 0

	query := `SELECT COUNT(id) FROM articles WHERE unit_measure_id = ?`
	if err := tx.GetContext(ctx, &count, query, id); err != nil {
		return count, apperrors.NewSQLError(query, err)
	}

	return count, nil
}

// Delete
func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	numberOfProducts, err := CountProducts(ctx, tx, id)
	if err != nil {
		return err
	}

	if numberOfProducts > 0 {
		return NewUnitMeasureInUseError(id, numberOfProducts)
	}

	query := `DELETE FROM unit_measurements WHERE id = ?`
	if _, err = tx.ExecContext(ctx, query, id); err != nil {
		return apperrors.NewSQLError(query, err)
	}

	return err
}
