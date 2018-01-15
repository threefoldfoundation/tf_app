import { AsyncPipe, I18nPluralPipe } from '@angular/common';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { takeWhile } from 'rxjs/operators/takeWhile';
import { getTimePipeValue, TimePipeTranslationMapping } from './time.pipe';

const translationMapping: TimePipeTranslationMapping = {
  s: {
    '=1': 'tff.1_second',
    'other': 'tff.x_seconds',
  },
  m: {
    '=1': 'tff.1_minute',
    'other': 'tff.x_minutes',
  },
  h: {
    '=1': 'tff.1_hour',
    'other': 'tff.x_hours',
  },
  d: {
    '=1': 'tff.1_day',
    'other': 'tff.x_days',
  },
  y: {
    '=1': 'tff.1_year',
    'other': 'tff.x_years',
  },
};

@Pipe({
  name: 'timeDuration',
  pure: false,
})
export class TimeDurationPipe implements OnDestroy, PipeTransform {
  private isDestroyed = false;
  private value: number;
  private observable: Observable<string>;
  private readonly asyncPipe: AsyncPipe;

  constructor(private ref: ChangeDetectorRef,
              private translate: TranslateService,
              private i18nPluralPipe: I18nPluralPipe) {
    this.asyncPipe = new AsyncPipe(ref);
  }

  public transform(timeDuration: number): string | null {
    this.value = timeDuration;
    if (!this.observable) {
      this.observable = this.getObservable();
    }
    return this.asyncPipe.transform(this.observable);
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.asyncPipe.ngOnDestroy();
  }

  private getTranslationKey(value: number, timeType: keyof TimePipeTranslationMapping) {
    return this.i18nPluralPipe.transform(value, translationMapping[ timeType ]);
  }

  private getObservable(): Observable<string> {
    const { value, timeType } = getTimePipeValue(this.value);
    return this.translate.stream(this.getTranslationKey(value, timeType), { value }).pipe(
      takeWhile(() => !this.isDestroyed),
    );
  }
}
