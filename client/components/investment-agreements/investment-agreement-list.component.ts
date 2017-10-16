import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import {
  INVESTMENT_AGREEMENT_STATUSES,
  InvestmentAgreementList,
  InvestmentAgreementsQuery,
  InvestmentAgreementsStatuses
} from '../../interfaces/index';

@Component({
  moduleId: module.id,
  selector: 'tff-investment-agreements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'investment-agreement-list.component.html',
  styles: [ `.investment-agreements-content {
    padding: 16px;
  }` ]
})
export class InvestmentAgreementListComponent implements OnInit, OnDestroy {
  statuses: { label: string, value: InvestmentAgreementsStatuses }[] = Object.keys(INVESTMENT_AGREEMENT_STATUSES).map(status => ({
    label: INVESTMENT_AGREEMENT_STATUSES[ <InvestmentAgreementsStatuses>parseInt(status) ],
    value: parseInt(status)
  }));

  @Input() investmentAgreements: InvestmentAgreementList;
  @Input() status: InvestmentAgreementsStatuses;
  @Input() listStatus: ApiRequestStatus;
  @Output() onQuery = new EventEmitter<InvestmentAgreementsQuery>();
  private _debouncedQuery = new Subject<InvestmentAgreementsQuery>();
  private _querySub: Subscription;

  private _query: InvestmentAgreementsQuery;

  get query() {
    return this._query;
  }

  @Input() set query(value: InvestmentAgreementsQuery) {
    this._query = { ...value };
  }

  ngOnInit() {
    this._querySub = this._debouncedQuery
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(query => this.onQuery.emit(query));
  }

  ngOnDestroy() {
    this._querySub.unsubscribe();
  }

  submit(debounced: boolean = true) {
    this.query = { ...this.query, cursor: null };
    if (debounced) {
      this._debouncedQuery.next(this.query);
    } else {
      this.onQuery.emit(this.query);
    }
  }

  loadMore() {
    this.onQuery.emit(this.query);
  }
}
