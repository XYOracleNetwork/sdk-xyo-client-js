import 'source-map-support/register'

import { assertEx } from '@xylabs/assert'
import { asyncHandler, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { ArchivePayloadsArchivist } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { RequestHandler } from 'express'

import { PayloadChainPathParams } from './payloadChainPathParams'

const getPayloads = async (archivist: ArchivePayloadsArchivist, archive: string, hash: string, payloads: XyoPayload[], limit: number) => {
  const wrapper = new ArchivistWrapper(archivist)
  const result = await wrapper.get([hash])
  const payload = PayloadWrapper.parse(result?.[0])
  if (payload) {
    payloads.push(payload.payload)
    if (payload.previousHash && limit > payloads.length) {
      await getPayloads(archivist, archive, payload.previousHash, payloads, limit)
    }
  }
}

const handler: RequestHandler<PayloadChainPathParams, XyoPayload[]> = async (req, res) => {
  const { archive, limit, hash } = req.params
  const { archivePayloadsArchivistFactory } = req.app
  const limitNumber = tryParseInt(limit) ?? 20
  assertEx(limitNumber > 0 && limitNumber <= 100, 'limit must be between 1 and 100')
  const payloads: XyoPayload[] = []
  await getPayloads(archivePayloadsArchivistFactory(archive), archive, hash, payloads, limitNumber)
  res.json(payloads)
}

export const getArchivePayloadChain = asyncHandler(handler)
