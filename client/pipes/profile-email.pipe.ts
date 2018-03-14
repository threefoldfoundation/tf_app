import { Pipe, PipeTransform } from '@angular/core';
import { Profile } from '../../../its_you_online_auth/client/interfaces';

@Pipe({
  name: 'profileEmail',
  pure: true,
})
export class ProfileEmailPipe implements PipeTransform {
  transform(profile: Profile | null): string {
    if (!profile || !profile.info) {
      return '';
    }
    if (profile.info.validatedemailaddresses.length) {
      return profile.info.validatedemailaddresses[ 0 ].emailaddress;
    }
    if (profile.info.emailaddresses.length) {
      return profile.info.emailaddresses[ 0 ].emailaddress;
    }
    return '';
  }
}
