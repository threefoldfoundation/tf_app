import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  GetInvestmentAgreementsPayload,
  GetNodeOrdersPayload,
  InvestmentAgreement,
  InvestmentAgreementList,
  NodeOrder,
  NodeOrderList
} from '../interfaces/index';
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

  getInvestmentAgreements(payload: GetInvestmentAgreementsPayload) {
    let params = new HttpParams();
    if (payload.cursor) {
      params = params.set('cursor', payload.cursor);
    }
    params = params.set('status', payload.status.toString());
    return this.http.get<InvestmentAgreementList>(`${TffConfig.API_URL}/investment-agreements`, { params });
  }

  getInvestmentAgreement(agreementId: string): Observable<InvestmentAgreement> {
    return this.http.get<InvestmentAgreement>(`${TffConfig.API_URL}/investment-agreements/${agreementId}`);
  }

  updateInvestmentAgreement(agreement: InvestmentAgreement) {
    return this.http.put<InvestmentAgreement>(`${TffConfig.API_URL}/investment-agreements/${agreement.id}`, agreement);
  }
}
