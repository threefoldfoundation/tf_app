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
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { TimestampPipe } from '../../../client/pipes/timestamp.pipe';
import { COMPONENTS } from '../components/index';
import { PAGES } from '../pages/index';
import { MarkdownPipe } from '../pipes/markdown.pipe';
import { SERVICES } from '../services/index';
import { MissingTranslationWarnHandler } from '../util/missing-translation-handler';
import { AppComponent } from './app.component';
import { REDUCER_INJECTION_TOKEN, reducerProvider } from './app.state';
import { BrandingEffects } from './branding.effects';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

const IONIC_NATIVE_PLUGINS = [ InAppBrowser, StatusBar, SplashScreen ];

@NgModule({
  declarations: [
    AppComponent,
    PAGES,
    COMPONENTS,
    MarkdownPipe,
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
    StoreModule.forRoot(REDUCER_INJECTION_TOKEN),
    EffectsModule.forRoot([ BrandingEffects ]),
    ChartModule,
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    AppComponent,
    PAGES,
  ],
  providers: [
    TimestampPipe,
    DecimalPipe,
    DatePipe,
    CurrencyPipe,
    I18nPluralPipe,
    SERVICES,
    IONIC_NATIVE_PLUGINS,
    reducerProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: MissingTranslationHandler, useClass: MissingTranslationWarnHandler },
  ],
})
export class AppModule {
}
