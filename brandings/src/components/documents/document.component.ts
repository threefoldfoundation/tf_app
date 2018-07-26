import { Component, Input } from '@angular/core';
import { SignedDocument } from '../../interfaces/documents';

@Component({
  selector: 'tff-document',
  templateUrl: 'document.component.html',
})

export class DocumentComponent {
  @Input() document: SignedDocument;
}
