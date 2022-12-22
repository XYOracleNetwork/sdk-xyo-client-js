import 'source-map-support/register'

import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { scrubBoundWitnesses } from '@xyo-network/node-core-lib'
import { RequestHandler } from 'express'

import { BlockHashPathParams } from './blockHashPathParams'

const handler: RequestHandler<BlockHashPathParams, XyoBoundWitness[]> = async (req, res) => {
  const { archive, hash } = req.params
  const { archiveBoundWitnessArchivistFactory } = req.app

  const wrapper = new ArchivistWrapper(archiveBoundWitnessArchivistFactory(archive))
  const result = await wrapper.get([hash])
  const block = result?.[0] as XyoBoundWitness
  res.json(scrubBoundWitnesses(block ? [block] : []))
}

export const getArchiveBlockHash = asyncHandler(handler)
