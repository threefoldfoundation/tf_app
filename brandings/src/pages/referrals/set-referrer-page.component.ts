import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { SetReferrerAction } from '../../actions/branding.actions';
import { IAppState } from '../../app/app.state';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getSetReferrerResult, getSetReferrerStatus } from '../../state/app.state';

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
    this.status$ = this.store.select(getSetReferrerStatus);
    this.setReferrerResult$ = this.store.select(getSetReferrerResult);
  }

  submit(code: string) {
    this.store.dispatch(new SetReferrerAction(code));
  }

  close() {
    this.platform.exitApp();
  }
}
