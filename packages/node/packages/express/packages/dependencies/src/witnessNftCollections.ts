/* eslint-disable max-statements */
import { assertEx } from '@xylabs/assert'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/core'
import { NftCollectionWitnessQuery, NftCollectionWitnessQuerySchema } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { isNftInfo } from '@xyo-network/crypto-nft-payload-plugin'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeInstance } from '@xyo-network/node-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { asWitnessInstance } from '@xyo-network/witness-model'
import { readFile, writeFile } from 'fs/promises'

import { collections } from './collections'

interface NftCollectionDisplaySlugInfo {
  displayName: string
  imageSlug: string | null
  score: string
}

type NftCollectionDisplaySlugInfos = Record<string, NftCollectionDisplaySlugInfo>

const maxNfts = 200_000

const filePath = './nftData/beta/nftCollectionDisplaySlugInfos.json'

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
    for (const [name, address, chainId] of collections) {
      console.log(`${address}(${name}): Beginning`)
      if (!address) {
        console.log(`${address}(${name}): Beginning: ERROR: No Address`)
        continue
      }
      try {
        console.log(`${address}(${name}): Collection History: Read Existing`)
        const nftCollectionDisplaySlugInfos: NftCollectionDisplaySlugInfos = await readCollectionInfo()
        const existingNftCollectionDisplaySlugInfo = nftCollectionDisplaySlugInfos[address]
        console.log(`${address}(${name}): Collection Info: Witness`)
        const nftCollectionInfoWitnessQuery: NftCollectionWitnessQuery = { address, chainId, maxNfts, schema: NftCollectionWitnessQuerySchema }
        const nftCollectionInfoResult = await nftCollectionInfoWitness.observe([nftCollectionInfoWitnessQuery])
        const nftCollectionInfo = assertEx(nftCollectionInfoResult?.[0], `${address}(${name}): ERROR: Collection Info: Witness: Invalid length`)
        console.log(`${address}(${name}): Collection Info: Store`)
        await archivist.insert([nftCollectionInfo])
        console.log(`${address}(${name}): Collection Score: Divine`)
        const nftCollectionScoreResult = await nftCollectionScoreDiviner.divine([nftCollectionInfo])
        const nftCollectionScore = assertEx(nftCollectionScoreResult?.[0], `${address}(${name}): ERROR: Collection Score: Divine: Invalid length`)
        const score = await PayloadHasher.hashAsync(nftCollectionScore)
        console.log(`${address}(${name}): Collection Score: Store`)
        await archivist.insert([nftCollectionScore])
        console.log(`${address}(${name}): Collection Thumbnail: Obtain Candidate`)
        let imageSlug: string | null = null
        const sourceNftInfoHash = nftCollectionInfo?.sources?.[0]
        if (sourceNftInfoHash) {
          const nftInfo = (await archivist.get([sourceNftInfoHash])).find(isNftInfo)
          if (typeof nftInfo?.metadata?.image === 'string') {
            const url = nftInfo.metadata.image
            const imageThumbnailWitnessQuery: UrlPayload = { schema: UrlSchema, url }
            try {
              console.log(`${address}(${name}): Collection Thumbnail: Witness`)
              const imageThumbnailResult = await imageThumbnailWitness.observe([imageThumbnailWitnessQuery])
              const imageThumbnail = assertEx(imageThumbnailResult?.[0], `${address}(${name}): ERROR: Collection Thumbnail: Witness: Invalid length`)
              console.log(`${address}(${name}): Collection Thumbnail: Store`)
              await archivist.insert([imageThumbnail])
              imageSlug = await PayloadHasher.hashAsync(imageThumbnail)
            } catch (error) {
              console.log(`${address}(${name}): ERROR: Collection Thumbnail: ${error}`)
            }
          }
        }
        console.log(`${address}(${name}): Collection Thumbnail: Persist Collection`)
        const updatedNftCollectionDisplaySlugInfo: NftCollectionDisplaySlugInfo = { displayName: name, imageSlug, score }
        const nftCollectionDisplaySlugInfo: NftCollectionDisplaySlugInfo = existingNftCollectionDisplaySlugInfo
          ? { ...existingNftCollectionDisplaySlugInfo, ...updatedNftCollectionDisplaySlugInfo }
          : updatedNftCollectionDisplaySlugInfo
        nftCollectionDisplaySlugInfos[address] = nftCollectionDisplaySlugInfo
        await writeFile(filePath, JSON.stringify(sortObjectKeys(nftCollectionDisplaySlugInfos), null, 2))
        console.log(`${address}(${name}): Collection Thumbnail: Collection Persisted`)
      } catch (error) {
        console.log(`${address}(${name}): ERROR`)
        console.log(error)
      }
    }
  } catch (error) {
    console.log('Error getting NFT collections')
    console.log(error)
  }
}

const readCollectionInfo = async (): Promise<NftCollectionDisplaySlugInfos> => {
  const fileContents = await readFile(filePath, 'utf8')
  const nftCollectionDisplaySlugInfos: NftCollectionDisplaySlugInfos = JSON.parse(fileContents)
  return nftCollectionDisplaySlugInfos
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary = { [key: string]: any }
function sortObjectKeys(obj: Dictionary) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {} as Dictionary)
}
