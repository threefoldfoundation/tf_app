import { Injectable } from '@angular/core';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class NodeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  updateNodeStatus() {
    return this.rogerthatService.apiCall<null>('node.status');
  }
}
