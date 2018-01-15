import { MetaGuard } from '@ngx-meta/core';
import { InvestmentAgreementDetailPageComponent, InvestmentAgreementListPageComponent } from '../components/investment-agreements';
import { CreateInvestmentAgreementPageComponent } from '../pages/investment-agreements';

export const INVESTMENT_AGREEMENT_ROUTES = [
  {
    path: 'investment-agreements',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'attach_money',
      id: 'tff_investment_agreements',
      meta: {
        title: 'tff.investment_agreements',
      },
    },
    component: InvestmentAgreementListPageComponent,
  },
  {
    path: 'investment-agreements/create',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.create_investment_agreement' } },
    component: CreateInvestmentAgreementPageComponent,
  },
  {
    path: 'investment-agreements/:investmentAgreementId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.investment_agreement_detail' } },
    component: InvestmentAgreementDetailPageComponent,
  },
];
