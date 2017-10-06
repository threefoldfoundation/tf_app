import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { getInvestmentAgreements, getInvestmentAgreementsStatus, getInvestmentAgreementsType } from '../../tff.state';
import { GetInvestmentAgreementsPayload, InvestmentAgreementList, InvestmentAgreementsStatuses } from '../../interfaces/index';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetInvestmentAgreementsAction } from '../../actions/threefold.action';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <tff-investment-agreements [investmentAgreements]="investmentAgreements$ | async"
                               [listStatus]="listStatus$ | async"
                               [status]="listType$ | async"
                               (onLoadInvestmentAgreements)="loadAgreements($event)"></tff-investment-agreements>`
})
export class InvestmentAgreementListPageComponent implements OnInit, OnDestroy {
  investmentAgreements$: Observable<InvestmentAgreementList>;
  listStatus$: Observable<ApiRequestStatus>;
  listType$: Observable<InvestmentAgreementsStatuses>;

  private _sub: Subscription;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.listType$ = this.store.let(getInvestmentAgreementsType);
    this.listStatus$ = this.store.let(getInvestmentAgreementsStatus);
    this.investmentAgreements$ = this.store.let(getInvestmentAgreements).withLatestFrom(this.listType$)
      .map(([ result, status ]) => ({ ...result, results: result.results.filter(o => o.status === status) }));
    this._sub = this.investmentAgreements$.first().subscribe(result => {
      if (!result.results.length) {
        this.store.dispatch(new GetInvestmentAgreementsAction({ cursor: null, status: InvestmentAgreementsStatuses.CREATED }));
      }
    });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  loadAgreements(payload: GetInvestmentAgreementsPayload) {
    this.store.dispatch(new GetInvestmentAgreementsAction(payload));
  }
}
