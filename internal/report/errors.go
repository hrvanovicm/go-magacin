package report

import "fmt"

// ReportTypeUnknownError
type ReportTypeUnknownError struct {
	ReportType string
}

func (e *ReportTypeUnknownError) Error() string {
	return fmt.Sprintf("Tip izvještaja %s ne postoji", e.ReportType)
}

func NewReportTypeUnknownError(reportType string) *ReportTypeUnknownError {
	return &ReportTypeUnknownError{
		ReportType: reportType,
	}
}

// ReportRecipeInvalidUseError
type ReportRecipeInvalidUseError struct {
	Report Report
}

func (e *ReportRecipeInvalidUseError) Error() string {
	return fmt.Sprintf("Izvještaj (ID:%d) ne može koristiti recepture", e.Report.ID)
}

func NewReportRecipeInvalidUseError(rep Report) *ReportRecipeInvalidUseError {
	return &ReportRecipeInvalidUseError{
		Report: rep,
	}
}
