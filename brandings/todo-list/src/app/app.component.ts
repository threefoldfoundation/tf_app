import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TranslateService } from '@ngx-translate/core';
import { RogerthatService } from '../services/rogerthat.service';
import { HomePageComponent } from '../pages/home/home-page.component';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush, // Everything else uses OnPush
  templateUrl: 'app.html',
})
export class TodoListAppComponent {
  rootPage: any = HomePageComponent;
  platformReady = false;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private translate: TranslateService,
              private rogerthatService: RogerthatService,
              private cdRef: ChangeDetectorRef) {
    translate.setDefaultLang('en');
    platform.ready().then(() => {
      rogerthat.callbacks.ready(() => {
        console.timeEnd('loaded');
        statusBar.styleDefault();
        splashScreen.hide();
        this.rogerthatService.initialize();
        this.platformReady = true;
        this.cdRef.detectChanges();
      });
    });
  }
}
