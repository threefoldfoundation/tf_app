import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { InvestmentAgreementList, InvestmentAgreementsQuery } from '../../interfaces/index';

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
}
