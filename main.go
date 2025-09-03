package main

import (
	"embed"
	"hrvanovicm/magacin/app"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	wailsApp := app.NewApp()

	err := wails.Run(&options.App{
		Title:             "Magacin",
		Width:             1400,
		Height:            720,
		MinWidth:          1100,
		MinHeight:         570,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		Assets:            assets,
		OnStartup:         wailsApp.Startup,
		OnShutdown:        wailsApp.Shutdown,
		Bind:              []interface{}{wailsApp},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
