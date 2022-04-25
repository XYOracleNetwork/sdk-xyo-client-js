import { XyoDomainConfigWrapper } from './DomainConfigWrapper'

describe('DomainConfigWrapper', () => {
  test('Valid', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('network.xyo.domain', process.env.API_DOMAIN)
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(2)
  })
  test('InValid', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('blahblah.blahblah.blahblah')
    expect(wrapper).toBe(undefined)
  })
})
