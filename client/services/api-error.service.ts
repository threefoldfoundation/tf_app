import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from '../../../framework/client/core/services/logging/log.service';
import { DialogService } from '../../../framework/client/dialog/index';
import { ApiError } from '../../../framework/client/rpc/rpc.interfaces';

export interface TranslationParams {
  [key: string]: string;
}

@Injectable()
export class ApiErrorService {
  constructor(private dialogService: DialogService,
              private translate: TranslateService,
              private log: LogService) {
  }

  /**
   * Tries its best to show a human-readable error message.
   * Uses an ApiError's `data` property as translation interpolation parameters by default.
   * @param {ApiError} err
   * @returns {string}
   */
  getErrorMessage(err: ApiError | null): string {
    if (!err) {
      this.log.error('ApiErrorService.getErrorMessage called without error object');
      // Assuming that this is a mistake, an empty message is returned.
      return '';
    }
    let key = `tff.errors.${err.error}`;
    const translationParameters: TranslationParams = { ...err.data };
    switch (err.error) {
      // Set error-specific translation parameters here
    }
    let msg = this.translate.instant(key, translationParameters);
    if (msg.startsWith('tff.')) {
      // No translation found. Fallback to the default translations based on the http status code.
      switch (err.status_code) {
        case 403:
          key = 'tff.errors.you_do_not_have_permission_to_view_this_information';
          break;
        default:
          key = 'tff.errors.unknown_error_occurred';
      }
      msg = `${this.translate.instant(key)} (${err.status_code}: ${err.error})`;
    }
    return msg;
  }

  showErrorDialog(error: ApiError | null, title = 'tff.error', closeButton = 'tff.close') {
    return this.dialogService.openAlert({
      title: this.translate.instant(title),
      message: this.getErrorMessage(error),
      ok: this.translate.instant(closeButton),
    });
  }
}
