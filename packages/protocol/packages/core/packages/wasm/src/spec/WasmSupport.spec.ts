import '@xylabs/vitest-extended'

import {
  describe, expect,
  it,
} from 'vitest'

import type { WasmFeature } from '../WasmSupport.ts'
import { WasmSupport } from '../WasmSupport.ts'

describe('WasmSupport', () => {
  const allFeatures: WasmFeature[] = [
    'bigInt',
    'bulkMemory',
    'exceptions',
    'extendedConst',
    'gc',
    'memory64',
    'multiValue',
    'mutableGlobals',
    'referenceTypes',
    'relaxedSimd',
    'saturatedFloatToInt',
    'signExtensions',
    'simd',
    'streamingCompilation',
    'tailCall',
    'threads',
  ]
  const generallySupportedFeatures: WasmFeature[] = ['simd', 'bigInt']
  describe('initialize', () => {
    it('initializes the instance', async () => {
      const instance = await WasmSupport.create(generallySupportedFeatures)
      expect(instance.isInitialized).toBe(true)
    })
  })
  describe('isDesiredFeatureSetSupported', () => {
    it('Returns true if desired features are supported', async () => {
      const instance = await WasmSupport.create(generallySupportedFeatures)
      expect(instance.isDesiredFeatureSetSupported).toBe(true)
    })
  })
  describe('featureSupport', () => {
    it('Lists desired features and their support status', async () => {
      const instance = await WasmSupport.create(allFeatures)
      expect(Object.keys(instance.featureSupport)).toIncludeAllMembers(allFeatures)
      for (const feature of Object.values(instance.featureSupport)) expect(typeof feature).toBe('boolean')
    })
  })
})
