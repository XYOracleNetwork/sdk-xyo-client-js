import { assertEx } from '@xylabs/assert'
import { AxiosJson } from '@xyo-network/axios'

interface OpenSeaNFT {
  collection: string
  contract: string
  created_at: string
  description: string | null
  identifier: string
  image_url: string | null
  is_disabled: boolean
  is_nsfw: boolean
  metadata_url: string | null
  name: string | null
  token_standard: string
  updated_at: string
}

export const getNftsFromWalletFromOpenSea = async (chainId: number, address: string, maxNfts = 200, timeout = 2000) => {
  const apiKey = assertEx(process.env.OPENSEA_API_KEY, 'No opensea key found')

  const axios = new AxiosJson({ headers: { 'x-api-key': apiKey }, timeout })

  const nfts = (await axios.get<{ nfts: OpenSeaNFT[] }>(`https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts?limit=${maxNfts}`)).data
    .nfts
  return nfts
}
