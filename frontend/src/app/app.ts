import {
  ApplicationConfig,
  Component,
  importProvidersFrom,
  inject,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  signal,
} from '@angular/core';
import { provideRouter, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { ProductIndexPage } from './article/article.page';
import { ArticleService } from './article/article.service';
import { UnitMeasureService } from './unit-measure/unit-measure.service';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ReportIndexPage } from './report/report.page';
import { ReportService } from './report/report.service';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import localeBs from '@angular/common/locales/bs';
import { registerLocaleData } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { UnitMeasureIndexDialog } from './unit-measure/index.dialog';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

registerLocaleData(localeBs);

@Component({
  imports: [MatToolbar, MatButton, RouterOutlet, MatDivider, RouterLink],
  template: `
    <mat-toolbar class="shrink-0">
      <span>Magacin</span>
      <span class="flex-1 basis-auto"></span>
      <button matButton [routerLink]="['/products']">Roba</button>
      <button matButton [routerLink]="['/reports']">Izvještaji</button>
      <button matButton (click)="openUnitMeasureDialog()">Mjerne jedinice</button>
    </mat-toolbar>

    <main class="flex flex-1 min-h-0 w-full overflow-hidden flex-col">
      <mat-divider></mat-divider>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: `
    :host {
      @apply flex flex-col h-full w-full overflow-hidden;
    }
  `
})
class ScaffoldLayout {
  readonly dialog = inject(MatDialog);

  openUnitMeasureDialog() {
    const dialogRef = this.dialog.open(UnitMeasureIndexDialog, {
      width: '1200px',
      height: '600px',
    });
  }
}

export const routes: Routes = [
  {
    path: '',
    component: ScaffoldLayout,
    children: [
      { path: 'products', component: ProductIndexPage },
      { path: 'reports', component: ReportIndexPage },
    ],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ArticleService,
    UnitMeasureService,
    ReportService,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
        appearance: 'outline',
      },
    },
    { provide: LOCALE_ID, useValue: 'bs-BA' },
    { provide: MAT_DATE_LOCALE, useValue: 'bs-BA' },
    importProvidersFrom(MatDatepickerModule, MatNativeDateModule),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 2000,
      },
    },
  ],
};

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  styles: `
    :host {
      @apply flex flex-col h-full w-full overflow-hidden;
    }
  `,
  imports: [RouterOutlet],
})
export class App {}
