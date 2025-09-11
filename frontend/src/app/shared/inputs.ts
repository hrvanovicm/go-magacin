import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { article, company, unit } from '../../../wailsjs/go/models';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ArticleCategory, ArticleCategoryValues, ArticleService } from '../article/article.service';
import { ArticleCategoryPipe, ArticleInStockPipe } from '../article/article.pipes';
import { UnitMeasureService } from '../unit-measure/unit-measure.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import Article = article.Article;
import UnitMeasure = unit.UnitMeasure;
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../report/report.service';
import Company = company.Company;
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-article-autocomplete [label] [control]',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        #input
        type="text"
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        (input)="filter()"
        (focus)="load()"
      />
      <mat-autocomplete requireSelection #auto="matAutocomplete" [displayWith]="display">
        @for (option of filteredOptions(); track option) {
          <mat-option [value]="option">
            <span> {{ option.name }} ({{ option.code }}) </span>
            <br />
            <small>
              {{ option.category | articleCategoryName }} | Na stanju:
              {{ option.inStockAmount | articleInStock: option.unitMeasure }}
            </small>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  imports: [
    MatFormField,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    ArticleCategoryPipe,
    ArticleInStockPipe,
  ],
})
export class ArticleAutocompleteComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  readonly articleService = inject(ArticleService);

  @Input() label!: string;
  @Input() control!: FormControl<Article | null>;
  @Input() excludes: Article[] = [];
  @Input() includeCategories: ArticleCategory[] = ArticleCategoryValues;

  allOptions: Article[] = [];
  readonly filteredOptions = signal<Article[]>([]);

  async load() {
    if (this.allOptions.length == 0) {
      this.allOptions = await this.articleService.getAll({
        categories: this.includeCategories,
      });
    }

    this.filter();
  }

  display(option: any): string {
    if (option && 'name' in option) {
      return option.name;
    }

    return option;
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions.set(
      this.allOptions.filter((o) => {
        if (this.excludes.find((e) => e.id === o.id)) {
          return false;
        }
        return (
          o.name.toLowerCase().includes(filterValue) || o.code?.toLowerCase().includes(filterValue)
        );
      }),
    );
  }
}

@Component({
  selector: 'app-unit-measure-autocomplete [label] [control]',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        #input
        type="text"
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        (input)="filter()"
        (focus)="load()"
      />
      <mat-autocomplete requireSelection #auto="matAutocomplete" [displayWith]="display">
        @for (option of filteredOptions(); track option) {
          <mat-option [value]="option">
            <span> {{ option.name }} </span>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  imports: [MatFormField, MatInputModule, MatAutocompleteModule, ReactiveFormsModule],
})
export class UnitMeasureAutocompleteComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  readonly unitMeasureService = inject(UnitMeasureService);

  @Input() label!: string;
  @Input() control!: FormControl<UnitMeasure | null>;

  allOptions: UnitMeasure[] = [];

  readonly filteredOptions = signal<UnitMeasure[]>([]);

  async load() {
    if (this.allOptions.length == 0) {
      this.allOptions = await this.unitMeasureService.getAll();
    }

    this.filter();
  }

  display(option: any): string {
    if (option && 'name' in option) {
      return option.name;
    }

    return option;
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions.set(
      this.allOptions.filter((o) => {
        return o.name.toLowerCase().includes(filterValue);
      }),
    );
  }
}

@Component({
  selector: 'app-amount-input [label]',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [formControl]="control"
        [pattern]="isInteger() ? '^[0-9]*$' : '^[0-9]+([.,][0-9]{0,2})?$'"
        (keypress)="onKeyPress($event)"
        [disabled]="disabled"
        (blur)="onBlur($event)"
      />
      <div matSuffix class="mr-3 text-sm">{{ unitMeasure?.name ?? ' N/A' }}</div>
    </mat-form-field>
  `,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class AmountInputComponent {
  @Input() label!: string;
  @Input() initValue?: number;
  @Input() control: FormControl<any> = new FormControl(0);
  @Input() unitMeasure: UnitMeasure | null = null;
  @Input() disabled = false;

  @Output() onValueChange = new EventEmitter<number>();

  isInteger = signal(false);

  ngAfterViewInit() {
    if (this.unitMeasure && this.unitMeasure.isInteger) {
      this.isInteger.set(this.unitMeasure.isInteger);
    }

    if (this.initValue !== undefined) {
      this.control.setValue(this.initValue.toFixed(2));
    }
  }

  onKeyPress(event: KeyboardEvent): boolean {
    const pattern = this.isInteger() ? /[0-9]/ : /[0-9.,]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  onBlur(event: FocusEvent) {
    let value = (event.target as HTMLInputElement).value;

    if (!value) {
      this.control.setValue('0.00');
      this.onValueChange.emit(0);
      return;
    }

    // Remove commas
    value = value.replace(/,/g, '');

    // Parse number
    let num = parseFloat(value);
    if (isNaN(num)) {
      num = 0;
    }

    // Always keep 2 decimals
    const formatted = num.toFixed(2);

    this.control.setValue(formatted);
    this.onValueChange.emit(num);
  }
}

@Component({
  selector: 'app-tags-input [label] [control]',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field class="w-full">
      <mat-label> {{ label }} </mat-label>
      <mat-chip-grid #chipGrid [formControl]="control">
        @for (keyword of keywords(); track keyword) {
          <mat-chip-row (removed)="removeKeyword(keyword)">
            {{ keyword }}
            <button matChipRemove [attr.aria-label]="'ukloni ' + keyword">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
        }
      </mat-chip-grid>
      <input [matChipInputFor]="chipGrid" (matChipInputTokenEnd)="add($event)" />
    </mat-form-field>
  `,
})
export class TagsInputComponent implements AfterViewInit {
  @Input() label!: string;
  @Input() control!: FormControl;

  readonly keywords = signal<any[]>([]);

  ngAfterViewInit() {
    if (this.control.value != '') {
      this.keywords.set(this.control.value);
    }
  }

  announcer = inject(LiveAnnouncer);

  removeKeyword(keyword: string) {
    this.keywords.update((keywords) => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }
      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword}`);
      return [...keywords];
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.keywords.update((keywords) => [...keywords, value]);
    }

    event.chipInput!.clear();
  }
}

@Component({
  selector: 'app-company-autocomplete',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        #input
        type="text"
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        (input)="filter()"
        (focus)="load()"
      />
      <mat-autocomplete requireSelection #auto="matAutocomplete">
        @for (option of filteredOptions(); track option) {
          <mat-option [value]="option.name">
            <span> {{ option.name }} </span>
            @if (option.inHouseProduction) {
              <mat-chip class="ml-3"> Vlastita proizvodnja </mat-chip>
            }
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  imports: [
    MatChipsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
})
export class CompanyAutocompleteComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  readonly reportService = inject(ReportService);

  @Input() label!: string;
  @Input() control!: FormControl<string>;

  allOptions: Company[] = [];

  readonly filteredOptions = signal<Company[]>([]);

  async load() {
    if (this.allOptions.length == 0) {
      this.allOptions = await this.reportService.getAllCompanies();
    }

    this.filter();
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions.set(
      this.allOptions.filter((o) => {
        return o.name?.toLowerCase().includes(filterValue);
      }),
    );
  }
}

@Component({
  selector: 'app-user-autocomplete',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        #input
        type="text"
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        (input)="filter()"
        (focus)="load()"
      />
      <mat-autocomplete #auto="matAutocomplete">
        @for (option of filteredOptions(); track option) {
          <mat-option [value]="option">
            <span> {{ option }} </span>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  imports: [
    FormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
})
export class UserAutocompleteComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  readonly reportService = inject(ReportService);

  @Input() label!: string;
  @Input() control!: FormControl<string>;

  allOptions: string[] = [];

  readonly filteredOptions = signal<string[]>([]);

  async load() {
    if (this.allOptions.length == 0) {
      this.allOptions = await this.reportService.getAllUsers();
    }

    this.filter();
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions.set(
      this.allOptions.filter((o) => {
        return o.toLowerCase().includes(filterValue);
      }),
    );
  }
}

@Component({
  selector: 'app-location-autocomplete',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        #input
        type="text"
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        (input)="filter()"
        (focus)="load()"
      />
      <mat-autocomplete #auto="matAutocomplete">
        @for (option of filteredOptions(); track option) {
          <mat-option [value]="option">
            <span> {{ option }} </span>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  imports: [
    FormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
})
export class LocationAutocompleteComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  readonly reportService = inject(ReportService);

  @Input() label!: string;
  @Input() control!: FormControl<string>;

  allOptions: string[] = [];

  readonly filteredOptions = signal<string[]>([]);

  async load() {
    if (this.allOptions.length == 0) {
      this.allOptions = await this.reportService.getAllLocations();
    }

    this.filter();
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions.set(
      this.allOptions.filter((o) => {
        return o.toLowerCase().includes(filterValue);
      }),
    );
  }
}
