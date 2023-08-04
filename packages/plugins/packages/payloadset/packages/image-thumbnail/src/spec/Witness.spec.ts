import { ImageThumbnailPayload } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailWitness } from '../Witness'

describe('ImageThumbnailWitness', () => {
  test('IPFS', async () => {
    const witness = await ImageThumbnailWitness.create()
    const ipfsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'ipfs://ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
    }
    const result = (await witness.observe([ipfsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`Result: ${result[0].url.length}}`)
  })
  test('HTTPS [small/static]', async () => {
    const witness = await ImageThumbnailWitness.create()
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://i.seadn.io/gae/sOGk14HmHMajXRrra4X7Y1ZWncAPyidZap5StDRFCtKHHNSiIUNMpa12v4wqmyp1lEe4CxSxpWgpfiIdh-b_Mn3fq9LDM68i9gof9w?w=500&auto=format',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`Result: ${result[0].url.length}}`)
  })
  test('HTTPS [large/animated]', async () => {
    const witness = await ImageThumbnailWitness.create()
    const httpsPayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://lh3.googleusercontent.com/N3uFgyMt0xOew9YjD8GiOLQEbbQ2Y7WJOqoHdUdZZSljKrbuKNt6VGkAByzyPAI80y81tELH6tKatSZvFXKfcbBdm6GfCyZhFWxgOTw',
    }
    const result = (await witness.observe([httpsPayload])) as ImageThumbnailPayload[]
    expect(result.length).toBe(1)
    console.log(`Result: ${result[0].url.length}}`)
  })
})
