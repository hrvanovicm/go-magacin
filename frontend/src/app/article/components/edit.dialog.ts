import {AfterContentInit, Component, inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {ArticleCategory, ArticleCategoryValues, ArticleService} from '../article.service';
import {ArticleCategoryPipe} from '../article.pipes';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {article, unit} from '../../../../wailsjs/go/models';
import {MatDivider} from '@angular/material/divider';
import {MatTabsModule} from '@angular/material/tabs';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {
  AmountInputComponent,
  ArticleAutocompleteComponent,
  TagsInputComponent,
  UnitMeasureAutocompleteComponent
} from '../../shared/inputs';
import Article = article.Article;
import UnitMeasure = unit.UnitMeasure;
import Reception = article.Reception;

export interface ArticleEditDialogData {
  article: Article | null;
  receptions: any[];
  receipts: any[]
}

@Component({
  template: `
    <h2 mat-dialog-title> {{ !data?.article?.id ? "Kreiraj robu" : data.article!.name }} </h2>
    <mat-dialog-content class="mat-typography min-w-[420px] h-full overflow-hidden">
      <mat-tab-group class="h-full overflow-hidden">
        <mat-tab label="Osnovne informacije" class="h-full overflow-hidden">
        <div class="h-full overflow-y-scroll">
          <form class="flex flex-col gap-y-5 mt-5 max-w-[400px] mx-auto" [formGroup]="basicInfoForm">
            <div class="flex flex-col gap-5">
              <mat-form-field class="w-full">
                <mat-label> Kategorija</mat-label>
                <mat-select formControlName="category">
                  @for (category of ArticleCategoryValues; track category) {
                    <mat-option [value]="category">{{ category | articleCategoryName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label> Naziv</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label> Šifra</mat-label>
                <input matInput formControlName="code">
              </mat-form-field>
            </div>
            <mat-divider></mat-divider>
            <div class="flex flex-col gap-5">
              <app-unit-measure-autocomplete class="w-full"
                                             label="Mjerna jedinica"
                                             [control]="unitMeasureControl"/>
              <app-amount-input class="w-full" label="Na stanju"
                                [control]="inStockAmountControl"
                                [unitMeasure]="unitMeasureControl.value"/>
              <app-amount-input class="w-full" label="Min. količina na stanju"
                                [control]="inStockWarningAmountControl"
                                [unitMeasure]="unitMeasureControl.value"/>
            </div>
            <mat-divider></mat-divider>
            <app-tags-input label="Oznake" [control]="tagsControl"/>
          </form>
        </div>
        </mat-tab>

        <mat-tab [label]="'Receptura (' + receptionDataSource.data.length + ')'"
                 [disabled]="categoryControl.value != ArticleCategory.PRODUCT">
          <div class="pt-3">
            <mat-accordion>
              <mat-expansion-panel #createRawMaterialPanel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>add</mat-icon>
                    <span class="ml-3"> Dodaj sirovinu </span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <form class="flex flex-row justify-between gap-x-3" [formGroup]="receptionCreateForm"
                      (submit)="submitReceptionCreateForm()">
                  <app-article-autocomplete
                    label="Sirovina" class="w-full"
                    [control]="receptionRawMaterialControl"
                    [excludes]="currentReceptionRawMaterials"
                    [includeCategories]="[ArticleCategory.RAW_MATERIAL]"/>
                  <app-amount-input label="Količina" [control]="receptionAmountControl" class="w-28"/>
                  <button matButton="filled" type="submit"> Dodaj</button>
                </form>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
          <table mat-table class="mat-elevation-z8 mt-1" [dataSource]="receptionDataSource">
            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef> Rb.</th>
              <td mat-cell *matCellDef="let i = index"> {{ i + 1 }}.</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef> Sirovina</th>
              <td mat-cell *matCellDef="let element"> {{ element.rawMaterial.name }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef> Količina</th>
              <td mat-cell *matCellDef="let element"> {{ element.amount }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> </th>
              <td mat-cell *matCellDef="let element">
                <button matIconButton (click)="removeReception(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="receptionDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: receptionDisplayedColumns;"></tr>
          </table>
        </mat-tab>

        <mat-tab label="Ulaz / Izlaz">
          <table mat-table class="mat-elevation-z8">
            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef> Rb.</th>
              <td mat-cell *matCellDef="let element"> {{ element.position }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef> Name</th>
              <td mat-cell *matCellDef="let element"> {{ element.name }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef> Količina</th>
              <td mat-cell *matCellDef="let element"> {{ element.weight }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> </th>
              <td mat-cell *matCellDef="let element">

              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="receptionDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: receptionDisplayedColumns;"></tr>
          </table>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close> Odustani</button>
      <button matButton="filled" cdkFocusInitial (click)="save()" [disabled]="!basicInfoForm.valid"> Sačuvaj</button>
    </mat-dialog-actions>
  `,
  imports: [MatTableModule, MatExpansionModule, MatTabsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ArticleCategoryPipe, ReactiveFormsModule, MatDivider, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatIconModule, ArticleAutocompleteComponent, AmountInputComponent, UnitMeasureAutocompleteComponent, TagsInputComponent],
})
export class ArticleEditDialog implements AfterContentInit {
  readonly dialogRef = inject(MatDialogRef<ArticleEditDialog>);

  readonly data = inject<ArticleEditDialogData>(MAT_DIALOG_DATA);

  @ViewChild('createRawMaterialPanel') panel!: MatExpansionPanel;

  readonly articleService = inject(ArticleService);

  readonly basicInfoForm = new FormGroup({
    category: new FormControl<ArticleCategory | undefined>(undefined, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    code: new FormControl<string | undefined>(''),
    tags: new FormControl<string[]>([]),
    unitMeasure: new FormControl<UnitMeasure | undefined>(undefined),
    inStockAmount: new FormControl<number>(0, [Validators.required]),
    inStockWarningAmount: new FormControl<number>(0, [Validators.required]),
  })

  readonly receptionDisplayedColumns: string[] = ['position', 'name', 'amount', 'actions'];
  readonly receptionDataSource = new MatTableDataSource<any>([]);
  readonly receptionCreateForm = new FormGroup({
    rawMaterial: new FormControl<Article | null>(null, [Validators.required]),
    amount: new FormControl(0, [Validators.required]),
  })
  
  get currentReceptionRawMaterials() {
    return this.receptionDataSource.data.map(r => r.rawMaterial);
  }

  get categoryControl() {
    return this.basicInfoForm.get('category') as FormControl<ArticleCategory | null>;
  }
  get unitMeasureControl() {
    return this.basicInfoForm.get('unitMeasure') as FormControl<UnitMeasure | null>;
  }
  get inStockAmountControl() {
    return this.basicInfoForm.get('inStockAmount') as FormControl<number>;
  }
  get inStockWarningAmountControl() {
    return this.basicInfoForm.get('inStockWarningAmount') as FormControl<number>;
  }
  get tagsControl() {
    return this.basicInfoForm.get('tags') as FormControl<string[]>;
  }

  get receptionRawMaterialControl() {
    return this.receptionCreateForm.get('rawMaterial') as FormControl<Article | null>;
  }
  get receptionAmountControl() {
    return this.receptionCreateForm.get('amount') as FormControl<number>;
  }

  async ngAfterContentInit() {
    if (this.data?.article) {
      this.basicInfoForm.setValue({
        name: this.data.article.name,
        category: this.data.article.category as ArticleCategory,
        code: this.data.article.code,
        unitMeasure: this.data.article.unitMeasure,
        inStockAmount: this.data.article.inStockAmount,
        inStockWarningAmount: this.data.article.inStockWarningAmount,
        tags: this.data.article.tags.split(',')
      })
    }

    if (this.data?.receptions) {
      this.receptionDataSource.data = this.data.receptions;
    }
  }

  removeReception(reception: Reception) {
    this.receptionDataSource.data = this.receptionDataSource.data.filter(r => r.rawMaterial.id != reception.rawMaterial.id);
  }

  submitReceptionCreateForm() {
    if (!this.receptionCreateForm.valid) {
      return;
    }

    this.receptionDataSource.data = [
      ...this.receptionDataSource.data,
      {
        rawMaterial: this.receptionCreateForm.value.rawMaterial,
        amount: parseFloat(String(this.receptionCreateForm.value.amount)),
      }
    ];

    this.panel.close();
    this.receptionCreateForm.setValue({
      rawMaterial: null,
      amount: 0,
    })
  }

  async save() {
    let basicFormValue = this.basicInfoForm.value;

    await this.articleService.save(Article.createFrom({
      id: this.data?.article?.id ?? 0,
      code: basicFormValue.code,
      unitMeasure: basicFormValue.unitMeasure as UnitMeasure,
      inStockAmount: parseFloat(String(basicFormValue.inStockAmount)),
      inStockWarningAmount: parseFloat(String(basicFormValue.inStockWarningAmount)),
      category: basicFormValue.category as ArticleCategory,
      name: basicFormValue.name as string,
      tags: basicFormValue.tags?.join(",") ?? "" as string
    }))

    if(basicFormValue.category === ArticleCategory.PRODUCT) {
      await this.articleService.saveReceptions(this.data.article?.id ?? 0, this.receptionDataSource.data);
    }

    this.dialogRef.close(this.data);
  }

  protected readonly ArticleCategoryValues = ArticleCategoryValues;
  protected readonly ArticleCategory = ArticleCategory;
}
