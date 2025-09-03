package report

import (
	"hrvanovicm/magacin/internal/article"
	"hrvanovicm/magacin/internal/company"
)

// ReportType represents the type of a report, used to define specific report categories such as "RECEIPT" or "SHIPMENT".
type ReportType string

// TypeReceipt indicates that the report type is a receipt.
// TypeShipment indicates that the report type is a shipment.
const (
	TypeReceipt  ReportType = "RECEIPT"
	TypeShipment ReportType = "SHIPMENT"
)

// Report represents a detailed report containing metadata and associated receipt or shipment data.
type Report struct {
	ID             int64      `db:"id" json:"id"`
	Type           ReportType `db:"type" json:"type"`
	Code           *string    `db:"code" json:"code"`
	Date           *string    `db:"signed_at" json:"signedAt"`
	PlaceOfPublish *string    `db:"signed_at_location" json:"signedAtLocation"`
	SignedByName   *string    `db:"signed_by" json:"signedBy"`
	Receipt        Receipt    `db:"receipt" json:"receipt"`
	Shipment       Shipment   `db:"shipment" json:"shipment"`
}

// Receipt represents a document detailing the transaction and product origin related to a supplier.
type Receipt struct {
	IsSupplierProducton *bool           `db:"is_supplier_producton" json:"isSupplierProducton"`
	SupplierCompany     company.Company `db:"supplier_company" json:"supplierCompany"`
	SupplierReportCode  *string         `db:"supplier_report_code" json:"supplierReportCode"`
}

// Shipment represents the delivery details including the receiving company.
type Shipment struct {
	ReceiptCompany company.Company `db:"receipt_company" json:"receiptCompany"`
}

// ReportArticle represents a detailed article report, including the article data, its amount, and associated recipes.
type ReportArticle struct {
	Article article.Article `db:"article" json:"article"`
	Amount  float64         `db:"amount" json:"amount"`
	Recipes []ReportRecipe  `db:"used_recipes" json:"usedRecipes"`
}

// ReportRecipe represents the usage of a raw material in a report, including the material details and the required amount.
type ReportRecipe struct {
	RawMaterial article.Article `db:"raw_material" json:"rawMaterial"`
	Amount      float64         `db:"amount" json:"amount"`
}
