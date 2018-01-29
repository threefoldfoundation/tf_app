import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { ListNewsAction, OpenSupportChatAction } from '../../actions';
import { IAppState } from '../../app/app.state';
import { SupportStatus } from '../../interfaces/home';
import { NodeInfo } from '../../interfaces/node-status.interfaces';
import { UserDataKYC } from '../../interfaces/rogerthat';
import { ListNewsItemsResult } from '../../manual_typings/rogerthat';
import { HomeService } from '../../services/home.service';
import { RogerthatService } from '../../services/rogerthat.service';
import { getKYC, getNodes, hasReferrer } from '../../state/app.state';
import { getMessagesBadgeCount, getNewsItemList } from '../../state/rogerthat.state';

@Component({
  selector: 'home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'home-page.component.html',
})
export class HomePageComponent implements OnInit {
  newsList$: Observable<ListNewsItemsResult>;
  kycStatus$: Observable<UserDataKYC>;
  hasReferrer$: Observable<boolean>;
  supportStatus$: Observable<SupportStatus>;
  nodes$: Observable<NodeInfo[]>;
  messagesCount$: Observable<number>;

  constructor(private store: Store<IAppState>,
              private rogerthatService: RogerthatService,
              private homeService: HomeService) {
  }

  ngOnInit() {
    this.store.dispatch(new ListNewsAction({ limit: 3 }));
    this.newsList$ = this.store.pipe(select(getNewsItemList));
    this.kycStatus$ = this.store.pipe(select(getKYC));
    this.hasReferrer$ = this.store.pipe(select(hasReferrer));
    this.nodes$ = this.store.pipe(select(getNodes));
    this.messagesCount$ = this.store.pipe(select(getMessagesBadgeCount));
    this.supportStatus$ = IntervalObservable.create(1000 * 60).pipe(
      startWith(1),
      map(() => this.homeService.getSupportStatus()),
      distinctUntilChanged((prev, next) => prev.online === next.online),
    );
  }

  onTileClicked(tileName: string) {
    console.log(`Clicked tile ${tileName}`);
    if (tileName === 'news') {
      this.rogerthatService.open({ action_type: null, action: 'news' });
    } else if (tileName === 'support') {
      this.store.dispatch(new OpenSupportChatAction());
    }
  }
}
