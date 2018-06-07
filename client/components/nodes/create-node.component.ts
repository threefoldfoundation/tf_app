import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { CreateNodePayload } from '../../interfaces';

@Component({
  selector: 'tff-create-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'create-node.component.html',
})
export class CreateNodeComponent {
  @Input() createStatus: ApiRequestStatus;
  @Output() createNode = new EventEmitter<CreateNodePayload>();
  node: CreateNodePayload = {
    username: null,
    id: '',
  };

  submit(form: NgForm) {
    if (form.form.valid && this.node.username) {
      this.createNode.emit(this.node);
    }
  }
}
