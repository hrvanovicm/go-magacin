package app

import (
	"context"
	"hrvanovicm/magacin/internal/article"

	"github.com/jmoiron/sqlx"
)

func (a *WailsApp) GetAllArticles() ([]article.Article, error) {
	var result []article.Article

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = article.GetAll(ctx, tx)
		return err
	})

	return result, err
}

func (a *WailsApp) GetAllReceptionsByArticleID(id int64) ([]article.Recipe, error) {
	var result []article.Recipe

	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		var err error
		result, err = article.GetRecipes(ctx, tx, id)
		return err
	})

	return result, err
}

func (a *WailsApp) SaveArticle(art *article.Article, receptions []article.Recipe) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		err := article.Save(ctx, tx, art)
		if err != nil {
			return err
		}

		return article.SaveRecipes(ctx, tx, art.ID, receptions)
	})
}

func (a *WailsApp) DeleteArticle(id int64) error {
	return a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		return article.Delete(ctx, tx, id)
	})
}
