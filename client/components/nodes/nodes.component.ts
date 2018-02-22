import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { UserNodeStatus } from '../../interfaces';
import { ProfileEmailPipe } from '../../pipes/profile-email.pipe';
import { ProfileNamePipe } from '../../pipes/profile-name.pipe';

@Component({
  selector: 'tff-nodes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: 'nodes.component.html',
  styles: [ `.mat-column-select {
    overflow: initial;
  }

  .email-list {
    margin: 16px;
  }` ],
})
export class NodesComponent implements OnChanges {
  @Input() nodes: UserNodeStatus[];
  @Input() status: ApiRequestStatus;
  displayedColumns = [ 'select', 'name', 'email', 'status', 'node_id', 'serial_number', 'profile_link' ];
  dataSource = new MatTableDataSource<UserNodeStatus>();
  selection = new SelectionModel<UserNodeStatus>(true, []);

  constructor(private profileNamePipe: ProfileNamePipe,
              private profileEmailPipe: ProfileEmailPipe) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nodes) {
      this.dataSource = new MatTableDataSource(changes.nodes.currentValue);
      this.selection.clear();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  /** Selects all rows if they are not all selected; otherwise clears the selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      for (const row of this.dataSource.data) {
        this.selection.select(row);
      }
    }
  }

  getSelectionCsv() {
    return this.selection.selected.map(s => {
      return `${this.profileNamePipe.transform(s.profile)} <${this.profileEmailPipe.transform(s.profile)}>`;
    }).join(',');
  }
}
