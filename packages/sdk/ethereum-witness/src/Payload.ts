import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumLogsQuery = XyoQueryPayload<{
  schema: 'network.xyo.ethereum.logs.query'
  fromBlock?: number
  toBlock?: number
  address?: string
  topics?: string[]
  blockhash?: string
}>

export type XyoEthereumLogsPayload = XyoPayload<{
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
}>

export type XyoEthereumBlockQuery = XyoQueryPayload<{
  schema: 'network.xyo.ethereum.block.query'
  hash?: string
  number?: number | string
  full?: boolean
}>

export type XyoEthereumBlockPayload = XyoPayload<{
  schema: 'network.xyo.ethereum.block'
  hash?: string
  number?: number | string
  parenthash?: string
  nonce?: string
}>
