import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, Loading, LoadingController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators/filter';
import { Subscription } from 'rxjs/Subscription';
import { GetEventPresenceAction, UpdateEventPresenceAction } from '../../actions';
import { IAppState } from '../../app/app.state';
import { AgendaEventDetail, EventPresence, UpdatePresenceData } from '../../interfaces/agenda.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getEventPresence, getEventPresenceStatus, updateEventPresenceStatus } from '../../state/app.state';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'event-details-page.component.html',
})
export class EventDetailsPageComponent implements OnInit, OnDestroy {
  agendaEvent: AgendaEventDetail;
  eventPresence$: Observable<EventPresence>;
  status$: Observable<ApiRequestStatus>;
  updateStatus$: Observable<ApiRequestStatus>;

  private _updateSub = Subscription.EMPTY;
  private _loading: Loading;

  constructor(private navParams: NavParams,
              private store: Store<IAppState>,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.agendaEvent = this.navParams.get('event');
    this.store.dispatch(new GetEventPresenceAction(this.agendaEvent.id));
    this.eventPresence$ = <Observable<EventPresence>>this.store.pipe(select(getEventPresence), filter(p => p !== null));
    this.status$ = this.store.pipe(select(getEventPresenceStatus));
    this.updateStatus$ = this.store.pipe(select(updateEventPresenceStatus));
  }

  ngOnDestroy() {
    this._updateSub.unsubscribe();
    if (this._loading) {
      this._loading.dismissAll();
    }
  }

  onUpdatePresence(data: UpdatePresenceData) {
    this.store.dispatch(new UpdateEventPresenceAction(data));
    this._loading = this.loadingCtrl.create({ content: this.translate.instant('loading') });
    this._loading.present();
    this._updateSub.unsubscribe();
    this._updateSub = this.updateStatus$.subscribe(status => {
      if (status.success) {
        this._loading.dismissAll();
      } else if (status.error) {
        this._loading.dismissAll();
        this.alertCtrl.create({
          title: this.translate.instant('error'),
          message: status.error.error,
          buttons: [ this.translate.instant('close') ],
        }).present();
      }
    });
  }
}
