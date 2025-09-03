import { AfterContentInit, Component, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { article, company, report, unit } from '../../../../wailsjs/go/models';
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
  CompanyAutocompleteComponent,
  LocationAutocompleteComponent,
  UserAutocompleteComponent,
} from '../../shared/inputs';
import Report = report.Report;
import { ReportService, ReportType, ReportTypeValues } from '../report.service';
import { ArticleCategoryValues } from '../../article/article.service';
import { ReporTypeNamePipe } from '../report.pipes';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import ReportArticle = report.ReportArticle;
import ReportRecipe = report.ReportRecipe;
import Company = company.Company;
import Article = article.Article;
import Recipe = article.Recipe;

export interface ReportEditDialogResult {
  report?: Report;
  articles?: any[];
}

@Component({
  template: `
    <h2 mat-dialog-title>{{ !data?.id ? 'Kreiraj izvještaj' : data!.code }}</h2>
    <mat-dialog-content class="mat-typography min-w-[420px] h-full overflow-hidden">
      <mat-tab-group class="h-full overflow-hidden">
        <mat-tab label="Osnovne informacije" class="h-full overflow-hidden">
          <div class="h-full overflow-y-scroll">
            <form class="flex flex-col gap-y-5 mt-5 max-w-[400px] mx-auto" [formGroup]="form">
              <div class="flex flex-col gap-5">
                <mat-form-field class="w-full">
                  <mat-label> Tip</mat-label>
                  <mat-select formControlName="type">
                    @for (type of ReportTypeValues; track type) {
                      <mat-option [value]="type">{{ type | reportTypeName }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full">
                  <mat-label> Šifra</mat-label>
                  <input matInput formControlName="code" />
                </mat-form-field>
                @if (typeControl.value == ReportType.RECEIPT) {
                  <mat-form-field class="w-full">
                    <mat-label> Šifra dobavljača </mat-label>
                    <input matInput formControlName="supplierReportCode" />
                  </mat-form-field>
                  <app-company-autocomplete label="Dobavljač" [control]="supplierCompanyControl" />
                }
                @if (typeControl.value == ReportType.SHIPMENT) {
                  <app-company-autocomplete label="Primaoc" [control]="receiptCompanyControl" />
                }
              </div>
              <mat-divider></mat-divider>
              <div class="flex flex-col gap-5">
                <mat-form-field class="w-full">
                  <mat-label>Datum izdavanja</mat-label>
                  <input matInput [matDatepicker]="datepicker" formControlName="signedAt" />
                  <mat-hint>YYYY-MM-DD</mat-hint>
                  <mat-datepicker-toggle matIconSuffix [for]="datepicker"></mat-datepicker-toggle>
                  <mat-datepicker #datepicker />
                </mat-form-field>
                <app-location-autocomplete
                  label="Lokacija izdavanja"
                  [control]="signedAtLocationControl"
                />
                <app-user-autocomplete label="Izdao/la" [control]="signedByControl" />
              </div>
            </form>
          </div>
        </mat-tab>

        <mat-tab [label]="'Artikli (' + articleDataSource.data.length + ')'">
          <div class="pt-3">
            <mat-accordion>
              <mat-expansion-panel #addArticlePanel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>add</mat-icon>
                    <span class="ml-3"> Dodaj artikal </span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <form
                  class="flex flex-row justify-between gap-x-3"
                  [formGroup]="articleForm"
                  (submit)="submitArticleForm()"
                >
                  <app-article-autocomplete
                    label="Sirovina"
                    class="w-full"
                    [control]="articleControl"
                    [excludes]="currentArticles"
                    [includeCategories]="ArticleCategoryValues"
                  />
                  <app-amount-input
                    label="Količina"
                    [control]="articleAmountControl"
                    class="w-28"
                  />
                  <button matButton="filled" type="submit">Dodaj</button>
                </form>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
          <table mat-table class="mt-1" [dataSource]="articleDataSource" multiTemplateDataRows>
            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef>Rb.</th>
              <td mat-cell *matCellDef="let element; let i = index"> {{ i }} .</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Sirovina</th>
              <td mat-cell *matCellDef="let element">{{ element.article.name }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Količina</th>
              <td mat-cell *matCellDef="let element">
                <app-amount-input
                  label="Količina"
                  [unitMeasure]="element.article.unitMeasure"
                  (click)="$event.preventDefault()"
                />
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let element">
                <button matIconButton (click)="removeArticle(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <ng-container matColumnDef="expandedDetail">
              <td class="!p-0" mat-cell *matCellDef="let element" [attr.colspan]="articleDisplayedColumnsExpanded.length">
                <div
                  class="example-element-detail-wrapper !bg-gray-100 mt-2 rounded-lg"
                  [class.example-element-detail-wrapper-expanded]="isArticleExpanded(element)"
                >
                  <div class="example-element-detail flex flex-col !bg-transparent px-3 py-2">
                    <h4 class="text-xl mt-3 mb-2">Receptura</h4>
                    <mat-accordion>
                      <mat-expansion-panel class="!shadow-none" #addRecipePanel>
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>add</mat-icon>
                            <span class="ml-3"> Dodaj recepturu </span>
                          </mat-panel-title>
                        </mat-expansion-panel-header>
                        <form
                          class="flex flex-row justify-between gap-x-3"
                          [formGroup]="recipeForm"
                          (submit)="submitRecipeForm()"
                        >
                          <app-article-autocomplete
                            label="Sirovina"
                            class="w-full"
                            [control]="recipeRawMaterialControl"
                            [excludes]="currentArticles"
                            [includeCategories]="ArticleCategoryValues"
                          />
                          <app-amount-input
                            label="Količina"
                            [control]="recipeAmountControl"
                            class="w-28"
                          />
                          <button matButton="filled" type="submit">Dodaj</button>
                        </form>
                      </mat-expansion-panel>
                    </mat-accordion>
                    <table mat-table class="mat-elevation-z8 !bg-transparent" [dataSource]="recipeDataSource">
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
                        <td mat-cell *matCellDef="let element">{{ element.amount }}</td>
                      </ng-container>
                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef></th>
                        <td mat-cell *matCellDef="let element">
                          <button matIconButton (click)="removeRecipe(expandedElement, element)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="recipeDisplayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: recipeDisplayedColumns"></tr>
                    </table>
                  </div>
                </div>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="articleDisplayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: articleDisplayedColumns"
              (click)="expandArticle(row)"
              [class]="{ hidden: expandedElement != null && !isArticleExpanded(row) }"
            ></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: ['expandedDetail']"
              class="example-detail-row"
            ></tr>
          </table>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Odustani</button>
      <button matButton="filled" cdkFocusInitial (click)="save()">Sačuvaj</button>
    </mat-dialog-actions>
  `,
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatTableModule,
    MatExpansionModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDivider,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIconModule,
    ArticleAutocompleteComponent,
    AmountInputComponent,
    ReporTypeNamePipe,
    CompanyAutocompleteComponent,
    LocationAutocompleteComponent,
    UserAutocompleteComponent,
  ],
  styles: `
    table {
      width: 100%;
    }

    tr {
      cursor: pointer;
    }
    
    tr.example-detail-row {
      height: 0;
    }

    tr.example-element-row {
      cursor: pointer;
    }

    tr.example-element-row:not(.example-expanded-row):hover {
      background: whitesmoke;
    }

    tr.example-element-row:not(.example-expanded-row):active {
      background: #efefef;
    }

    .example-element-detail-wrapper {
      display: none !important;
    }

    .example-element-detail-wrapper.example-element-detail-wrapper-expanded {
      display: grid !important;
    }

    .example-element-row td {
      border-bottom-width: 0;
    }

    .example-element-detail-wrapper {
      overflow: hidden;
      display: grid;
      grid-template-rows: 0fr;
      grid-template-columns: 100%;
      transition: grid-template-rows 225ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .example-element-detail-wrapper-expanded {
      grid-template-rows: 1fr;
    }

    .example-element-detail {
      display: flex;
      min-height: 0;
    }
  `,
})
export class ReportEditDialog implements AfterContentInit {
  @ViewChild('addArticlePanel') articleCreatePanel!: MatExpansionPanel;
  @ViewChild('addRecipePanel') recipeCreatePanel!: MatExpansionPanel;

  readonly data = inject<Report | undefined>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ReportEditDialog>);
  readonly reportService = inject(ReportService);

  readonly form = new FormGroup({
    type: new FormControl<ReportType | null>(null, [Validators.required]),
    code: new FormControl<string>(''),
    receiptCompany: new FormControl<string>(''),
    supplierCompany: new FormControl<string>(''),
    supplierReportCode: new FormControl<string>(''),
    signedAt: new FormControl<string>(''),
    signedAtLocation: new FormControl<string>(''),
    signedBy: new FormControl<string>(''),
  });

  expandedElement: ReportArticle | null = null;
  readonly articleDisplayedColumns: string[] = ['position', 'name', 'amount', 'actions'];
  readonly articleDisplayedColumnsExpanded: string[] = [...this.articleDisplayedColumns, 'expand'];
  readonly articleDataSource = new MatTableDataSource<ReportArticle>([]);
  readonly articleForm = new FormGroup({
    article: new FormControl<Article | null>(null, [Validators.required]),
    amount: new FormControl(0, [Validators.required]),
  });

  readonly recipeDisplayedColumns: string[] = ['position', 'name', 'amount', 'actions'];
  readonly recipeDataSource = new MatTableDataSource<ReportRecipe>([]);
  readonly recipeForm = new FormGroup({
    rawMaterial: new FormControl<Article | null>(null, [Validators.required]),
    amount: new FormControl(0, [Validators.required]),
  });

  get currentArticles() {
    return this.articleDataSource.data.map((r) => r.article);
  }

  get currentRecipeRawMaterials() {
    return this.recipeDataSource.data.map((r) => r.rawMaterial);
  }

  get typeControl() {
    return this.form.get('type') as FormControl;
  }
  get receiptCompanyControl() {
    return this.form.get('receiptCompany') as FormControl;
  }
  get supplierCompanyControl() {
    return this.form.get('supplierCompany') as FormControl;
  }
  get signedAtLocationControl() {
    return this.form.get('signedAtLocation') as FormControl;
  }
  get signedByControl() {
    return this.form.get('signedBy') as FormControl;
  }

  get articleControl() {
    return this.articleForm.get('article') as FormControl;
  }
  get articleAmountControl() {
    return this.articleForm.get('amount') as FormControl;
  }

  get recipeRawMaterialControl() {
    return this.recipeForm.get('rawMaterial') as FormControl;
  }
  get recipeAmountControl() {
    return this.recipeForm.get('amount') as FormControl;
  }

  async ngAfterContentInit() {
    if (this.data) {
      this.form.setValue({
        code: this.data.code ? this.data.code : null,
        signedBy: this.data.signedBy ?? '',
        signedAtLocation: this.data.signedAtLocation ?? '',
        signedAt: this.data.signedAt ?? null,
        receiptCompany: this.data.shipment.receiptCompany.name ?? '',
        type: this.data.type as ReportType,
        supplierCompany: this.data.receipt.supplierCompany.name ?? '',
        supplierReportCode: this.data.receipt.supplierReportCode ?? '',
      });
    }

    if (this.data) {
      this.articleDataSource.data = await this.reportService.getArticles(this.data.id);
    }
  }

  removeArticle(article: ReportArticle) {
    this.articleDataSource.data = this.articleDataSource.data.filter(
      (r) => r.article.id != article.article.id,
    );
  }

  removeRecipe(article: ReportArticle | null, recipe: ReportRecipe) {
    this.recipeDataSource.data = this.recipeDataSource.data.filter(
      (r) => r.rawMaterial.id != recipe?.rawMaterial.id,
    );

    this.articleDataSource.data = this.articleDataSource.data.map(value => {
      if(value.article.id == article?.article.id) {
        value.usedRecipes = this.recipeDataSource.data ?? [];
      }

      return value;
    })
  }

  submitArticleForm() {
    if (!this.articleForm.valid) {
      return;
    }

    this.articleDataSource.data = [
      ...this.articleDataSource.data,
      ReportArticle.createFrom({
        article: this.articleForm.value.article,
        amount: parseFloat(String(this.articleForm.value.amount)),
        usedRecipes: [],
      }),
    ];

    this.articleCreatePanel.close();
    this.articleForm.setValue({
      article: null,
      amount: 0,
    });

    console.log(this.articleDataSource.data);
  }

  submitRecipeForm() {
    if (!this.recipeForm.valid) {
      return;
    }

    this.recipeDataSource.data = [
      ...this.recipeDataSource.data,
      ReportRecipe.createFrom({
        rawMaterial: this.recipeForm.value.rawMaterial as Article,
        amount: parseFloat(String(this.articleForm.value.amount)),
      }),
    ];

    this.expandedElement!.usedRecipes = this.recipeDataSource.data ?? [];

    this.recipeCreatePanel.close();
    this.recipeForm.setValue({
      rawMaterial: null,
      amount: 0,
    });
  }

  expandArticle(element: ReportArticle) {
    this.expandedElement = this.isArticleExpanded(element) ? null : element;
    this.recipeDataSource.data = element.usedRecipes;
  }

  isArticleExpanded(element: ReportArticle) {
    return this.expandedElement === element;
  }

  async save() {
    let formValue = this.form.value;

    let report = Report.createFrom({
      id: this.data?.id ?? 0,
      type: formValue.type,
      code: (formValue.code?.length ?? 0) > 0 ? formValue.code : undefined,
      signedAt: (formValue.signedAt?.length ?? 0) > 0 ? formValue.signedAt : undefined,
      signedAtLocation:
        (formValue.signedAtLocation?.length ?? 0) > 0 ? formValue.signedAtLocation : undefined,
      signedBy: (formValue.signedBy?.length ?? 0) > 0 ? formValue.signedBy : undefined,
      receipt: {
        supplierCompany:
          formValue.supplierCompany != ''
            ? Company.createFrom({
                name: formValue.supplierCompany,
              })
            : undefined,
        supplierReportCode:
          formValue.supplierReportCode != '' ? formValue.supplierReportCode : undefined,
      },
      shipment: {
        receiptCompany:
          formValue.receiptCompany != ''
            ? Company.createFrom({
                name: formValue.receiptCompany,
              })
            : undefined,
      },
    });

    console.log(this.articleDataSource.data);
    await this.reportService.save(report, this.articleDataSource.data);

    this.dialogRef.close(this.data);
  }

  protected readonly ReportTypeValues = ReportTypeValues;
  protected readonly ArticleCategoryValues = ArticleCategoryValues;
  protected readonly ReportType = ReportType;
}
