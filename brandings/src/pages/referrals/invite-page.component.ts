import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'invite-page.component.html',
})
export class InvitePageComponent implements OnInit {
  smsLink: SafeUrl;
  emailLink: SafeUrl;
  code: string;

  constructor(private platform: Platform,
              private translate: TranslateService,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    const code = rogerthat.user.data.invitation_code;
    this.code = code;
    const userName = rogerthat.user.data.name || rogerthat.user.name;
    const appId = rogerthat.system.appId;
    const subject = this.translate.instant('invitation_to_threefold');
    const message = this.translate.instant('invitation_text', { appId, code, userName });
    if (rogerthat.system.os === 'ios') {
      this.smsLink = this.sanitize('sms:&body=' + encodeURIComponent(message));
    } else {
      this.smsLink = this.sanitize('sms:?body=' + encodeURIComponent(message));
    }
    this.emailLink = this.sanitize('mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message));
  }

  close() {
    this.platform.exitApp();
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
