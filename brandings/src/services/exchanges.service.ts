import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExchangeInfo } from '../interfaces/exchange.interfaces';

@Injectable()
export class ExchangesService {

  constructor(private http: HttpClient) {
  }

  getExchanges() {
    return this.http.get<ExchangeInfo[]>('assets/data/exchanges.json');
  }
}
