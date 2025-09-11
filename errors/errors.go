package apperrors

import "fmt"

type SQLError struct {
	Query   string
	Message string
}

func (e *SQLError) Error() string {
	return fmt.Sprintf("sql greška: %s on query %s", e.Message, e.Query)
}

func NewSQLError(query string, err error) *SQLError {
	return &SQLError{
		Query:   query,
		Message: err.Error(),
	}
}
