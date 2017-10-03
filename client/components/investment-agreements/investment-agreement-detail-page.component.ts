import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { getInvestmentAgreement, getInvestmentAgreementStatus, updateInvestmentAgreementStatus } from '../../tff.state';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { InvestmentAgreement, InvestmentAgreementsStatuses } from '../../interfaces/investment-agreements.interfaces';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import {
  GetInvestmentAgreementAction,
  ResetInvestmentAgreementAction,
  UpdateInvestmentAgreementAction
} from '../../actions/threefold.action';
import { getIdentity } from '../../../../framework/client/identity/identity.state';
import { Identity } from '../../../../framework/client/identity/interfaces/identity.interfaces';
import { TffPermissions } from '../../interfaces/permissions.interfaces';
import { DialogService } from '../../../../framework/client/dialog/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <investment-agreement [investmentAgreement]="investmentAgreement$ | async"
                          [status]="status$ | async"
                          [updateStatus]="updateStatus$ | async"
                          [canUpdate]="canUpdate$ | async"
                          (onUpdate)="onUpdate($event)"></investment-agreement>`
})

export class InvestmentAgreementDetailPageComponent implements OnInit {
  investmentAgreement$: Observable<InvestmentAgreement>;
  status$: Observable<ApiRequestStatus>;
  updateStatus$: Observable<ApiRequestStatus>;
  canUpdate$: Observable<boolean>;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute,
              private translate: TranslateService,
              private dialogService: DialogService) {
  }

  ngOnInit() {
    const agreementId = this.route.snapshot.params.investmentAgreementId;
    this.store.dispatch(new ResetInvestmentAgreementAction());
    this.store.dispatch(new GetInvestmentAgreementAction(agreementId));
    this.investmentAgreement$ = this.store.let(getInvestmentAgreement);
    this.status$ = this.store.let(getInvestmentAgreementStatus);
    this.updateStatus$ = this.store.let(updateInvestmentAgreementStatus);
    this.canUpdate$ = this.store.let(getIdentity).filter(i => i !== null)
      .map((identity: Identity) => identity.permissions.includes(TffPermissions.ADMINS));
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
