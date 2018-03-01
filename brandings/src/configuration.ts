import { environment } from '../../../framework/client/environments/environment';

export interface TffClientConfiguration {
  wallet_url: string;
}

export const configuration: TffClientConfiguration = environment.configuration.plugins.tff_backend;
