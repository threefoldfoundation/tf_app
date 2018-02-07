import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import {
  INVESTMENT_AGREEMENT_STATUSES,
  InvestmentAgreement,
  InvestmentAgreementList,
  InvestmentAgreementsQuery,
} from '../../interfaces';

@Component({
  selector: 'tff-investment-agreements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'investment-agreement-list.component.html',
})
export class InvestmentAgreementListComponent {
  @Input() investmentAgreements: InvestmentAgreementList;
  @Input() status: ApiRequestStatus;
  @Input() linkTarget = '_self';
  @Output() loadMore = new EventEmitter<InvestmentAgreementsQuery>();

  getStatus(agreement: InvestmentAgreement) {
    return INVESTMENT_AGREEMENT_STATUSES[ agreement.status ];
  }
}
