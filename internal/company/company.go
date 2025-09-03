package company

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Company struct {
	Name              *string `db:"name" json:"name"`
	InHouseProduction bool    `db:"in_house_production" json:"inHouseProduction"`
}

func GetAll(ctx context.Context, tx *sqlx.Tx) ([]Company, error) {
	var result []Company

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
	`

	err := tx.SelectContext(ctx, &result, query)
	if err != nil {
		return result, err
	}

	return result, nil
}
