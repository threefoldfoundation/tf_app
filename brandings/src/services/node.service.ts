import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NodeStatus } from '../interfaces/node-status.interfaces';
import { SeeDocument, SeeDocumentDetails } from '../interfaces/see.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class NodeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  getStatus() {
    return this.rogerthatService.apiCall<NodeStatus>('node.status');
  }
}
