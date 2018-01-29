import { Injectable, NgZone } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ApiCallAction, ApiCallCompleteAction, SetServiceDataAction, SetUserDataAction } from '../actions';
import { IAppState } from '../app/app.state';
import {
  CountNewsItemsResult,
  ListNewsItemsParams,
  ListNewsItemsResult,
  NewsItem,
  RogerthatCallbacks,
  RogerthatOpenParams,
} from '../manual_typings/rogerthat';
import { RogerthatError, RogerthatMessageOpenError } from '../manual_typings/rogerthat-errors';
import { getApicallResult } from '../state/rogerthat.state';
import { I18nService } from './i18n.service';

export interface ApiCallResult {
  method: string;
  result: string;
  error: string | null;
  tag: string;
}

export interface AppVersion {
  major: number;
  minor: number;
  patch: number;
}

export class ApiCallError extends Error {
  constructor(public message: string, public apiCallResult: ApiCallResult) {
    super(message);
  }
}

@Injectable()
export class RogerthatService {
  private _version: AppVersion;

  constructor(private i18nService: I18nService,
              private ngZone: NgZone,
              private store: Store<IAppState>) {
  }

  initialize() {
    this.store.dispatch(new SetUserDataAction(rogerthat.user.data));
    this.store.dispatch(new SetServiceDataAction(rogerthat.service.data));
    this.i18nService.use(rogerthat.user.language);
    rogerthat.api.callbacks.resultReceived((method: string, result: any, error: string | null, tag: string) => {
      this.ngZone.run(() => this.store.dispatch(new ApiCallCompleteAction({ method, result, error, tag })));
    });
    const cb = <RogerthatCallbacks>rogerthat.callbacks;
    cb.userDataUpdated(() => this.ngZone.run(() => this.store.dispatch(new SetUserDataAction(rogerthat.user.data))));
    cb.serviceDataUpdated(() => this.ngZone.run(() => {
      this.store.dispatch(new SetServiceDataAction(rogerthat.service.data));
    }));
    const [ major, minor, patch ] = rogerthat.system.appVersion.split('.').slice(0, 3).map(s => parseInt(s));
    this._version = { major, minor, patch };
  }

  getVersion(): AppVersion {
    return this._version;
  }

  isVersionSupported(androidVersion: AppVersion, iosVersion: AppVersion) {
    const currentVersion = this.getVersion();
    const checkVersion = rogerthat.system.os === 'android' ? androidVersion : iosVersion;
    return currentVersion.major > checkVersion.major
      || currentVersion.minor > checkVersion.minor
      || currentVersion.patch > checkVersion.patch;
  }

  getContext<T>(): Observable<T> {
    return Observable.create((emitter: Subject<T>) => {

      const success = (context: T) => {
        this.ngZone.run(() => {
          emitter.next(context);
          emitter.complete();
        });
      };

      const error = (err: RogerthatError) => this.ngZone.run(() => emitter.error(err));
      rogerthat.context(success, error);
    });
  }

  open(params: RogerthatOpenParams): Observable<null> {
    return Observable.create((emitter: Subject<null>) => {
      const success = () => {
        this.ngZone.run(() => {
          emitter.next(null);
          emitter.complete();
        });
      };
      const error = (err: RogerthatError) => this.ngZone.run(() => emitter.error(err));
      rogerthat.util.open(params, success, error);
    });
  }

  openMessage(messageKey: string): Observable<null> {
    return Observable.create((emitter: Subject<null>) => {
      const success = () => {
        this.ngZone.run(() => {
          emitter.next(null);
          emitter.complete();
        });
      };
      const error = (err: RogerthatMessageOpenError) => this.ngZone.run(() => emitter.error(<RogerthatError>{
        code: err.type,
        message: err.type,
      }));
      rogerthat.message.open(messageKey, success, error);
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
    return this.store.pipe(
      select(getApicallResult),
      filter(result => result !== null && result.method === method && result.tag === tag),
      tap(s => {
        if (s && s.error) {
          throw new ApiCallError(s.error, s);
        }
      }),
      map(result => <T>JSON.parse(result!.result || 'null')),
    );
  }

  countNews(): Observable<CountNewsItemsResult> {
    return Observable.create((emitter: Subject<CountNewsItemsResult>) => {
      const success = (result: CountNewsItemsResult) => {
        this.ngZone.run(() => {
          emitter.next(result);
          emitter.complete();
        });
      };
      const error = (err: RogerthatError) => this.ngZone.run(() => emitter.error(err));
      rogerthat.news.count(success, error);
    });
  }

  getNews(newsId: number): Observable<NewsItem> {
    return Observable.create((emitter: Subject<NewsItem>) => {
      const success = (result: NewsItem) => {
        this.ngZone.run(() => {
          emitter.next(result);
          emitter.complete();
        });
      };
      const error = (err: RogerthatError) => this.ngZone.run(() => emitter.error(err));
      rogerthat.news.get(success, error, { news_id: newsId });
    });
  }

  listNews(params: ListNewsItemsParams): Observable<ListNewsItemsResult> {
    return Observable.create((emitter: Subject<ListNewsItemsResult>) => {
      const success = (result: ListNewsItemsResult) => {
        this.ngZone.run(() => {
          emitter.next(result);
          emitter.complete();
        });
      };
      const error = (err: RogerthatError) => this.ngZone.run(() => emitter.error(err));
      rogerthat.news.list(success, error, params);
    });
  }
}
