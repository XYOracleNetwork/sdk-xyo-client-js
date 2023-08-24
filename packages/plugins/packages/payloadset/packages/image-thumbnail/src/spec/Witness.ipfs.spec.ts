import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { ModuleError, ModuleErrorSchema } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { sync as hasbin } from 'hasbin'

import { ImageThumbnailWitness } from '../Witness'

const testIfHasBin = (bin: string) => (hasbin(bin) ? it : it.skip)

describe('ImageThumbnailWitness', () => {
  let witness: ImageThumbnailWitness
  beforeAll(async () => {
    witness = await ImageThumbnailWitness.create({
      account: await HDWallet.random(),
      ipfs: {
        infura: {
          endpoint: assertEx(process.env.INFURA_THUMBNAIL_IPFS_ENDPOINT),
          key: assertEx(process.env.INFURA_THUMBNAIL_IPFS_KEY),
          secret: assertEx(process.env.INFURA_THUMBNAIL_IPFS_KEY_SECRET),
        },
      },
    })
  })
  testIfHasBin('magick')('IPFS [jpeg]', async () => {
    const ipfsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'ipfs://ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
    }
    const result = (await witness.observe([ipfsPayload])) as (ImageThumbnail | ModuleError)[]
    expect(result.length).toBe(1)
    const thumb = result[0] as ImageThumbnail
    expect(thumb.url?.length).toBeLessThan(64000)
    const error = result[0] as ModuleError
    if (result[0].schema === ModuleErrorSchema) {
      console.log(`Error: ${error.message}`)
    }
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  testIfHasBin('magick')('IPFS [png]', async () => {
    const ipfsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'ipfs://bafybeie3vrrqcq7iugzmsdsdxscvmvqnfkqkk7if2ywxu5h436wf72usga/470.png',
    }
    const result = (await witness.observe([ipfsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    const thumb = result[0] as ImageThumbnail
    expect(thumb.url?.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
})
