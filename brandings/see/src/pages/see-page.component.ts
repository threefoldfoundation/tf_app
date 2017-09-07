import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AlertController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { SeeDocument } from '../interfaces/see.interfaces';
import { SeeService } from '../services/see.service';
import { ApiCallResult } from '../services/rogerthat.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'see-page.component.html',
})
export class SeePageComponent implements OnInit {
  documents$: Observable<SeeDocument[]>;

  constructor(private seeService: SeeService,
              private platform: Platform,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.documents$ = this.seeService.list().catch((err: ApiCallResult) => {
      this.alertCtrl.create({
        title: this.translate.instant('error'),
        message: err.error!
      }).present();
      return Observable.of([]);
    });
  }

  close() {
    this.platform.exitApp();
  }
}
