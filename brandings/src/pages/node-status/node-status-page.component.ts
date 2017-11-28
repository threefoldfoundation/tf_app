import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators/filter';
import { GetNodeStatusAction } from '../../actions/branding.actions';
import { IAppState } from '../../app/app.state';
import { NodeStatus } from '../../interfaces/node-status.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getNodeStatus, getNodeStatusStatus } from '../../state/app.state';

@Component({
  selector: 'node-status-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'node-status-page.component.html',
})
export class NodeStatusPageComponent implements OnInit {
  nodeStatus$: Observable<NodeStatus>;
  status$: Observable<ApiRequestStatus>;

  constructor(private platform: Platform,
              private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.store.dispatch(new GetNodeStatusAction());
    this.nodeStatus$ = <Observable<NodeStatus>>this.store.select(getNodeStatus).pipe(filter(p => p !== null));
    this.status$ = this.store.select(getNodeStatusStatus);
  }

  close() {
    this.platform.exitApp();
  }
}
