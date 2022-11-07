import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { XyoDomainPayload, XyoDomainPayloadWrapper } from '@xyo-network/domain-payload-plugin'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

export type DomainPathParams = {
  domain: string
}

const handler: RequestHandler<DomainPathParams, XyoDomainPayload> = async (req, res, next) => {
  const { domain } = req.params
  const config = await XyoDomainPayloadWrapper.discover(domain)
  if (config) {
    res.json(config.payload)
  } else {
    next({ message: 'Config not found', statusCode: StatusCodes.NOT_FOUND })
  }
}

export const getDomain = asyncHandler(handler)
