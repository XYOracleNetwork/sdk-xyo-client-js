import { simd } from 'wasm-feature-detect'

export type WasmFeaturesSet = Record<string, boolean>

export class WasmSupport {
  private _allowWasm = true
  private _forceWasm = true
  private _isInitialized = false
  private _isWasmSupported = true

  protected constructor(protected desiredFeatures: WasmFeaturesSet) {}

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
  get isWasmSupported(): boolean {
    return this._isWasmSupported
  }

  static async create(desiredFeatures: WasmFeaturesSet): Promise<WasmSupport> {
    const instance = new WasmSupport(desiredFeatures)
    await instance.initialize()
    return Promise.resolve(instance)
  }

  async initialize(): Promise<void> {
    await Promise.resolve()
    if (await simd()) {
      this._isWasmSupported = true
    } else {
      this._isWasmSupported = false
    }
    this._isInitialized = true
    return
  }
}
