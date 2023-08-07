import { HDWallet } from '@xyo-network/account'
import { ImageThumbnailPayload, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { ModuleError, ModuleErrorSchema } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailWitness } from '../Witness'

describe('ImageThumbnailWitness', () => {
  test('IPFS [jpeg]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const ipfsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'ipfs://ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
    }
    const result = (await witness.observe([ipfsPayload])) as (ImageThumbnailPayload | ModuleError)[]
    expect(result.length).toBe(1)
    const thumb = result[0] as ImageThumbnailPayload
    console.log(`IPFS/JPG Size: ${thumb.url.length}}`)
    expect(thumb.url.length).toBeLessThan(64000)
    const error = result[0] as ModuleError
    if (result[0].schema === ModuleErrorSchema) {
      console.log(`Error: ${error.message}`)
    }
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  test('IPFS [png]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const ipfsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'ipfs://bafybeie3vrrqcq7iugzmsdsdxscvmvqnfkqkk7if2ywxu5h436wf72usga/470.png',
    }
    const result = (await witness.observe([ipfsPayload])) as (ImageThumbnailPayload | ModuleError)[]
    expect(result.length).toBe(1)
    const thumb = result[0] as ImageThumbnailPayload
    console.log(`IPFS/JPG Size: ${thumb.url.length}}`)
    expect(thumb.url.length).toBeLessThan(64000)
    const error = result[0] as ModuleError
    if (result[0].schema === ModuleErrorSchema) {
      console.log(`Error: ${error.message}`)
    }
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
})
