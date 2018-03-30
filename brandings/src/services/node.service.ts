import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class NodeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  updateNodeStatus(): Observable<NodeInfo[]> {
    return this.rogerthatService.apiCall<NodeInfo[]>('node.status');
  }
}
