import { HDWallet } from '@xyo-network/account'
import { ModuleError } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'

import { GoogleSafeBrowsingMatchPayload, UrlSafetyWitness } from '../Witness'

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
    const result = (await witness.observe([safePayload])) as (GoogleSafeBrowsingMatchPayload | ModuleError)[]
    const safety = result as GoogleSafeBrowsingMatchPayload[]
    expect(safety ?? []).toBeArrayOfSize(0)
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
    const result = (await witness.observe([safePayload])) as (GoogleSafeBrowsingMatchPayload | ModuleError)[]
    const safety = result as GoogleSafeBrowsingMatchPayload[]
    expect(safety ?? []).toBeArrayOfSize(0)
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
    const result = (await witness.observe([safePayload])) as (GoogleSafeBrowsingMatchPayload | ModuleError)[]
    const safety = result as GoogleSafeBrowsingMatchPayload[]
    expect((safety ?? []).length).toBeGreaterThan(0)
  })
})
