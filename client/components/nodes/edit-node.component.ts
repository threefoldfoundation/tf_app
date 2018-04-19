import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { NodeInfo, UpdateNodePayload } from '../../interfaces';

@Component({
  selector: 'tff-edit-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'edit-node.component.html',
})
export class EditNodeComponent {
  @Input() node: NodeInfo;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Output() update = new EventEmitter<UpdateNodePayload>();
  @Output() deleteNode = new EventEmitter<NodeInfo>();

  submit() {
    this.update.emit({ username: this.node.username });
  }
}
