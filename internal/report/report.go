package report

import (
	"hrvanovicm/magacin/internal/article"
	"hrvanovicm/magacin/internal/company"
)

type ReportType string

const (
	TypeReceipt  ReportType = "RECEIPT"
	TypeShipment ReportType = "SHIPMENT"
)

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

type Receipt struct {
	SupplierCompany    company.Company `db:"supplier_company" json:"supplierCompany"`
	SupplierReportCode *string         `db:"supplier_report_code" json:"supplierReportCode"`
}

type Shipment struct {
	ReceiptCompany company.Company `db:"receipt_company" json:"receiptCompany"`
}

type ReportArticle struct {
	Article article.Article `db:"article" json:"article"`
	Amount  float32         `db:"amount" json:"amount"`
	Recipes []ReportRecipe  `db:"used_recipes" json:"usedRecipes"`
}

type ReportRecipe struct {
	RawMaterial article.Article `db:"raw_material" json:"rawMaterial"`
	Amount      float32         `db:"amount" json:"amount"`
}

func (r *Report) CanUseRecipes() bool {
	if r.Type == TypeReceipt && r.Receipt.SupplierCompany.InHouseProduction {
		return true
	}

	return false
}
