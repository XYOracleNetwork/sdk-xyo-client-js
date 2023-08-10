import { assertEx } from '@xylabs/assert'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { NftCollectionWitnessQuery, NftCollectionWitnessQuerySchema } from '@xyo-network/crypto-nft-collection-payload-plugin'
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
    console.log('Getting NFT Collections')
    for (const [address, chainId] of collections) {
      try {
        console.log(`${address}: Collection Info: Witness`)
        const nftCollectionInfoWitnessQuery: NftCollectionWitnessQuery = { address, chainId, maxNfts: 20000, schema: NftCollectionWitnessQuerySchema }
        const nftCollectionInfo = await nftCollectionInfoWitness.observe([nftCollectionInfoWitnessQuery])
        assertEx(nftCollectionInfo?.length > 0, `${address}: ERROR: Collection Info: Witness: Invalid length`)
        console.log(`${address}: Collection Info: Store`)
        await archivist.insert(nftCollectionInfo)
        console.log(`${address}: Collection Score: Divine`)
        const nftCollectionScore = await nftCollectionScoreDiviner.divine(nftCollectionInfo)
        assertEx(nftCollectionInfo?.length > 0, `${address}: ERROR: Collection Score: Divine: Invalid length`)
        console.log(`${address}: Collection Score: Store`)
        await archivist.insert(nftCollectionScore)
        console.log(`${address}: Collection Thumbnail: Obtain Candidate`)
        console.log(`${address}: Collection Thumbnail: Witness`)
        console.log(`${address}: Collection Thumbnail: Store`)
      } catch (error) {
        console.log(`${address}: Error`)
        console.log(error)
      }
    }
  } catch (error) {
    console.log('Error getting NFT collections')
    console.log(error)
  }
}
