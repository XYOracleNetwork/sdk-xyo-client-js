import { assertEx } from '@xylabs/assert'

import { WalletBase } from '../../Wallet'

export class WebWallet extends WalletBase {
  static load(name = 'xyoWallet') {
    return new WalletBase(assertEx(localStorage.getItem(name), 'No stored wallet found'), name)
  }

  save() {
    localStorage.setItem(this._name, this._phrase)
  }
}
