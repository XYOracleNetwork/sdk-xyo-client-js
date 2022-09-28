import { assertEx } from '@xylabs/assert'

import { XyoWalletBase } from '../../Wallet'

export class XyoWebWallet extends XyoWalletBase {
  public static load(name = 'xyoWallet') {
    return new XyoWalletBase(assertEx(localStorage.getItem(name), 'No stored wallet found'), name)
  }

  public save() {
    localStorage.setItem(this._name, this._phrase)
  }
}
