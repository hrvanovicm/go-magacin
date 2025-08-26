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

func (a *App) SaveAllUnitMeasures(ums []unit.UnitMeasure) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		existings, err := unit.GetAll(ctx, tx)
		if err != nil {
			return err
		}

		ids := make([]int64, len(ums))
		for i := range ums {
			ids[i] = ums[i].ID
			err := unit.Save(ctx, tx, &ums[i])
			if err != nil {
				return err
			}
		}

		for i := range existings {
			found := false
			for _, id := range ids {
				if id == existings[i].ID {
					found = true
					break
				}
			}
			if !found {
				err := unit.Delete(ctx, tx, existings[i].ID)
				if err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (a *App) DeleteUnitMeasure(id int64) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return unit.Delete(ctx, tx, id)
	})
}
