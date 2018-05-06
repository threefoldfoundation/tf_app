import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { UserList } from '../../interfaces';

@Component({
  selector: 'tff-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-list.component.html',
})
export class UserListComponent {
  @Input() userList: UserList;
  @Output() loadMore = new EventEmitter();
}
