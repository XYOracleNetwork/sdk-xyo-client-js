import { HDWallet } from '@xyo-network/account'
import { ImageThumbnailErrorPayload, ImageThumbnailPayload, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { ModuleErrorSchema } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { sync as hasbin } from 'hasbin'

import { ImageThumbnailWitness } from '../Witness'

const testIfHasBin = (bin: string) => (hasbin(bin) ? it : it.skip)

describe('ImageThumbnailWitness', () => {
  testIfHasBin('magick')('HTTPS [medium/avif]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://i.seadn.io/gae/sOGk14HmHMajXRrra4X7Y1ZWncAPyidZap5StDRFCtKHHNSiIUNMpa12v4wqmyp1lEe4CxSxpWgpfiIdh-b_Mn3fq9LDM68i9gof9w?w=500&auto=format',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/AVIF Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  testIfHasBin('magick')('HTTPS [medium/png/unsafe]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://ethercb.com/image.png',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/PNG/UNSAFE Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  testIfHasBin('magick')('HTTPS [medium/svg]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://xyo.network/static/media/XYO_Network_Logo_Full_Colored.409bc88a38e9fbe5184378e61c2a795e.svg',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/SVG Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)

    //do a second pass and make sure we get cached result
    const result2 = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result2.length).toBe(1)
    expect(result2[0].url.length).toEqual(result[0].url.length)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  testIfHasBin('magick')('HTTPS [large/gif (animated)]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://lh3.googleusercontent.com/N3uFgyMt0xOew9YjD8GiOLQEbbQ2Y7WJOqoHdUdZZSljKrbuKNt6VGkAByzyPAI80y81tELH6tKatSZvFXKfcbBdm6GfCyZhFWxgOTw',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/GIF/ANIMATED Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
  testIfHasBin('magick')('HTTPS [html/error]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://espn.com',
    }
    const result = (await witness.observe([httpsPayload])) as (ImageThumbnailPayload | ImageThumbnailErrorPayload)[]
    expect(result.length).toBe(1)
    const error = result[0] as ImageThumbnailErrorPayload
    expect(error?.schema).toBe(ModuleErrorSchema)
    console.log(`HTTPS/ESPN Error: ${result[0].url.length}}`)
    expect(error?.message).toStartWith('Invalid file type')
  })
  testIfHasBin('magick')('HTTPS [dns/error]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://sdjkfsdljkfhdskfsd.com',
    }
    const result = (await witness.observe([httpsPayload])) as (ImageThumbnailPayload | ImageThumbnailErrorPayload)[]
    expect(result.length).toBe(1)
    const error = result[0] as ImageThumbnailErrorPayload
    expect(error?.schema).toBe(ModuleErrorSchema)
    console.log(`HTTPS/DNS Error: ${result[0].url.length}}`)
    expect(error?.message).toStartWith('getaddrinfo ENOTFOUND')
  })
  testIfHasBin('magick')('HTTPS [medium/png]', async () => {
    const witness = await ImageThumbnailWitness.create({ account: await HDWallet.random() })
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://usdclive.org/usdc.png',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/PNG Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)

    //do a second pass and make sure we get cached result
    const result2 = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result2.length).toBe(1)
    expect(result2[0].url.length).toEqual(result[0].url.length)
    expect(result[0].schema).toBe(ImageThumbnailSchema)
  })
})
