package app

import (
	"context"
	"hrvanovicm/magacin/internal/article"

	"github.com/jmoiron/sqlx"
)

// GetAllArticles
func (a *WailsApp) GetAllArticles() ([]article.Article, error) {
	response := []article.Article{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if articles, err := article.FindAll(ctx, tx); err != nil {
			return err
		} else {
			response = articles
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, nil
}

// GetAllReceptionsByArticleID
func (a *WailsApp) GetAllReceptionsByArticleID(id int64) ([]article.Recipe, error) {
	response := []article.Recipe{}

	err := a.runWithReadTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if recipes, err := article.FindAllRecipes(ctx, tx, id); err != nil {
			return err
		} else {
			response = recipes
		}

		return nil
	})

	if err != nil {
		a.HandleError(err)
		return response, err
	}

	return response, err
}

// SaveArticle
func (a *WailsApp) SaveArticle(art *article.Article, recs []article.Recipe) error {
	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if err := article.Save(ctx, tx, art); err != nil {
			return err
		}

		if err := article.SaveRecipes(ctx, tx, art.ID, recs); err != nil {
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

// DeleteArticle
func (a *WailsApp) DeleteArticle(id int64) error {
	err := a.runWithTx(func(ctx context.Context, tx *sqlx.Tx) error {
		if err := article.Delete(ctx, tx, id); err != nil {
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
