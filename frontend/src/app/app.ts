import {
  ApplicationConfig,
  Component,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  signal
} from '@angular/core';
import {provideRouter, RouterOutlet, Routes} from '@angular/router';
import {ScaffoldLayout} from './shared/scaffold.layout';
import {ProductIndexPage} from './article/article.page';
import {ArticleService} from './article/article.service';
import {UnitMeasureService} from './unit-measure/unit-measure.service';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';

export const routes: Routes = [
  {
    path: '',
    component: ScaffoldLayout,
    children: [
      { path: 'products', component: ProductIndexPage },
    ]
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ArticleService, UnitMeasureService,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
        appearance: 'outline'
      }
    }
  ]
};


@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [],
  imports: [
    RouterOutlet
  ]
})
export class App {}
