import { ModuleWrapper } from '@xyo-network/modules'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export const getModuleQueries = async (wrapper: ModuleWrapper): Promise<string[]> => {
  return (await wrapper.discover()).filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema).map((p) => p.query)
}
