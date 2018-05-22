import { Pipe, PipeTransform } from '@angular/core';
import { Profile } from '../../../its_you_online_auth/client/interfaces';

@Pipe({
  name: 'profileEmail',
  pure: true,
})
export class ProfileEmailPipe implements PipeTransform {
  transform(profile: Profile | null): string {
    if (!profile || !profile.information) {
      return '';
    }
    if (profile.information.validatedemailaddresses.length) {
      return profile.information.validatedemailaddresses[ 0 ].emailaddress;
    }
    if (profile.information.emailaddresses.length) {
      return profile.information.emailaddresses[ 0 ].emailaddress;
    }
    return '';
  }
}
