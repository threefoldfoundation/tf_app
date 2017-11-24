import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, NavParams } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { GetEventPresenceAction, UpdateEventPresenceAction } from '../../actions/branding.actions';
import { AgendaEventDetail, EventPresence, UpdatePresenceData } from '../../interfaces/agenda.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getEventPresence, getEventPresenceStatus, IBrandingState, updateEventPresenceStatus } from '../../state/app.state';

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
              private store: Store<IBrandingState>,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.agendaEvent = this.navParams.get('event');
    this.store.dispatch(new GetEventPresenceAction(this.agendaEvent.id));
    this.eventPresence$ = <Observable<EventPresence>>this.store.select(getEventPresence).filter(p => p !== null);
    this.status$ = this.store.select(getEventPresenceStatus);
    this.updateStatus$ = this.store.select(updateEventPresenceStatus);
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
    this._updateSub = this.store.select(updateEventPresenceStatus).subscribe(status => {
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
