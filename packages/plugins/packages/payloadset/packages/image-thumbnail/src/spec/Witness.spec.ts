import { ImageThumbnailPayload } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailWitness } from '../Witness'

describe('ImageThumbnailWitness', () => {
  test('IPFS [jpeg]', async () => {
    const witness = await ImageThumbnailWitness.create()
    const ipfsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'ipfs://ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
    }
    const result = (await witness.observe([ipfsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`IPFS/JPG Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)
  })
  test('HTTPS [medium/avif]', async () => {
    const witness = await ImageThumbnailWitness.create()
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://i.seadn.io/gae/sOGk14HmHMajXRrra4X7Y1ZWncAPyidZap5StDRFCtKHHNSiIUNMpa12v4wqmyp1lEe4CxSxpWgpfiIdh-b_Mn3fq9LDM68i9gof9w?w=500&auto=format',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/AVIF Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)
  })
  test('HTTPS [medium/svg]', async () => {
    const witness = await ImageThumbnailWitness.create()
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://xyo.network/static/media/XYO_Network_Logo_Full_Colored.409bc88a38e9fbe5184378e61c2a795e.svg',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/SVG Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)
  })
  test('HTTPS [large/gif (animated)]', async () => {
    const witness = await ImageThumbnailWitness.create()
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://lh3.googleusercontent.com/N3uFgyMt0xOew9YjD8GiOLQEbbQ2Y7WJOqoHdUdZZSljKrbuKNt6VGkAByzyPAI80y81tELH6tKatSZvFXKfcbBdm6GfCyZhFWxgOTw',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`HTTPS/GIF/ANIMATED Size: ${result[0].url.length}}`)
    expect(result[0].url.length).toBeLessThan(64000)
  })
})
