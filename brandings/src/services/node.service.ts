import { Injectable } from '@angular/core';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class NodeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  getStatus() {
    return this.rogerthatService.apiCall<NodeInfo[]>('node.status');
  }
}
