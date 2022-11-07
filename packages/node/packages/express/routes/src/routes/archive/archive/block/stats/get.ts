import 'source-map-support/register'

import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { XyoDivinerWrapper } from '@xyo-network/diviner'
import {
  ArchivePathParams,
  BoundWitnessStatsPayload,
  BoundWitnessStatsQueryPayload,
  BoundWitnessStatsQuerySchema,
  BoundWitnessStatsSchema,
} from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

const unknownCount: BoundWitnessStatsPayload = { count: -1, schema: BoundWitnessStatsSchema }

export interface GetArchiveBlockStats {
  count: number
}

const handler: RequestHandler<ArchivePathParams, GetArchiveBlockStats> = async (req, res) => {
  const { archive } = req.params
  const { boundWitnessStatsDiviner: diviner } = req.app
  const wrapper = new XyoDivinerWrapper(diviner)
  const payloads: BoundWitnessStatsQueryPayload[] = [{ archive, schema: BoundWitnessStatsQuerySchema }]
  const result = await wrapper.divine(payloads)

  const answer = (result?.[0] as BoundWitnessStatsPayload) || unknownCount
  res.json(answer)
}

export const getArchiveBlockStats = asyncHandler(handler)
