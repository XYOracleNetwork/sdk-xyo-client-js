import 'source-map-support/register'

import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { getRequestMeta } from '@xyo-network/express-node-lib'
import { prepareBoundWitnesses, validatePayloadSchema } from '@xyo-network/node-core-lib'
import { ArchivePathParams, XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'
import { RequestHandler } from 'express'

const handler: RequestHandler<ArchivePathParams, XyoBoundWitnessWithMeta[], XyoBoundWitnessWithMeta | XyoBoundWitnessWithMeta[]> = async (
  req,
  res,
) => {
  const { archive } = req.params || 'temp'
  const { archiveBoundWitnessArchivistFactory, archivePayloadsArchivistFactory } = req.app
  const [boundWitnessMeta, payloadMeta] = getRequestMeta(req)

  // Handle payload of single object or (preferred) array of bound witnesses
  const body: XyoBoundWitnessWithMeta[] = Array.isArray(req.body) ? req.body : [req.body]
  const { payloads, sanitized } = prepareBoundWitnesses(body, boundWitnessMeta, payloadMeta)

  const wrapper = new XyoArchivistWrapper(archiveBoundWitnessArchivistFactory(archive))
  await wrapper.insert(sanitized)

  if (payloads.length) {
    payloads.forEach(async (payload) => {
      const valid = await validatePayloadSchema(payload)
      if (!valid) {
        const payloadWithExtraMeta = payload as XyoPayload<{ _schemaValid: boolean; schema: string }>
        payloadWithExtraMeta._schemaValid = false
      }
    })
    const wrapper = new XyoArchivistWrapper(archivePayloadsArchivistFactory(archive))
    await wrapper.insert(payloads)
  }
  res.json(sanitized)
}

export const postArchiveBlock = asyncHandler(handler)
