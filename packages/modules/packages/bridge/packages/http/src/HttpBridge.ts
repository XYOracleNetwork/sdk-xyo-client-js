import { assertEx } from '@xylabs/assert'
import { AxiosJson } from '@xylabs/axios'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ApiEnvelope } from '@xyo-network/api-models'
import { BridgeExposeOptions, BridgeModule, BridgeParams, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AnyConfigSchema,
  creatableModule,
  ModuleEventData,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryResult,
  ModuleStateQuery,
  ModuleStateQuerySchema,
} from '@xyo-network/module-model'
import { isNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType, WithMeta } from '@xyo-network/payload-model'

import { HttpBridgeConfig, HttpBridgeConfigSchema } from './HttpBridgeConfig'
import { HttpModuleProxy, HttpModuleProxyParams } from './ModuleProxy'

export type HttpBridgeParams<TConfig extends AnyConfigSchema<HttpBridgeConfig> = AnyConfigSchema<HttpBridgeConfig>> = BridgeParams<TConfig>

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [HttpBridgeConfigSchema]
  static maxPayloadSizeWarning = 256 * 256

  private _axios?: AxiosJson

  get axios() {
    this._axios = this._axios ?? new AxiosJson()
    return this._axios
  }

  get legacyMode() {
    // eslint-disable-next-line deprecation/deprecation
    const result = !!this.config.legacyMode
    if (result) {
      console.warn(`Running in legacy bridge mode [${this.config.name ?? this.address}]`)
    }
    return result
  }

  get nodeUrl() {
    return assertEx(this.config.nodeUrl, 'No Url Set')
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<Lowercase<string>[]> {
    throw new Error('Unsupported')
  }

  moduleUrl(address: Address) {
    return new URL(address, this.nodeUrl)
  }

  resolveHandler<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, _options?: ModuleFilterOptions<T>): Promisable<T | undefined> {
    const params: HttpModuleProxyParams = {
      account: Account.randomSync(),
      axios: this.axios,
      bridge: this,
      moduleAddress: id as Address,
      moduleUrl: this.moduleUrl(id as Address).href,
    }
    return new HttpModuleProxy<T>(params) as unknown as T
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<Lowercase<string>[]> {
    throw new Error('Unsupported')
  }

  protected override async startHandler(): Promise<boolean> {
    if (this.legacyMode) {
      await this.legacyDiscover()
    }
    return true
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

  private async legacyDiscover() {
    const state = await this.getRootState()
    const nodeManifest = state?.find(isPayloadOfSchemaType<WithMeta<NodeManifestPayload>>(NodeManifestPayloadSchema))
    if (nodeManifest) {
      const modules = await this.legacyResolveNode(nodeManifest)
      for (const mod of modules) {
        this.downResolver.add(mod)
      }
      return modules
    }
    return []
  }

  private async legacyResolveNode(nodeManifest: NodeManifestPayload): Promise<ModuleInstance[]> {
    const children: ModuleInstance[] = (
      await Promise.all(
        (nodeManifest.modules?.public ?? []).map((childManifest) => this.resolve(assertEx(childManifest.status?.address, 'Child has no address'))),
      )
    ).filter(exists)
    const childNodes = children.filter((mod) => isNodeInstance(mod))
    const grandChildren = (
      await Promise.all(
        childNodes.map(async (node) => {
          const state = await node.state()
          const nodeManifest = state?.find(isPayloadOfSchemaType<WithMeta<NodeManifestPayload>>(NodeManifestPayloadSchema))
          return nodeManifest ? await this.legacyResolveNode(nodeManifest) : []
        }),
      )
    ).flat()
    return [...children, ...grandChildren]
  }
}
