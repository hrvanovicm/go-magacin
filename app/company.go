package app

import (
	"context"
	"hrvanovicm/magacin/internal/company"

	"github.com/jmoiron/sqlx"
)

func (a *WailsApp) GetAllCompanies() ([]company.Company, error) {
	var result []company.Company

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = company.GetAll(ctx, tx)
		return err
	})

	return result, err
}
