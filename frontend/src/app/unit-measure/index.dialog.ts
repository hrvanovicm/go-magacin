import {AfterViewInit, Component, inject, ViewChild} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDivider} from '@angular/material/divider';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {UnitMeasureService} from './unit-measure.service';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatExpansionModule, MatExpansionPanel} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {unit} from '../../../wailsjs/go/models';
import UnitMeasure = unit.UnitMeasure;

@Component({
  template: `
    <h2 mat-dialog-title> Mjerne jedinice </h2>
    <mat-dialog-content class="mat-typography">
      <div class="pt-3">
        <mat-accordion>
          <mat-expansion-panel #createPanel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>add</mat-icon>
                <span class="ml-3"> Kreiraj mjernu jedinicu </span>
              </mat-panel-title>
            </mat-expansion-panel-header>
            <form class="flex flex-row justify-between gap-x-3" [formGroup]="createForm" (submit)="submit()">
              <mat-form-field>
                <mat-label>Naziv</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-checkbox formControlName="is_integer" value="true"> Cijeli broj</mat-checkbox>
              <button matButton="filled" type="submit"> Sačuvaj</button>
            </form>
          </mat-expansion-panel>
        </mat-accordion>
      </div>
      <mat-divider class="!mt-5"></mat-divider>
      <div class="mt-3 max-h-80 overflow-y-auto">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8 w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Naziv</th>
            <td mat-cell *matCellDef="let element"> {{ element.name }}</td>
          </ng-container>
          <ng-container matColumnDef="is_integer">
            <th mat-header-cell *matHeaderCellDef> Cijeli broj</th>
            <td mat-cell *matCellDef="let element">
              <mat-checkbox [checked]="element.isInteger" (click)="toggleIsInteger(element)"></mat-checkbox>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let element">
              <button matIconButton (click)="delete(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Odustani</button>
      <button matButton="filled" cdkFocusInitial (click)="saveAll()"> Sačuvaj</button>
    </mat-dialog-actions>
  `,
  imports: [MatIconModule, MatExpansionModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule, MatDivider, MatTableModule, MatCheckboxModule, ReactiveFormsModule]
})
export class UnitMeasureIndexDialog implements AfterViewInit {
  unitMeasureService = inject(UnitMeasureService);

  @ViewChild('createPanel') createPanel!: MatExpansionPanel;

  readonly displayedColumns: string[] = ['name', 'is_integer', 'actions'];
  readonly dataSource = new MatTableDataSource<UnitMeasure>([]);

  readonly createForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    is_integer: new FormControl<boolean>(false, [Validators.required]),
  })

  async ngAfterViewInit() {
    this.dataSource.data = await this.unitMeasureService.getAll();
  }

  async toggleIsInteger(unitMeasure: UnitMeasure) {
    let data = this.dataSource.data;

    data.map(um => {
      if (unitMeasure.id == um.id) {
        um.isInteger = !um.isInteger;
      }
      return um;
    })

    this.dataSource.data = data;
  }

  async delete(unitMeasure: UnitMeasure) {
    this.dataSource.data = this.dataSource.data.filter(u => u.id != unitMeasure.id);
  }

  async submit() {
    if (!this.createForm.valid) {
      return;
    }

    let formValue = this.createForm.value;

    this.dataSource.data = [
      ...this.dataSource.data,
      {
        id: 0,
        name: formValue.name as string,
        isInteger: formValue.is_integer as boolean,
      }
    ]

    this.createPanel.close();
    this.createForm.setValue({
      name: null,
      is_integer: false,
    })
  }

  async saveAll() {
    await this.unitMeasureService.saveAll(this.dataSource.data);
  }
}
