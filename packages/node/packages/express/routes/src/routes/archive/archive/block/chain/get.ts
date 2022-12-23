import 'source-map-support/register'

import { assertEx } from '@xylabs/assert'
import { asyncHandler, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ArchiveBoundWitnessArchivist } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

import { BlockChainPathParams } from './blockChainPathParams'

const getBlocks = async (archivist: ArchiveBoundWitnessArchivist, hash: string, address: string, blocks: XyoBoundWitness[], limit: number) => {
  const wrapper = new ArchivistWrapper(archivist)
  const result = await wrapper.get([hash])
  const block = result?.[0] as XyoBoundWitness
  if (block) {
    const addressIndex = block.addresses.findIndex((value) => value === address)
    if (addressIndex !== -1) {
      blocks.push(block)
      const previousHash = block.previous_hashes[addressIndex]
      if (previousHash && limit > blocks.length) {
        await getBlocks(archivist, previousHash, address, blocks, limit)
      }
    }
  }
}

const handler: RequestHandler<BlockChainPathParams, XyoBoundWitness[]> = async (req, res) => {
  const { archive, address, limit, hash } = req.params
  const { archiveBoundWitnessArchivistFactory } = req.app
  const limitNumber = tryParseInt(limit) ?? 20
  assertEx(limitNumber > 0 && limitNumber <= 100, 'limit must be between 1 and 100')
  const blocks: XyoBoundWitness[] = []
  await getBlocks(archiveBoundWitnessArchivistFactory(archive), hash, address, blocks, limitNumber)
  res.json(blocks)
}

export const getArchiveBlockChain = asyncHandler(handler)
