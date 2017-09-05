import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { InvestmentAgreement, InvestmentAgreementsStatuses, } from '../../interfaces/index';
import { TranslateService } from '@ngx-translate/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { INVESTMENT_AGREEMENT_STATUSES } from '../../interfaces/investment-agreements.interfaces';

@Component({
  moduleId: module.id,
  selector: 'investment-agreement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'investment-agreement-detail.component.html',
  styles: [ `.investment-agreement-content {
    padding: 16px;
  }` ]
})

export class InvestmentAgreementDetailComponent {
  statuses = InvestmentAgreementsStatuses;
  @Input() investmentAgreement: InvestmentAgreement;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Output() onUpdate = new EventEmitter<InvestmentAgreement>();

  private _canMarkAsPaid: boolean = false;

  get canMarkAsPaid(): boolean {
    return InvestmentAgreementsStatuses.SIGNED === this.investmentAgreement.status && this._canMarkAsPaid;
  }

  @Input()
  set canMarkAsPaid(input: boolean) {
    this._canMarkAsPaid = input;
  }

  constructor(private translate: TranslateService) {
  }

  getStatus(): string {
    return this.translate.instant(INVESTMENT_AGREEMENT_STATUSES[ this.investmentAgreement.status ]);
  }

  markAsPaid() {
    // Mark as signed, a message will be sent to the current user his account in the threefold app.
    // When the admin user has signed, then it will be marked as paid
    this.onUpdate.emit(Object.assign({}, this.investmentAgreement, { status: InvestmentAgreementsStatuses.SIGNED }));
  }
}
