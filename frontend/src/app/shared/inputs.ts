import {AfterViewInit, Component, ElementRef, inject, Input, signal, ViewChild} from '@angular/core';
import {article, unit} from '../../../wailsjs/go/models';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ArticleCategory, ArticleCategoryValues, ArticleService} from '../article/article.service';
import {ArticleCategoryPipe, ArticleInStockPipe} from '../article/article.pipes';
import {UnitMeasureService} from '../unit-measure/unit-measure.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import Article = article.Article;
import UnitMeasure = unit.UnitMeasure;
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-article-autocomplete [label] [control]',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input #input type="text" matInput
             [formControl]="control"
             [matAutocomplete]="auto"
             (input)="filter()"
             (focus)="load()">
      <mat-autocomplete requireSelection #auto="matAutocomplete" [displayWith]="display">
        @for (option of filteredOptions(); track option) {
          <mat-option [value]="option">
            <span> {{ option.name }} ({{ option.code }}) </span>
            <br>
            <small> {{ option.category | articleCategoryName }} | Na
              stanju: {{ option.inStockAmount | articleInStock: option.unitMeasure }} </small>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  imports: [MatFormField, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, ArticleCategoryPipe, ArticleInStockPipe],
})
export class ArticleAutocompleteComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  readonly articleService = inject(ArticleService);

  @Input() label!: string;
  @Input() control!: FormControl<Article | null>;
  @Input() excludes : Article[] = [];
  @Input() includeCategories : ArticleCategory[] = ArticleCategoryValues;

  allOptions: Article[] = [];
  readonly filteredOptions = signal<Article[]>([]);

  async load() {
    if (this.allOptions.length == 0) {
      this.allOptions = await this.articleService.getAll({
        categories: this.includeCategories
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
      this.allOptions.filter(o => {
        if (this.excludes.find(e => e.id === o.id)) {
          return false;
        }
        return o.name.toLowerCase().includes(filterValue) || o.code?.toLowerCase().includes(filterValue);
      })
    )
  }
}

@Component({
  selector: 'app-unit-measure-autocomplete [label] [control]',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input #input type="text" matInput
             [formControl]="control"
             [matAutocomplete]="auto"
             (input)="filter()"
             (focus)="load()">
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
      this.allOptions.filter(o => {
        return o.name.toLowerCase().includes(filterValue);
      })
    )
  }
}

@Component({
  selector: 'app-amount-input [label] [control]',
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input matInput
             [formControl]="control"
             [pattern]="isInteger() ? '^[0-9]*$' : '^[0-9]+(\\.[0-9]{0,2})?$'"
             (keypress)="onKeyPress($event)">
      <div matSuffix class="mr-3 text-sm"> {{ unitMeasure?.name ?? " N/A" }}</div>
    </mat-form-field>
  `,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class AmountInputComponent {
  @Input() label!: string;
  @Input() control!: FormControl<any>;
  @Input() unitMeasure: UnitMeasure | null = null;

  isInteger = signal(false);

  ngAfterContentInit() {
    if (this.unitMeasure && this.unitMeasure.isInteger) {
      this.isInteger.set(this.unitMeasure.isInteger);
    }
  }

  onKeyPress(event: KeyboardEvent): boolean {
    const pattern = this.isInteger() ? /[0-9]/ : /[0-9.]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }

    if (inputChar === '.' && !this.isInteger()) {
      const value = (event.target as HTMLInputElement).value;
      if (value.includes('.') || value.length === 0) {
        event.preventDefault();
        return false;
      }
    }

    return true;
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
      <mat-label> {{ label}} </mat-label>
      <mat-chip-grid #chipGrid [formControl]="control">
        @for (keyword of keywords(); track keyword) {
          <mat-chip-row (removed)="removeKeyword(keyword)">
            {{keyword}}
            <button matChipRemove [attr.aria-label]="'ukloni ' + keyword">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
        }
      </mat-chip-grid>
      <input
        [matChipInputFor]="chipGrid"
        (matChipInputTokenEnd)="add($event)"
      />
    </mat-form-field>
  `
})
export class TagsInputComponent implements AfterViewInit {
  @Input() label!: string;
  @Input() control!: FormControl;

  readonly keywords = signal<any[]>([]);

  ngAfterViewInit() {
    this.keywords.set(this.control.value);
  }

  announcer = inject(LiveAnnouncer);

  removeKeyword(keyword: string) {
    this.keywords.update(keywords => {
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
      this.keywords.update(keywords => [...keywords, value]);
    }

    event.chipInput!.clear();
  }
}
