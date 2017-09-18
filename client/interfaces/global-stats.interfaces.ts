export interface CurrencyValue {
  currency: string;
  value: number;
  timestamp: number;
  auto_update: boolean;
}

export interface GlobalStats {
  id: string;
  name: string;
  token_count: number;
  unlocked_count: number;
  value: number;
  currencies: CurrencyValue[];
  market_cap: number;
}
