package app

import (
	"context"
	"hrvanovicm/magacin/internal/article"

	"github.com/jmoiron/sqlx"
)

func (a *App) GetAllArticles() ([]article.Article, error) {
	var result []article.Article

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = article.GetAll(ctx, tx)
		return err
	})

	return result, err
}

func (a *App) GetAllReceptionsByArticleID(id int64) ([]article.Reception, error) {
	var result []article.Reception

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = article.GetReceptions(ctx, tx, id)
		return err
	})

	return result, err
}

func (a *App) SaveArticleReceptions(id int64, receptions []article.Reception) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return article.SaveReceptions(ctx, tx, id, receptions)
	})
}

func (a *App) SaveArticle(art *article.Article) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return article.Save(ctx, tx, art)
	})
}

func (a *App) DeleteArticle(id int64) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return article.Delete(ctx, tx, id)
	})
}
