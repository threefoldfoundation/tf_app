import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { GetEventsAction } from '../actions/branding.actions';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { IBrandingState } from '../state/app.state';
import { I18nService } from './i18n.service';

export interface ApiCallResult {
  method: string;
  result: string;
  error: string | null;
  tag: string;
}

@Injectable()
export class RogerthatService {

  private resultReceived$: Observable<ApiCallResult>;
  private subject: Subject<ApiCallResult>;

  constructor(private i18nService: I18nService,
              private ngZone: NgZone,
              private store: Store<IBrandingState>) {
    this.resultReceived$ = Observable.create((emitter: Subject<ApiCallResult>) => {
      this.subject = emitter;
    });
  }

  initialize() {
    this.i18nService.use(rogerthat.user.language);
    rogerthat.api.callbacks.resultReceived((method: string, result: any, error: string | null, tag: string) => {
      console.log({ method, result, error, tag });
      this.ngZone.run(() => {
        if (error) {
          this.subject.error({ method, result, error, tag });
        } else {
          this.subject.next({ method, result, error, tag });
        }
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
    console.log(`system.api_call -> ${method}`);
    rogerthat.api.call(method, data, tag);
    return this.resultReceived$.filter(result => result.method === method && result.tag === tag)
      .do(result => console.log(`${method} result`, result.result))
      .map(result => <T>JSON.parse(result.result || 'null'));
  }
}
