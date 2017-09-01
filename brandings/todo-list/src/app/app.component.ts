import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TranslateService } from '@ngx-translate/core';
import { RogerthatService } from '../services/rogerthat.service';
import { HomePageComponent } from '../pages/home/home-page.component';

@Component({
  templateUrl: 'app.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListAppComponent {
  rootPage: any = HomePageComponent;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private translate: TranslateService,
              private rogerthatService: RogerthatService) {
    translate.setDefaultLang('en');
    platform.ready().then(() => {
      console.timeEnd('loaded');
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      rogerthat.callbacks.ready(() => {
        this.rogerthatService.initialize();
      });
    });
  }
}
