import { AfterContentInit, Component, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ArticleCategory, ArticleCategoryValues, ArticleService } from '../article.service';
import { ArticleCategoryPipe } from '../article.pipes';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { article, report, unit } from '../../../../wailsjs/go/models';
import { MatDivider } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  AmountInputComponent,
  ArticleAutocompleteComponent,
  TagsInputComponent,
  UnitMeasureAutocompleteComponent,
} from '../../shared/inputs';
import Article = article.Article;
import UnitMeasure = unit.UnitMeasure;
import Recipe = article.Recipe;
import Receipt = report.Receipt;
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ArticleEditDialogData {
  article: Article | null;
}

export interface ArticleEditDialogResult {
  article: Article | null;
  receptions: any[];
}

@Component({
  template: `
    <h2 mat-dialog-title>
      {{ !data?.article?.id ? 'Kreiraj robu' : data.article!.name }}
    </h2>
    <mat-dialog-content class="mat-typography min-w-[420px] h-full overflow-hidden">
      <mat-tab-group class="h-full overflow-hidden">
        <mat-tab label="Osnovne informacije" class="h-full overflow-hidden">
          <div class="h-full overflow-y-scroll">
            <form class="flex flex-col gap-y-5 mt-5 max-w-[400px] mx-auto" [formGroup]="form">
              <div class="flex flex-col gap-5">
                <mat-form-field class="w-full">
                  <mat-label> Kategorija</mat-label>
                  <mat-select formControlName="category">
                    @for (category of ArticleCategoryValues; track category) {
                      <mat-option [value]="category">{{
                        category | articleCategoryName
                      }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full">
                  <mat-label> Naziv</mat-label>
                  <input matInput formControlName="name" />
                </mat-form-field>
                <mat-form-field class="w-full">
                  <mat-label> Šifra</mat-label>
                  <input matInput formControlName="code" />
                </mat-form-field>
              </div>
              <mat-divider></mat-divider>
              <div class="flex flex-col gap-5">
                <app-unit-measure-autocomplete
                  class="w-full"
                  label="Mjerna jedinica"
                  [control]="unitMeasureControl"
                />
                <app-amount-input
                  class="w-full"
                  label="Na stanju"
                  [control]="inStockAmountControl"
                  [unitMeasure]="unitMeasureControl.value"
                />
                <app-amount-input
                  class="w-full"
                  label="Min. količina na stanju"
                  [control]="inStockWarningAmountControl"
                  [unitMeasure]="unitMeasureControl.value"
                />
              </div>
              <mat-divider></mat-divider>
              <app-tags-input label="Oznake" [control]="tagsControl" />
            </form>
          </div>
        </mat-tab>

        <mat-tab
          [label]="'Receptura (' + receptionDataSource.data.length + ')'"
          [disabled]="categoryControl.value != ArticleCategory.PRODUCT"
        >
          <div class="pt-3">
            <mat-accordion>
              <mat-expansion-panel #createRawMaterialPanel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>add</mat-icon>
                    <span class="ml-3"> Dodaj sirovinu </span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <form
                  class="flex flex-row justify-between gap-x-3"
                  [formGroup]="receptionCreateForm"
                  (submit)="submitReceptionCreateForm()"
                >
                  <app-article-autocomplete
                    label="Sirovina"
                    class="w-full"
                    [control]="receptionRawMaterialControl"
                    [excludes]="currentReceptionRawMaterials"
                    [includeCategories]="[ArticleCategory.RAW_MATERIAL]"
                  />
                  <app-amount-input
                    class="w-52"
                    label="Količina"
                    [control]="receptionAmountControl"
                    [unitMeasure]="receptionRawMaterialControl.value?.unitMeasure ?? null"
                  />
                  <button matButton="filled" type="submit">Dodaj</button>
                </form>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
          <table mat-table class="mat-elevation-z8 mt-1" [dataSource]="receptionDataSource">
            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef>Rb.</th>
              <td mat-cell *matCellDef="let i = index">{{ i + 1 }}.</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Sirovina</th>
              <td mat-cell *matCellDef="let element">{{ element.rawMaterial.name }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Količina</th>
              <td mat-cell *matCellDef="let element">
                <app-amount-input
                  label="Količina"
                  [initValue]="element.amount"
                  [unitMeasure]="element.rawMaterial.unitMeasure"
                  (click)="$event.preventDefault()"
                  (onValueChange)="updateReceptionAmount(element, $event)"
                />
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let element">
                <button matIconButton (click)="removeReception(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="receptionDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: receptionDisplayedColumns"></tr>
          </table>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Odustani</button>
      <button matButton="filled" cdkFocusInitial (click)="save()" [disabled]="!form.valid">
        Sačuvaj
      </button>
    </mat-dialog-actions>
  `,
  imports: [
    MatTableModule,
    MatExpansionModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ArticleCategoryPipe,
    ReactiveFormsModule,
    MatDivider,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIconModule,
    ArticleAutocompleteComponent,
    AmountInputComponent,
    UnitMeasureAutocompleteComponent,
    TagsInputComponent,
  ],
})
export class ArticleEditDialog implements AfterContentInit {
  @ViewChild('createRawMaterialPanel') panel!: MatExpansionPanel;

  readonly snackbar = inject(MatSnackBar);
  readonly data = inject<ArticleEditDialogResult>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ArticleEditDialog>);
  readonly articleService = inject(ArticleService);

  readonly form = new FormGroup({
    category: new FormControl<ArticleCategory | null>(null, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    code: new FormControl<string>(''),
    tags: new FormControl<string[]>([]),
    unitMeasure: new FormControl<UnitMeasure | null>(null),
    inStockAmount: new FormControl<number>(0, [Validators.required]),
    inStockWarningAmount: new FormControl<number>(0, [Validators.required]),
  });

  readonly receptionDisplayedColumns: string[] = ['position', 'name', 'amount', 'actions'];
  readonly receptionDataSource = new MatTableDataSource<Recipe>([]);
  readonly receptionCreateForm = new FormGroup({
    rawMaterial: new FormControl<Article | null>(null, [Validators.required]),
    amount: new FormControl(0, [Validators.required]),
  });

  get currentReceptionRawMaterials() {
    return this.receptionDataSource.data.map((r) => r.rawMaterial);
  }

  get categoryControl() {
    return this.form.get('category') as FormControl;
  }
  get unitMeasureControl() {
    return this.form.get('unitMeasure') as FormControl;
  }
  get inStockAmountControl() {
    return this.form.get('inStockAmount') as FormControl;
  }
  get inStockWarningAmountControl() {
    return this.form.get('inStockWarningAmount') as FormControl;
  }
  get tagsControl() {
    return this.form.get('tags') as FormControl;
  }

  get receptionRawMaterialControl() {
    return this.receptionCreateForm.get('rawMaterial') as FormControl;
  }
  get receptionAmountControl() {
    return this.receptionCreateForm.get('amount') as FormControl;
  }

  async ngAfterContentInit() {
    if (this.data?.article) {
      this.form.setValue({
        name: this.data.article.name,
        category: this.data.article.category as ArticleCategory,
        code: this.data.article.code ? this.data.article.code : '',
        unitMeasure: this.data.article.unitMeasure ? this.data.article.unitMeasure : null,
        inStockAmount: this.data.article.inStockAmount,
        inStockWarningAmount: this.data.article.inStockWarningAmount,
        tags: this.data.article.tags.split(','),
      });

      this.receptionDataSource.data = await this.articleService.getReceptions(this.data.article.id);
    }
  }

  removeReception(reception: Recipe) {
    this.receptionDataSource.data = this.receptionDataSource.data.filter(
      (r) => r.rawMaterial.id != reception.rawMaterial.id,
    );
  }

  updateReceptionAmount(reception: Recipe, amount: number) {
    this.receptionDataSource.data = this.receptionDataSource.data.map((r) => {
      if (r.rawMaterial.id == reception.rawMaterial.id) {
        r.amount = parseFloat(String(amount));
      }
      return r;
    });
  }

  submitReceptionCreateForm() {
    if (!this.receptionCreateForm.valid) {
      return;
    }

    this.receptionDataSource.data = [
      ...this.receptionDataSource.data,
      Recipe.createFrom({
        rawMaterial: this.receptionCreateForm.value.rawMaterial as Article,
        amount: parseFloat(String(this.receptionCreateForm.value.amount)),
      }),
    ];

    this.panel.close();
    this.receptionCreateForm.setValue({
      rawMaterial: null,
      amount: 0,
    });
  }

  async save() {
    let formValue = this.form.value;

    let article = Article.createFrom({
      id: this.data?.article?.id ?? 0,
      code: formValue.code == '' ? null : (formValue.code as string),
      unitMeasure: formValue.unitMeasure as UnitMeasure,
      inStockAmount: parseFloat(String(formValue.inStockAmount)),
      inStockWarningAmount: parseFloat(String(formValue.inStockWarningAmount)),
      category: formValue.category as ArticleCategory,
      name: formValue.name as string,
      tags: formValue.tags?.join(',') ?? ('' as string),
    });

    try {
      await this.articleService.save(article, this.receptionDataSource.data);
      this.snackbar.open(`✅ Uspješno sačuvan artikal ${article.name}!`);

      this.dialogRef.close({
        article: article,
        receptions: this.receptionDataSource.data,
      });
    } catch (error) {
      this.snackbar.open(`❌ Došlo je do greške! ${error}`);
    }
  }

  protected readonly ArticleCategoryValues = ArticleCategoryValues;
  protected readonly ArticleCategory = ArticleCategory;
}
