import { getHttpHeader } from '@xylabs/sdk-api-express-ecs'
import { BoundWitnessMeta, PayloadMeta } from '@xyo-network/node-core-model'
import { Request } from 'express'

export type RequestWithArchive = {
  archive?: string
}

export const getRequestMeta = <T extends RequestWithArchive>(req: Request<T>): [BoundWitnessMeta, PayloadMeta] => {
  const { archive } = req.params || 'temp'
  const _source_ip = req.ip ?? undefined
  const _timestamp = Date.now()
  const _user_agent = getHttpHeader('User-agent', req) || undefined
  const boundWitnessMetaData: Partial<BoundWitnessMeta> = {
    _archive: archive,
    _source_ip,
    _timestamp,
    _user_agent,
  }
  const payloadMetaData: Partial<PayloadMeta> = {
    _archive: archive,
    _timestamp,
  }
  return [boundWitnessMetaData as BoundWitnessMeta, payloadMetaData as PayloadMeta]
}
