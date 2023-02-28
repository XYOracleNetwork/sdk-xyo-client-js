import { HDNode } from '@ethersproject/hdnode'
import { staticImplements } from '@xylabs/static-implements'
import { AccountInstance } from '@xyo-network/account-model'
import { WalletInstance, WalletStatic } from '@xyo-network/wallet-model'

import { HDAccount } from './HDAccount'

@staticImplements<WalletStatic<HDNode>>()
export class HDWallet extends HDNode implements WalletInstance {
  protected readonly _account = new HDAccount(this)

  account(path?: string): AccountInstance {
    return path ? new HDAccount(this.derivePath(path)) : this._account
  }
}
