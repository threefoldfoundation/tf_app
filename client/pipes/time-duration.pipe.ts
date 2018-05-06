import { AsyncPipe, I18nPluralPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { getTimePipeValue, TIME_DURATION_MAPPING, TimePipeTranslationMapping } from './time-pipe-data';

@Pipe({
  name: 'timeDuration',
  pure: false,
})
export class TimeDurationPipe implements PipeTransform {
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
    this.asyncPipe.ngOnDestroy();
  }

  private getTranslationKey(value: number, timeType: keyof TimePipeTranslationMapping) {
    return this.i18nPluralPipe.transform(value, TIME_DURATION_MAPPING[ timeType ]);
  }

  private getObservable(): Observable<string> {
    const { value, timeType } = getTimePipeValue(this.value);
    return this.translate.stream(this.getTranslationKey(value, timeType), { value });
  }
}
