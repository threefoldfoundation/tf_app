import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { GlobalStatsAppComponent } from './app.component';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PAGES } from '../pages/index';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SERVICES } from '../services/index';
import { MissingTranslationWarnHandler } from '../util/missing-translation-handler';
import { COMPONENTS } from '../components/index';
import { CurrencyPipe } from '@angular/common';
import './operators';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}


@NgModule({
  declarations: [
    GlobalStatsAppComponent,
    PAGES,
    COMPONENTS
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(GlobalStatsAppComponent),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      },
    })
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    GlobalStatsAppComponent,
    PAGES
  ],
  providers: [
    CurrencyPipe,
    SERVICES,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: MissingTranslationHandler, useClass: MissingTranslationWarnHandler },
  ]
})
export class AppModule {
}
