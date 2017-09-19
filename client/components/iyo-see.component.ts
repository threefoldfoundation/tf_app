import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'iyo-see',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ 'tff.iyo_see_url' | translate }}: <a [href]="url" target="_blank">{{ url }}</a></p>`,
})

export class IyoSeeComponent {
  @Input() id: string;

  get url() {
    return `https://itsyou.online/#/see/${encodeURIComponent(this.id)}/threefold`;
  }
}
