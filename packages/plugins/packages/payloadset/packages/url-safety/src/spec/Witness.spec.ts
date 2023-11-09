import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { ModuleError } from '@xyo-network/payload-model'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { UrlSafetyPayload } from '@xyo-network/url-safety-payload-plugin'

import { UrlSafetyWitness } from '../Witness'

describeIf(process.env.GOOGLE_SAFEBROWSING_KEY)('UrlSafetyWitness', () => {
  let witness: UrlSafetyWitness
  const schema = UrlSchema
  beforeAll(async () => {
    witness = await UrlSafetyWitness.create({
      account: Account.randomSync(),
      google: { safeBrowsing: { key: process.env.GOOGLE_SAFEBROWSING_KEY } },
    })
  })
  test('Safe', async () => {
    const safePayload: UrlPayload = { schema, url: 'https://cnn.com' }
    const result = (await witness.observe([safePayload])) as (UrlSafetyPayload | ModuleError)[]
    const safety = result[0] as UrlSafetyPayload
    expect(safety.threatTypes).toBeUndefined()
  })
  test('Unsafe [unknown]', async () => {
    const safePayload: UrlPayload = { schema, url: 'https://ethercb.com/image.png' }
    const result = (await witness.observe([safePayload])) as (UrlSafetyPayload | ModuleError)[]
    const safety = result[0] as UrlSafetyPayload
    expect(safety.threatTypes).toBeUndefined()
  })
  test('Unsafe [test vector]', async () => {
    const safePayload: UrlPayload = { schema, url: 'https://testsafebrowsing.appspot.com/s/phishing.html' }
    const result = (await witness.observe([safePayload])) as (UrlSafetyPayload | ModuleError)[]
    const safety = result[0] as UrlSafetyPayload
    expect(safety.threatTypes?.length).toBeGreaterThan(0)
  })
})
