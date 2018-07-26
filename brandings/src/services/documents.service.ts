import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SignedDocument } from '../interfaces/documents';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class DocumentsService {

  constructor(private rogerthatService: RogerthatService) {
  }

  list(): Observable<SignedDocument[]> {
    return this.rogerthatService.apiCall<SignedDocument[]>('documents.list');
  }
}
