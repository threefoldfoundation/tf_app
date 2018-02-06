import { CommonModule, CurrencyPipe, DatePipe, I18nPluralPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatDatepickerModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
// noinspection ES6UnusedImports
import {} from '@types/google.visualization';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { ChannelModule } from '../../framework/client/channel/channel.module';
import { MultilingualModule } from '../../framework/client/i18n/multilingual.module';
import { SetThemeAction } from '../../framework/client/identity/actions';
import { AuthenticationService } from '../../framework/client/identity/services';
import { IAppState } from '../../framework/client/ngrx';
import { AddRoutesAction } from '../../framework/client/sidebar/index';
import { AddToolbarItemAction } from '../../framework/client/toolbar/actions';
import { ToolbarItemTypes } from '../../framework/client/toolbar/interfaces';
import {
  AgendaEventDetailComponent,
  AgendaEventDetailPageComponent,
  AgendaEventsListComponent,
  AgendaEventsListPageComponent,
  ApiRequestStatusComponent,
  CreateAgendaEventPageComponent,
  CreateTransactionComponent,
  CreateTransactionPageComponent,
  DashboardComponent,
  EventParticipantsComponent,
  EventParticipantsPageComponent,
  FlowRunDetailComponent,
  FlowRunStatusComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InstallationComponent,
  InstallationLogsComponent,
  InstallationsComponent,
  InstallationStatusComponent,
  InvestmentAgreementAmountComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  IyoSeeComponent,
  KycComponent,
  KycUpdatesComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent,
  SearchInvestmentAgreementsComponent,
  SearchNodeOrdersComponent,
  TransactionListComponent,
  UserListComponent,
  UserSearchComponent,
  WalletBalanceComponent,
} from './components';
import { TffEffects } from './effects';
import {
  CreateInvestmentAgreementPageComponent,
  CreateOrderPageComponent,
  DashboardPageComponent,
  FlowStatisticsDetailPageComponent,
  FlowStatisticsOverviewPageComponent,
  FlowStatisticsPageComponent,
  InstallationLogsPageComponent,
  InstallationsPageComponent,
  KycPageComponent,
  UserDetailsPageComponent,
  UserListPageComponent,
  UserNodeOrdersPageComponent,
  UserPageComponent,
  UserPurchaseAgreementsPageComponent,
  UserTransactionsListPageComponent,
} from './pages';
import { MarkdownPipe } from './pipes/markdown.pipe';
import { ProfileNamePipe } from './pipes/profile-name.pipe';
import { TimeDurationPipe } from './pipes/time-duration.pipe';
import { TimePipe } from './pipes/time.pipe';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { tffReducer } from './reducers';
import { TffRoutes } from './routes';
import { ApiErrorService, FlowStatisticsService, TffConfig, TffService } from './services';

const MATERIAL_IMPORTS = [
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatDatepickerModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatToolbarModule,
];

const PIPES = [
  TimestampPipe,
  MarkdownPipe,
  TimePipe,
  TimeDurationPipe,
  ProfileNamePipe,
];

export const TFF_PROVIDERS = [
  ApiErrorService,
  FlowStatisticsService,
  TffConfig,
  TffService,
];

export const TFF_PAGES = [
  CreateInvestmentAgreementPageComponent,
  CreateOrderPageComponent,
  DashboardPageComponent,
  FlowStatisticsDetailPageComponent,
  FlowStatisticsOverviewPageComponent,
  FlowStatisticsPageComponent,
  InstallationLogsPageComponent,
  InstallationsPageComponent,
  KycPageComponent,
  UserDetailsPageComponent,
  UserListPageComponent,
  UserNodeOrdersPageComponent,
  UserPageComponent,
  UserPurchaseAgreementsPageComponent,
  UserTransactionsListPageComponent,
];

export const TFF_COMPONENTS: any[] = [
  AgendaEventDetailComponent,
  AgendaEventDetailPageComponent,
  AgendaEventsListComponent,
  AgendaEventsListPageComponent,
  ApiRequestStatusComponent,
  CreateAgendaEventPageComponent,
  CreateTransactionComponent,
  CreateTransactionPageComponent,
  DashboardComponent,
  EventParticipantsComponent,
  EventParticipantsPageComponent,
  FlowRunDetailComponent,
  FlowRunStatusComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InstallationComponent,
  InstallationLogsComponent,
  InstallationsComponent,
  InstallationStatusComponent,
  InvestmentAgreementAmountComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  IyoSeeComponent,
  KycComponent,
  KycUpdatesComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent,
  SearchInvestmentAgreementsComponent,
  SearchNodeOrdersComponent,
  TransactionListComponent,
  UserListComponent,
  UserSearchComponent,
  WalletBalanceComponent,
  ...TFF_PAGES,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MultilingualModule,
    RouterModule.forChild(TffRoutes),
    StoreModule.forFeature('tff', tffReducer),
    EffectsModule.forFeature([ TffEffects ]),
    MATERIAL_IMPORTS,
    FlexLayoutModule,
    ChannelModule,
    Ng2GoogleChartsModule,
  ],
  declarations: [
    TFF_COMPONENTS,
    PIPES,
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    I18nPluralPipe,
    TFF_PROVIDERS,
    PIPES,
  ],
  exports: [
    TFF_COMPONENTS,
  ],
})
export class TffBackendModule {
  constructor(@Optional() @SkipSelf() parentModule: TffBackendModule,
              private store: Store<IAppState>,
              private authService: AuthenticationService) {
    if (parentModule) {
      throw new Error('TffBackendModule already loaded; Import in root module only.');
    }
    this.store.dispatch(new AddRoutesAction(TffRoutes));
    const themeItem = {
      id: 'change_theme',
      type: ToolbarItemTypes.ICON,
      icon: 'format_color_fill',
      persistent: true,
      onclick: () => {
        const newTheme = this.authService.getLocalTheme() ? null : { cssClass: 'dark-theme', dark: true };
        this.store.dispatch(new SetThemeAction(newTheme));
      },
    };
    this.store.dispatch(new AddToolbarItemAction(themeItem));
  }
}
