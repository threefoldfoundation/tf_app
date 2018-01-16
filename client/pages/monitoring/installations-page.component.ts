import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { InstallationsList } from '../../../../rogerthat_api/client/interfaces/app';
import { GetInstallationsAction } from '../../actions/index';
import { GetInstallationsQuery } from '../../interfaces';
import { ITffState } from '../../states/index';
import { getInstallations, getInstallationsStatus } from '../../tff.state';

@Component({
  selector: 'tff-installation-logs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tff-installations [installations]="installations$ | async"
                       [status]="status$ | async"
                       (loadMore)="loadMore($event)"></tff-installations>`,
})
export class InstallationsPageComponent implements OnInit {
  installations$: Observable<InstallationsList>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>) {
  }

  ngOnInit() {
    this.store.dispatch(new GetInstallationsAction({}));
    this.installations$ = this.store.select(getInstallations);
    this.status$ = this.store.select(getInstallationsStatus);
  }

  loadMore(query: GetInstallationsQuery) {
    this.store.dispatch(new GetInstallationsAction(query));
  }
}
