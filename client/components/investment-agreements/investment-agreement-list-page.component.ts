import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { getInvestmentAgreements, getInvestmentAgreementsStatus } from '../../tff.state';
import { GetInvestmentAgreementsPayload, InvestmentAgreementList, InvestmentAgreementsStatuses } from '../../interfaces/index';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetInvestmentAgreementsAction } from '../../actions/threefold.action';

@Component({
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <tff-investment-agreements [investmentAgreements]="investmentAgreements$ | async"
                               [listStatus]="listStatus$ | async"
                               (onLoadInvestmentAgreements)="loadAgreements($event)"></tff-investment-agreements>`
})
export class InvestmentAgreementListPageComponent implements OnInit {
  investmentAgreements$: Observable<InvestmentAgreementList>;
  listStatus$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.investmentAgreements$ = this.store.let(getInvestmentAgreements);
    this.investmentAgreements$.first().subscribe(orders => {
      if (!orders.results.length) {
        this.store.dispatch(new GetInvestmentAgreementsAction({ cursor: null, status: InvestmentAgreementsStatuses.CREATED }));
      }
    });
    this.listStatus$ = this.store.let(getInvestmentAgreementsStatus);
  }

  loadAgreements(payload: GetInvestmentAgreementsPayload) {
    this.store.dispatch(new GetInvestmentAgreementsAction(payload));
  }
}
