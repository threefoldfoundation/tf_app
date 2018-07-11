import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ExchangeInfo } from '../interfaces/exchange.interfaces';

@Injectable()
export class ExchangesService {

  constructor(private http: HttpClient) {
  }

  getExchanges() {
    return this.http.get<ExchangeInfo[]>('assets/data/exchanges.json');
  }

  getExchangeDescription(exchangeInfo: ExchangeInfo) {
    const split = exchangeInfo.url.split('/');
    split.pop();  // remove filename
    const baseUrl = split.join('/');
    // Prepend the base url to paths starting with ../
    return this.http.get(exchangeInfo.url, { responseType: 'text' }).pipe(
      map(response => response.replace(/\.\.\//g, `${baseUrl}/../`)),
    );
  }
}
