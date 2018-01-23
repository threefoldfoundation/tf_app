import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs/observable/of';
import { merge } from 'rxjs/operators/merge';
import { NodeStatus } from '../interfaces/node-status.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class NodeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  getStatus() {
    const userDataObservable = observableOf({
      status: rogerthat.user.data.node_status || 'halted',
    });
    if (rogerthat.user.data.node_status === 'running') {
      return userDataObservable.pipe(merge(this.rogerthatService.apiCall<NodeStatus>('node.status')));
    } else {
      return userDataObservable;
    }
  }
}
