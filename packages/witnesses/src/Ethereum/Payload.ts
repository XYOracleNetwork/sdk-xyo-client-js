import { XyoPayload, XyoQueryPayload } from '@xyo-network/core'

export interface XyoEthereumLogsQuery extends XyoQueryPayload {
  schema: 'network.xyo.ethereum.logs.query'
  fromBlock?: number
  toBlock?: number
  address?: string
  topics?: string[]
  blockhash?: string
}

export interface XyoEthereumLogsPayload extends XyoPayload {
  schema: 'network.xyo.ethereum.logs'
  removed?: boolean
  logindex?: string
  transactionindex?: string
  transactionhash?: string
  blockhash?: string
  blocknumber?: string
  address: string
  data?: string[]
  topics?: string[]
}

export interface XyoEthereumBlockQuery extends XyoQueryPayload {
  schema: 'network.xyo.ethereum.block.query'
  hash?: string
  number?: number | string
  full?: boolean
}

export interface XyoEthereumBlockPayload extends XyoPayload {
  schema: 'network.xyo.ethereum.block'
  hash?: string
  number?: number | string
  parenthash?: string
  nonce?: string
}
