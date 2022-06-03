import { HttpClient } from '@angular/common/http';
import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { AnalyticsService } from 'app/core/analytics/analytics.service';
import { DataFrame, readCSV, toJSON } from 'danfojs';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import {
  CompleteStock,
  Stock,
  StockResponse,
} from './../../core/analytics/analytics.types';
import { _lowerObjectKeys } from './../../core/utils';

@Component({
  selector: 'example',
  templateUrl: './analytics.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AnalyticsComponent implements OnInit {
  // @ User input
  @ViewChild('fileInput') csvInput: any;
  // @ Prediction
  predictedData: StockResponse;
  displayedPredictions: Stock[] = [];
  // @ Test data
  testCsv: File;
  testOptions: { option: string; value: string; disabled?: boolean }[] = [
    { option: 'Select company stock', value: 'none', disabled: true },
    { option: 'MSFT', value: 'MSFT' },
    { option: 'AAPL', value: 'AAPL' },
    { option: 'AMZN', value: 'AMZN' },
    { option: 'TSLA', value: 'TSLA' },
  ];
  testForm: FormGroup;
  selectedCsv: File;
  // @ Table & Chart
  sampleData: DataFrame;
  displayedColumns: string[] = [];
  dataSource: CompleteStock[] = [];

  constructor(
    private _analyticsService: AnalyticsService,
    private _httpClient: HttpClient,
    private _formBuilder: FormBuilder
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lyfe cycle hooks & event handlers
  // -----------------------------------------------------------------------------------------------------

  get selectedCompany(): AbstractControl {
    return this.testForm.get('selectedCompany');
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    if (!this.sampleData) {
      return;
    }

    if (this.sampleData && window.innerWidth <= 600) {
      this.fillTable(2);
    } else {
      this.fillTable();
    }
  }

  ngOnInit(): void {
    this.testForm = this._formBuilder.group({
      selectedCompany: ['none'],
    });
  }

  onChange(event: any): void {
    const fileList: FileList = event.target.files;

    if (!fileList[0]) {
      return;
    }

    if (fileList[0].name.slice(-4) === '.csv') {
      this.testCsv = undefined;
      this.selectedCompany.setValue('none');
      this.selectedCsv = fileList[0];
      readCSV(this.selectedCsv).then(
        (res) => {
          this.sampleData = res.head(15);
          this.fillTable();
          // TODO - perform data validation client-side instead of server-side
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  sendCsv(): void {
    if (!this.selectedCsv && !this.testCsv) {
      Swal.fire({
        title: 'You should select a CSV before analysis',
        icon: 'warning',
      });
    } else {
      this._analyticsService
        .analyzeCsv(this.selectedCsv ?? this.testCsv)
        .pipe(
          catchError((err) => {
            if (err.status === 400) {
              Swal.fire({
                title: 'Invalid csv format',
                html: err.error.data.error,
                icon: 'error',
              });
            }
            return throwError(() => err);
          })
        )
        .subscribe((res) => {
          console.log('----------------------------------------');

          console.log(res);
          this.predictedData = res;
          this.displayedPredictions = [
            ...this.predictedData.train,
            ...this.predictedData.valid,
          ];
        });
    }
  }

  loadTestCsv(): void {
    if (this.selectedCompany.value === 'none') {
      this.testForm.markAllAsTouched();
      return;
    }

    this.selectedCsv = undefined;
    // load file from assets
    this._httpClient
      .get(`assets/stock_data/${this.selectedCompany.value}.csv`, {
        responseType: 'text',
      })
      .subscribe((res) => {
        this.testCsv = new File([res], 'MSFT.csv', {
          type: 'text/plain',
        });

        readCSV(this.testCsv).then(
          (data) => {
            this.sampleData = data.head(15);
            this.fillTable();
          },
          (err) => {
            console.log(err);
          }
        );
      });
  }

  removeCsv(): void {
    this.selectedCsv = null;
    this.sampleData = null;
    this.displayedColumns = [];
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private fillTable(max?: number): void {
    this.displayedColumns = this.sampleData.columns.map((col) =>
      col.toLowerCase()
    );
    if (this.displayedColumns.length > 5) {
      const other = this.displayedColumns.filter(
        (col) => col !== 'date' && col !== 'close'
      );

      const main = this.displayedColumns.filter(
        (col) => col === 'date' || col === 'close'
      );

      if (main.length === 0) {
        this.displayedColumns = this.displayedColumns.slice(0, max ?? 5);
      } else {
        this.displayedColumns = [...main, ...other.slice(0, 3)].slice(
          0,
          max ?? 5
        );
      }
    }
    this.dataSource = Object.values(toJSON(this.sampleData) as any).map(
      _lowerObjectKeys
    );
    console.log(this.dataSource);
    console.log(this.displayedColumns);
    console.log(this.sampleData);
  }
}
