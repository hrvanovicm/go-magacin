package migrations

import (
	"embed"
	"errors"
	"hrvanovicm/magacin/database"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed scripts/*.sql
var Files embed.FS

func RunMigrations(db *database.DB) {
	driver, err := sqlite3.WithInstance(db.Conn.DB, &sqlite3.Config{})
	if err != nil {
		panic("cannot create migration sqlite instance")
	}

	d, err := iofs.New(Files, "scripts")
	m, err := migrate.NewWithInstance("iofs", d, "sqlite3", driver)
	if err != nil {
		panic(err)
	}

	if err := m.Up(); !errors.Is(err, migrate.ErrNoChange) {
		panic(err)
	}
}
