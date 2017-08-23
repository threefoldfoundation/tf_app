import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NodeOrder, NodeOrderList } from '../interfaces/nodes.interfaces';
import { TffConfig } from './tff-config.service';

@Injectable()
export class TffService {

  constructor(private http: HttpClient) {
  }

  getNodeOrders(cursor: string | null) {
    let params = new HttpParams();
    if (cursor) {
      params = params.set('cursor', cursor);
    }
    return this.http.get<NodeOrderList>(`${TffConfig.API_URL}/orders`, { params });
  }

  getNodeOrder(orderId: string) {
    return this.http.get<NodeOrder>(`${TffConfig.API_URL}/orders/${orderId}`);
  }

  updateNodeOrder(nodeOrder: NodeOrder) {
    return this.http.put<NodeOrder>(`${TffConfig.API_URL}/orders/${nodeOrder.id}`, nodeOrder);
  }
}
