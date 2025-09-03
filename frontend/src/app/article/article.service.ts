import {Injectable} from '@angular/core';
import {article} from '../../../wailsjs/go/models';

import Article = article.Article;
import Recipe = article.Recipe;
import {GetAllArticles, GetAllReceptionsByArticleID, SaveArticle} from '../../../wailsjs/go/app/WailsApp';

export enum ArticleCategory {
  PRODUCT = 'PRODUCT',
  COMMERCIAL = 'COMMERCIAL',
  RAW_MATERIAL = 'RAW_MATERIAL'
}

export const ArticleCategoryValues = Object.values(ArticleCategory);

export interface ArticleParams {
  search?: string;
  categories?: ArticleCategory[];
  lowInStock?: boolean;
  sortBy?: string;
  sortDirection?: string;
}

@Injectable()
export class ArticleService {
  async getAll(params: Partial<ArticleParams>): Promise<any[]> {
    let articles = await GetAllArticles();

    if(params.search != undefined) {
      const search = params.search.trim().toLowerCase();

      articles = articles.filter(article => {
        return article.name.toLowerCase().includes(search) ||
          article.code?.toLowerCase().includes(search) ||
          (article.tags?.split(",") ?? []).some(t => t.toLowerCase().includes(search));
      })
    }

    if(params.categories != undefined) {
      articles = articles.filter(article => {
        return params.categories!.some(category =>
          (category === ArticleCategory.PRODUCT && article.category === ArticleCategory.PRODUCT) ||
          (category === ArticleCategory.COMMERCIAL && article.category === ArticleCategory.COMMERCIAL) ||
          (category === ArticleCategory.RAW_MATERIAL && article.category === ArticleCategory.RAW_MATERIAL)
        );
      })
    }

    if(params.lowInStock != undefined) {
      articles = articles.filter(article => article.inStockAmount <= article.inStockWarningAmount);
    }

    if (params.sortBy != undefined) {
      let sortDirection = params.sortDirection ?? 'asc';
      let sortField = params.sortBy ?? 'name';

      articles = articles.sort((a, b) => {
        let compareValue: number;

        switch (sortField) {
          case 'name':
            compareValue = a.name.localeCompare(b.name);
            break;
          case 'code':
            compareValue = (a.code ?? '').localeCompare(b.code ?? '');
            break;
          case 'category':
            compareValue = a.category.localeCompare(b.category);
            break;
          case 'inStockAmount':
            compareValue = a.inStockAmount - b.inStockAmount;
            break;
          default:
            compareValue = 0;
        }

        return sortDirection === 'asc' ? compareValue : -compareValue;
      })
    }

    return articles;
  }

  async getReceptions(id: number): Promise<Recipe[]> {
    return await GetAllReceptionsByArticleID(id);
  }

  async save(request: Article, receptions: Recipe[]) {
    return await SaveArticle(request, receptions);
  }

  async delete(request: Article) {
    return true;
  }
}
