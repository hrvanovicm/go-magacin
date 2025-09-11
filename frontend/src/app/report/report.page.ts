import {
  AfterContentInit,
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { debounceTime } from 'rxjs';
import { article, report } from '../../../wailsjs/go/models';
import Article = article.Article;
import { ReportParams, ReportService, ReportType, ReportTypeValues } from './report.service';
import { ReportEditDialog, ReportEditDialogResult } from './components/edit.dialog';
import { DatePipe } from '@angular/common';
import Report = report.Report;

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
    DatePipe,
  ],
  template: `
    <mat-toolbar>
      <mat-toolbar-row>
        <h4 class="!text-xl">Izvještaji ({{ dataSource.filteredData.length }})</h4>
        <span class="mx-5">|</span>
        <form class="flex flex-row gap-x-1" [formGroup]="filterForm">
          <mat-form-field class="w-64">
            <mat-label>Pretraga</mat-label>
            <input matInput formControlName="search" />
          </mat-form-field>
          <div class="flex flex-row gap-x-1">
            <button matIconButton (click)="reset()">
              <mat-icon>refresh</mat-icon>
            </button>
            <mat-chip-listbox formControlName="types" [multiple]="true" class="flex flex-row">
              <mat-chip-option [value]="ReportType.RECEIPT">Primka</mat-chip-option>
              <mat-chip-option [value]="ReportType.SHIPMENT">Otpremnica</mat-chip-option>
            </mat-chip-listbox>
          </div>
        </form>
        <span class="flex-1 basis-auto"></span>
        <button matButton (click)="openCreateDialog()">
          Kreiraj izvještaj <mat-icon>add</mat-icon>
        </button>
      </mat-toolbar-row>
    </mat-toolbar>

    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" matSort>
      <ng-container matColumnDef="position">
        <th mat-header-cell *matHeaderCellDef>Rb.</th>
        <td mat-cell *matCellDef="let i = index">{{ i + 1 }}.</td>
      </ng-container>
      <ng-container matColumnDef="icon">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let element">
          @if (element.type === ReportType.RECEIPT) {
            <mat-icon class="text-xl text-gray-600">present_to_all</mat-icon>
          } @else if (element.type === ReportType.SHIPMENT) {
            <mat-icon class="text-xl text-gray-600">local_shipping</mat-icon>
          }
        </td>
      </ng-container>
      <ng-container matColumnDef="code">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Šifra</th>
        <td mat-cell *matCellDef="let element">
          <strong> {{ element.code }} </strong>
        </td>
      </ng-container>
      <ng-container matColumnDef="company">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Kompanija</th>
        <td mat-cell *matCellDef="let element">
          @if (element.type === ReportType.RECEIPT) {
            {{ element.receipt.supplierCompany.name }}
            @if (element.receipt.supplierCompany.inHouseProduction) {
              <mat-chip class="ml-3"> Vlastita proizvodnja </mat-chip>
            }
          } @else if (element.type === ReportType.SHIPMENT) {
            {{ element.shipment.receiptCompany.name }}
            @if (element.shipment.receiptCompany.inHouseProduction) {
              <mat-chip class="ml-3"> Vlastita proizvodnja </mat-chip>
            }
          }
        </td>
      </ng-container>
      <ng-container matColumnDef="signedOnDate">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Datum</th>
        <td mat-cell *matCellDef="let element">
          @if (element.signedAt) {
            {{ element.signedAt | date: 'longDate' }}
          }
        </td>
      </ng-container>
      <ng-container matColumnDef="locationOfPublish">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Lokacija</th>
        <td mat-cell *matCellDef="let element">{{ element.signedAtLocation }}</td>
      </ng-container>
      <ng-container matColumnDef="signedByName">
        <th mat-header-cell *matHeaderCellDef>Potpisao</th>
        <td mat-cell *matCellDef="let element">{{ element.signedBy }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns"
        (click)="openUpdateDialog(row)"
      ></tr>
    </table>
  `,
  styles: `
    tr {
      cursor: pointer !important;
    }
    tr:not(.example-expanded-row):hover {
      background: whitesmoke !important;
    }
  `,
})
export class ReportIndexPage implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  readonly reportService = inject(ReportService);
  readonly dialog = inject(MatDialog);

  readonly displayedColumns: string[] = [
    'position',
    'icon',
    'code',
    'company',
    'signedOnDate',
    'locationOfPublish',
    'signedByName',
  ];
  readonly dataSource = new MatTableDataSource<Report>([]);
  readonly filterForm = new FormGroup({
    search: new FormControl<string | null>(null),
    types: new FormControl<ReportType[]>(ReportTypeValues),
  });

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
    const dialogRef = this.dialog.open(ReportEditDialog, {
      width: '600px',
      height: '80vh',
      maxHeight: '1200px',
      maxWidth: '600px',
    });

    dialogRef.afterClosed().subscribe(async (result?: ReportEditDialogResult) => {
      if (result) {
        this.load();
      }
    });
  }

  async openUpdateDialog(report: Report) {
    const dialogRef = this.dialog.open(ReportEditDialog, {
      width: '600px',
      height: '80vh',
      maxHeight: '1200px',
      maxWidth: '600px',
      data: report,
    });

    dialogRef.afterClosed().subscribe(async (result?: ReportEditDialogResult) => {
      if (result) {
        this.load();
      }
    });
  }

  async reset() {
    // this.filterForm.setValue({
    //   search: null,
    //   categories: ArticleCategoryValues,
    //   isLowInStock: null
    // })

    await this.load();
  }

  async load() {
    let filterFormValue = this.filterForm.getRawValue();

    let sortValue = {
      direction: this.sort.direction ?? 'asc',
      active: this.sort.active,
    };

    let params: Partial<ReportParams> = {};

    if (filterFormValue.search) {
      params.search = filterFormValue.search;
    }

    if (filterFormValue.types) {
      params.types = filterFormValue.types;
    }

    this.dataSource.data = await this.reportService.getAll(params);
  }

  protected readonly ReportType = ReportType;
}
