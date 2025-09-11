package unit

import "fmt"

// UnitMeasureInUseError
type UnitMeasureInUseError struct {
	UnitMeasureID int64
	ProductCount  int64
}

func (e *UnitMeasureInUseError) Error() string {
	return fmt.Sprintf("%d artikala koristi mjernu jedinicu (ID:%d)", e.UnitMeasureID, e.ProductCount)
}

func NewUnitMeasureInUseError(id int64, count int64) *UnitMeasureInUseError {
	return &UnitMeasureInUseError{
		UnitMeasureID: id,
		ProductCount:  count,
	}
}
