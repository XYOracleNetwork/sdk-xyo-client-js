import { describeIf } from '@xylabs/jest-helpers'

import { hasNonDefaultProvider } from '../../../Providers'
import { reportCryptoPrices } from '../reportCryptoPrices'

/**
 * @group crypto
 * @group slow
 */

describeIf(hasNonDefaultProvider())('reportCryptoPrices', () => {
  it('gets prices using default provider if no provider supplied', async () => {
    const [bw, ...payloads] = await reportCryptoPrices()
    expect(bw).toBeTruthy()
    expect(payloads.length).toBeGreaterThan(0)
  }, 60000)
})
