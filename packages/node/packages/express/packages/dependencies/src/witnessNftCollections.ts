import { assertEx } from '@xylabs/assert'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeInstance } from '@xyo-network/node-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

const collections: [address: string, chainId: number][] = []

export const witnessNftCollections = async (node: NodeInstance) => {
  const archivistMod = assertEx(await node.resolve(TYPES.Archivist.description), `Resolving: ${TYPES.Archivist.description}`)
  const archivist = assertEx(asArchivistInstance(archivistMod), `Creating: ${TYPES.Archivist.description}`)

  const nftCollectionScoreDivinerMod = assertEx(
    await node.resolve(TYPES.NftCollectionScoreDiviner.description),
    `Resolving: ${TYPES.NftCollectionScoreDiviner.description}`,
  )
  const nftCollectionScoreDiviner = assertEx(
    asDivinerInstance(nftCollectionScoreDivinerMod),
    `Creating: ${TYPES.NftCollectionScoreDiviner.description}`,
  )

  const nftCollectionInfoWitnessMod = assertEx(
    await node.resolve(TYPES.CryptoNftCollectionWitness.description),
    `Resolving: ${TYPES.CryptoNftCollectionWitness.description}`,
  )
  const nftCollectionInfoWitness = assertEx(
    asWitnessInstance(nftCollectionInfoWitnessMod),
    `Creating: ${TYPES.CryptoNftCollectionWitness.description}`,
  )

  const imageThumbnailWitnessMod = assertEx(
    await node.resolve(TYPES.ImageThumbnailWitness.description),
    `Resolving: ${TYPES.ImageThumbnailWitness.description}`,
  )
  const imageThumbnailWitness = assertEx(asWitnessInstance(imageThumbnailWitnessMod), `Creating: ${TYPES.ImageThumbnailWitness.description}`)

  try {
    console.log('Getting NFT collections')
  } catch (error) {
    console.log('Error getting NFT collections')
    console.log(error)
  }
}
