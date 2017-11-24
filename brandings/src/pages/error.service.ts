import { Injectable } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class ErrorService {
  constructor(private translate: TranslateService,
              private alertCtrl: AlertController,
              private inAppBrowser: InAppBrowser) {
  }

  showVersionNotSupported(errorMessage: string) {
    const url = `https://rogerth.at/install?a=${rogerthat.system.appId}`;
    return this.alertCtrl.create({
      title: this.translate.instant('update_required'),
      message: errorMessage,
      buttons: [ {
        text: this.translate.instant('update_app'),
        handler: () => {
          this.inAppBrowser.create(url, '_system');
        },
      }, {
        text: this.translate.instant('close'),
      } ],
    }).present();
  }
}
