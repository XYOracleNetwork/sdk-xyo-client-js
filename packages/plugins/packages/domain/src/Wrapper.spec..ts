import { XyoDomainPayloadSchema } from './Schema'
import { XyoDomainPayloadWrapper } from './Wrapper'

describe('DomainPayloadWrapper', () => {
  test('Valid-discover', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discover(XyoDomainPayloadSchema)
    expect(wrapper?.payload.schema).toBe(XyoDomainPayloadSchema)
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(3)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Valid-discover-proxy', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discover(XyoDomainPayloadSchema, `${process.env.API_DOMAIN}/domain`)
    expect(wrapper?.payload.schema).toBe(XyoDomainPayloadSchema)
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
    expect(wrapper?.payload.schema).toBe(XyoDomainPayloadSchema)
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(3)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('InValid', async () => {
    const wrapper = await XyoDomainPayloadWrapper.discover('blahblah.blahblah.blahblah')
    expect(wrapper).toBe(undefined)
  })
})
