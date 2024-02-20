import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import {
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeInstance,
  BridgeModule,
  BridgeQuery,
  isBridgeInstance,
  isBridgeModule,
} from '@xyo-network/bridge-model'
import { ModuleManifestPayload, ModuleManifestPayloadSchema, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import { isPayloadOfSchemaType, Payload, Query } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class BridgeWrapper<TWrappedModule extends BridgeModule = BridgeModule>
  extends ModuleWrapper<TWrappedModule>
  implements BridgeInstance<TWrappedModule['params']>
{
  static override instanceIdentityCheck = isBridgeInstance
  static override moduleIdentityCheck = isBridgeModule

  get connected(): boolean {
    throw new Error('Not supported')
  }

  get targetDownResolver() {
    return this.module.targetDownResolver
  }

  async connect(uri?: string): Promise<boolean> {
    const queryPayload: BridgeQuery = { schema: BridgeConnectQuerySchema, uri }
    await this.sendQuery(queryPayload)
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const queryPayload: BridgeQuery = { schema: BridgeDisconnectQuerySchema, uri }
    await this.sendQuery(queryPayload)
    return true
  }

  getRootAddress(): Promisable<Address> {
    throw new Error('Method not implemented.')
  }

  targetConfig(address: Address): ModuleConfig {
    return this.module.targetConfig(address)
  }

  async targetDiscover(address: Address): Promise<Payload[]> {
    const queryPayload: ModuleDiscoverQuery = { schema: ModuleDiscoverQuerySchema }
    return await this.sendTargetQuery(address, queryPayload)
  }

  async targetManifest(address: Address, maxDepth?: number): Promise<ModuleManifestPayload> {
    const queryPayload: ModuleManifestQuery = { maxDepth, schema: ModuleManifestQuerySchema }
    return assertEx(
      (await this.sendTargetQuery(address, queryPayload)).find(
        isPayloadOfSchemaType(ModuleManifestPayloadSchema) || isPayloadOfSchemaType(NodeManifestPayloadSchema),
      ),
    ) as ModuleManifestPayload
  }

  targetQueries(address: Address): string[] {
    return this.module.targetQueries(address)
  }

  async targetQuery<T extends QueryBoundWitness = QueryBoundWitness>(address: Address, query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.module.targetQuery(address, query, payloads)
  }

  async targetQueryable(address: Address, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): Promise<boolean> {
    return await this.module.targetQueryable(address, query, payloads, queryConfig)
  }

  async targetResolve(address: Address, filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  async targetResolve(address: Address, nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  async targetResolve(
    address: Address,
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<Promisable<ModuleInstance | ModuleInstance[] | undefined>> {
    return await this.module.targetResolve(address, nameOrAddressOrFilter, options)
  }

  protected async sendTargetQuery<T extends Query>(address: Address, queryPayload: T, payloads?: Payload[]): Promise<Payload[]> {
    const query = await this.bindQuery(queryPayload, payloads)
    const [, resultPayloads, errors] = await this.module.targetQuery(address, query[0], query[1])
    //TODO: figure out a rollup error solution
    if (errors?.length > 0) {
      throw errors[0]
    }
    return resultPayloads
  }
}
