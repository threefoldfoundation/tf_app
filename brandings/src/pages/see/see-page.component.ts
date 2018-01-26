import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { map, withLatestFrom } from 'rxjs/operators';
import { GetSeeDocumentsAction } from '../../actions/branding.actions';
import { IAppState } from '../../app/app.state';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { SeeDocument } from '../../interfaces/see.interfaces';
import { getSeeDocuments, getSeeDocumentsStatus } from '../../state/app.state';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'see-page.component.html',
})
export class SeePageComponent implements OnInit {
  documents$: Observable<SeeDocument[]>;
  status$: Observable<ApiRequestStatus>;
  hasNoDocuments$: Observable<boolean>;

  constructor(private platform: Platform,
              private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.documents$ = this.store.select(getSeeDocuments);
    this.status$ = this.store.select(getSeeDocumentsStatus);
    this.store.dispatch(new GetSeeDocumentsAction());
    this.hasNoDocuments$ = this.status$.pipe(
      withLatestFrom(this.documents$),
      map(([ status, docs ]) => status.success && docs.length === 0),
    );
  }

  close() {
    this.platform.exitApp();
  }
}
