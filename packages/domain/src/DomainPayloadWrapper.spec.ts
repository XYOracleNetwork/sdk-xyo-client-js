import { XyoDomainPayloadWrapper } from './DomainPayloadWrapper'

describe('DomainPayloadWrapper', () => {
  test('Valid-discover', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discover('network.xyo.domain')
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(3)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Valid-discover-proxy', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discover('network.xyo.domain', `${process.env.API_DOMAIN}/domain`)
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(3)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Invalid-discover-proxy', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discoverRootFileWithProxy('xyoo.network', `${process.env.API_DOMAIN}/domain`)
    expect(wrapper?.payload.schema).toBeUndefined()
  })
  test('Valid-discover-direct', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discoverRootFileDirect('xyo.network')
    expect(wrapper?.payload.schema).toBe('network.xyo.domain')
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(3)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('InValid', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discover('blahblah.blahblah.blahblah')
    expect(wrapper).toBe(undefined)
  })
})
