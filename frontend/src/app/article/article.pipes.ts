import {inject, Pipe, PipeTransform} from '@angular/core';
import {ArticleCategory} from './article.service';
import {DomSanitizer} from '@angular/platform-browser';
import {unit} from '../../../wailsjs/go/models';
import UnitMeasure = unit.UnitMeasure;

@Pipe({name: 'articleCategoryName'})
export class ArticleCategoryPipe implements PipeTransform {
  transform(value: string): any {
    switch (value) {
      case ArticleCategory.PRODUCT:
        return 'Proizvod';
      case ArticleCategory.COMMERCIAL:
        return 'Komercijala';
      case ArticleCategory.RAW_MATERIAL:
        return 'Sirovina';
      default:
        throw new Error('Unknown category');
    }
  }
}

@Pipe({name: 'articleInStock'})
export class ArticleInStockPipe implements PipeTransform {
  transform(value: number, unitMeasure?: UnitMeasure): any {
    if (value === 0) {
      return 'Nema na stanju';
    }

    if (!unitMeasure) {
      return value.toFixed(2);
    }

    return `${value.toFixed(2)} (${unitMeasure!.name ?? ''})`;
  }
}
