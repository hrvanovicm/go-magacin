package app

import (
	"context"
	"hrvanovicm/magacin/internal/unit"

	"github.com/jmoiron/sqlx"
)

func (a *App) GetAllUnitMeasurements() ([]unit.UnitMeasure, error) {
	var result []unit.UnitMeasure

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = unit.GetAll(ctx, tx)
		return err
	})

	return result, err
}

func (a *App) SaveUnitMeasure(um *unit.UnitMeasure) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return unit.Save(ctx, tx, um)
	})
}

func (a *App) DeleteUnitMeasure(id int64) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return unit.Delete(ctx, tx, id)
	})
}
