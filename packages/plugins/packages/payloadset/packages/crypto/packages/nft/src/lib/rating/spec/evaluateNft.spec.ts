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
  {
    contract: '0x8eaaabe11896bd09fb852d3a5248004ec44bc793',
    metadata: {
      animation_url:
        'https://refractions.azureedge.net/refractions/metadata/refractions/0000000000000000000000000000000000000000000000000000000000000007/prism.mp4',
      attributes: [
        {
          display_type: 'date',
          trait_type: 'Publish Date',
          value: 1643274000,
        },
        {
          trait_type: 'Edition',
          value: 'Bridge',
        },
        {
          trait_type: 'Inventory',
          value: 'Artifacts',
        },
      ],
      description:
        '🜂🜃🜁🜄 [Prism](https://refractions.xyz/prism) The Lighthouse  \r\n  Airdropped to all [BAYC](https://opensea.io/collection/boredapeyachtclub) and [CryptoFish](https://cryptofish.io/) members by [Captain Murray #9671](https://opensea.io/muratsayginer).   \r\n  \r\n  **Introducing [refractions.xyz](https://refractions.xyz/)** / _This is a new yet familiar territory. A dimension where metaphors rule physics and fiction builds reality…_  \r\n  \r\n  [#apefollowape](https://twitter.com/muratsayginer)',
      external_url: 'https://refractions.xyz/',
      image:
        'https://refractions.azureedge.net/refractions/metadata/refractions/0000000000000000000000000000000000000000000000000000000000000007/prism_placeholder.gif',
      name: 'Prism',
    },
    supply: '1',
    tokenId: '7',
    type: 'ERC1155',
  },
  {
    contract: '0x0369edc7646948e2f36f9f85baf297bb99843054',
    metadata: {
      attributes: [
        {
          trait_type: 'Artist',
          value: 'MrSnowy10',
        },
        {
          trait_type: 'Item Eaten',
          value: 'Radioactive Waste',
        },
        {
          trait_type: 'Type',
          value: 'Avatar',
        },
        {
          trait_type: 'Species',
          value: 'Pinco',
        },
      ],
      created_by: 'MrSnowy10',
      description: 'Alien Pinco\n\nPinco "Alien"',
      external_url: 'https://www.thepincovillage.com/',
      image: 'https://arweave.net/0-R-VFX6VxkK4Cr70gnq50A2Rd6qXge0sHAQqGPqI4E',
      image_details: {
        bytes: 2459769,
        format: 'PNG',
        height: 1500,
        sha256: 'f5cc400e767fe9a5c75c32745faf472ca35863b0ff48662923d7f3c9bae13edd',
        width: 1200,
      },
      image_url: 'https://arweave.net/0-R-VFX6VxkK4Cr70gnq50A2Rd6qXge0sHAQqGPqI4E',
      name: 'Pinco "Alien"',
    },
    supply: '1',
    tokenId: '27',
    type: 'ERC1155',
  },
]

describe('evaluateNft', () => {
  it.each(nfts)('evaluates the NFT', async (nft) => {
    const rating = await evaluateNft(nft)
    expect(rating).toBeObject()
    Object.entries(rating).map(([key, score]) => {
      expect(key).toBeString()
      const [total, possible] = score
      expect(total).toBeNumber()
      expect(total).not.toBeNegative()
      expect(possible).toBeNumber()
      expect(possible).not.toBeNegative()
      expect(total).toBeLessThanOrEqual(possible)
    })
  })
})
