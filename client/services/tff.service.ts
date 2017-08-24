import { Injectable } from '@angular/core';
import { NodeOrder, NodeOrderList } from '../interfaces/nodes.interfaces';
import { TffConfig } from './tff-config.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TffService {

  constructor(private http: Http) {
  }

  getNodeOrders(cursor: string | null): Observable<NodeOrderList> {
    let params = new URLSearchParams();
    if (cursor) {
      params.append('cursor', cursor);
    }
    return this.http.get(`${TffConfig.API_URL}/orders`, { params })
      .map(response => response.json());
  }

  getNodeOrder(orderId: string): Observable<NodeOrder> {
    return this.http.get(`${TffConfig.API_URL}/orders/${orderId}`)
      .map(response => response.json());
  }

  updateNodeOrder(nodeOrder: NodeOrder): Observable<NodeOrder> {
    return this.http.put(`${TffConfig.API_URL}/orders/${nodeOrder.id}`, nodeOrder)
      .map(response => response.json());
  }
}
