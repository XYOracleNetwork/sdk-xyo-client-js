import { WasmFeature, WasmSupport } from '../../src/Wasm/WasmSupport'

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
      Object.values(instance.featureSupport).map((feature) => expect(feature).toBeBoolean())
    })
  })
})
