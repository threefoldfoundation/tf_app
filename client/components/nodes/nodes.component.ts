import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { MatTableDataSource, Sort } from '@angular/material';
import { environment } from '../../../../framework/client/environments/environment';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { ChainStatus, LimitedProfile, NodeInfo, NodesQuery, NodeStatus, UserNodeStatus, WalletStatus } from '../../interfaces';
import { CSVService } from '../../services';

const DEFAULT_COLUMNS = [ 'select', 'username', 'status', 'node_id', 'serial_number', 'chain_status.network', 'chain_status.block_height',
  'chain_status.confirmed_balance', 'chain_status.active_blockstakes', 'chain_status.connected_peers' ];

@Component({
  selector: 'tff-nodes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'nodes.component.html',
  styles: [ `.mat-column-select {
    overflow: initial !important;
    flex: 0 0 32px !important;
  }

  .mat-column-actions {
    flex: 0 0 144px !important;
  }

  .email-list {
    margin: 16px;
  }

  .flex-layout-row {
    box-sizing: border-box;
    flex-direction: row;
    display: flex;
  }
  .flex-layout-align-start-center {
    flex: 1 1 0%;
    place-content: center flex-start;
    align-items: center;
  }

  .flex-layout-align-end-center {
    place-content: center flex-end;
    align-items: center;
  }` ],
})
export class NodesComponent implements OnChanges {
  @Input() nodes: UserNodeStatus[];
  @Input() status: ApiRequestStatus;
  @Output() searchNodes = new EventEmitter<NodesQuery>();
  displayedColumns: string[] = [];
  possibleColumns = [
    { value: 'select', label: 'tff.checkbox' },
    { value: 'username', label: 'tff.name' },
    { value: 'status', label: 'tff.status' },
    { value: 'node_id', label: 'tff.node_id' },
    { value: 'serial_number', label: 'tff.serial_number' },
    { value: 'chain_status.network', label: 'tff.network' },
    { value: 'chain_status.block_height', label: 'tff.block_height' },
    { value: 'chain_status.confirmed_balance', label: 'tff.confirmed_balance' },
    { value: 'chain_status.active_blockstakes', label: 'tff.active_blockstakes' },
    { value: 'chain_status.connected_peers', label: 'tff.connected_peers' },
  ];
  dataSource = new MatTableDataSource<UserNodeStatus>();
  selection = new SelectionModel<UserNodeStatus>(true, []);

  constructor(private csvService: CSVService) {
    // TODO move to service & input / output
    const selectedColumns = localStorage.getItem('tff.nodes.selectedColumns');
    let columns = DEFAULT_COLUMNS;
    if (selectedColumns) {
      try {
        columns = JSON.parse(selectedColumns);
      } catch (ignored) {
      }
    }
    this.displayedColumns = [ ...columns, 'actions' ];
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
    return this.selection.selected.filter(s => s.profile !== null && s.profile.email !== null).map(s => {
      const p = <LimitedProfile>s.profile;
      return `${p.name || p.username} <${p.email}>`;
    }).join(',');
  }

  generateCsv(selection: UserNodeStatus[]) {
    const csvData = selection.map(row => ({
      name: row.profile ? row.profile.name : '',
      email: row.profile ? row.profile.email : '',
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

  getWalletStatusColor(chainStatus: ChainStatus) {
    return chainStatus.wallet_status === WalletStatus.UNLOCKED ? 'primary' : 'warn';
  }

  getWalletStatusIcon(chainStatus: ChainStatus) {
    return chainStatus.wallet_status === WalletStatus.UNLOCKED ? 'check' : 'close';
  }

  getWalletStatusTooltip(chainStatus: ChainStatus) {
    return chainStatus.wallet_status === WalletStatus.UNLOCKED ? 'tff.unlocked' : 'tff.error';
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

  onSortNodes(event: Sort) {
    this.searchNodes.emit({ sort_by: event.direction ? event.active : null, direction: event.direction });
  }

  columnsChanged(selectedColumns: string[]) {
    this.displayedColumns = [ ...selectedColumns, 'actions' ];
    localStorage.setItem('tff.nodes.selectedColumns', JSON.stringify(selectedColumns));
  }
}
