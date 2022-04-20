import { XyoDomainConfigWrapper } from './DomainConfigWrapper'

describe('DomainConfigWrapper', () => {
  test('Valid', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('network.xyo.domain')
    expect(wrapper?.config.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.definitions?.length).toBe(2)
  })
  test('InValid', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('blahblah.blahblah.blahblah')
    expect(wrapper?.config.schema).toBe(undefined)
  })
})
