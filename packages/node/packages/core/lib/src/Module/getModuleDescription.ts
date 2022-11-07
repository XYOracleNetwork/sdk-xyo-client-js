import { Module } from '@xyo-network/module'
import { ModuleDescription } from '@xyo-network/node-core-model'

export const getModuleDescription = (module: Module): ModuleDescription => {
  const { address, queries: getQueries } = module
  const queries = getQueries()
  return { address, queries }
}
