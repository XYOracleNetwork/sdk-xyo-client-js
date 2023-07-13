import { isDirectModule, Module } from '@xyo-network/module-model'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export const getModuleQueries = async (module: Module): Promise<string[]> => {
  return (isDirectModule(module) ? await module.discover() : await ModuleWrapper.wrap(module).discover())
    .filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
    .map((p) => p.query)
}
