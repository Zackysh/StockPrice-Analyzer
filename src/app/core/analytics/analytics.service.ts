import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { StockResponse } from './analytics.types';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  selectedFile: File;

  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Analyze user stock.
   *
   * @returns predicted stock data
   * @throws 400 if csv contains any error
   */
  analyzeCsv(csv: File): Observable<StockResponse> {
    const formData = new FormData();
    formData.append('data', csv, csv.name);

    return this._httpClient
      .post<StockResponse>('core/analytics', formData)
      .pipe(
        map((stockRes) => ({
          ...stockRes,
          valid: stockRes.valid.map((o) => ({ ...o, predicted: o.close })),
        })),
        map((stockRes) => ({
          valid: stockRes.valid.map((o) => ({ ...o, date: new Date(o.date) })),
          train: stockRes.train.map((o) => ({ ...o, date: new Date(o.date) })),
          complete: stockRes.complete.map((o) => ({
            ...o,
            date: new Date(o.date),
          })),
        }))
      );
  }
}
