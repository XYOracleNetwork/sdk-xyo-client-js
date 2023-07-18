import { HDWallet } from '@xyo-network/account'
import { isModuleInstance, Module } from '@xyo-network/module-model'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export const getModuleQueries = async (module: Module): Promise<string[]> => {
  return (isModuleInstance(module) ? await module.discover() : await ModuleWrapper.wrap(module, await HDWallet.random()).discover())
    .filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
    .map((p) => p.query)
}
