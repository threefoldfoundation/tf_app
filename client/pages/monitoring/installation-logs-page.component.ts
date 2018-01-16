import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filterNull } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Installation, InstallationLog } from '../../../../rogerthat_api/client/interfaces';
import { GetInstallationAction, GetInstallationLogsAction } from '../../actions';
import { ITffState } from '../../states';
import { getInstallation, getInstallationLogs, getInstallationLogsStatus, getInstallationStatus } from '../../tff.state';

@Component({
  selector: 'tff-installation-logs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <button mat-button [routerLink]="['..']" style="margin-bottom: 16px">
        <mat-icon>arrow_back</mat-icon>
        {{ 'tff.back' | translate }}
      </button>
      <tff-installation [installation]="installation$ | async"
                        [status]="installationStatus$ | async"></tff-installation>
      <h2>{{ 'tff.logs' | translate }}</h2>
      <tff-installation-logs [logs]=" installationLogs$ | async"
                             [status]="installationLogsStatus$ | async"></tff-installation-logs>
    </div>`,
})
export class InstallationLogsPageComponent implements OnInit {
  installation$: Observable<Installation>;
  installationStatus$: Observable<ApiRequestStatus>;
  installationLogs$: Observable<InstallationLog[]>;
  installationLogsStatus$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const installationId: string = this.route.snapshot.params.installationId;
    this.store.dispatch(new GetInstallationAction(installationId));
    this.store.dispatch(new GetInstallationLogsAction(installationId));
    this.installationLogs$ = this.store.select(getInstallationLogs);
    this.installationLogsStatus$ = this.store.select(getInstallationLogsStatus);
    this.installation$ = this.store.select(getInstallation).pipe(filterNull<Installation>());
    this.installationStatus$ = this.store.select(getInstallationStatus);
  }
}
