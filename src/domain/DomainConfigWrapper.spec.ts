import { XyoDomainConfigWrapper } from './DomainConfigWrapper'

describe('DomainConfigWrapper', () => {
  test('Valid-discover', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('network.xyo.domain', process.env.API_DOMAIN)
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(2)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Valid-discover-proxy', async () => {
    const wrapper = await XyoDomainConfigWrapper.discoverRootFileWithProxy('xyo.network', `${process.env.API_DOMAIN}/domain`)
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(2)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Valid-discover-direct', async () => {
    const wrapper = await XyoDomainConfigWrapper.discoverRootFileDirect('xyo.network')
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(2)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('InValid', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('blahblah.blahblah.blahblah')
    expect(wrapper).toBe(undefined)
  })
})
