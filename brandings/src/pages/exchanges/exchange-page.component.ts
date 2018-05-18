import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, NavParams, NavController } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators/filter';
import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../app/app.state';
import { ExchangeDetailPageComponent } from './exchange-detail-page.component';
import { ExchangeInfo } from '../../interfaces/exchange.interfaces';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'exchange-page.component.html',
})
export class ExchangesPageComponent implements OnInit, OnDestroy {

  private _updateSub = Subscription.EMPTY;
  private _loading: Loading;
  public exchanges: ExchangeInfo[];

  constructor(private navParams: NavParams,
              private navControl: NavController,
              private store: Store<IAppState>,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

  ngOnInit() {
      this.exchanges = [
        {title: "BTC-Alpha", url: "https://raw.githubusercontent.com/threefoldfoundation/info_tokens/master/docs/btc-alpha.md", iconPath:"/assets/images/btc-alpha-logo.svg"}
      ];
  }

  ngOnDestroy() {
    this._updateSub.unsubscribe();
    if (this._loading) {
      this._loading.dismissAll();
    }
  }

  itemSelected(item: ExchangeInfo) {
    this.navControl.push(ExchangeDetailPageComponent, {info: item});
  }

}
