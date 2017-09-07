import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SeeDocumentsAppComponent } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PAGES } from '../pages/index';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SERVICES } from '../services/index';
import { MissingTranslationWarnHandler } from '../util/missing-translation-handler';
import { COMPONENTS } from '../components/index';
import './operators';
import { MarkdownModule } from 'angular2-markdown';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}


@NgModule({
  declarations: [
    SeeDocumentsAppComponent,
    PAGES,
    COMPONENTS
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(SeeDocumentsAppComponent),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      },
    }),
    MarkdownModule.forRoot()
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    SeeDocumentsAppComponent,
    PAGES
  ],
  providers: [
    SERVICES,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: MissingTranslationHandler, useClass: MissingTranslationWarnHandler },
  ]
})
export class AppModule {
}
