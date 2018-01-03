import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { first } from 'rxjs/operators/first';
import { map } from 'rxjs/operators/map';
import { withLatestFrom } from 'rxjs/operators/withLatestFrom';
import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetInvestmentAgreementsAction } from '../../actions/threefold.action';
import { InvestmentAgreementList, InvestmentAgreementsQuery } from '../../interfaces/index';
import { getInvestmentAgreements, getInvestmentAgreementsQuery, getInvestmentAgreementsStatus } from '../../tff.state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-search-investment-agreements [query]="query$ | async"
                                        (search)="onQuery($event)"></tff-search-investment-agreements>
      <tff-investment-agreements [investmentAgreements]="investmentAgreements$ | async"
                                 [status]="listStatus$ | async"
                                 (loadMore)="onLoadMore()"></tff-investment-agreements>
    </div>
    <div class="fab-bottom-right">
      <a mat-fab [routerLink]="['create']">
        <mat-icon>add</mat-icon>
      </a>
    </div>`
})
export class InvestmentAgreementListPageComponent implements OnInit, OnDestroy {
  investmentAgreements$: Observable<InvestmentAgreementList>;
  listStatus$: Observable<ApiRequestStatus>;
  query$: Observable<InvestmentAgreementsQuery>;

  private _sub: Subscription;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.query$ = this.store.select(getInvestmentAgreementsQuery);
    this.listStatus$ = this.store.select(getInvestmentAgreementsStatus);
    this.investmentAgreements$ = this.store.select(getInvestmentAgreements).pipe(
      withLatestFrom(this.query$),
      map(([ result, query ]) => ({ ...result, results: result.results.filter(o => query.status ? o.status === query.status : true) })));
    this._sub = this.investmentAgreements$.pipe(first()).subscribe(result => {
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

  onLoadMore() {
    this.query$.pipe(first()).subscribe(query => this.onQuery(query));
  }
}
