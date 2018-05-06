import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ApiRequestStatus } from '../../../../../framework/client/rpc/rpc.interfaces';
import { WalletBalance } from '../../../interfaces/transactions.interfaces';

@Component({
  selector: 'tff-wallet-balance',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'wallet-balance.component.html',
  styles: [ `.wallet-balance-card {
    width: 200px;
    display: inline-block !important;
    margin: 16px;
  }` ],
})
export class WalletBalanceComponent {
  @Input() balance: WalletBalance[];
  @Input() status: ApiRequestStatus;

  getAvailable(balance: WalletBalance) {
    return balance.available / Math.pow(10, balance.precision);
  }

  getTotal(balance: WalletBalance) {
    return balance.total / Math.pow(10, balance.precision);
  }
}
