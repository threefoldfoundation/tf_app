import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import {
  GetInvestmentAgreementsPayload,
  INVESTMENT_AGREEMENT_STATUSES,
  InvestmentAgreementList,
  InvestmentAgreementsStatuses
} from '../../interfaces/index';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-investment-agreements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'investment-agreement-list.component.html',
  styles: [ `.investment-agreements-content {
    padding: 16px;
  }` ]
})
export class InvestmentAgreementListComponent {

  @Input() investmentAgreements: InvestmentAgreementList;
  @Input() listStatus: ApiRequestStatus;
  @Output() onLoadInvestmentAgreements = new EventEmitter<GetInvestmentAgreementsPayload>();
  statuses: { label: string, value: InvestmentAgreementsStatuses }[] = Object.keys(INVESTMENT_AGREEMENT_STATUSES).map(status => ({
    label: INVESTMENT_AGREEMENT_STATUSES[ parseInt(status) ],
    value: parseInt(status)
  }));
  status: InvestmentAgreementsStatuses = InvestmentAgreementsStatuses.CREATED;

  getStatusString(): string {
    return INVESTMENT_AGREEMENT_STATUSES[ this.status ];
  }

  onStatusChange() {
    this.onLoadInvestmentAgreements.emit({ cursor: null, status: this.status });
  }

  loadMore() {
    this.onLoadInvestmentAgreements.emit({ cursor: this.investmentAgreements.cursor, status: this.status });
  }
}
