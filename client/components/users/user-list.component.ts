import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { UserList } from '../../interfaces';

@Component({
  selector: 'tff-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-list.component.html'
})
export class UserListComponent {
  @Input() userList: UserList;
  @Output() loadMore = new EventEmitter();

  getUserName(user: Profile) {
    return user.info && user.info.firstname ? `${user.info.firstname} ${user.info.lastname}` : user.username;
  }
}
