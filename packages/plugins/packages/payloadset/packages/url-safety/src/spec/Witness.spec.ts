import { HDWallet } from '@xyo-network/account'
import { ModuleError } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { UrlSafetyPayload } from '@xyo-network/url-safety-payload-plugin'

import { UrlSafetyWitness } from '../Witness'

describe('UrlSafetyWitness', () => {
  test('Safe', async () => {
    const witness = await UrlSafetyWitness.create({
      account: await HDWallet.random(),
      google: { safeBrowsing: { key: process.env.GOOGLE_SAFEBROWSING_KEY } },
    })
    const safePayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://cnn.com',
    }
    const result = (await witness.observe([safePayload])) as (UrlSafetyPayload | ModuleError)[]
    const safety = result as UrlSafetyPayload[]
    expect(safety[0].threatTypes).toBeUndefined()
  })
  test('Unsafe [unknown]', async () => {
    const witness = await UrlSafetyWitness.create({
      account: await HDWallet.random(),
      google: { safeBrowsing: { key: process.env.GOOGLE_SAFEBROWSING_KEY } },
    })
    const safePayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://ethercb.com/image.png',
    }
    const result = (await witness.observe([safePayload])) as (UrlSafetyPayload | ModuleError)[]
    const safety = result as UrlSafetyPayload[]
    expect(safety[0].threatTypes).toBeUndefined()
  })
  test('Unsafe [test vector]', async () => {
    const witness = await UrlSafetyWitness.create({
      account: await HDWallet.random(),
      google: { safeBrowsing: { key: process.env.GOOGLE_SAFEBROWSING_KEY } },
    })
    const safePayload: UrlPayload = {
      schema: UrlSchema,
      url: 'https://testsafebrowsing.appspot.com/s/phishing.html',
    }
    const result = (await witness.observe([safePayload])) as (UrlSafetyPayload | ModuleError)[]
    const safety = result as UrlSafetyPayload[]
    expect(safety[0].threatTypes?.length).toBeGreaterThan(0)
  })
})
