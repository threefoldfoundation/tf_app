import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GetNodeOrdersPayload, NodeOrder, NodeOrderList } from '../interfaces/nodes.interfaces';
import { TffConfig } from './tff-config.service';

@Injectable()
export class TffService {

  constructor(private http: HttpClient) {
  }

  getNodeOrders(payload: GetNodeOrdersPayload) {
    let params = new HttpParams();
    if (payload.cursor) {
      params = params.set('cursor', payload.cursor);
    }
    params = params.set('status', payload.status.toString());
    return this.http.get<NodeOrderList>(`${TffConfig.API_URL}/orders`, { params });
  }

  getNodeOrder(orderId: string): Observable<NodeOrder> {
    return this.http.get<NodeOrder>(`${TffConfig.API_URL}/orders/${orderId}`);
  }

  updateNodeOrder(nodeOrder: NodeOrder) {
    return this.http.put<NodeOrder>(`${TffConfig.API_URL}/orders/${nodeOrder.id}`, nodeOrder);
  }
}
