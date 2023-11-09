import { HDWallet } from '@xyo-network/account'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import hasbin from 'hasbin'

import { ImageThumbnailWitness } from '../Witness'

// eslint-disable-next-line import/no-named-as-default-member
const testIfHasBin = (bin: string) => (hasbin.sync(bin) ? it : it.skip)

/**
 * @group thumbnail
 */

describe('ImageThumbnailWitness', () => {
  testIfHasBin('magick')('Dynamic SVG [medium/png]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAxMjAwIDEyMDAiPjxpbWFnZSBocmVmPSJodHRwczovL25lb3Rva3lvLm15cGluYXRhLmNsb3VkL2lwZnMvUW1aeGhEd0xjb0s3Y2lwWDNZMXFNRXBXVUhFeE43RjJqQ3o3UU5mR2NleFVFdS9iYWNrZ3JvdW5kLzgucG5nIi8+PGltYWdlIGhyZWY9Imh0dHBzOi8vbmVvdG9reW8ubXlwaW5hdGEuY2xvdWQvaXBmcy9RbVp4aER3TGNvSzdjaXBYM1kxcU1FcFdVSEV4TjdGMmpDejdRTmZHY2V4VUV1L2JvZHkvMy5wbmciLz48aW1hZ2UgaHJlZj0iaHR0cHM6Ly9uZW90b2t5by5teXBpbmF0YS5jbG91ZC9pcGZzL1FtWnhoRHdMY29LN2NpcFgzWTFxTUVwV1VIRXhON0YyakN6N1FOZkdjZXhVRXUvY2xvdGgvNC5wbmciLz48aW1hZ2UgaHJlZj0iaHR0cHM6Ly9uZW90b2t5by5teXBpbmF0YS5jbG91ZC9pcGZzL1FtWnhoRHdMY29LN2NpcFgzWTFxTUVwV1VIRXhON0YyakN6N1FOZkdjZXhVRXUvaGFuZC9maXN0LzMucG5nIi8+PGltYWdlIGhyZWY9Imh0dHBzOi8vbmVvdG9reW8ubXlwaW5hdGEuY2xvdWQvaXBmcy9RbVp4aER3TGNvSzdjaXBYM1kxcU1FcFdVSEV4TjdGMmpDejdRTmZHY2V4VUV1L2hlYWQvMy5wbmciLz48aW1hZ2UgaHJlZj0iaHR0cHM6Ly9uZW90b2t5by5teXBpbmF0YS5jbG91ZC9pcGZzL1FtWnhoRHdMY29LN2NpcFgzWTFxTUVwV1VIRXhON0YyakN6N1FOZkdjZXhVRXUvaGVsbS8yLnBuZyIvPjwvc3ZnPg==',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    // console.log(`DATA/PNG Size: ${result[0].url?.length}}`)
    expect(result[0].url?.length).toBeLessThan(128000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
})
