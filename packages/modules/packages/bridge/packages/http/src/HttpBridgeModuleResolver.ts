import { AxiosJson } from '@xylabs/axios'
import { Address } from '@xylabs/hex'
import { AbstractBridgeModuleResolver, BridgeModuleResolverOptions, wrapModuleWithType } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import { ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { HttpModuleProxy, HttpModuleProxyParams } from './ModuleProxy'

export interface HttpBridgeModuleResolverOptions extends BridgeModuleResolverOptions {
  rootUrl: string
}

export class HttpBridgeModuleResolver<
  T extends HttpBridgeModuleResolverOptions = HttpBridgeModuleResolverOptions,
> extends AbstractBridgeModuleResolver<T> {
  private _axios?: AxiosJson

  get axios() {
    this._axios = this._axios ?? new AxiosJson()
    return this._axios
  }

  moduleUrl(address: Address) {
    return new URL(address, this.options.rootUrl)
  }

  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const parentResult = await super.resolveHandler(id, options)
    if (parentResult) {
      return parentResult
    }
    const idParts = id.split(':')
    const firstPart = idParts.shift()
    const remainderParts = idParts.join(':')
    const params: HttpModuleProxyParams = {
      account: Account.randomSync(),
      axios: this.axios,
      host: this.options.bridge,
      moduleAddress: firstPart as Address,
      moduleUrl: this.moduleUrl(id as Address).href,
    }
    const proxy = new HttpModuleProxy<T>(params)
    //calling state here to get the config
    const state = await proxy.state()
    const manifest = state.find((payload) => isPayloadOfSchemaType(ModuleManifestPayloadSchema)(payload)) as ModuleManifestPayload | undefined
    if (manifest) {
      proxy.setConfig(manifest.config)
    }
    if (remainderParts.length > 0) {
      const result = await proxy.resolve<T>(remainderParts, options)
      if (result) {
        return wrapModuleWithType(result, Account.randomSync()) as unknown as T
      }
    }
    return wrapModuleWithType(proxy, Account.randomSync()) as unknown as T
  }
}
