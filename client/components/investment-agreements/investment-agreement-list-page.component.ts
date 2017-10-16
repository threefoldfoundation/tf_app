import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { getInvestmentAgreements, getInvestmentAgreementsQuery, getInvestmentAgreementsStatus } from '../../tff.state';
import { InvestmentAgreementList, InvestmentAgreementsQuery } from '../../interfaces/index';
import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetInvestmentAgreementsAction } from '../../actions/threefold.action';
import {
  GetInvestmentAgreementsPayload,
  InvestmentAgreementList,
} from '../../interfaces/investment-agreements.interfaces';
import { getInvestmentAgreements, getInvestmentAgreementsStatus, getInvestmentAgreementsType } from '../../tff.state';

@Component({
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <tff-investment-agreements [investmentAgreements]="investmentAgreements$ | async"
                               [listStatus]="listStatus$ | async"
                               [query]="query$ | async"
                               (onQuery)="onQuery($event)"></tff-investment-agreements>`
})
export class InvestmentAgreementListPageComponent implements OnInit, OnDestroy {
  investmentAgreements$: Observable<InvestmentAgreementList>;
  listStatus$: Observable<ApiRequestStatus>;
  query$: Observable<InvestmentAgreementsQuery>;

  private _sub: Subscription;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.query$ = this.store.let(getInvestmentAgreementsQuery);
    this.listStatus$ = this.store.let(getInvestmentAgreementsStatus);
    this.investmentAgreements$ = this.store.let(getInvestmentAgreements).withLatestFrom(this.query$)
      .map(([ result, query ]) => ({ ...result, results: result.results.filter(o => query.status ? o.status === query.status : true) }));
    this._sub = this.investmentAgreements$.first().subscribe(result => {
      // Load some investments on page load
      if (!result.results.length) {
        this.onQuery({ cursor: null, status: null, query: null });
      }
    });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  onQuery(payload: InvestmentAgreementsQuery) {
    this.store.dispatch(new GetInvestmentAgreementsAction(payload));
  }
}
