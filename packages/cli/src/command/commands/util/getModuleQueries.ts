import { Module } from '@xyo-network/modules'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export const getModuleQueries = async (module: Module): Promise<string[]> => {
  return (await module.discover()).filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema).map((p) => p.query)
}
