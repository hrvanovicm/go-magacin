package unit

type UnitMeasure struct {
	ID        int64  `db:"id" json:"id"`
	Name      string `db:"name" json:"name"`
	IsInteger bool   `db:"is_integer" json:"isInteger"`
}
