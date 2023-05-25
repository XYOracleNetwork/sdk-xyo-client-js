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

  /**
   * Instance constructor for use where async instantiation
   * is not possible. Where possible, prefer the static
   * create method over use of this constructor directly
   * as no initialization (feature detection) is able to
   * be done here
   * @param desiredFeatures The desired feature set
   */
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

  /**
   * Returns a object containing a property for each desired wasm feature
   * with a boolean value indicating whether or not the feature is supported
   */
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

  /**
   * Static creation & async initialization for use where
   * async instantiation is possible
   * @param desiredFeatures The desired feature set
   * @returns An initialized instance of the class with detection
   * for the desired feature set
   */
  static async create(desiredFeatures: WasmFeature[]): Promise<WasmSupport> {
    const instance = new WasmSupport(desiredFeatures)
    await instance.initialize()
    return Promise.resolve(instance)
  }

  /**
   * Checks for specific wasm features
   * @param features The list of features to check for
   * @returns True if all the features are supported, false otherwise
   */
  async featureCheck(features: WasmFeature[]): Promise<boolean> {
    const results = await Promise.all(features.map((feature) => WasmFeatureDetectors[feature]).map(async (detector) => await detector()))
    return results.every((result) => result)
  }

  /**
   * Does feature detection for the desired feature set
   */
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
