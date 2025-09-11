package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Uow struct {
	ctx      context.Context
	db       *sqlx.DB
	tx       *sqlx.Tx
	readOnly bool
}

func NewUow(ctx context.Context, db *sqlx.DB, readOnly bool) *Uow {
	return &Uow{
		db:       db,
		readOnly: readOnly,
		ctx:      ctx,
	}
}

func (s *Uow) Begin() error {
	tx, err := s.db.BeginTxx(s.ctx, &sql.TxOptions{
		ReadOnly: s.readOnly,
	})

	if err != nil {
		return err
	}

	s.tx = tx

	return nil
}

func (s *Uow) Commit(ctx context.Context) error {
	if s.tx == nil {
		return fmt.Errorf("transaction not started")
	}

	err := s.tx.Commit()
	s.tx = nil

	if err != nil {
		return err
	}

	return nil
}

func (s *Uow) Rollback(ctx context.Context) error {
	if s.tx == nil {
		return fmt.Errorf("transaction not started")
	}

	err := s.tx.Rollback()
	s.tx = nil

	if err != nil && !errors.Is(err, sql.ErrTxDone) {
		return err
	}

	return nil
}

func (s *Uow) Tx() *sqlx.Tx {
	return s.tx
}
