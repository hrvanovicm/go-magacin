package database

import (
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	connection string
	Conn       *sqlx.DB
}

func NewDB(connection string) *DB {
	return &DB{
		connection: connection,
	}
}

func (db *DB) Connect() {
	conn, err := sqlx.Connect("sqlite3", db.connection)

	if err != nil {
		panic(err)
	}

	db.Conn = conn
}
