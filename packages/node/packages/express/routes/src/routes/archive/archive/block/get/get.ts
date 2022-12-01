import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { asyncHandler, NoReqBody, NoReqQuery, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { DivinerWrapper } from '@xyo-network/diviner'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { scrubBoundWitnesses } from '@xyo-network/node-core-lib'
import { ArchiveLocals, ArchivePathParams, BoundWitnessQueryPayload, BoundWitnessQuerySchema, SortDirection } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

const defaultLimit = 10
const maxLimit = 100

export interface GetArchiveBlocksQueryParams extends NoReqQuery {
  address?: string | string[]
  limit?: string
  order?: SortDirection
  timestamp?: string
}

const handler: RequestHandler<
  ArchivePathParams,
  Pick<XyoBoundWitness, keyof XyoBoundWitness>[],
  NoReqBody,
  GetArchiveBlocksQueryParams,
  ArchiveLocals
> = async (req, res, next) => {
  const { archive } = res.locals
  if (!archive) {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
    return
  }
  const { address, limit, order, timestamp } = req.query
  const { node } = req.app
  const limitNumber = tryParseInt(limit) ?? defaultLimit
  assertEx(limitNumber > 0 && limitNumber <= maxLimit, `limit must be between 1 and ${maxLimit}`)
  const timestampNumber = tryParseInt(timestamp)
  const parsedOrder = order?.toLowerCase?.() === 'asc' ? 'asc' : 'desc'
  const query: BoundWitnessQueryPayload = {
    archive: archive.archive,
    limit: limitNumber,
    order: parsedOrder,
    schema: BoundWitnessQuerySchema,
    timestamp: timestampNumber,
  }
  if (address) {
    query.address = address as string | [string]
  }
  const boundWitnessDiviner = await resolveBySymbol(node, TYPES.BoundWitnessDiviner)
  const boundWitness = ((await new DivinerWrapper(boundWitnessDiviner).divine([query])) as (XyoBoundWitness | null)[]).filter(exists)
  if (boundWitness) {
    res.json(scrubBoundWitnesses(boundWitness))
  } else {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
  }
}

export const getArchiveBlocks = asyncHandler(handler)
