import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Injectable()
export class ErrorService {
  constructor(private translate: TranslateService,
              private alertCtrl: AlertController,
              private appVersion: AppVersion,
              private inAppBrowser: InAppBrowser) {
  }

  async showVersionNotSupported(errorMessage: string) {
    const isIos = rogerthat.system.os === 'ios';
    const packageName = await this.appVersion.getPackageName();
    const url = `${isIos ? `itms-apps://itunes.apple.com/app/` : `market://details?id=`}${packageName}`;
    const buttonText = isIos ? 'open_app_store' : 'open_google_play';
    return this.alertCtrl.create({
      title: this.translate.instant('update_required'),
      message: errorMessage,
      buttons: [ {
        text: this.translate.instant(buttonText),
        handler: () => {
          this.inAppBrowser.create(url, '_system');
        }
      }, {
        text: this.translate.instant('close')
      } ]
    }).present();
  }
}
