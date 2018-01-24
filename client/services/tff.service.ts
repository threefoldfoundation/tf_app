import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { Profile } from '../../../its_you_online_auth/client/interfaces';
import { Installation, InstallationLog, InstallationsList } from '../../../rogerthat_api/client/interfaces';
import {
  AgendaEvent,
  Check,
  CreateInvestmentAgreementPayload,
  CreateOrderPayload,
  CreateTransactionPayload,
  EventParticipant,
  FlowRun,
  FlowRunList,
  FlowRunQuery,
  FlowStats,
  GetEventParticipantsPayload,
  GetInstallationsQuery,
  GlobalStats,
  InvestmentAgreement,
  InvestmentAgreementList,
  InvestmentAgreementsQuery,
  NodeOrder,
  NodeOrderList,
  NodeOrdersQuery,
  PaginatedResult,
  SearchUsersQuery,
  SetKYCStatusPayload,
  TffProfile,
  Transaction,
  TransactionList,
  UserList,
  WalletBalance,
} from '../interfaces';
import { TffConfig } from './tff-config.service';

@Injectable()
export class TffService {

  constructor(private http: HttpClient) {
  }

  getNodeOrders(payload: NodeOrdersQuery) {
    const params = this._getQueryParams(payload);
    return this.http.get<NodeOrderList>(`${TffConfig.API_URL}/orders`, { params });
  }

  getNodeOrder(orderId: string) {
    return this.http.get<NodeOrder>(`${TffConfig.API_URL}/orders/${orderId}`);
  }

  createNodeOrder(nodeOrder: CreateOrderPayload) {
    return this.http.post<NodeOrder>(`${TffConfig.API_URL}/orders`, nodeOrder);
  }

  updateNodeOrder(nodeOrder: NodeOrder) {
    return this.http.put<NodeOrder>(`${TffConfig.API_URL}/orders/${nodeOrder.id}`, nodeOrder);
  }

  getInvestmentAgreements(payload: InvestmentAgreementsQuery) {
    const params = this._getQueryParams(payload);
    return this.http.get<InvestmentAgreementList>(`${TffConfig.API_URL}/investment-agreements`, { params });
  }

  getInvestmentAgreement(agreementId: string) {
    return this.http.get<InvestmentAgreement>(`${TffConfig.API_URL}/investment-agreements/${agreementId}`);
  }

  updateInvestmentAgreement(agreement: InvestmentAgreement) {
    return this.http.put<InvestmentAgreement>(`${TffConfig.API_URL}/investment-agreements/${agreement.id}`, agreement);
  }

  createInvestmentAgreement(agreement: CreateInvestmentAgreementPayload) {
    return this.http.post<InvestmentAgreement>(`${TffConfig.API_URL}/investment-agreements`, agreement);
  }

  getGlobalStatsList() {
    return this.http.get<GlobalStats[]>(`${TffConfig.API_URL}/global-stats`);
  }

  getGlobalStats(statsId: string) {
    return this.http.get<GlobalStats>(`${TffConfig.API_URL}/global-stats/${statsId}`);
  }

  updateGlobalStats(stats: GlobalStats) {
    return this.http.put<GlobalStats>(`${TffConfig.API_URL}/global-stats/${stats.id}`, stats);
  }

  searchUsers(payload: SearchUsersQuery) {
    const params = this._getQueryParams(payload);
    return this.http.get<UserList>(`${TffConfig.API_URL}/users`, { params });
  }

  getUser(username: string) {
    return this.http.get<Profile>(`${TffConfig.API_URL}/users/${encodeURIComponent(username)}`);
  }

  getTffProfile(username: string) {
    return this.http.get<TffProfile>(`${TffConfig.API_URL}/users/${encodeURIComponent(username)}/profile`);
  }

  setKYCStatus(username: string, payload: SetKYCStatusPayload) {
    return this.http.put<TffProfile>(`${TffConfig.API_URL}/users/${encodeURIComponent(username)}/profile/kyc`, payload);
  }

  getBalance(username: string) {
    return this.http.get<WalletBalance[]>(`${TffConfig.API_URL}/users/${encodeURIComponent(username)}/balance`);
  }

  getUserTransactions(username: string) {
    return this.http.get<TransactionList>(`${TffConfig.API_URL}/users/${encodeURIComponent(username)}/transactions`);
  }

  createTransaction(payload: CreateTransactionPayload) {
    const data: Partial<CreateTransactionPayload> = { ...payload };
    delete data.username;
    return this.http.post<Transaction>(`${TffConfig.API_URL}/users/${encodeURIComponent(payload.username)}/transactions`, data);
  }

  getAgendaEvents(past: boolean) {
    const params = this._getQueryParams({ past });
    return this.http.get<AgendaEvent[]>(`${TffConfig.API_URL}/agenda-events`, { params });
  }

  getAgendaEvent(id: number) {
    return this.http.get<AgendaEvent>(`${TffConfig.API_URL}/agenda-events/${id}`);
  }

  createAgendaEvent(event: AgendaEvent) {
    return this.http.post<AgendaEvent>(`${TffConfig.API_URL}/agenda-events`, event);
  }

  updateAgendaEvent(event: AgendaEvent) {
    return this.http.put<AgendaEvent>(`${TffConfig.API_URL}/agenda-events/${event.id}`, event);
  }

  getEventParticipants(payload: GetEventParticipantsPayload) {
    let params = new HttpParams();
    params = params.set('page_size', String(payload.page_size));
    return this.http.get<PaginatedResult<EventParticipant>>(`${TffConfig.API_URL}/agenda-events/${payload.event_id}/participants`,
      { params });
  }

  getKYCChecks(username: string) {
    return this.http.get<Check[]>(`${TffConfig.API_URL}/users/${encodeURIComponent(username)}/kyc/checks`);
  }

  getDistinctFlows() {
    return this.http.get<string[]>(`${TffConfig.API_URL}/flow-statistics/flows`);
  }

  getFlowRuns(query: FlowRunQuery): Observable<FlowRunList> {
    const params = this._getQueryParams(query);
    return this.http.get<FlowRunList<string>>(`${TffConfig.API_URL}/flow-statistics`, { params }).pipe(
      map(result => ({ ...result, results: result.results.map(flowRun => this.convertFlowRun(flowRun)) })),
    );
  }

  getFlowRun(id: string): Observable<FlowRun> {
    return this.http.get<FlowRun<string>>(`${TffConfig.API_URL}/flow-statistics/details/${id}`).pipe(
      map(result => this.convertFlowRun(result)),
    );
  }

  getFlowStats(startDate: string) {
    const params = this._getQueryParams({ start_date: startDate });
    return this.http.get<FlowStats[]>(`${TffConfig.API_URL}/flow-statistics/stats`, { params });
  }

  getInstallations(query: GetInstallationsQuery) {
    const params = this._getQueryParams(query);
    return this.http.get<InstallationsList>(`${TffConfig.API_URL}/installations`, { params });
  }

  getInstallation(installationId: string) {
    return this.http.get<Installation>(`${TffConfig.API_URL}/installations/${installationId}`);
  }

  getInstallationLogs(installationId: string) {
    return this.http.get<InstallationLog[]>(`${TffConfig.API_URL}/installations/${installationId}/logs`);
  }

  private _getQueryParams<T>(queryObject: T): HttpParams {
    let params = new HttpParams();
    const q = <[ keyof T ]>Object.keys(queryObject);
    for (const key of q) {
      if (queryObject[ key ] !== null) {
        params = params.set(key, queryObject[ key ].toString());
      }
    }
    return params;
  }

  /**
   * Converts string dates in the FlowRun object to Date objects
   */
  private convertFlowRun(flowRun: FlowRun<string>): FlowRun<Date> {
    return {
      ...flowRun,
      start_date: new Date(flowRun.start_date),
      statistics: { ...flowRun.statistics, last_step_date: new Date(flowRun.statistics.last_step_date) },
    };
  }

}
