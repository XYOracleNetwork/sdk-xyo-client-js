import 'source-map-support/register'

import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import {
  ArchivePathParams,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
  PayloadStatsQuerySchema,
  PayloadStatsSchema,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { RequestHandler } from 'express'

const unknownCount: PayloadStatsPayload = { count: -1, schema: PayloadStatsSchema }

export interface ArchivePayloadStats {
  count: number
}

const handler: RequestHandler<ArchivePathParams, ArchivePayloadStats> = async (req, res) => {
  const { archive } = req.params
  const { node } = req.app
  const payloads: PayloadStatsQueryPayload[] = [{ archive, schema: PayloadStatsQuerySchema }]
  const payloadStatsDiviner = await resolveBySymbol(node, TYPES.PayloadStatsDiviner)
  const wrapper = new DivinerWrapper(payloadStatsDiviner)
  const result = await wrapper.divine(payloads)

  const answer = (result?.[0] as PayloadStatsPayload) || unknownCount
  res.json(answer)
}

export const getArchivePayloadStats = asyncHandler(handler)
