import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportStatus } from '../../interfaces/home';
import { NodeStatus } from '../../interfaces/node-status.interfaces';
import { UserDataKYC } from '../../interfaces/rogerthat';
import { NewsItem } from '../../manual_typings/rogerthat';

@Component({
  selector: 'home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'home.component.html',
})
export class HomeComponent {
  @Input() supportStatus: SupportStatus;
  @Input() newsItems: NewsItem[];
  @Input() kycStatus: UserDataKYC;
  @Input() hasReferrer: boolean;
  @Input() nodes: NodeStatus[];
  @Input() messageCount: number;
  @Output() tileClicked = new EventEmitter<string>();
}
