import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ApiCallAction, ApiCallCompleteAction, GetEventsAction } from '../actions/branding.actions';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { getApicallResult, IBrandingState } from '../state/app.state';
import { I18nService } from './i18n.service';

export interface ApiCallResult {
  method: string;
  result: string;
  error: string | null;
  tag: string;
}

@Injectable()
export class RogerthatService {
  constructor(private i18nService: I18nService,
              private ngZone: NgZone,
              private store: Store<IBrandingState>) {
  }

  initialize() {
    this.i18nService.use(rogerthat.user.language);
    rogerthat.api.callbacks.resultReceived((method: string, result: any, error: string | null, tag: string) => {
      this.ngZone.run(() => {
        this.store.dispatch(new ApiCallCompleteAction({ method, result, error, tag }));
      });
    });
    rogerthat.callbacks.serviceDataUpdated(() => {
      this.store.dispatch(new GetEventsAction());
    });
  }

  getContext(): Observable<any> {
    return Observable.create((emitter: Subject<any>) => {
      rogerthat.context(success.bind(this), error.bind(this));

      function success(context: any) {
        emitter.next(context);
        emitter.complete();
      }

      function error(error: RogerthatError) {
        emitter.error(error);
      }
    });
  }

  apiCall<T>(method: string, data?: any, tag?: string | null): Observable<T> {
    if (!tag) {
      tag = rogerthat.util.uuid();
    }
    if (data) {
      data = JSON.stringify(data);
    }
    this.store.dispatch(new ApiCallAction(method, data, tag));
    rogerthat.api.call(method, data, tag);
    return this.store.select(getApicallResult)
      .filter(result => result !== null && result.method === method && result.tag === tag)
      .do(s => s && s.error ? Observable.throw(s) : void(0))
      .map(result => <T>JSON.parse(result!.result || 'null'));
  }
}
