import { assertEx } from '@xylabs/assert'
import type { CreatableInstance } from '@xylabs/creatable'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import type { Address } from '@xylabs/hex'
import { asAddress, isAddress } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import { Account } from '@xyo-network/account'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { QuerySendFinishedEventArgs, QuerySendStartedEventArgs } from '@xyo-network/bridge-model'
import type { ModuleManifestPayload, NodeManifestPayload } from '@xyo-network/manifest-model'
import { ModuleManifestPayloadSchema, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  AddressPreviousHashPayload,
  ArchivingModuleConfig,
  AttachableModuleInstance,
  Module,
  ModuleAddressQuery,
  ModuleEventData,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleName,
  ModuleParams,
  ModuleQueryHandlerResult,
  ModuleQueryResult,
  ModuleResolver,
} from '@xyo-network/module-model'
import {
  AddressPreviousHashSchema,
  DeadModuleError,
  ModuleAddressQuerySchema,
  ModuleConfigSchema,
  ModuleManifestQuerySchema,
  ModuleStateQuerySchema,
} from '@xyo-network/module-model'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  ModuleError, Payload, Schema,
} from '@xyo-network/payload-model'
import {
  isPayloadOfSchemaType, isSchema, ModuleErrorSchema,
} from '@xyo-network/payload-model'
import type { QueryPayload } from '@xyo-network/query-payload-plugin'
import { QuerySchema } from '@xyo-network/query-payload-plugin'
import { LRUCache } from 'lru-cache'

import { ModuleProxyResolver } from './ModuleProxyResolver.ts'

export interface ModuleProxyParams extends ModuleParams
{
  account: AccountInstance
  archiving?: ArchivingModuleConfig['archiving'] & { resolveArchivists: () => Promise<ArchivistInstance[]> }
  host: ModuleResolver
  manifest?: ModuleManifestPayload
  moduleAddress: Address
  onQuerySendFinished?: (args: Omit<QuerySendFinishedEventArgs, 'mod'>) => void
  onQuerySendStarted?: (args: Omit<QuerySendStartedEventArgs, 'mod'>) => void
  state?: Payload[]
}

export abstract class AbstractModuleProxy<
  TWrappedModule extends ModuleInstance = ModuleInstance,
  TParams extends ModuleProxyParams = ModuleProxyParams,
>
  extends AbstractModuleInstance<TParams, TWrappedModule['eventData']>
  implements ModuleInstance<TParams, TWrappedModule['eventData']> {
  static readonly requiredQueries: string[] = [ModuleStateQuerySchema]

  protected _config?: TWrappedModule['config']
  protected _publicChildren?: ModuleInstance[]
  protected _state: Payload[] | undefined = undefined
  protected _stateInProcess = false

  private _spamTrap = new LRUCache<string, number>({
    max: 1000, ttl: 1000 * 60, ttlAutopurge: true,
  })

  override get address() {
    return this.params.moduleAddress
  }

  override get archiving(): ArchivingModuleConfig['archiving'] | undefined {
    return this.params?.archiving
  }

  override get config(): TWrappedModule['config'] & { schema: Schema } {
    return { ...this._config, schema: (this._config?.schema ?? ModuleConfigSchema) }
  }

  override get queries(): string[] {
    const queryPayloads = assertEx(this._state, () => 'Module state not found.  Make sure proxy has been started').filter(item =>
      isPayloadOfSchemaType<QueryPayload>(QuerySchema)(item)) as QueryPayload[]
    return queryPayloads.map(payload => payload.query)
  }

  static hasRequiredQueries(mod: Module) {
    return this.missingRequiredQueries(mod).length === 0
  }

  static override isAllowedSchema(schema: Schema): boolean {
    return isSchema(schema)
  }

  static missingRequiredQueries(mod: Module): string[] {
    const moduleQueries = mod.queries
    return (
      this.requiredQueries.map((query) => {
        return moduleQueries.includes(query) ? null : query
      })
    ).filter(exists)
  }

  static override async paramsHandler<T extends AttachableModuleInstance<ModuleParams, ModuleEventData>>(
    inParams?: Partial<T['params']>,
  ): Promise<T['params']> {
    const superParams = await super.paramsHandler(inParams)
    return {
      ...superParams,
      account: (superParams.account === 'random') ? await Account.random() : superParams.account,
      addToResolvers: superParams.addToResolvers ?? true,
    }
  }

  async addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    const result: AddressPreviousHashPayload = assertEx(
      (await this.sendQuery(queryPayload, undefined, this.account)).find(
        isPayloadOfSchemaType<AddressPreviousHashPayload>(AddressPreviousHashSchema),
      ) as AddressPreviousHashPayload,
      () => 'Result did not include correct payload',
    )
    return result
  }

  childAddressByName(name: ModuleName): Address | undefined {
    const nodeManifests = this._state?.filter(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
    const childPairs = nodeManifests?.flatMap(nodeManifest => Object.entries(nodeManifest.status?.children ?? {}) as [Address, ModuleName | null][])
    return asAddress(childPairs?.find(([_, childName]) => childName === name)?.[0])
  }

  async childAddressMap(): Promise<Record<Address, ModuleName | null>> {
    let nodeManifests: NodeManifestPayload[] | undefined
      = isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema)(this.params.manifest) ? [this.params.manifest] : undefined
    const result: Record<Address, ModuleName | null> = {}
    if (nodeManifests === undefined) {
      const state = await this.state()
      nodeManifests = state.filter(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
    }
    for (const manifest of nodeManifests ?? []) {
      const children = manifest.modules?.public ?? []
      for (const child of children) {
        if (typeof child === 'object') {
          const address = child.status?.address
          if (isAddress(address)) {
            result[address] = child.config.name ?? null
          }
        }
      }
    }
    return result
  }

  override async createHandler(): Promise<void> {
    await super.createHandler()
    let manifest: ModuleManifestPayload | NodeManifestPayload | undefined = this.params.manifest
    if (!manifest) {
      const state = await this.state()
      const manifestPayload = state.find(
        payload => isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema)(payload)
          || isPayloadOfSchemaType<ModuleManifestPayload>(ModuleManifestPayloadSchema)(payload),
      )
      manifest = assertEx(manifestPayload, () => "Can't find manifest payload")
    }
    this.setConfig({ ...manifest.config })
    this.downResolver.addResolver(
      new ModuleProxyResolver({
        childAddressMap: await this.childAddressMap(),
        host: this.params.host,
        mod: this,
        moduleIdentifierTransformers: this.params.moduleIdentifierTransformers,
      }),
    )
  }

  override async manifest(maxDepth?: number): Promise<ModuleManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return (await this.sendQuery(queryPayload))[0] as ModuleManifestPayload
  }

  override async moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return (await this.sendQuery(queryPayload)) as AddressPreviousHashPayload[]
  }

  override async previousHash(): Promise<string | undefined> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return ((await this.sendQuery(queryPayload)).pop() as AddressPreviousHashPayload).previousHash
  }

  override async publicChildren() {
    this._publicChildren = this._publicChildren ?? (await super.publicChildren())
    return this._publicChildren
  }

  override async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    this._checkDead()
    return await this.busy(async () => {
      try {
        await this.checkSpam(query)
        if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
          forget(this.storeToArchivists([query, ...(payloads ?? [])]))
        }
        this.params.onQuerySendStarted?.({ payloads, query })
        const result = await this.proxyQueryHandler<T>(query, payloads)
        this.params.onQuerySendFinished?.({
          payloads, query, result, status: 'success',
        })
        if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
          forget(this.storeToArchivists(result.flat()))
        }
        forget(this.emit('moduleQueried', {
          mod: this, payloads, query, result,
        }))
        return result
      } catch (ex) {
        this.params.onQuerySendFinished?.({
          payloads, query, status: 'failure',
        })
        const error = ex as Error
        this._lastError = error
        // this.status = 'dead'
        const deadError = new DeadModuleError(this.address, error)
        const errorPayload: ModuleError = {
          message: deadError.message,
          name: deadError.name,
          schema: ModuleErrorSchema,
        }
        const sourceQuery = assertEx(QueryBoundWitnessWrapper.unwrap(query), () => 'Invalid query')
        return await this.bindQueryResult(sourceQuery, [], undefined, [errorPayload])
      }
    })
  }

  override queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(
    _query: T,
    _payloads?: Payload[],
    _queryConfig?: TWrappedModule['params']['config'],
  ): Promise<ModuleQueryHandlerResult> {
    throw new Error('queryHandler should never be called')
  }

  override async queryable<T extends QueryBoundWitness = QueryBoundWitness>(
    _query: T,
    _payloads?: Payload[],
    _queryConfig?: TWrappedModule['params']['config'],
  ): Promise<boolean> {
    return await Promise.resolve(true)
  }

  override async resolveArchivingArchivists(): Promise<ArchivistInstance[]> {
    return (await this.params.archiving?.resolveArchivists()) ?? []
  }

  setConfig(config: TWrappedModule['params']['config']) {
    this._config = config
  }

  setState(state: Payload[]) {
    this._state = state
  }

  override async state(): Promise<Payload[]> {
    if (this._state === undefined) {
      // temporarily add ModuleStateQuerySchema to the schema list so we can wrap it and get the real query list
      const stateQueryPayload: QueryPayload = { query: ModuleStateQuerySchema, schema: QuerySchema }
      const manifestQueryPayload: QueryPayload = { query: ModuleManifestQuerySchema, schema: QuerySchema }
      this._state = [stateQueryPayload, manifestQueryPayload]
      const wrapper = ModuleWrapper.wrap(this, await Account.random())
      this._state = await wrapper.state()
    }
    return this._state
  }

  protected filterErrors(result: ModuleQueryResult): ModuleError[] {
    const wrapper = BoundWitnessWrapper.wrap(result[0], result[1])
    return wrapper.payloadsBySchema<ModuleError>(ModuleErrorSchema)
  }

  protected override async startHandler(): Promise<void> {
    return await super.startHandler()
  }

  // this checks and warns if we are getting spammed by the same query
  private async checkSpam(query: QueryBoundWitness) {
    const hash = await PayloadBuilder.hash(query)
    const previousCount = this._spamTrap.get(hash) ?? 0
    if (previousCount > 0) {
      this.logger?.warn(`Spam trap triggered for query: ${hash} from ${toJsonString(query.addresses)}`)
    }
    this._spamTrap.set(hash, previousCount + 1)
  }

  abstract proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(_query: T, _payloads?: Payload[]): Promise<ModuleQueryResult>
}
