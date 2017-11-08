import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PromptDialogResult } from '../../../../framework/client/dialog/interfaces/dialog.interfaces';
import { DialogService } from '../../../../framework/client/dialog/services/dialog.service';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import {
  KYC_STATUS_MAPPING,
  KYCApiCall,
  KYCStatus,
  KYCStatuses,
  SetKYCStatusPayload,
  TffProfile
} from '../../interfaces/profile.interfaces';
import { DataFields } from '../../interfaces/trulioo.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-kyc',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc.component.html',
  styleUrls: [ './kyc.component.css' ],
})
export class KycComponent implements OnChanges {
  kyc = KYCStatus;
  allowedStatuses: KYCStatus[] = [];
  data: Partial<DataFields> = {
    Passport: { Mrz1: null, Mrz2: null }
  };

  @Input() profile: TffProfile;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Output() setStatus = new EventEmitter<SetKYCStatusPayload>();
  @ViewChild('form') form: NgForm;

  constructor(private translate: TranslateService,
              private dialogService: DialogService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.profile && changes.profile.currentValue) {
      const profile = (<TffProfile>changes.profile.currentValue);
      this.allowedStatuses = KYC_STATUS_MAPPING[ profile.kyc.status ];
      if (profile.kyc.pending_information && profile.kyc.pending_information.data) {
        const keys = Object.keys(profile.kyc.pending_information.data);
        for (const key of keys) {
          (<any>this.data)[ key ] = { ...(<any>this.data)[ key ], ...(<any>profile.kyc.pending_information.data)[ key ] };
        }
      }
    }
  }

  getStatus(status: KYCStatus) {
    const statusString = this.translate.instant(KYCStatuses.find(s => s.value === status).label);
    return this.translate.instant('tff.current_status', { status: statusString });
  }

  getUrl(apiCall: KYCApiCall) {
    return `https://portal.trulioo.com/verification?transactionRecordId=${apiCall.record_id}&transactionId=${apiCall.transaction_id}`;
  }

  submit(status: KYCStatus) {
    if (status === KYCStatus.INFO_SET && !this.form.form.valid) {
      return;
    }
    this.dialogService.openPrompt({
      title: this.translate.instant('tff.comment'),
      ok: this.translate.instant('tff.submit'),
      message: this.translate.instant('tff.enter_optional_comment'),
      cancel: this.translate.instant('tff.cancel'),
      required: false,
    }).afterClosed().filter((data?: PromptDialogResult) => data && data.submitted)
      .subscribe((data: PromptDialogResult) => this.setStatus.emit({
        status,
        comment: data.value,
        data: status === KYCStatus.INFO_SET ? this.data : {}
      }));
  }
}
