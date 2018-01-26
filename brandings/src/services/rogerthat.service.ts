import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ApiCallAction, ApiCallCompleteAction, GetEventsAction } from '../actions/branding.actions';
import {
  CountNewsItemsParams,
  CountNewsItemsResult,
  ListNewsItemsParams,
  ListNewsItemsResult,
  NewsItem,
} from '../manual_typings/rogerthat';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { getApicallResult, IBrandingState } from '../state/app.state';
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

declare var Zone: any;

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
              private store: Store<IBrandingState>) {
  }

  initialize() {
    console.log(<any>Zone.current.name);

    this.i18nService.use(rogerthat.user.language);
    rogerthat.api.callbacks.resultReceived((method: string, result: any, error: string | null, tag: string) => {
      this.ngZone.run(() => this.store.dispatch(new ApiCallCompleteAction({ method, result, error, tag })));
    });
    rogerthat.callbacks.serviceDataUpdated(() => {
      this.ngZone.run(() => this.store.dispatch(new GetEventsAction()));
    });
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

  getContext(): Observable<any> {
    return Observable.create((emitter: Subject<any>) => {
      rogerthat.context(success.bind(this), error.bind(this));

      function success(context: any) {
        emitter.next(context);
        emitter.complete();
      }

      function error(err: RogerthatError) {
        emitter.error(err);
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
    return this.store.select(getApicallResult).pipe(
      filter(result => result !== null && result.method === method && result.tag === tag),
      tap(s => {
        if (s && s.error) {
          throw new ApiCallError(s.error, s);
        }
      }),
      map(result => <T>JSON.parse(result!.result || 'null')),
    );
  }

  countNews(params?: CountNewsItemsParams): Observable<CountNewsItemsResult> {
    console.log(<any>Zone.current.name);
    return Observable.create((emitter: Subject<CountNewsItemsResult>) => {
      const success = (result: CountNewsItemsResult) => {
        console.log(<any>Zone.current.name);
        emitter.next(result);
        emitter.complete();
      };
      const error = (err: RogerthatError) => emitter.error(err);
      rogerthat.news.count(success, error, params);
    });
  }

  getNews(newsId: number): Observable<NewsItem> {
    console.log(<any>Zone.current.name);
    return Observable.create((emitter: Subject<NewsItem>) => {
      const success = (result: NewsItem) => {
        console.log(<any>Zone.current.name);
        emitter.next(result);
        emitter.complete();
      };
      const error = (err: RogerthatError) => emitter.error(err);
      rogerthat.news.get(success, error, { news_id: newsId });
    });
  }

  listNews(params: ListNewsItemsParams): Observable<ListNewsItemsResult> {
    console.log(<any>Zone.current.name);
    return Observable.create((emitter: Subject<ListNewsItemsResult>) => {
      const success = (result: ListNewsItemsResult) => {
        console.log(<any>Zone.current.name);
        emitter.next(result);
        emitter.complete();
      };
      const error = (err: RogerthatError) => emitter.error(err);
      rogerthat.news.list(success, error, params);
    });
  }
}
