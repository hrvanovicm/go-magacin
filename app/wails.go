package app

import (
	"context"
	"errors"
	"hrvanovicm/magacin/database"
	"hrvanovicm/magacin/migrations"
	"os"
	"path/filepath"
	"time"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	REQUEST_TIMEOUT = 5 * time.Second
)

type WailsApp struct {
	db     *database.DB
	ctx    context.Context
	logger *zap.Logger
}

func NewApp() *WailsApp {
	return &WailsApp{}
}

func (a *WailsApp) Startup(ctx context.Context) {
	a.ctx = ctx

	a.InitSetup()

	dbPath := getDatabaseFullPath()
	a.db = database.NewDB(dbPath)
	if err := a.db.Connect(); err != nil {
		a.HandleError(err)
		panic(err)
	}

	loggerCfg := zap.Config{
		Level:            zap.NewAtomicLevelAt(zapcore.DebugLevel),
		Development:      true,
		Encoding:         "console",
		OutputPaths:      []string{"stdout"},
		ErrorOutputPaths: []string{"stderr"},
		EncoderConfig: zapcore.EncoderConfig{
			MessageKey:     "msg",
			LevelKey:       "",
			TimeKey:        "",
			NameKey:        "",
			CallerKey:      "",
			FunctionKey:    "",
			EncodeLevel:    zapcore.CapitalLevelEncoder,
			EncodeTime:     nil,
			EncodeDuration: nil,
		},
	}

	if logger, err := loggerCfg.Build(); err != nil {
		panic(err)
	} else {
		a.logger = logger
	}

	migrations.RunMigrations(a.db)
}

func (a *WailsApp) Shutdown(ctx context.Context) {
	_ = a.db.Close()

	if a.logger != nil {
		a.logger.Sync()
	}
}

func (a *WailsApp) runWithTx(fn func(ctx context.Context, tx *sqlx.Tx) error) error {
	ctx, cancel := context.WithTimeout(context.Background(), REQUEST_TIMEOUT)
	defer cancel()

	uow := database.NewUow(ctx, a.db.Conn, false)
	if err := uow.Begin(); err != nil {
		return err
	}

	var err error
	defer func() {
		if err != nil {
			uow.Rollback(ctx)
		} else {
			uow.Commit(ctx)
		}
	}()

	err = fn(ctx, uow.Tx())
	return err
}

func (a *WailsApp) runWithReadTx(fn func(ctx context.Context, tx *sqlx.Tx) error) error {
	ctx, cancel := context.WithTimeout(context.Background(), REQUEST_TIMEOUT)
	defer cancel()

	uow := database.NewUow(ctx, a.db.Conn, true)
	if err := uow.Begin(); err != nil {
		return err
	}

	var err error
	defer func() {
		if err != nil {
			uow.Rollback(ctx)
		} else {
			uow.Commit(ctx)
		}
	}()

	err = fn(ctx, uow.Tx())
	return err
}

func (a *WailsApp) HandleError(err error) {
	if a.logger != nil {
		a.logger.Error("error", zap.Error(err))
	}
}

func (a *WailsApp) InitSetup() {
	dbPath := getDatabaseFullPath()

	if _, err := os.Stat(dbPath); errors.Is(err, os.ErrNotExist) {
		if err := os.MkdirAll(filepath.Dir(dbPath), os.ModePerm); err != nil {
			panic(err)
		}

		_, err := os.Create(dbPath)
		if err != nil {
			panic(err)
		}
	}
}

func getDatabaseFullPath() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	return filepath.Join(homeDir, "hrvanovicm", "magacin", "magacin.db")
}
