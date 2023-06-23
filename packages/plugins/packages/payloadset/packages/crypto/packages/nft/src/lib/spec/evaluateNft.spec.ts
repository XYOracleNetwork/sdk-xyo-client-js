import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { evaluateNft } from '../evaluateNft'

const nfts: NftInfo[] = [
  {
    contract: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
    metadata: {
      attributes: [
        {
          display_type: 'date',
          trait_type: 'Created Date',
          value: null,
        },
        {
          display_type: 'number',
          trait_type: 'Length',
          value: 8,
        },
        {
          display_type: 'date',
          trait_type: 'Registration Date',
          value: 1640668437000,
        },
        {
          display_type: 'date',
          trait_type: 'Expiration Date',
          value: 1956237957000,
        },
      ],
      background_image: 'https://metadata.ens.domains/mainnet/avatar/💩happens.eth',
      description: '💩happens.eth, an ENS name.',
      image_url:
        'https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0x727cff87562fe62e86e8147c31e567da501307ce220e074ec61eb51b6afc8e7a/image',
      is_normalized: true,
      name: '💩happens.eth',
      name_length: 8,
      url: 'https://app.ens.domains/name/💩happens.eth',
      version: 0,
    },
    supply: '1',
    tokenId: '51784517368512681240378652206490798036726342785538345603107759690694088494714',
    type: 'ERC721',
  },
]

describe('evaluateNft', () => {
  it.each(nfts)('evaluates the NFT', async (nft) => {
    const rating = await evaluateNft(nft)
    expect(rating).toBeObject()
    Object.entries(rating).map(([key, score]) => {
      expect(key).toBeString()
      const [amount, possible] = score
      expect(amount).toBeNumber()
      expect(amount).toBePositive()
      expect(possible).toBeNumber()
      expect(possible).toBePositive()
      expect(amount).toBeGreaterThanOrEqual(possible)
    })
  })
})
