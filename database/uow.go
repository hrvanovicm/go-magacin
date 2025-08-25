package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Uow struct {
	db *sqlx.DB
	tx *sqlx.Tx
}

func NewUow(db *sqlx.DB) *Uow {
	return &Uow{
		db: db,
	}
}

func (s *Uow) Begin() error {
	tx, err := s.db.Beginx()
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
