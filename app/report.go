package app

import (
	"context"
	"hrvanovicm/magacin/internal/report"

	"github.com/jmoiron/sqlx"
)

func (a *App) GetAllReports() ([]report.Report, error) {
	var result []report.Report

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetAllReports(ctx, tx)
		return err
	})

	return result, err
}

func (a *App) GetReportTypes() []string {
	return report.GetAllTypes()
}

func (a *App) GetAllReportPublishLocations() ([]string, error) {
	var result []string

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetAllPublishLocations(ctx, tx)
		return err
	})

	return result, err
}

func (a *App) GetAllReportSignUsers() ([]string, error) {
	var result []string

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetAllSignUsers(ctx, tx)
		return err
	})

	return result, err
}

func (a *App) GetAllReportCompanies() ([]string, error) {
	var result []string

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetAllCompanies(ctx, tx)
		return err
	})

	return result, err
}

func (a *App) GetNextReportCode() (string, error) {
	var result string

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetNextReportCode(ctx, tx)
		return err
	})

	return result, err
}

func (a *App) GetReportArticles(id int64) ([]report.Article, error) {
	var result []report.Article

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = report.GetArticlesByReportId(ctx, tx, id)
		return err
	})

	return result, err
}

func (a *App) SaveReportArticles(id int64, articles []report.Article) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return report.SaveArticles(ctx, tx, id, articles)
	})
}

func (a *App) SaveReport(rep *report.Report) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return report.Save(ctx, tx, rep)
	})
}

func (a *App) DeleteReport(id int64) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return report.Delete(ctx, tx, id)
	})
}
