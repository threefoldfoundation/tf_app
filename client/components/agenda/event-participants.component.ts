import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { Profile } from '../../../../its_you_online_auth/client/interfaces/user.interfaces';
import { EventParticipant, EventPresenceStatus } from '../../interfaces/agenda-events.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-event-participants',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'event-participants.component.html'
})
export class EventParticipantsComponent implements OnChanges {
  @Input() participants: EventParticipant[];
  @Input() status: ApiRequestStatus;

  wantsRecording = 42;
  presence: { [key: number]: EventParticipant[] } = {
    [ EventPresenceStatus.PRESENT ]: [],
    [ EventPresenceStatus.ABSENT ]: [],
    [ this.wantsRecording ]: [],
  };

  tabs = [
    { label: 'tff.going_x', value: EventPresenceStatus.PRESENT },
    { label: 'tff.not_going_x', value: EventPresenceStatus.ABSENT },
    { label: 'tff.wants_recording_x', value: this.wantsRecording },
  ];

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.participants && changes.participants.currentValue) {
      const presence: EventParticipant[] = changes.participants.currentValue;
      this.presence[ EventPresenceStatus.PRESENT ] = presence.filter(p => p.status === EventPresenceStatus.PRESENT);
      this.presence[ EventPresenceStatus.ABSENT ] = presence.filter(p => p.status === EventPresenceStatus.ABSENT);
      this.presence[this.wantsRecording] = presence.filter(p => p.wants_recording);
    }
  }

  getUserName(profile: Profile) {
    return profile.info && profile.info.firstname ? `${profile.info.firstname} ${profile.info.lastname}` : profile.username;
  }

  trackByUsername(index: number, item: EventParticipant) {
    return item.username;
  }
}
