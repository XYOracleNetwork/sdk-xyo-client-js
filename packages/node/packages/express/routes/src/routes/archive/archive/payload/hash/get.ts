import 'source-map-support/register'

import { exists } from '@xylabs/exists'
import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { RequestHandler } from 'express'

import { PayloadHashPathParams } from '../payloadHashPathParams'

const handler: RequestHandler<PayloadHashPathParams, XyoPayload[]> = async (req, res) => {
  const { archive, hash } = req.params
  const { archivePayloadsArchivistFactory } = req.app

  const wrapper = new ArchivistWrapper(archivePayloadsArchivistFactory(archive))
  const result = await wrapper.get([hash])

  const payload = result?.filter(exists).map((payload) => new PayloadWrapper(payload).body)?.[0]
  res.json(payload ? [payload] : [])
}

export const getArchivePayloadHash = asyncHandler(handler)
