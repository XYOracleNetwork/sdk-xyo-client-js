import { HDWallet } from '@xyo-network/account'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { sync as hasbin } from 'hasbin'

import { ImageThumbnailWitness } from '../Witness'

const describeIfHasBin = (bin: string) => (hasbin(bin) ? describe : describe.skip)
const testIfHasBin = (bin: string) => (hasbin(bin) ? it : it.skip)

describeIfHasBin('magick')('ImageThumbnailWitness', () => {
  let witness: ImageThumbnailWitness
  beforeAll(async () => {
    witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
  })
  const cases = [
    'https://cdn-longterm.mee6.xyz/assets/avatars-presale.mp4',
    'https://media.niftygateway.com/video/upload/v1649189105/Abigail/FEWO/Paint/Paint/006266_paint_hf9cft.mp4',
  ]
  testIfHasBin('ffmpeg').each(cases)('HTTPS [large/mp4 (animated)]', async (url) => {
    const httpsPayload: UrlPayload = { schema: UrlSchema, url }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    expect(result[0].url?.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
})
