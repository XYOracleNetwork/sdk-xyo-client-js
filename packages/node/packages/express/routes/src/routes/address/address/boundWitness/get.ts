import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { asyncHandler, NoReqBody, NoReqQuery, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AddressHistoryQueryPayload, AddressHistoryQuerySchema, DivinerWrapper } from '@xyo-network/diviner'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { scrubBoundWitnesses, trimAddressPrefix } from '@xyo-network/node-core-lib'
import { ArchiveLocals } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { AddressPathParams } from '../../AddressPathParams'

const defaultLimit = 10
const maxLimit = 20
const schema = AddressHistoryQuerySchema

export interface GetAddressHistoryQueryParams extends NoReqQuery {
  limit?: string
  offset?: string
}

const handler: RequestHandler<AddressPathParams, XyoBoundWitness[], NoReqBody, GetAddressHistoryQueryParams, ArchiveLocals> = async (
  req,
  res,
  next,
) => {
  const { limit, offset } = req.query
  const { address } = req.params
  const { node } = req.app
  const normalizedAddress = trimAddressPrefix(address).toLowerCase()
  const limitNumber = tryParseInt(limit) ?? defaultLimit
  assertEx(limitNumber > 0 && limitNumber <= maxLimit, `limit must be between 1 and ${maxLimit}`)
  const query: AddressHistoryQueryPayload = { address: normalizedAddress, limit: limitNumber, schema }
  if (offset) {
    query.offset = offset
  }
  const addressHistoryDiviner = await resolveBySymbol(node, TYPES.AddressHistoryDiviner)
  const boundWitness = ((await new DivinerWrapper(addressHistoryDiviner).divine([query])) as (XyoBoundWitness | null)[]).filter(exists)
  if (boundWitness) {
    res.json(scrubBoundWitnesses(boundWitness))
  } else {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
  }
}

export const getAddressHistory = asyncHandler(handler)
