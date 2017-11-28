import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';

@Component({
  selector: 'set-referrer-form',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'set-referrer-form.component.html',
})

export class SetReferrerFormComponent {
  @Input() status: ApiRequestStatus;
  @Input() result: string | null;
  @Output() onSubmit = new EventEmitter<string>();

  code: string;

  submit(form: NgForm) {
    if (form.form.valid) {
      this.onSubmit.emit(this.code);
    }
  }
}
