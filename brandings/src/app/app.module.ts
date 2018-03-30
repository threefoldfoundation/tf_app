import { CurrencyPipe, DatePipe, DecimalPipe, I18nPluralPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ChartModule } from 'angular2-chartjs';
import { QRCodeModule } from 'angular2-qrcode';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import {
  AgendaComponent,
  ApiRequestStatusComponent,
  ConfirmSendComponent,
  EventDetailsComponent,
  GlobalStatsComponent,
  NodeStatusComponent,
  SeeDocumentComponent,
  SendComponent,
  TodoItemListComponent,
} from '../components';
import { BrandingEffects, RogerthatEffects } from '../effects';
import {
  AgendaPageComponent,
  ConfirmSendPageComponent,
  EventDetailsPageComponent,
  GlobalStatsPageComponent,
  InvitePageComponent,
  NodeStatusPageComponent,
  PayWidgetPageComponent,
  ReceivePageComponent,
  SeePageComponent,
  SendPageComponent,
  TodoListOverviewPageComponent,
  TodoListPageComponent,
  TransactionDetailPageComponent,
  TransactionsListPageComponent,
  WalletPageComponent,
} from '../pages';
import { AmountPipe } from '../pipes/amount.pipe';
import { LocaleDecimalPipe } from '../pipes/localized-pipes';
import { MarkdownPipe } from '../pipes/markdown.pipe';
import { SERVICES } from '../services';
import { MissingTranslationWarnHandler } from '../util/missing-translation-handler';
import { AppComponent } from './app.component';
import { reducers } from './app.state';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

const IONIC_NATIVE_PLUGINS = [ InAppBrowser, StatusBar, SplashScreen ];

export const PAGES = [
  AgendaPageComponent,
  ConfirmSendPageComponent,
  EventDetailsPageComponent,
  GlobalStatsPageComponent,
  InvitePageComponent,
  NodeStatusPageComponent,
  PayWidgetPageComponent,
  ReceivePageComponent,
  SeePageComponent,
  SendPageComponent,
  TodoListOverviewPageComponent,
  TodoListPageComponent,
  TransactionDetailPageComponent,
  TransactionsListPageComponent,
  WalletPageComponent,
];

export const COMPONENTS = [
  AgendaComponent,
  ApiRequestStatusComponent,
  ConfirmSendComponent,
  EventDetailsComponent,
  GlobalStatsComponent,
  NodeStatusComponent,
  SeeDocumentComponent,
  SendComponent,
  TodoItemListComponent,
];


@NgModule({
  declarations: [
    AppComponent,
    PAGES,
    COMPONENTS,
    MarkdownPipe,
    LocaleDecimalPipe,
    AmountPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(AppComponent),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ],
      },
    }),
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([ BrandingEffects, RogerthatEffects ]),
    ChartModule,
    QRCodeModule,
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    AppComponent,
    PAGES,
  ],
  providers: [
    DecimalPipe,
    DatePipe,
    CurrencyPipe,
    LocaleDecimalPipe,
    AmountPipe,
    I18nPluralPipe,
    SERVICES,
    IONIC_NATIVE_PLUGINS,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: MissingTranslationHandler, useClass: MissingTranslationWarnHandler },
  ],
})
export class AppModule {
}
