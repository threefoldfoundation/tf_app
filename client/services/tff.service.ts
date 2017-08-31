import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import { GetNodeOrdersPayload, NodeOrder, NodeOrderList } from '../interfaces/nodes.interfaces';
import { TffConfig } from './tff-config.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TffService {

  constructor(private http: Http) {
  }

  getNodeOrders(payload: GetNodeOrdersPayload): Observable<NodeOrderList> {
    let params = new URLSearchParams();
    if (payload.cursor) {
      params.set('cursor', payload.cursor);
    }
    params.set('status', payload.status.toString());

    return this.http.get(`${TffConfig.API_URL}/orders`, new RequestOptions({ params }))
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
