package app

import (
	"context"
	"hrvanovicm/magacin/internal/report"

	"github.com/jmoiron/sqlx"
)

// GetAllUserNames
func (a *WailsApp) GetAllUserNames() ([]string, error) {
	response := []string{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if users, err := report.FindAllSignUsers(ctx, tx); err != nil {
			return err
		} else {
			response = users
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}
