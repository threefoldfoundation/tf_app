import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Record } from '../../interfaces/trulioo.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-trulioo-information',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'trulioo-information.component.html'
})

export class TruliooInformationComponent {
  @Input() record: Record;
}
