package app

import (
	"context"
	"hrvanovicm/magacin/internal/report"

	"github.com/jmoiron/sqlx"
)

func (a *WailsApp) GetAllUserNames() ([]string, error) {
	var result []string

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetAllSignUsers(ctx, tx)
		return err
	})

	return result, err
}
