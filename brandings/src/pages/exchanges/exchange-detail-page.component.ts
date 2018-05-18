import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { ExchangeInfo } from '../../interfaces/exchange.interfaces';
import { ExchangesService } from '../../services/exchanges.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'exchange-detail-page.component.html',
})
export class ExchangeDetailPageComponent implements OnInit {
  public exchangeInfo: ExchangeInfo;
  public markdownText$: Observable<string>;

  constructor(private navParams: NavParams,
              private exchangeService: ExchangesService) {
  }

  ngOnInit() {
    this.exchangeInfo = this.navParams.get('info');
    this.markdownText$ = this.exchangeService.getExchangeDescription(this.exchangeInfo);
  }
}
