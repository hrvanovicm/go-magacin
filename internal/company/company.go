package company

type Company struct {
	Name              *string `db:"name" json:"name"`
	InHouseProduction bool    `db:"in_house_production" json:"inHouseProduction"`
}
