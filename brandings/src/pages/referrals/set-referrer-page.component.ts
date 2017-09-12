import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getSetReferrerResult, getSetReferrerStatus } from '../../state/app.state';
import { Store } from '@ngrx/store';
import { IAppState } from '../../app/app.state';
import { SetReferrerAction } from '../../actions/branding.actions';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'set-referrer-page.component.html',
})
export class SetReferrerPageComponent implements OnInit {
  status$: Observable<ApiRequestStatus>;
  setReferrerResult$: Observable<string | null>;

  constructor(private platform: Platform,
              private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.status$ = this.store.let(getSetReferrerStatus);
    this.setReferrerResult$ = this.store.let(getSetReferrerResult);
  }

  submit(code: string) {
    this.store.dispatch(new SetReferrerAction(code));
  }

  close() {
    this.platform.exitApp();
  }
}
