import {
  bigInt,
  bulkMemory,
  exceptions,
  extendedConst,
  gc,
  memory64,
  multiValue,
  mutableGlobals,
  referenceTypes,
  relaxedSimd,
  saturatedFloatToInt,
  signExtensions,
  simd,
  streamingCompilation,
  tailCall,
  threads,
} from 'wasm-feature-detect'

const WasmFeatureDetectors = {
  bigInt: bigInt,
  bulkMemory: bulkMemory,
  exceptions: exceptions,
  extendedConst: extendedConst,
  gc: gc,
  memory64: memory64,
  multiValue: multiValue,
  mutableGlobals: mutableGlobals,
  referenceTypes: referenceTypes,
  relaxedSimd: relaxedSimd,
  saturatedFloatToInt: saturatedFloatToInt,
  signExtensions: signExtensions,
  simd: simd,
  streamingCompilation: streamingCompilation,
  tailCall: tailCall,
  threads: threads,
} as const

export type WasmFeature = keyof typeof WasmFeatureDetectors

export class WasmSupport {
  private _allowWasm = true
  private _featureSupport: Partial<Record<WasmFeature, boolean>> = {}
  private _forceWasm = false
  private _isInitialized = false
  private _isWasmFeatureSetSupported = false

  constructor(protected desiredFeatures: WasmFeature[]) {}

  /**
   * Is Wasm allowed
   */
  get allowWasm(): boolean {
    return this._allowWasm
  }
  /**
   * Whether or not to allow WASM usage
   */
  set allowWasm(v: boolean) {
    this._allowWasm = v
  }

  /**
   * Whether or not Wasm should be used based on the desired
   * feature set, initialization state, or force-use settings
   */
  get canUseWasm(): boolean {
    return (
      // Just force WASM
      this._forceWasm ||
      // Or if we haven't checked be optimistic
      (this._allowWasm && !this._isInitialized) ||
      // Or if we have checked and WASM is not supported, be realistic
      (this._allowWasm && this._isInitialized && this._isWasmFeatureSetSupported)
    )
  }

  get featureSupport(): Readonly<Partial<Record<WasmFeature, boolean>>> {
    return { ...this._featureSupport }
  }

  /**
   * Force use of Wasm
   */
  get forceWasm(): boolean {
    return this._forceWasm
  }
  /**
   * Whether or not to force Wasm usage
   */
  set forceWasm(v: boolean) {
    this._forceWasm = v
  }

  /**
   * Whether or not Wasm is supported based
   * on the desired feature set
   */
  get isDesiredFeatureSetSupported(): boolean {
    return this._isWasmFeatureSetSupported
  }

  /**
   * Whether or not Wasm detection has been run
   * for the desired feature set
   */
  get isInitialized(): boolean {
    return this._isInitialized
  }

  static async create(desiredFeatures: WasmFeature[]): Promise<WasmSupport> {
    const instance = new WasmSupport(desiredFeatures)
    await instance.initialize()
    return Promise.resolve(instance)
  }

  async featureCheck(features: WasmFeature[]): Promise<boolean> {
    const results = await Promise.all(features.map((feature) => WasmFeatureDetectors[feature]).map(async (detector) => await detector()))
    return results.every((result) => result)
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) return
    await this.detectDesiredFeatures()
    this._isInitialized = true
    return
  }

  protected async detectDesiredFeatures(): Promise<void> {
    for (let feature = 0; feature < this.desiredFeatures.length; feature++) {
      const desiredFeature = this.desiredFeatures[feature]
      const detector = WasmFeatureDetectors[desiredFeature]
      if (!(await detector())) {
        this._featureSupport[desiredFeature] = false
      } else {
        this._featureSupport[desiredFeature] = true
      }
    }
    this._isWasmFeatureSetSupported = Object.values(this._featureSupport).every((v) => v)
  }
}
