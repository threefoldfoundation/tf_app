import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, NavParams } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators/filter';
import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../app/app.state';
import { ExchangeInfo } from '../../interfaces/exchange.interfaces';
import { HttpClient } from '@angular/common/http';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'exchange-detail-page.component.html',
})
export class ExchangeDetailPageComponent implements OnInit, OnDestroy {

  private _updateSub = Subscription.EMPTY;
  private _loading: Loading;
  public exchangeInfo: ExchangeInfo;
  public markdownText$: Observable<string>;

  constructor(private navParams: NavParams,
              private store: Store<IAppState>,
              private loadingCtrl: LoadingController,
              private http: HttpClient,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.exchangeInfo = this.navParams.get('info');
    this.markdownText$ = this.http.get(this.exchangeInfo.url, {responseType: 'text'});
  }

  ngOnDestroy() {
    this._updateSub.unsubscribe();
    if (this._loading) {
      this._loading.dismissAll();
    }
  }

}
