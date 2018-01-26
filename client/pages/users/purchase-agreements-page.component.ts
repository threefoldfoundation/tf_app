import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetInvestmentAgreementsAction } from '../../actions';
import { InvestmentAgreementList } from '../../interfaces';
import { ITffState } from '../../states';
import { getInvestmentAgreements, getInvestmentAgreementsStatus } from '../../tff.state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <h2>{{ 'tff.investment_agreements' | translate }}</h2>
    </mat-toolbar>
    <tff-investment-agreements [investmentAgreements]="investments$ | async"
                               [status]="status$ | async"
                               linkTarget="_tab"></tff-investment-agreements>`,
})
export class UserPurchaseAgreementsPageComponent implements OnInit {
  investments$: Observable<InvestmentAgreementList>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>, private route: ActivatedRoute) {
  }

  ngOnInit() {
    const username = (<ActivatedRoute>this.route.parent).snapshot.params.username;
    this.store.dispatch(new GetInvestmentAgreementsAction({ query: `username:${username}`, cursor: null, status: null }));
    this.investments$ = this.store.select(getInvestmentAgreements);
    this.status$ = this.store.select(getInvestmentAgreementsStatus);
  }
}
