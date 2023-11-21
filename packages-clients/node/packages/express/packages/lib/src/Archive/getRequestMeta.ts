import { getHttpHeader } from '@xylabs/sdk-api-express-ecs'
import { BoundWitnessMeta, PayloadMeta } from '@xyo-network/payload-mongodb'
import { Request } from 'express'

export type RequestWithArchive = {
  archive?: string
}

export const getRequestMeta = <T extends RequestWithArchive>(req: Request<T>): [BoundWitnessMeta, PayloadMeta] => {
  const _source_ip = req.ip ?? undefined
  const _timestamp = Date.now()
  const _user_agent = getHttpHeader('User-agent', req) || undefined
  const boundWitnessMetaData: Partial<BoundWitnessMeta> = {
    _source_ip,
    _timestamp,
    _user_agent,
  }
  const payloadMetaData: Partial<PayloadMeta> = {
    _timestamp,
  }
  return [boundWitnessMetaData as BoundWitnessMeta, payloadMetaData as PayloadMeta]
}
