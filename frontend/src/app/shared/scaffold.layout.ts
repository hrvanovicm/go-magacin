import {Component, inject} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton} from '@angular/material/button';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatDivider} from '@angular/material/divider';
import {MatDialog} from '@angular/material/dialog';
import {UnitMeasureIndexDialog} from '../unit-measure/index.dialog';

@Component({
  imports: [
    MatToolbar,
    MatButton,
    RouterOutlet,
    MatDivider,
    RouterLink
  ],
  template: `
    <mat-toolbar>
      <span>Magacin</span>
      <span class="flex-1 basis-auto"></span>
      <button matButton [routerLink]="['/products']">Roba</button>
      <button matButton>Ulaz / Izlaz</button>
      <button matButton (click)="openUnitMeasureDialog()">Mjerne jedinice</button>
    </mat-toolbar>

    <main>
      <mat-divider></mat-divider>
      <router-outlet></router-outlet>
    </main>
  `
})
export class ScaffoldLayout {
  readonly dialog = inject(MatDialog);

  openUnitMeasureDialog() {
    const dialogRef = this.dialog.open(UnitMeasureIndexDialog, {
      width: '1200px',
      height: '600px',
    });
   }
}
