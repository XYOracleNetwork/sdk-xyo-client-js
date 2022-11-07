import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { XyoArchivistWrapper } from '@xyo-network/archivist'
import {
  ArchivePayloadsArchivist,
  XyoBoundWitnessWithPartialMeta,
  XyoPartialPayloadMeta,
  XyoPayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

import { BlockHashPathParams } from '../blockHashPathParams'

const getPayloadsByHashes = async (archivist: ArchivePayloadsArchivist, archive: string, hashes: string[]) => {
  const map: Record<string, XyoPayloadWithPartialMeta[]> = {}
  const payloads: (XyoPayloadWithPartialMeta | undefined)[] = []
  for (const hash of hashes) {
    const wrapper = new XyoArchivistWrapper(archivist)
    const result = await wrapper.get([hash])
    const payload = (result?.[0] as XyoPayloadWithPartialMeta) || undefined
    payloads.push(payload)
  }
  payloads.forEach((value) => {
    if (value?._hash) {
      map[value._hash] = map[value._hash] ? [...map[value._hash], value] : [value]
    }
  })
  return hashes.map((value) => map[value])
}

const handler: RequestHandler<BlockHashPathParams, XyoPartialPayloadMeta[][]> = async (req, res, next) => {
  const { archive, hash } = req.params
  const { archivePayloadsArchivistFactory, archiveBoundWitnessArchivistFactory } = req.app
  const wrapper = new XyoArchivistWrapper(archiveBoundWitnessArchivistFactory(archive))
  const result = await wrapper.get([hash])
  const block = (result?.[0] as XyoBoundWitnessWithPartialMeta) || undefined
  if (block) {
    res.json(await getPayloadsByHashes(archivePayloadsArchivistFactory(archive), archive, block.payload_hashes))
  } else {
    next({ message: 'Block not found', statusCode: StatusCodes.NOT_FOUND })
  }
}

export const getArchiveBlockHashPayloads = asyncHandler(handler)
