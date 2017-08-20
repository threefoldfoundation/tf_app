import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NodeOrder } from '../interfaces/nodes.interfaces';
import { TffConfig } from './tff-config.service';

@Injectable()
export class TffService {

  constructor(private http: HttpClient) {
  }

  getNodeOrders() {
    return this.http.get<NodeOrder[]>(`${TffConfig.API_URL}/orders`);
  }
}
