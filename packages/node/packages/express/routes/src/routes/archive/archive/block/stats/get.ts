import 'source-map-support/register'

import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import {
  ArchivePathParams,
  BoundWitnessStatsPayload,
  BoundWitnessStatsQueryPayload,
  BoundWitnessStatsQuerySchema,
  BoundWitnessStatsSchema,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { RequestHandler } from 'express'

const unknownCount: BoundWitnessStatsPayload = { count: -1, schema: BoundWitnessStatsSchema }

export interface GetArchiveBlockStats {
  count: number
}

const handler: RequestHandler<ArchivePathParams, GetArchiveBlockStats> = async (req, res) => {
  const { archive } = req.params
  const { node } = req.app
  const boundWitnessStatsDiviner = await resolveBySymbol(node, TYPES.BoundWitnessStatsDiviner)
  const wrapper = new DivinerWrapper(boundWitnessStatsDiviner)
  const payloads: BoundWitnessStatsQueryPayload[] = [{ archive, schema: BoundWitnessStatsQuerySchema }]
  const result = await wrapper.divine(payloads)
  const answer = (result?.[0] as BoundWitnessStatsPayload) || unknownCount
  res.json(answer)
}

export const getArchiveBlockStats = asyncHandler(handler)
