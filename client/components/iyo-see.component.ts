import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tff-document-url',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p *ngIf="url">{{ 'tff.document_url' | translate }}: <a [href]="url" target="_blank">{{ url }}</a></p>`,
})

export class IyoSeeComponent {
  @Input() url: string | null;
}
