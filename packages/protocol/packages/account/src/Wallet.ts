import { HDNode } from '@ethersproject/hdnode'
import { staticImplements } from '@xylabs/static-implements'
import { WalletInstance, WalletStatic } from '@xyo-network/wallet-model'

@staticImplements<WalletStatic>()
export class Wallet extends HDNode implements WalletInstance {}
