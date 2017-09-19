import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AppComponent } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { PAGES } from '../pages/index';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SERVICES } from '../services/index';
import { MissingTranslationWarnHandler } from '../util/missing-translation-handler';
import { COMPONENTS } from '../components/index';
import { CurrencyPipe, DecimalPipe, I18nPluralPipe } from '@angular/common';
import { MarkdownPipe } from '../pipes/markdown.pipe';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { REDUCER_INJECTION_TOKEN, reducerProvider } from './app.state';
import { BrandingEffects } from './branding.effects';
import './operators';

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
        deps: [ HttpClient ]
      },
    }),
    StoreModule.forRoot(REDUCER_INJECTION_TOKEN),
    EffectsModule.forRoot([ BrandingEffects ]),
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    AppComponent,
    PAGES
  ],
  providers: [
    DecimalPipe,
    CurrencyPipe,
    I18nPluralPipe,
    SERVICES,
    IONIC_NATIVE_PLUGINS,
    reducerProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: MissingTranslationHandler, useClass: MissingTranslationWarnHandler },
  ]
})
export class AppModule {
}
