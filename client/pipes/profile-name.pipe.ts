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
    return profile.info && profile.info.firstname ? `${profile.info.firstname} ${profile.info.lastname}` : profile.username;
  }
}
