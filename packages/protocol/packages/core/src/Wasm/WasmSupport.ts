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
  private _forceWasm = true
  private _isInitialized = false
  private _isWasmFeatureSetSupported = true

  protected constructor(protected desiredFeatures: WasmFeature[]) {}

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

  get featureSupport(): Partial<Record<WasmFeature, boolean>> {
    return this._featureSupport
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
   * Whether or not Wasm detection has been run
   * for the desired feature set
   */
  get isInitialized(): boolean {
    return this._isInitialized
  }

  /**
   * Whether or not Wasm is supported based
   * on the desired feature set
   */
  get isWasmFeatureSetSupported(): boolean {
    return this._isWasmFeatureSetSupported
  }

  static async create(desiredFeatures: WasmFeature[]): Promise<WasmSupport> {
    const instance = new WasmSupport(desiredFeatures)
    await instance.initialize()
    return Promise.resolve(instance)
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) return
    for (let feature = 0; feature < this.desiredFeatures.length; feature++) {
      const desiredFeature = this.desiredFeatures[feature]
      const detector = WasmFeatureDetectors[desiredFeature]
      this._isWasmFeatureSetSupported = true
      if (!(await detector())) {
        this._isWasmFeatureSetSupported = false
        this._featureSupport[desiredFeature] = false
      } else {
        this._featureSupport[desiredFeature] = true
      }
    }
    this._isInitialized = true
    return
  }
}
