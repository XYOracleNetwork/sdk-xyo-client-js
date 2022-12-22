import { assertEx } from '@xylabs/assert'
import { asyncHandler, NoReqBody, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { DivinerWrapper } from '@xyo-network/diviner'
import { resolveBySymbol } from '@xyo-network/express-node-lib'
import { ArchiveLocals, ArchivePathParams, PayloadQueryPayload, PayloadQuerySchema } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayload } from '@xyo-network/payload-model'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { GetArchivePayloadsQueryParams } from './GetArchivePayloadsQueryParams'

const maxLimit = 100

const handler: RequestHandler<ArchivePathParams, (XyoPayload | null)[], NoReqBody, GetArchivePayloadsQueryParams, ArchiveLocals> = async (
  req,
  res,
  next,
) => {
  const { archive } = res.locals
  if (!archive) {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
    return
  }
  const { limit, order, timestamp, schema } = req.query
  const { node } = req.app
  const limitNumber = tryParseInt(limit) ?? 10
  const timestampNumber = tryParseInt(timestamp)
  assertEx(limitNumber > 0 && limitNumber <= maxLimit, `limit must be between 1 and ${maxLimit}`)
  const parsedOrder = order?.toLowerCase?.() === 'asc' ? 'asc' : 'desc'
  const filter: PayloadQueryPayload = {
    archive: archive.archive,
    limit: limitNumber,
    order: parsedOrder,
    schema: PayloadQuerySchema,
    timestamp: timestampNumber,
  }
  if (schema) filter.schemas = [schema]
  const payloadDiviner = await resolveBySymbol(node, TYPES.PayloadDiviner)
  const wrapper = new DivinerWrapper(payloadDiviner)
  const payloads = await wrapper.divine([filter])
  if (payloads) {
    res.json(payloads)
  } else {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
  }
}

export const getArchivePayloads = asyncHandler(handler)
