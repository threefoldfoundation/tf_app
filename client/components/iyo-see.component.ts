import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { SeeDocumentDetails } from '../interfaces/iyo-see.interfaces';

@Component({
  moduleId: module.id,
  selector: 'iyo-see',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p *ngIf="document">{{ 'tff.document_url' | translate }}: <a [href]="getUrl()" target="_blank">{{ getUrl() }}</a></p>`,
})

export class IyoSeeComponent {
  @Input() document: SeeDocumentDetails;

  getUrl() {
    return this.document.versions[ 0 ].link;
  }
}
