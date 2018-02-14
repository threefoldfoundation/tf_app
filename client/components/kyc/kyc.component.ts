import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MonoTypeOperatorFunction } from 'rxjs/interfaces';
import { filter } from 'rxjs/operators/filter';
import { DialogService, PromptDialogResult } from '../../../../framework/client/dialog';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Applicant, Check, KYC_STATUS_MAPPING, KYCStatus, KYCStatuses, SetKYCStatusPayload, TffProfile } from '../../interfaces';

@Component({
  selector: 'tff-kyc',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc.component.html',
  styleUrls: [ './kyc.component.css' ],
})
export class KycComponent implements OnChanges {
  kyc = KYCStatus;
  allowedStatuses: KYCStatus[] = [];
  data: Partial<Applicant> = {};

  @Input() profile: TffProfile;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Input() checks: Check[];
  @Input() checksStatus: ApiRequestStatus;
  @Input() utilityBillStatus: ApiRequestStatus;
  @Output() setStatus = new EventEmitter<SetKYCStatusPayload>();
  @Output() verifyUtilityBill = new EventEmitter<string>();
  @ViewChild('form') form: NgForm;

  constructor(private translate: TranslateService,
              private dialogService: DialogService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.profile && changes.profile.currentValue) {
      const profile = (<TffProfile>changes.profile.currentValue);
      this.allowedStatuses = KYC_STATUS_MAPPING[ profile.kyc.status ];
    }
  }

  public getStatus(status: KYCStatus) {
    const kycStatus = KYCStatuses.find(s => s.value === status);
    if (kycStatus) {
      const statusString = this.translate.instant(kycStatus.label);
      return this.translate.instant('tff.current_status', { status: statusString });
    }
    return '';
  }

  public submit(status: KYCStatus) {
    if (status === KYCStatus.INFO_SET && !this.form.form.valid) {
      return;
    }
    let message = this.translate.instant('tff.enter_optional_comment');
    if (status === KYCStatus.PENDING_SUBMIT) {
      message = this.translate.instant('tff.resend_kyc_enter_reason_why');
    }
    this.dialogService.openPrompt({
      title: this.translate.instant('tff.comment'),
      ok: this.translate.instant('tff.submit'),
      message,
      cancel: this.translate.instant('tff.cancel'),
      required: false,
      inputType: 'textarea',
    }).afterClosed().pipe(<MonoTypeOperatorFunction<PromptDialogResult>>filter((data?: PromptDialogResult) => !!data && data.submitted))
      .subscribe((data: PromptDialogResult) => this.setStatus.emit({
        status,
        comment: data.value,
        data: status === KYCStatus.INFO_SET ? this.data : {},
      }));
  }
}
