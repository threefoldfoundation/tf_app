import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GlobalStatsService } from '../../services/global-stats.service';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { Observable } from 'rxjs/Observable';
import { AlertController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiCallResult } from '../../services/rogerthat.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-stats-page.component.html',
})
export class GlobalStatsPageComponent implements OnInit {
  globalStats$: Observable<GlobalStats[]>;
  loading = true;

  constructor(private globalStatsService: GlobalStatsService,
              private platform: Platform,
              private alertCtrl: AlertController,
              private translate: TranslateService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.globalStats$ = this.globalStatsService.listStats().do(stats => {
      this.loading = false;
      this.cdRef.detectChanges();
    }).catch((err: ApiCallResult) => {
      this.alertCtrl.create({
        title: this.translate.instant('error'),
        message: err.error!
      }).present();
      return Observable.of([]);
    });

    this.globalStats$.subscribe(res => console.log('stats result', res));
  }

  close() {
    this.platform.exitApp();
  }
}
