import { Pipe, PipeTransform } from '@angular/core';
import { Profile } from '../../../its_you_online_auth/client/interfaces';

@Pipe({
  name: 'profileName',
  pure: true,
})
export class ProfileNamePipe implements PipeTransform {
  transform(profile: Profile | null): string {
    if (!profile) {
      return '';
    }
    if (profile.information && profile.information.firstname) {
      return `${profile.information.firstname} ${profile.information.lastname}`;
    } else {
      return profile.username;
    }
  }
}
