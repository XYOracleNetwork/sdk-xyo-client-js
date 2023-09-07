import { HDWallet } from '@xyo-network/account'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { sync as hasbin } from 'hasbin'

import { ImageThumbnailWitness } from '../Witness'

const describeIfHasBin = (bin: string) => (hasbin(bin) ? describe : describe.skip)

type MimeWithUrl = [mime: string, url: string]

const testVideo = async (witness: ImageThumbnailWitness, url: string) => {
  const httpsPayload: UrlPayload = { schema: UrlSchema, url }
  const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
  expect(result.length).toBe(1)
  expect(result[0].url?.length).toBeLessThan(64000)
  expect(result[0].schema).toBe(ImageThumbnailSchema)
}

describeIfHasBin('magick')('ImageThumbnailWitness', () => {
  describe('with video type', () => {
    let witness: ImageThumbnailWitness
    beforeAll(async () => {
      witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    })
    describe('3GPP', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/3gpp', 'https://filesamples.com/samples/video/3gp/sample_640x360.3gp'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('3GPP2', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/3gpp2', ''],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('Advanced Video Coding / H.264', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/h264', ''],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('High Efficiency Video Coding / H.265', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/h265', ''],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('MPEG-2 Transport Stream', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/mp2t', 'https://filesamples.com/samples/video/m2ts/sample_640x360.m2ts'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe('MPEG-4 Part 14', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/mp4', 'https://cdn-longterm.mee6.xyz/assets/avatars-presale.mp4'],
        ['video/mp4;codecs=avc1', 'https://media.niftygateway.com/video/upload/v1649189105/Abigail/FEWO/Paint/Paint/006266_paint_hf9cft.mp4'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe('MPEG Moving Picture Experts Group Phase 1', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/mpeg', 'https://filesamples.com/samples/video/mpeg/sample_640x360.mpeg'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('OGG', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/ogg', 'https://filesamples.com/samples/video/ogv/sample_640x360.ogv'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe('QuickTime File Format (QTFF)', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/quicktime', 'https://filesamples.com/samples/video/mov/sample_640x360.mov'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('RealMedia', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/vnd.rn-realvideo', '.rm'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe('WebM', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/webm', 'https://filesamples.com/samples/video/webm/sample_640x360.webm'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('Flash Video', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/x-flv', ''],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe('MPEG-4 Video', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/x-m4v', 'https://filesamples.com/samples/video/m4v/sample_640x360.m4v'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe.skip('Matroska Multimedia Container', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/x-matroska', 'https://filesamples.com/samples/video/mkv/sample_640x360.mkv'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe('Windows Media Video', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        ['video/x-ms-wmv', 'https://filesamples.com/samples/video/wmv/sample_640x360.wmv'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
    describe('Audio Video Interleave', () => {
      const cases: MimeWithUrl[] = [
        // Cases
        // ['video/vnd.avi', 'https://filesamples.com/samples/video/avi/sample_640x360.avi'],
        ['video/avi', 'https://filesamples.com/samples/video/avi/sample_640x360.avi'],
        // ['video/msvideo', 'https://filesamples.com/samples/video/avi/sample_640x360.avi'],
        // ['video/x-msvideo', 'https://filesamples.com/samples/video/avi/sample_640x360.avi'],
      ]
      it.each(cases)('video [mime (%s)]', async (_mime, url) => await testVideo(witness, url))
    })
  })
})
