package report

import "hrvanovicm/magacin/internal/article"

const (
	ReportTypeReceipt  = "RECEIPT"
	ReportTypeShipment = "SHIPMENT"
)

type Report struct {
	ID             int64    `db:"id" json:"id"`
	Type           string   `db:"type" json:"type"`
	Code           string   `db:"code" json:"code"`
	Date           string   `db:"date" json:"date"`
	PlaceOfPublish string   `db:"place_of_publish" json:"placeOfPublish"`
	SignedByName   string   `db:"signed_by_name" json:"signedByName"`
	Receipt        Receipt  `db:"receipt" json:"receipt"`
	Shipment       Shipment `db:"shipment" json:"shipment"`
}

type Receipt struct {
	IsSupplierProducton bool   `db:"is_supplier_producton" json:"isSupplierProducton"`
	SupplierCompanyName string `db:"supplier_company_name" json:"supplierCompanyName"`
	SupplierReportCode  string `db:"supplier_report_code" json:"supplierReportCode"`
}

type Shipment struct {
	ReceiptCompanyName string `db:"receipt_company_name" json:"receiptCompanyName"`
}

type Article struct {
	Article      article.Article  `db:"article" json:"article"`
	Amount       float64          `db:"amount" json:"amount"`
	UsedReceipts []ArticleReceipt `db:"used_receipts" json:"usedReceipts"`
}

type ArticleReceipt struct {
	RawMaterial Article `db:"raw_material" json:"rawMaterial"`
	Amount      float64 `db:"amount" json:"amount"`
}
