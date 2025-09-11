package company

import (
	"context"
	apperrors "hrvanovicm/magacin/errors"

	"github.com/jmoiron/sqlx"
)

// FindAll
func FindAll(ctx context.Context, tx *sqlx.Tx) ([]Company, error) {
	companies := []Company{}

	query := `
		SELECT
			supplier_company_name name,
			CASE
				WHEN EXISTS (SELECT 1 FROM in_house_companies ihc WHERE ihc.name = supplier_company_name)
				THEN TRUE
				ELSE FALSE
			END as in_house_production
		FROM receipts
		UNION SELECT
						receipt_company_name name,
						CASE
							WHEN EXISTS (SELECT 1 FROM in_house_companies ihc WHERE ihc.name = receipt_company_name)
							THEN TRUE
							ELSE FALSE
						END as in_house_production
		FROM shipments
		UNION SELECT name, TRUE as in_house_production FROM in_house_companies
	`

	if err := tx.SelectContext(ctx, &companies, query); err != nil {
		return companies, apperrors.NewSQLError(query, err)
	}

	return companies, nil
}
