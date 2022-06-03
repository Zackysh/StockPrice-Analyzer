import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

    return this._httpClient.post<StockResponse>('core/analytics', formData);
  }
}
