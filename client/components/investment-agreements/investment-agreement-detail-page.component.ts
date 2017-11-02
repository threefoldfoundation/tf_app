import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { DialogService } from '../../../../framework/client/dialog/services/dialog.service';
import { getIdentity, Identity } from '../../../../framework/client/identity/index';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import {
  GetGlobalStatsAction,
  GetInvestmentAgreementAction,
  ResetInvestmentAgreementAction,
  UpdateInvestmentAgreementAction
} from '../../actions/threefold.action';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { InvestmentAgreement, InvestmentAgreementsStatuses } from '../../interfaces/investment-agreements.interfaces';
import { TffPermissions } from '../../interfaces/permissions.interfaces';
import { ApiErrorService } from '../../services/api-error.service';
import { getGlobalStats, getInvestmentAgreement, getInvestmentAgreementStatus, updateInvestmentAgreementStatus } from '../../tff.state';

@Component({
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <investment-agreement [investmentAgreement]="investmentAgreement$ | async"
                          [status]="status$ | async"
                          [globalStats]="globalStats$ | async"
                          [updateStatus]="updateStatus$ | async"
                          [canUpdate]="canUpdate$ | async"
                          (onUpdate)="onUpdate($event)"></investment-agreement>`
})

export class InvestmentAgreementDetailPageComponent implements OnInit, OnDestroy {
  investmentAgreement$: Observable<InvestmentAgreement>;
  status$: Observable<ApiRequestStatus>;
  updateStatus$: Observable<ApiRequestStatus>;
  globalStats$: Observable<GlobalStats>;
  canUpdate$: Observable<boolean>;

  private _investmentSub: Subscription;
  private _errorSub: Subscription;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute,
              private translate: TranslateService,
              private dialogService: DialogService,
              private apiErrorService: ApiErrorService) {
  }

  ngOnInit() {
    const agreementId = this.route.snapshot.params.investmentAgreementId;
    this.store.dispatch(new ResetInvestmentAgreementAction());
    this.store.dispatch(new GetInvestmentAgreementAction(agreementId));
    this.investmentAgreement$ = this.store.select(getInvestmentAgreement);
    this.status$ = this.store.select(getInvestmentAgreementStatus);
    this.updateStatus$ = this.store.select(updateInvestmentAgreementStatus);
    this.canUpdate$ = this.store.select(getIdentity).filter(i => i !== null)
      .map((identity: Identity) => identity.permissions.includes(TffPermissions.ADMINS));
    this.globalStats$ = this.store.select(getGlobalStats);
    this._investmentSub = this.investmentAgreement$.filter(i => i !== null && i.token !== null).subscribe(investment => {
      this.store.dispatch(new GetGlobalStatsAction(investment.token));
    });
    this._errorSub = this.updateStatus$.filter(status => !status.success && !status.loading && status.error !== null)
      .subscribe(status => this.apiErrorService.showErrorDialog(status.error));
  }

  ngOnDestroy() {
    this._investmentSub.unsubscribe();
    this._errorSub.unsubscribe();
  }

  onUpdate(agreement: InvestmentAgreement) {
    this.store.dispatch(new UpdateInvestmentAgreementAction(agreement));
    if (agreement.status === InvestmentAgreementsStatuses.SIGNED) {
      this.dialogService.openAlert({
        message: this.translate.instant('tff.mark_as_paid_info'),
        ok: this.translate.instant('tff.close')
      });
    }
  }
}
