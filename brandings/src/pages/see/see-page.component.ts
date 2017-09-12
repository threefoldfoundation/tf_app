import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Platform } from 'ionic-angular';
import { SeeDocument } from '../../interfaces/see.interfaces';
import { Store } from '@ngrx/store';
import { IAppState } from '../../app/app.state';
import { getSeeDocuments, getSeeDocumentsStatus } from '../../state/app.state';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { GetSeeDocumentsAction } from '../../actions/branding.actions';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'see-page.component.html',
})
export class SeePageComponent implements OnInit {
  documents$: Observable<SeeDocument[]>;
  status$: Observable<ApiRequestStatus>;

  constructor(private platform: Platform,
              private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.documents$ = this.store.let(getSeeDocuments);
    this.status$ = this.store.let(getSeeDocumentsStatus);
    this.store.dispatch(new GetSeeDocumentsAction());
  }

  close() {
    this.platform.exitApp();
  }
}
