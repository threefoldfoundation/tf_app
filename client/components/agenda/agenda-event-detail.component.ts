import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MdDatepickerInputEvent } from '@angular/material';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { AGENDA_EVENT_TYPES, AgendaEvent } from '../../interfaces/agenda-events.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-agenda-event-detail',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'agenda-event-detail.component.html',
  styles: [ `tff-agenda-event-detail .mat-form-field {
    width: 100%;
  }

  tff-agenda-event-detail .time-input {
    width: 100px;
    margin-left: 16px;
  }` ]
})

export class AgendaEventDetailComponent {
  eventTypes = AGENDA_EVENT_TYPES;
  @ViewChild('form') form: NgForm;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;

  @Input() set event(value: AgendaEvent) {
    this._event = { ...value };
  }

  get event() {
    return this._event;
  }

  @Output() submitted = new EventEmitter<AgendaEvent>();

  private _event: AgendaEvent;

  constructor(private datePipe: DatePipe) {
  }

  onDateChange(property: 'start_timestamp' | 'end_timestamp', event: MdDatepickerInputEvent<Date>) {
    this.event[ property ] = event.value.toISOString();
    if (property === 'start_timestamp' && this.event.end_timestamp && event.value > new Date(this.event.end_timestamp)) {
      this.event.end_timestamp = this.event.start_timestamp;
    }
  }

  getFormattedDate(date: string) {
    return `${this.datePipe.transform(date, 'mediumDate')} ${this.datePipe.transform(date, 'shortTime')}`;
  }

  getDate(date: string) {
    return date && new Date(date);
  }

  getHours(date: string): number {
    return date ? new Date(date).getHours() : 0;
  }

  setHours(property: 'start_timestamp' | 'end_timestamp', value: number) {
    const date = new Date(this.event[ property ]);
    date.setHours(value);
    this.event[ property ] = date.toISOString();
  }

  setMinutes(property: 'start_timestamp' | 'end_timestamp', value: number) {
    const date = new Date(this.event[ property ]);
    date.setMinutes(value);
    this.event[ property ] = date.toISOString();
  }

  getMinutes(date: string): number {
    return date ? new Date(date).getMinutes() : 0;
  }

  onSubmit() {
    if (!this.form.form.valid) {
      return;
    }
    this.submitted.emit(this.event);
  }

}
