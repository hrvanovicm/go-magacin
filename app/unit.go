package app

import (
	"context"
	"hrvanovicm/magacin/internal/unit"
	"slices"

	"github.com/jmoiron/sqlx"
)

// GetAllUnitMeasurements
func (a *WailsApp) GetAllUnitMeasurements() ([]unit.UnitMeasure, error) {
	response := []unit.UnitMeasure{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if unitMeasures, err := unit.FindAll(ctx, tx); err != nil {
			return err
		} else {
			response = unitMeasures
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}

// SaveAllUnitMeasures
func (a *WailsApp) SaveAllUnitMeasures(ums []unit.UnitMeasure) error {
	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		existing, err := unit.FindAll(ctx, tx)
		if err != nil {
			return err
		}

		usedIDs := make([]int64, len(ums))
		for i := range ums {
			usedIDs[i] = ums[i].ID
			if err := unit.Save(ctx, tx, &ums[i]); err != nil {
				return err
			}
		}

		for _, existingUM := range existing {
			if !slices.Contains(usedIDs, existingUM.ID) {
				if err := unit.Delete(ctx, tx, existingUM.ID); err != nil {
					return err
				}
			}
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return err
	}

	return nil
}

// DeleteUnitMeasure
func (a *WailsApp) DeleteUnitMeasure(id int64) error {
	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if err := unit.Delete(ctx, tx, id); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return err
	}

	return nil
}
