import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { map, withLatestFrom } from 'rxjs/operators';
import { GetDocumentsAction } from '../../actions';
import { IAppState } from '../../app/app.state';
import { SignedDocument } from '../../interfaces/documents';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getSeeDocuments, getSeeDocumentsStatus } from '../../state/app.state';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'documents-page.component.html',
})
export class DocumentsPageComponent implements OnInit {
  documents$: Observable<SignedDocument[]>;
  status$: Observable<ApiRequestStatus>;
  hasNoDocuments$: Observable<boolean>;

  constructor(private platform: Platform,
              private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.documents$ = this.store.pipe(select(getSeeDocuments));
    this.status$ = this.store.pipe(select(getSeeDocumentsStatus));
    this.store.dispatch(new GetDocumentsAction());
    this.hasNoDocuments$ = this.status$.pipe(
      withLatestFrom(this.documents$),
      map(([ status, docs ]) => status.success && docs.length === 0),
    );
  }

  close() {
    this.platform.exitApp();
  }
}
