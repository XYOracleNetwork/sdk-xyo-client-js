import { Module } from '@xyo-network/module'
import { NodeInfo } from '@xyo-network/node-core-model'

export const nodeInfoFromModule = (module: Module): NodeInfo => {
  const { address, queries: getQueries } = module
  const queries = getQueries()
  const url = `/${address}`
  return { address, queries, url }
}
