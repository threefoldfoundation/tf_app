import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { NodeInfo, NodeStatus } from '../interfaces/node-status.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class NodeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  getStatus() {
    const userDataNodes: NodeInfo[] = rogerthat.user.data.nodes || [];
    let resultObservable: Observable<NodeInfo[]>;
    const hasRunningNodes = userDataNodes.some(node => node.status === NodeStatus.RUNNING);
    const userDataObservable = observableOf(userDataNodes);
    if (hasRunningNodes) {
      resultObservable = merge(userDataObservable, this.rogerthatService.apiCall<NodeInfo[]>('node.status'));
    } else {
      resultObservable = userDataObservable;
    }
    return resultObservable.pipe(map(nodes => nodes.map(node => ({ ...node, status: node.status || NodeStatus.HALTED }))));
  }
}
