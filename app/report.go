package app

import (
	"context"
	"hrvanovicm/magacin/internal/report"

	"github.com/jmoiron/sqlx"
)

// GetAllReportTypes
func (a *WailsApp) GetAllReportTypes() []report.ReportType {
	return report.FindAllTypes()
}

// GetAllReports
func (a *WailsApp) GetAllReports() ([]report.Report, error) {
	response := []report.Report{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if reports, err := report.FindAllReports(ctx, tx); err != nil {
			return err
		} else {
			response = reports
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}

// GetAllReportPublishLocations
func (a *WailsApp) GetAllReportPublishLocations() ([]string, error) {
	response := []string{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if locations, err := report.FindAllPublishLocations(ctx, tx); err != nil {
			return err
		} else {
			response = locations
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}

// GetNextReportCode
func (a *WailsApp) GetNextReportCode() (string, error) {
	var response string

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if reportCode, err := report.FindNextReportCode(ctx, tx); err != nil {
			return err
		} else {
			response = reportCode
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}

// GetReportArticles
func (a *WailsApp) GetReportArticles(id int64) ([]report.ReportArticle, error) {
	response := []report.ReportArticle{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if reportArticles, err := report.FindArticlesByReportId(ctx, tx, id); err != nil {
			return err
		} else {
			response = reportArticles
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}

// SaveReport
func (a *WailsApp) SaveReport(rep *report.Report, articles []report.ReportArticle) error {
	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if err := report.Save(ctx, tx, rep); err != nil {
			return err
		}

		if err := report.SaveArticles(ctx, tx, rep, articles); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return err
	}

	return nil
}

// DeleteReport
func (a *WailsApp) DeleteReport(id int64) error {
	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if err := report.Delete(ctx, tx, id); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return err
	}

	return nil
}

// CanReportUseRecipes
func (a *WailsApp) CanReportUseRecipes(rep *report.Report) bool {
	return rep.CanUseRecipes()
}
