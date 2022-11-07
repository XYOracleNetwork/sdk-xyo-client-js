import 'source-map-support/register'

import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { XyoDivinerWrapper } from '@xyo-network/diviner'
import {
  ArchivePathParams,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
  PayloadStatsQuerySchema,
  PayloadStatsSchema,
} from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

const unknownCount: PayloadStatsPayload = { count: -1, schema: PayloadStatsSchema }

export interface ArchivePayloadStats {
  count: number
}

const handler: RequestHandler<ArchivePathParams, ArchivePayloadStats> = async (req, res) => {
  const { archive } = req.params
  const { payloadStatsDiviner: diviner } = req.app
  const payloads: PayloadStatsQueryPayload[] = [{ archive, schema: PayloadStatsQuerySchema }]
  const wrapper = new XyoDivinerWrapper(diviner)
  const result = await wrapper.divine(payloads)

  const answer = (result?.[0] as PayloadStatsPayload) || unknownCount
  res.json(answer)
}

export const getArchivePayloadStats = asyncHandler(handler)
