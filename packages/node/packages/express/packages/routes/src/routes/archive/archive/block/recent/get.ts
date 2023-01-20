import 'source-map-support/register'

import { assertEx } from '@xylabs/assert'
import { asyncHandler, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { BoundWitnessQueryPayload, BoundWitnessQuerySchema } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { RequestHandler } from 'express'

import { BlockRecentPathParams } from './BlockRecentPathParams'

const handler: RequestHandler<BlockRecentPathParams, (XyoBoundWitness | null)[]> = async (req, res) => {
  const { archive, limit } = req.params
  const { node } = req.app
  const limitNumber = tryParseInt(limit) ?? 20
  assertEx(limitNumber > 0 && limitNumber <= 100, 'limit must be between 1 and 100')
  const query: BoundWitnessQueryPayload = { archive, limit: limitNumber, schema: BoundWitnessQuerySchema }
  const boundWitnessDiviner = await resolveBySymbol(node, TYPES.BoundWitnessDiviner)
  const boundWitnesses = (await new DivinerWrapper(boundWitnessDiviner).divine([query])) as (XyoBoundWitness | null)[]
  res.json(boundWitnesses)
}

export const getArchiveBlockRecent = asyncHandler(handler)
