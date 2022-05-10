import { XyoPayload } from '../../core'

export interface EthereumAccount {
  address?: string
  balance?: string
}

export interface XyoEthereumPayload extends XyoPayload {
  timestamp?: number
  network?: number
  blockNumber?: number
}

export interface XyoEthereumAccountPayload extends XyoEthereumPayload {
  account?: EthereumAccount
}

export interface XyoEthereumErc20AccountPayload extends XyoEthereumAccountPayload {
  contract?: string
}
