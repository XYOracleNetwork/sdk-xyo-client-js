import { XyoDomainConfigWrapper } from './DomainConfigWrapper'

describe('DomainConfigWrapper', () => {
  test('Valid-discover', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('network.xyo.domain', process.env.API_DOMAIN)
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(2)
  })
  test('Valid-discover-proxy', async () => {
    console.log('One')
    const wrapper = await XyoDomainConfigWrapper.discoverRootFileWithProxy('xyo.network', `${process.env.API_DOMAIN}/domain`)
    console.log('Two')
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(2)
  })
  test('Valid-discover-direct', async () => {
    console.log('One-B')
    const wrapper = await XyoDomainConfigWrapper.discoverRootFileDirect('xyo.network')
    console.log('Two-B')
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(2)
  })
  test('InValid', async () => {
    const wrapper = await XyoDomainConfigWrapper.discover('blahblah.blahblah.blahblah')
    expect(wrapper).toBe(undefined)
  })
})
