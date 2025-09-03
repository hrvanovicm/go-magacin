package app

import (
	"context"
	"hrvanovicm/magacin/internal/report"

	"github.com/jmoiron/sqlx"
)

func (a *WailsApp) GetReportTypes() []report.ReportType {
	return report.GetAllTypes()
}

func (a *WailsApp) GetAllReports() ([]report.Report, error) {
	var result []report.Report

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetAllReports(ctx, tx)
		return err
	})

	return result, err
}

func (a *WailsApp) GetAllReportPublishLocations() ([]string, error) {
	var result []string

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetAllPublishLocations(ctx, tx)
		return err
	})

	return result, err
}

func (a *WailsApp) GetNextReportCode() (string, error) {
	var result string

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetNextReportCode(ctx, tx)
		return err
	})

	return result, err
}

func (a *WailsApp) GetReportArticles(id int64) ([]report.ReportArticle, error) {
	var result []report.ReportArticle

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetArticlesByReportId(ctx, tx, id)
		return err
	})

	return result, err
}

func (a *WailsApp) SaveReport(rep *report.Report, articles []report.ReportArticle) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		err := report.Save(ctx, tx, rep)
		if err != nil {
			return err
		}

		return report.SaveArticles(ctx, tx, rep.ID, articles)
	})
}

func (a *WailsApp) DeleteReport(id int64) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return report.Delete(ctx, tx, id)
	})
}
