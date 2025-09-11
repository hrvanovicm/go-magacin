package app

import (
	"context"
	"hrvanovicm/magacin/internal/company"

	"github.com/jmoiron/sqlx"
)

// GetAllCompanies
func (a *WailsApp) GetAllCompanies() ([]company.Company, error) {
	response := []company.Company{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if companies, err := company.FindAll(ctx, tx); err != nil {
			return err
		} else {
			response = companies
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}
