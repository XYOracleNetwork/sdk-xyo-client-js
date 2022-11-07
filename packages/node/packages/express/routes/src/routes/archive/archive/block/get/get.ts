import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { asyncHandler, NoReqBody, NoReqQuery, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoDivinerWrapper } from '@xyo-network/diviner'
import { scrubBoundWitnesses } from '@xyo-network/node-core-lib'
import { ArchiveLocals, ArchivePathParams, BoundWitnessQueryPayload, BoundWitnessQuerySchema, SortDirection } from '@xyo-network/node-core-model'
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
  const { boundWitnessDiviner } = req.app
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
  const boundWitness = ((await new XyoDivinerWrapper(boundWitnessDiviner).divine([query])) as (XyoBoundWitness | null)[]).filter(exists)
  if (boundWitness) {
    res.json(scrubBoundWitnesses(boundWitness))
  } else {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
  }
}

export const getArchiveBlocks = asyncHandler(handler)
