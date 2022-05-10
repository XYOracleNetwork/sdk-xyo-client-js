import { XyoPayload } from '../../core'

type EthereumType = string | number | boolean

export interface XyoEthereumQueryPayload extends XyoPayload {
  network: number
}

export interface XyoEthereumPayload extends XyoPayload {
  timestamp: number
  network: number
  blockNumber: number
}

export interface XyoEthereumAccountBalanceQueryPayload extends XyoEthereumPayload {
  address: string
}

export interface XyoEthereumAccountBalancePayload extends XyoEthereumPayload {
  balance?: string
}

export interface XyoEthereumContractQueryPayload extends XyoEthereumQueryPayload {
  contract: string
}

export interface XyoEthereumContractMethodCallQueryPayload extends XyoEthereumQueryPayload {
  method: string
  params?: EthereumType[]
}

export interface XyoEthereumContractMethodCallPayload extends XyoEthereumPayload {
  result?: EthereumType
}
