import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertButton, AlertController } from 'ionic-angular';
import {
  AgendaEventDetail,
  AgendaEventType,
  EventPresence,
  EventPresenceStatus,
  UpdatePresenceData
} from '../../interfaces/agenda.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';

@Component({
  selector: 'event-details',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'event-details.component.html'
})

export class EventDetailsComponent {
  statuses = EventPresenceStatus;
  @Input() agendaEvent: AgendaEventDetail;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Input() eventPresence: EventPresence;

  @Output() updatePresence = new EventEmitter<UpdatePresenceData>();

  constructor(private alertCtrl: AlertController,
              private translate: TranslateService) {
  }

  update(status: EventPresenceStatus) {
    if (this.agendaEvent.type === AgendaEventType.VIDEO_CALL) {
      this.alertCtrl.create({
        title: this.translate.instant('recording'),
        message: this.translate.instant('do_you_want_recording_of_event'),
        buttons: <AlertButton[]>[
          { text: this.translate.instant('no'), handler: () => this.submit(false, status) },
          { text: this.translate.instant('yes'), handler: () => this.submit(true, status) },
        ]
      }).present();
    } else {
      this.submit(false, status);
    }
  }

  isPresent(): boolean {
    return this.eventPresence && this.eventPresence.status === EventPresenceStatus.PRESENT;
  }

  isAbsent(): boolean {
    return this.eventPresence && this.eventPresence.status === EventPresenceStatus.ABSENT;
  }

  private submit(wants_recording: boolean, status: EventPresenceStatus) {
    this.updatePresence.emit({ event_id: this.agendaEvent.id, status, wants_recording });
  }
}
