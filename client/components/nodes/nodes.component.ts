import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { environment } from '../../../../framework/client/environments/environment';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { NodeInfo, NodeStatus, UserNodeStatus } from '../../interfaces';
import { ProfileEmailPipe } from '../../pipes/profile-email.pipe';
import { ProfileNamePipe } from '../../pipes/profile-name.pipe';
import { CSVService } from '../../services';

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
              private profileEmailPipe: ProfileEmailPipe,
              private csvService: CSVService) {

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
    return this.selection.selected.filter(s => !!s.profile).map(s => {
      return `${this.profileNamePipe.transform(s.profile)} <${this.profileEmailPipe.transform(s.profile)}>`;
    }).join(',');
  }

  generateCsv(selection: UserNodeStatus[]) {
    const csvData = selection.map(row => ({
      name: this.profileNamePipe.transform(row.profile),
      email: this.profileEmailPipe.transform(row.profile),
      status: row.node.status,
      node_id: row.node.id,
      serial_number: row.node.serial_number || '',
    }));
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
      { key: 'node_id', label: 'Node id' },
      { key: 'serial_number', label: 'Serial number' },
    ];
    this.csvService.generateCsv(csvData, 'nodes', { headers });
  }

  getNodeStatusColor(nodeStatus: NodeStatus) {
    return nodeStatus === NodeStatus.RUNNING ? 'primary' : 'warn';
  }

  getNodeStatusIcon(nodeStatus: NodeStatus) {
    return nodeStatus === NodeStatus.RUNNING ? 'check' : 'close';
  }

  getStatisticsUrl(node: NodeInfo) {
    return `${environment.configuration.plugins.tff_backend.grafana_url + environment.configuration.plugins.tff_backend.grafana_node_detail_dashboard}?var-nodes=${node.id}`;
  }

  copyText(element: HTMLElement) {
    if (window.getSelection) {
      const range = document.createRange();
      range.selectNode(element);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
    document.execCommand('copy');
  }
}
