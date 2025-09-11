package report

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/chromedp/chromedp"
	"github.com/google/uuid"
)

// ShowReportAsPDF
// TODO
func ShowReportAsPDF(ctx context.Context, rep Report) error {
	var tmplPath string

	switch rep.Type {
	case TypeReceipt:
		tmplPath = "views/report/receipt.html"
	case TypeShipment:
		tmplPath = "views/report/shipment.html"
	default:
		return NewReportTypeUnknownError(string(rep.Type))
	}

	tmpl, err := template.ParseFiles(tmplPath)
	if err != nil {
		return err
	}

	var rendered bytes.Buffer
	if err := tmpl.Execute(&rendered, nil); err != nil {
		return err
	}

	tempFile := filepath.Join(os.TempDir(), fmt.Sprintf("report_%s", uuid.New().String())+".html")
	if err := ioutil.WriteFile(tempFile, rendered.Bytes(), 0644); err != nil {
		return err
	}

	userDataDir := filepath.Join(os.TempDir(), "chromedp-profile-"+uuid.New().String())
	chromeCfg := append(
		chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", false),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("disable-extensions", false),
		chromedp.UserDataDir(userDataDir),
	)

	allocatorCtx, _ := chromedp.NewExecAllocator(ctx, chromeCfg...)
	taskCtx, _ := chromedp.NewContext(allocatorCtx)

	var title string = "Report"
	if err = chromedp.Run(taskCtx,
		chromedp.Navigate("file://"+tempFile),
		chromedp.WaitReady("body", chromedp.ByQuery),
		chromedp.Title(&title),
	); err != nil {
		return err
	}

	return nil
}
