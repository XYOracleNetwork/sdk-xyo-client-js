import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { DivinerWrapper } from '@xyo-network/diviner'
import { ArchivePathParams, SchemaStatsQueryPayload, SchemaStatsQuerySchema } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

const handler: RequestHandler<ArchivePathParams, string[]> = async (req, res) => {
  const { archive } = req.params
  const { schemaStatsDiviner: diviner } = req.app
  const payloads: SchemaStatsQueryPayload[] = [{ archive, schema: SchemaStatsQuerySchema }]

  const wrapper = new DivinerWrapper(diviner)
  const result = await wrapper.divine(payloads)

  const counts = (result?.[0] as unknown as Record<string, number>)?.count || {}
  const schemas = Object.keys(counts)
  res.json(schemas)
}

/* @deprecated: Use schema stats instead and just make a list of stats keys */
export const getArchivePayloadSchemas = asyncHandler(handler)
