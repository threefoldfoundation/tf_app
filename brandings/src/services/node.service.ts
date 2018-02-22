import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs/observable/of';
import { NodeInfo, NodeStatus } from '../interfaces/node-status.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class NodeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  getLocalStatus() {
    const userDataNodes: NodeInfo[] = (rogerthat.user.data.nodes || []).map((node: NodeInfo) => ({
      ...node,
      status: node.status || NodeStatus.HALTED,
    }));
    return observableOf(userDataNodes);
  }

  updateNodeStatus() {
    return this.rogerthatService.apiCall<null>('node.status');
  }
}
