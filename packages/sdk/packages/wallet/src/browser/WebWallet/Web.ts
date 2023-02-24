import { assertEx } from '@xylabs/assert'

import { XyoWalletBase } from '../../Wallet'

export class XyoWebWallet extends XyoWalletBase {
  static load(name = 'xyoWallet') {
    return new XyoWalletBase(assertEx(localStorage.getItem(name), 'No stored wallet found'), name)
  }

  save() {
    localStorage.setItem(this._name, this._phrase)
  }
}
