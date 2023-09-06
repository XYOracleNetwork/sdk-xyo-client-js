import { HDWallet } from '@xyo-network/account'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { sync as hasbin } from 'hasbin'

import { ImageThumbnailWitness } from '../Witness'

const describeIfHasBin = (bin: string) => (hasbin(bin) ? describe : describe.skip)
const testIfHasBin = (bin: string) => (hasbin(bin) ? it : it.skip)

describeIfHasBin('magick')('ImageThumbnailWitness', () => {
  describe('with video type', () => {
    let witness: ImageThumbnailWitness
    beforeAll(async () => {
      witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    })
    const cases: [mime: string, url: string][] = [
      // ['video/3gpp', 'https://filesamples.com/samples/video/3gp/sample_640x360.3gp'],
      // ['video/3gpp2', ''],
      // ['video/h264', ''],
      // ['video/h265', ''],
      // MPEG-2 Transport Stream
      // ['video/mp2t', 'https://filesamples.com/samples/video/m2ts/sample_640x360.m2ts'],
      ['video/mp4', 'https://cdn-longterm.mee6.xyz/assets/avatars-presale.mp4'],
      // MPEG Moving Picture Experts Group Phase 1
      ['video/mpeg', 'https://filesamples.com/samples/video/mpeg/sample_640x360.mpeg'],
      // ['video/ogg', 'https://filesamples.com/samples/video/ogv/sample_640x360.ogv'],
      // ['video/quicktime', 'https://filesamples.com/samples/video/mov/sample_640x360.mov'],
      // ['video/vnd.rn-realvideo', ''],
      ['video/webm', 'https://filesamples.com/samples/video/webm/sample_640x360.webm'],
      // ['video/x-flv', ''],
      // MPEG-4 Video
      // ['video/x-m4v', 'https://filesamples.com/samples/video/m4v/sample_640x360.m4v'],
      // ['video/x-matroska', 'https://filesamples.com/samples/video/mkv/sample_640x360.mkv'],
      // Windows Media Video
      ['video/x-ms-wmv', 'https://filesamples.com/samples/video/wmv/sample_640x360.wmv'],
      // AVI (video/vnd.avi, video/avi, video/msvideo, video/x-msvideo)
      ['video/x-msvideo', 'https://filesamples.com/samples/video/avi/sample_640x360.avi'],
    ]
    const problemCases = [
      // 'https://media.niftygateway.com/video/upload/v1649189105/Abigail/FEWO/Paint/Paint/006266_paint_hf9cft.mp4',
    ]
    testIfHasBin('ffmpeg').each(cases)('video [mime (%s)]', async (mime, url) => {
      const httpsPayload: UrlPayload = { schema: UrlSchema, url }
      const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
      expect(result.length).toBe(1)
      expect(result[0].url?.length).toBeLessThan(64000)
      expect(result[0].schema).toBe(ImageThumbnailSchema)
    })
  })
})
