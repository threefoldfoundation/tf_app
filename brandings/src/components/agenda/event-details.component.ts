import { DatePipe } from '@angular/common';
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
              private translate: TranslateService,
              private datePipe: DatePipe) {
  }

  getFormattedDate(date: string) {
    return `${this.datePipe.transform(date, 'mediumDate')} ${this.datePipe.transform(date, 'shortTime')}`;
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

  getAttendeesText() {
    if (this.status.loading) {
      return '';
    }
    if (this.isPresent()) {
      return this.translate.instant('you_and_x_others', { attendees: Math.max(0, this.eventPresence.present_count - 1) });
    } else {
      return this.translate.instant('x_attendees', { attendees: this.eventPresence.present_count });
    }
  }

  private submit(wants_recording: boolean, status: EventPresenceStatus) {
    this.updatePresence.emit({ event_id: this.agendaEvent.id, status, wants_recording });
  }
}
