package report

import (
	"context"

	"github.com/jmoiron/sqlx"
)

func GetAllTypes() []string {
	return []string{ReportTypeReceipt, ReportTypeShipment}
}

func GetAllPublishLocations(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	return []string{"Lukavac"}, nil
}

func GetAllSignUsers(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	return []string{"Lukavac"}, nil
}

func GetAllCompanies(ctx context.Context, tx *sqlx.Tx) ([]string, error) {
	return []string{"Bauklar"}, nil
}

func GetNextReportCode(ctx context.Context, tx *sqlx.Tx) (string, error) {
	return "22/23", nil
}

func GetAllReports(ctx context.Context, tx *sqlx.Tx) ([]Report, error) {
	var reports []Report

	query := `SELECT 
    			r.id, r.type, r.code, r.date, r.location_of_publish, r.signed_by_name,
    			rec.supplier_company_name "receipt.supplier_company_name",
    			rec.supplier_report_code "receipt.supplier_report_code",
    			shp.receipt_company_name "shipment.receipt_company_name"
			  FROM reports r
			  LEFT JOIN receipts rec ON rec.report_id = r.id
			  LEFT JOIN shipments shp ON shp.report_id = r.id
	`
	err := tx.SelectContext(ctx, &reports, query)
	if err != nil {
		return nil, err
	}

	return reports, nil
}

func GetArticlesByReportId(ctx context.Context, tx *sqlx.Tx, reportId int64) ([]Article, error) {
	var articles []Article
	return articles, nil
}

func Save(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	if report.ID != 0 {
		args := []interface{}{
			report.Type, report.Code, report.Date, report.PlaceOfPublish, report.SignedByName, report.ID,
		}
		query := `UPDATE reports SET 
                	type = $1, code = $2, date = $3, location_of_publish = $4, signed_by_name = $5 
                  WHERE id = $6
		`
		_, err := tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	} else {
		args := []interface{}{
			report.Type, report.Code, report.Date, report.PlaceOfPublish, report.SignedByName,
		}
		query := `INSERT INTO reports 
    				(type, code, date, location_of_publish, signed_by_name) 
			  	  VALUES ($1, $2, $3, $4, $5)
		`
		result, err := tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}

		id, err := result.LastInsertId()
		if err != nil {
			return err
		}

		report.ID = id
	}

	if report.Type == ReportTypeReceipt {
		return saveReceipt(ctx, tx, report)
	} else if report.Type == ReportTypeShipment {
		return saveShipment(ctx, tx, report)
	} else {
		panic("unknown report type")
	}
}

func saveReceipt(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	var isExists bool
	err := tx.GetContext(ctx, &isExists, `SELECT EXISTS(SELECT 1 FROM receipts WHERE report_id = $1)`, report.ID)
	if err != nil {
		return err
	}

	if !isExists {
		args := []interface{}{report.Receipt.SupplierCompanyName, report.Receipt.SupplierReportCode, report.ID}
		query := `INSERT INTO receipts (supplier_company_name, supplier_report_code, report_id) VALUES ($1, $2, $3)`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	} else {
		args := []interface{}{report.Receipt.SupplierCompanyName, report.Receipt.SupplierReportCode, report.ID}
		query := `UPDATE receipts SET supplier_company_name = $1, supplier_report_code = $2 WHERE report_id = $3`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}

func saveShipment(ctx context.Context, tx *sqlx.Tx, report *Report) error {
	var isExists bool
	err := tx.GetContext(ctx, &isExists, `SELECT EXISTS(SELECT 1 FROM shipments WHERE report_id = $1)`, report.ID)
	if err != nil {
		return err
	}

	if !isExists {
		args := []interface{}{report.Shipment.ReceiptCompanyName, report.ID}
		query := `INSERT INTO shipments (receipt_company_name, report_id) VALUES ($1, $2)`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	} else {
		args := []interface{}{report.Shipment.ReceiptCompanyName, report.ID}
		query := `UPDATE shipments SET receipt_company_name = $1 WHERE report_id = $2`
		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return nil
}

func SaveArticles(ctx context.Context, tx *sqlx.Tx, reportId int64, articles []Article) error {
	return nil
}

func Delete(ctx context.Context, tx *sqlx.Tx, id int64) error {
	query := `DELETE FROM reports WHERE id = $1`
	_, err := tx.ExecContext(ctx, query, id)
	return err
}
