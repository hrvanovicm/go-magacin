import {AfterContentInit, AfterViewInit, Component, inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ArticleCategory, ArticleCategoryValues, ArticleParams, ArticleService} from './article.service';
import {MatDialog} from '@angular/material/dialog';
import {ArticleEditDialog, ArticleEditDialogData} from './components/edit.dialog';
import {MatChipsModule} from '@angular/material/chips';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {debounceTime} from 'rxjs';
import {article} from '../../../wailsjs/go/models';
import {ArticleCategoryPipe, ArticleInStockPipe} from './article.pipes';
import Article = article.Article;

@Component({
  imports: [
    MatTableModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatIconButton,
    MatIconModule,
    MatChipsModule,
    MatSortModule,
    ReactiveFormsModule,
    ArticleCategoryPipe,
    ArticleInStockPipe
  ],
  template: `
    <mat-toolbar>
      <mat-toolbar-row>
        <h4 class="!text-xl">Roba ({{ dataSource.filteredData.length }})</h4>
        <span class="mx-5">|</span>
        <form class="flex flex-row gap-x-1" [formGroup]="filterForm">
          <mat-form-field class="w-64">
            <mat-label>Pretraga</mat-label>
            <input matInput formControlName="search">
          </mat-form-field>
          <div class="flex flex-row gap-x-1">
            <button matIconButton (click)="reset()">
              <mat-icon>refresh</mat-icon>
            </button>
            <mat-chip-listbox formControlName="categories" [multiple]="true" class="flex flex-row">
              <mat-chip-option [value]="ArticleCategory.PRODUCT">Proizvod</mat-chip-option>
              <mat-chip-option [value]="ArticleCategory.COMMERCIAL">Komercijala</mat-chip-option>
              <mat-chip-option [value]="ArticleCategory.RAW_MATERIAL">Sirovine</mat-chip-option>
            </mat-chip-listbox>
            <mat-chip-listbox formControlName="isLowInStock" [multiple]="false" class="flex flex-row">
              <mat-chip-option [value]="true">Stanje pri kraju</mat-chip-option>
            </mat-chip-listbox>
          </div>
        </form>
        <span class="flex-1 basis-auto"></span>
        <button matButton (click)="openCreateDialog()"> Kreiraj robu <mat-icon>add</mat-icon> </button>
      </mat-toolbar-row>
    </mat-toolbar>

    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" matSort>
      <ng-container matColumnDef="position">
        <th mat-header-cell *matHeaderCellDef> Rb. </th>
        <td mat-cell *matCellDef="let i = index"> {{ i + 1 }}.</td>
      </ng-container>
      <ng-container matColumnDef="icon">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let i = index"> <mat-icon class="text-xl text-gray-600">sell</mat-icon></td>
      </ng-container>
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Naziv </th>
        <td mat-cell *matCellDef="let element"> <strong> {{ element.name }} </strong></td>
      </ng-container>
      <ng-container matColumnDef="code">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Šifra </th>
        <td mat-cell *matCellDef="let element"> {{ element.code }}</td>
      </ng-container>
      <ng-container matColumnDef="category">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Tip </th>
        <td mat-cell *matCellDef="let element"> {{ element.category | articleCategoryName }}</td>
      </ng-container>
      <ng-container matColumnDef="tags">
        <th mat-header-cell *matHeaderCellDef> Oznake </th>
        <td mat-cell *matCellDef="let element"> {{ element.tags.split(',').join(', ') }}</td>
      </ng-container>
      <ng-container matColumnDef="inStockAmount">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Na stanju </th>
        <td mat-cell *matCellDef="let element"><span [innerHTML]="element.inStockAmount | articleInStock: element.unitMeasure"></span></td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="openUpdateDialog(row)"></tr>
    </table>
  `,
  styles: `
    tr {
      cursor: pointer !important;
    }
    tr:not(.example-expanded-row):hover {
      background: whitesmoke !important;
    }
  `
})
export class ProductIndexPage implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  readonly articleService = inject(ArticleService);
  readonly dialog = inject(MatDialog);

  readonly displayedColumns: string[] = ['position', 'icon', 'name', 'code', 'category', 'tags', 'inStockAmount'];
  readonly dataSource = new MatTableDataSource<Article>([]);
  readonly filterForm = new FormGroup({
    search: new FormControl<string | null>(null),
    categories: new FormControl<ArticleCategory[]>(ArticleCategoryValues),
    isLowInStock: new FormControl<boolean | null>(null)
  })

  ngOnInit() {
    this.filterForm.valueChanges.pipe(debounceTime(150)).subscribe(() => this.load());
  }

  async ngAfterViewInit() {
    this.sort.sortChange.subscribe(async () => {
      await this.load();
    });

    await this.load();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ArticleEditDialog, {
      width: '600px',
      height: '650px',
      maxWidth: '600px',
    });

    dialogRef.afterClosed().subscribe(async (result?: ArticleEditDialogData) => {
      if(result) {
        let data = this.dataSource.data;
        data.push(result.article!);

        this.dataSource.data = data;
      }
    });
  }

  async openUpdateDialog(article: Article) {
    let receptions = await this.articleService.getReceptions(article.id);

    const dialogRef = this.dialog.open(ArticleEditDialog, {
      width: '600px',
      height: '650px',
      maxWidth: '600px',
      data: {
        article: article,
        receptions: receptions
      }
    });

    dialogRef.afterClosed().subscribe(async (result?: ArticleEditDialogData) => {
      if(result) {
        let data = this.dataSource.data;
        data.map(a => {
          if(a.id === result.article!.id) {
            a = result.article!;
          }
          return a;
        })

        this.dataSource.data = data;
      }
    });
  }

  async reset() {
    this.filterForm.setValue({
      search: null,
      categories: ArticleCategoryValues,
      isLowInStock: null
    })

    await this.load();
  }

  async load() {
    let filterFormValue = this.filterForm.getRawValue();
    let sortValue = {
      direction: this.sort.direction ?? "asc",
      active: this.sort.active
    }

    let params: Partial<ArticleParams> = {};

    if(filterFormValue.search) {
      params.search = filterFormValue.search;
    }

    if(filterFormValue.isLowInStock) {
      params.lowInStock = true;
    }

    if(sortValue.active) {
      params.sortBy = sortValue.active;
      params.sortDirection = sortValue.direction;
    }

    params.categories = filterFormValue.categories ?? [];

    this.dataSource.data = await this.articleService.getAll(params);
  }

  protected readonly ArticleCategory = ArticleCategory;
}
