package unit

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

func GetAll(ctx context.Context, tx *sqlx.Tx) ([]UnitMeasure, error) {
	var unitMeasurements []UnitMeasure

	query := `SELECT id, name, is_integer FROM unit_measurements`
	err := tx.SelectContext(ctx, &unitMeasurements, query)

	return unitMeasurements, err
}

func Save(ctx context.Context, tx *sqlx.Tx, um *UnitMeasure) error {
	if um.ID == 0 {
		query := `INSERT INTO unit_measurements (name, is_integer) VALUES ($1, $2)`
		args := []interface{}{um.Name, um.IsInteger}

		result, err := tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}

		id, err := result.LastInsertId()
		if err != nil {
			return err
		}

		um.ID = id
	} else {
		query := `UPDATE unit_measurements SET name = $1, is_integer = $2 WHERE id = $3`
		args := []interface{}{um.Name, um.IsInteger, um.ID}

		_, err := tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}

func CountProducts(ctx context.Context, tx *sqlx.Tx, id int64) (int64, error) {
	var count int64 = 0

	query := `SELECT COUNT(id) FROM articles WHERE unit_measure_id = $1`
	err := tx.GetContext(ctx, &count, query, id)

	return count, err
}

func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	numberOfProducts, err := CountProducts(ctx, tx, id)
	if err != nil {
		return err
	}

	if numberOfProducts > 0 {
		return fmt.Errorf("cannot delete unit measure because it is used in %d products", numberOfProducts)
	}

	query := `DELETE FROM unit_measurements WHERE id = $1`
	_, err = tx.ExecContext(ctx, query, id)

	return err
}
