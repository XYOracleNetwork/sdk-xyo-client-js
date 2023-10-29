import { HDWallet } from '@xyo-network/account'
import { PayloadHasher } from '@xyo-network/core'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import hasbin from 'hasbin'

import { ImageThumbnailWitness } from '../Witness'

// eslint-disable-next-line import/no-named-as-default-member
const describeIfHasBin = (bin: string) => (hasbin.sync(bin) ? describe : describe.skip)

/**
 * @group thumbnail
 */

describeIfHasBin('magick')('ImageThumbnailWitness', () => {
  let witness: ImageThumbnailWitness
  beforeAll(async () => {
    witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
  })
  it('HTTPS [medium/avif]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://i.seadn.io/gae/sOGk14HmHMajXRrra4X7Y1ZWncAPyidZap5StDRFCtKHHNSiIUNMpa12v4wqmyp1lEe4CxSxpWgpfiIdh-b_Mn3fq9LDM68i9gof9w?w=500&auto=format',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    expect(result[0].url?.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  it.skip('HTTPS [medium/png/unsafe]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://ethercb.com/image.png',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
    expect(result[0].url?.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  it('HTTPS [medium/svg]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://xyo.network/static/media/XYO_Network_Logo_Full_Colored.409bc88a38e9fbe5184378e61c2a795e.svg',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    expect(result[0].url?.length).toBeLessThan(64000)

    //do a second pass and make sure we get cached result
    const result2 = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result2.length).toBe(1)
    expect(result2[0].url?.length).toEqual(result[0].url?.length)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  it('HTTPS [medium/ens]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0x7d26d96c6c36f4edabfb87287e2ebfca83a454b05c34d684b9b19a5af30d7994/image',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    console.log(`ENS-SourceHash: ${result[0].sourceHash}`)
    console.log(`ENS-Hash: ${await PayloadHasher.hashAsync(result[0])}`)
    console.log(`ENS-DataHash: ${await PayloadHasher.hashAsync({ url: result[0].url })}`)
    console.log(`ENS-Result: ${JSON.stringify(result[0], null, 2)}`)
    expect(result.length).toBe(1)
    expect(result[0].url?.length).toBeLessThan(64000)

    //do a second pass and make sure we get cached result
    const result2 = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result2.length).toBe(1)
    expect(result2[0].url?.length).toEqual(result[0].url?.length)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  it('HTTPS [large/gif (animated)]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://lh3.googleusercontent.com/N3uFgyMt0xOew9YjD8GiOLQEbbQ2Y7WJOqoHdUdZZSljKrbuKNt6VGkAByzyPAI80y81tELH6tKatSZvFXKfcbBdm6GfCyZhFWxgOTw',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    console.log(`GIF-SourceHash: ${result[0].sourceHash}`)
    console.log(`GIF-Hash: ${await PayloadHasher.hashAsync(result[0])}`)
    console.log(`GIF-DataHash: ${await PayloadHasher.hashAsync({ url: result[0].url })}`)
    console.log(`GIF-Result: ${JSON.stringify(result[0], null, 2)}`)
    expect(result.length).toBe(1)
    expect(result[0].url?.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  it('HTTPS [html/error]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://espn.com',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    expect(result[0]?.mime?.invalid).toBe(true)
  })
  it('HTTPS [dns/error]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://sdjkfsdljkfhdskfsd.com',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    expect(result[0]?.http?.code).toBe('ENOTFOUND')
  })
  it('HTTPS [other/error]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://profilesetting.in/mier/logo.gif',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    console.log(`HTTPS [other/error]: ${JSON.stringify(result)}`)
    expect(result[0]?.http?.code).toBe('ENOTFOUND')
  })
  it.skip('HTTPS [medium/png]', async () => {
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://usdclive.org/usdc.png',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result.length).toBe(1)
    expect(result[0].url?.length).toBeLessThan(64000)

    //do a second pass and make sure we get cached result
    const result2 = (await witness.observe([httpsPayload])) as ImageThumbnail[]
    expect(result2.length).toBe(1)
    expect(result2[0].url?.length).toEqual(result[0].url?.length)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
})
