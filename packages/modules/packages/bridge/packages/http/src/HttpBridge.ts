import { assertEx } from '@xylabs/assert'
import { AxiosError, AxiosJson } from '@xylabs/axios'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { ApiEnvelope } from '@xyo-network/api-models'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeExposeOptions, BridgeModule, BridgeParams, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AnyConfigSchema,
  creatableModule,
  ModuleInstance,
  ModuleQueryResult,
  ModuleResolverInstance,
  ModuleStateQuery,
  ModuleStateQuerySchema,
} from '@xyo-network/module-model'
import { asAttachableNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType, Payload, WithMeta } from '@xyo-network/payload-model'

import { HttpBridgeConfig, HttpBridgeConfigSchema } from './HttpBridgeConfig'
import { HttpBridgeModuleResolver } from './HttpBridgeModuleResolver'
import { BridgeQuerySender } from './ModuleProxy'

export type HttpBridgeParams<TConfig extends AnyConfigSchema<HttpBridgeConfig> = AnyConfigSchema<HttpBridgeConfig>> = BridgeParams<TConfig>

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams> extends AbstractBridge<TParams> implements BridgeModule<TParams>, BridgeQuerySender {
  static override configSchemas = [HttpBridgeConfigSchema]
  static maxPayloadSizeWarning = 256 * 256

  private _axios?: AxiosJson
  private _resolver?: HttpBridgeModuleResolver

  get axios() {
    this._axios = this._axios ?? new AxiosJson()
    return this._axios
  }

  get maxPayloadSizeWarning() {
    return this.config.maxPayloadSizeWarning ?? 10_000
  }

  get nodeUrl() {
    return assertEx(this.config.nodeUrl, () => 'No Url Set')
  }

  override get resolver() {
    this._resolver =
      this._resolver ?? new HttpBridgeModuleResolver({ bridge: this, querySender: this, rootUrl: this.nodeUrl, wrapperAccount: this.account })
    return this._resolver
  }

  override async discoverRoots(): Promise<ModuleInstance[]> {
    const state = await this.getRootState()
    const nodeManifest = state?.find(isPayloadOfSchemaType<WithMeta<NodeManifestPayload>>(NodeManifestPayloadSchema))
    if (nodeManifest) {
      const modules = (await this.resolveRootNode(nodeManifest)).filter(exists)
      return modules
    }
    return []
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  override exposedHandler(): Promisable<Address[]> {
    throw new Error('Unsupported')
  }

  moduleUrl(address: Address) {
    return new URL(address, this.nodeUrl)
  }

  async sendBridgeQuery<TOut extends Payload = Payload, TQuery extends QueryBoundWitness = QueryBoundWitness, TIn extends Payload = Payload>(
    targetAddress: Address,
    query: TQuery,
    payloads?: TIn[],
  ): Promise<ModuleQueryResult<TOut>> {
    try {
      const payloadSize = JSON.stringify([query, payloads]).length
      if (payloadSize > this.maxPayloadSizeWarning) {
        this.logger?.warn(
          `Large targetQuery being sent: ${payloadSize} bytes [${this.address}][${this.moduleAddress}] [${query.schema}] [${payloads?.length}]`,
        )
      }
      const moduleUrl = this.moduleUrl(targetAddress).href
      const result = await this.axios.post<ApiEnvelope<ModuleQueryResult<TOut>>>(moduleUrl, [query, payloads])
      if (result.status === 404) {
        throw `target module not found [${moduleUrl}] [${result.status}]`
      }
      if (result.status >= 400) {
        this.logger?.error(`targetQuery failed [${moduleUrl}]`)
        throw `targetQuery failed [${moduleUrl}] [${result.status}]`
      }
      return result.data?.data
    } catch (ex) {
      const error = ex as AxiosError
      this.logger?.error(`Error: ${toJsonString(error)}`)
      throw error
    }
  }

  override async startHandler(): Promise<boolean> {
    // eslint-disable-next-line deprecation/deprecation
    const { discoverRoot = true, legacyMode } = this.config
    if (discoverRoot || legacyMode) {
      await this.discoverRoots()
    }
    return true
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  private async getRootState() {
    const queryPayload: ModuleStateQuery = { schema: ModuleStateQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    try {
      const response = await this.axios.post<ApiEnvelope<ModuleQueryResult>>(this.nodeUrl.toString(), boundQuery)
      if (response.status === 404) {
        return []
      }
      const [, payloads, errors] = response.data.data
      if (errors.length > 0) {
        throw new Error(`getRootState failed: ${JSON.stringify(errors, null, 2)}`)
      }
      return payloads
    } catch (ex) {
      const error = ex as Error
      this.logger?.warn(`Unable to connect to remote node: ${error.message} [${this.nodeUrl}]`)
    }
  }

  private async resolveRootNode(nodeManifest: NodeManifestPayload): Promise<ModuleInstance[]> {
    const rootModule = assertEx(
      await this.resolver.resolve(assertEx(nodeManifest.status?.address, () => 'Root has no address')),
      () => `Root not found [${nodeManifest.status?.address}]`,
    )
    assertEx(rootModule.constructor.name !== 'HttpModuleProxy', () => 'rootModule is not a Wrapper')
    const rootNode = asAttachableNodeInstance(rootModule, 'Root modules is not a node')
    this.logger.debug(`rootNode: ${rootNode.config.name}`)
    this.downResolver.addResolver(rootNode.downResolver as ModuleResolverInstance)
    return [rootNode]
  }
}
