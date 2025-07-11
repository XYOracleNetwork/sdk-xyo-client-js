import '@xylabs/vitest-extended'

import {
  describe, expect, test,
} from 'vitest'

import { DomainSchema } from '../Schema.ts'
import { DomainPayloadWrapper } from '../Wrapper.ts'

describe('DomainPayloadWrapper', () => {
  test('Valid-discover', async () => {
    const wrapper = await DomainPayloadWrapper.discover(DomainSchema)
    expect(wrapper?.schema()).toBe(DomainSchema)
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(17)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Valid-discover-proxy', async () => {
    const wrapper = await DomainPayloadWrapper.discover(DomainSchema, `${process.env.API_DOMAIN ?? 'https://beta.api.archivist.xyo.network'}/domain`)
    expect(wrapper?.schema()).toBe(DomainSchema)
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(17)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Invalid-discover-proxy', async () => {
    const wrapper = await DomainPayloadWrapper.discoverRootFileWithProxy('xyoo.network', `${process.env.API_DOMAIN}/domain`)
    try {
      expect(wrapper?.schema()).toBeDefined()
    } catch (e) {
      expect(e).toBeDefined()
    }
  })
  test('Valid-discover-direct', async () => {
    const wrapper = await DomainPayloadWrapper.discoverRootFileDirect('xyo.network')
    expect(wrapper?.schema()).toBe(DomainSchema)
    await wrapper?.fetch()
    expect(wrapper?.aliases?.length).toBe(17)
    expect(wrapper?.aliases?.[0].huri).toBeDefined()
  })
  test('Valid-domain-no-file', async () => {
    const wrapper = await DomainPayloadWrapper.discoverRootFileDirect('com.cnn')
    expect(wrapper).toBe(undefined)
  })
  test('InValid', async () => {
    const wrapper = await DomainPayloadWrapper.discover('blahblah.blahblah.blahblah')
    expect(wrapper).toBe(undefined)
  })
})
