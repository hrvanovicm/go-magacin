import {
  ApplicationConfig,
  Component,
  importProvidersFrom,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  signal,
} from '@angular/core';
import { provideRouter, RouterOutlet, Routes } from '@angular/router';
import { ScaffoldLayout } from './shared/scaffold.layout';
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

registerLocaleData(localeBs);

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
  ],
};

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  imports: [RouterOutlet],
})
export class App {}
