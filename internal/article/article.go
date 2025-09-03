package article

import (
	"hrvanovicm/magacin/internal/unit"
)

const (
	CategoryRawMaterial = "RAW_MATERIAL"
	CategoryProduct     = "PRODUCT"
	CategoryCommercial  = "COMMERCIAL"
)

type Article struct {
	ID                   int64             `db:"id" json:"id"`
	Name                 string            `db:"name" json:"name"`
	Code                 *string           `db:"code" json:"code"`
	Tags                 string            `db:"tags" json:"tags"`
	Category             string            `db:"category" json:"category"`
	InStockAmount        float32           `db:"in_stock_amount" json:"inStockAmount"`
	InStockWarningAmount float32           `db:"in_stock_warning_amount" json:"inStockWarningAmount"`
	UnitMeasure          *unit.UnitMeasure `db:"unit_measure" json:"unitMeasure"`
}
type Recipe struct {
	RawMaterial Article `db:"raw_material" json:"rawMaterial"`
	Amount      float32 `db:"amount" json:"amount"`
}
