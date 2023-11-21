import { ModuleInstance } from '@xyo-network/module-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export const getModuleQueries = async (module: ModuleInstance): Promise<string[]> => {
  return (await module.discover()).filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema).map((p) => p.query)
}
