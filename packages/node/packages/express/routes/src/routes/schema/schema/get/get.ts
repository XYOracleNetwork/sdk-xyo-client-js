import { asyncHandler, NoReqBody, NoReqQuery } from '@xylabs/sdk-api-express-ecs'
import { XyoPayload } from '@xyo-network/payload-model'
import { XyoSchemaCache } from '@xyo-network/utils'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { SchemaPathParams } from '../../schemaPathParams'

const handler: RequestHandler<SchemaPathParams, XyoPayload, NoReqBody, NoReqQuery> = async (req, res, next) => {
  const { schema } = req.params
  if (!schema) {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
  } else {
    // TODO: Hook Huri.fetch globally instead
    XyoSchemaCache.instance.proxy = `http://127.0.0.1:${req.socket.localPort}/domain`
    const schemaCacheEntry = await XyoSchemaCache.instance.get(schema)
    res.json(schemaCacheEntry?.payload ?? undefined)
  }
}

export const getSchema = asyncHandler(handler)
