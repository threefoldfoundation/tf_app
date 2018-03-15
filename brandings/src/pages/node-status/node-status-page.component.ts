import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { GetNodeStatusAction } from '../../actions';
import { IAppState } from '../../app/app.state';
import { NodeInfo } from '../../interfaces/node-status.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getNodes, getNodesStatus } from '../../state/app.state';

@Component({
  selector: 'node-status-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'node-status-page.component.html',
})
export class NodeStatusPageComponent implements OnInit {
  nodes$: Observable<NodeInfo[]>;
  status$: Observable<ApiRequestStatus>;

  constructor(private platform: Platform,
              private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.store.dispatch(new GetNodeStatusAction());
    this.nodes$ = this.store.pipe(select(getNodes));
    this.status$ = this.store.pipe(select(getNodesStatus));
  }

  close() {
    this.platform.exitApp();
  }
}
