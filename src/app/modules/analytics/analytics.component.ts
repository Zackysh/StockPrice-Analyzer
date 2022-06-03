import { FormHelper } from './../../shared/form.helper';
import {
  Component,
  HostListener,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AnalyticsService } from 'app/core/analytics/analytics.service';
import { DataFrame, readCSV, toJSON } from 'danfojs';
import { CompleteStock } from './../../core/analytics/analytics.types';
import { _lowerObjectKeys } from './../../core/utils';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'example',
  templateUrl: './analytics.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AnalyticsComponent {
  @ViewChild('fileInput') csvInput: any;
  selectedCsv: File;
  sampleData: DataFrame;

  // Table
  displayedColumns: string[] = [];
  dataSource: CompleteStock[] = [];

  constructor(private _analyticsService: AnalyticsService) {}

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    if (this.sampleData && window.innerWidth <= 600) {
      this.fillTable(2);
    } else {
      this.fillTable();
    }
  }

  sendCsv(): void {
    if (!this.selectedCsv) {
      Swal.fire({
        title: 'You should select a CSV before analysis',
        icon: 'warning',
      });
    } else {
      this._analyticsService
        .analyzeCsv(this.selectedCsv)
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
          console.log(res);
          // document.getElementById()
        });
    }
  }

  onChange(event: any): void {
    const fileList: FileList = event.target.files;

    if (!fileList[0]) {
      return;
    }

    if (fileList[0].name.slice(-4) === '.csv') {
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

  fillTable(max?: number): void {
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

  removeCsv(): void {
    this.selectedCsv = null;
    this.sampleData = null;
    this.displayedColumns = [];
  }
}
