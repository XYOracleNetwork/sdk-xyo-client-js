import { isDirectModule, Module, ModuleWrapper } from '@xyo-network/modules'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export const getModuleQueries = async (module: Module): Promise<string[]> => {
  return (isDirectModule(module) ? await module.discover() : await ModuleWrapper.wrap(module).discover())
    .filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
    .map((p) => p.query)
}
