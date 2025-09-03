package app

import (
	"context"
	"hrvanovicm/magacin/database"
	"time"

	"github.com/jmoiron/sqlx"
)

const (
	REQUEST_TIMEOUT = 5 * time.Second
)

type WailsApp struct {
	db  *database.DB
	ctx context.Context
}

func NewApp() *WailsApp {
	return &WailsApp{}
}

func (a *WailsApp) Startup(ctx context.Context) {
	a.ctx = ctx
	a.db = database.NewDB("./storage/magacin.db")
	a.db.Connect()
}

func (a *WailsApp) Shutdown(ctx context.Context) {

}

func (a *WailsApp) runWithTx(fn func(ctx context.Context, tx *sqlx.Tx) error) error {
	ctx, cancel := context.WithTimeout(context.Background(), REQUEST_TIMEOUT)
	defer cancel()

	uow := database.NewUow(a.db.Conn)
	if err := uow.Begin(); err != nil {
		return err
	}

	var err error
	defer func() {
		if err != nil {
			uow.Rollback(ctx)
			print("rollback")
		} else {
			uow.Commit(ctx)
			print("commit")
		}
	}()

	err = fn(ctx, uow.Tx())
	return err
}
