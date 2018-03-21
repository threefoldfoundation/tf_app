export interface TffClientConfiguration {
  wallet_url: string;
}

export const configuration: TffClientConfiguration = {
  // wallet_url: 'https://staging-tff-backend.appspot.com/api/plugins/tff_backend/v1.0/wallet',
  wallet_url: 'http://10.1.1.121:8800/api/plugins/tff_backend/v1.0/wallet',
};
