import { assertEx } from '@xylabs/assert'
import { forget } from '@xylabs/forget'
import { Address, asAddress } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { toJsonString } from '@xylabs/object'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { QuerySendFinishedEventArgs, QuerySendStartedEventArgs } from '@xyo-network/bridge-model'
import { ModuleManifestPayload, ModuleManifestPayloadSchema, NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  ArchivingModuleConfig,
  DeadModuleError,
  Module,
  ModuleAddressQuery,
  ModuleAddressQuerySchema,
  ModuleConfigSchema,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleName,
  ModuleParams,
  ModuleQueryHandlerResult,
  ModuleQueryResult,
  ModuleResolver,
  ModuleStateQuerySchema,
} from '@xyo-network/module-model'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, ModuleError, ModuleErrorSchema, Payload, WithMeta } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { LRUCache } from 'lru-cache'

import { ModuleProxyResolver } from './ModuleProxyResolver.ts'

export type ModuleProxyParams = ModuleParams<
  {
    schema: ModuleConfigSchema
  },
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
>

export abstract class AbstractModuleProxy<
    TWrappedModule extends ModuleInstance = ModuleInstance,
    TParams extends Omit<ModuleProxyParams, 'config'> & { config: TWrappedModule['config'] } = Omit<ModuleProxyParams, 'config'> & {
      config: TWrappedModule['config']
    },
  >
  extends AbstractModuleInstance<TParams, TWrappedModule['eventData']>
  implements ModuleInstance<TParams, TWrappedModule['eventData']>
{
  static requiredQueries: string[] = [ModuleStateQuerySchema]

  protected _config?: ModuleInstance['config']
  protected _publicChildren?: ModuleInstance[]
  protected _state: Payload[] | undefined = undefined
  protected _stateInProcess = false

  private _spamTrap = new LRUCache<string, number>({ max: 1000, ttl: 1000 * 60, ttlAutopurge: true })

  constructor(params: TParams) {
    params.addToResolvers = false
    super(AbstractModuleProxy.privateConstructorKey, params, params.account)
  }

  override get address() {
    return this.params.moduleAddress
  }

  override get archiving(): ArchivingModuleConfig['archiving'] | undefined {
    return this.params?.archiving
  }

  override get config() {
    return assertEx(this._config, () => 'Config not set')
  }

  override get queries(): string[] {
    const queryPayloads = assertEx(this._state, () => 'Module state not found.  Make sure proxy has been started').filter((item) =>
      isPayloadOfSchemaType<QueryPayload>(QuerySchema)(item),
    ) as QueryPayload[]
    return queryPayloads.map((payload) => payload.query)
  }

  static hasRequiredQueries(mod: Module) {
    return this.missingRequiredQueries(mod).length === 0
  }

  static missingRequiredQueries(mod: Module): string[] {
    const moduleQueries = mod.queries
    return compact(
      this.requiredQueries.map((query) => {
        return moduleQueries.includes(query) ? null : query
      }),
    )
  }

  async addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    const result: AddressPreviousHashPayload = assertEx(
      (await this.sendQuery(queryPayload, undefined, this.account)).find(
        isPayloadOfSchemaType<AddressPreviousHashPayload>(AddressPreviousHashSchema),
      ) as WithMeta<AddressPreviousHashPayload>,
      () => 'Result did not include correct payload',
    )
    return result
  }

  childAddressByName(name: ModuleName): Address | undefined {
    const nodeManifests = this._state?.filter(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
    const childPairs = nodeManifests?.flatMap((nodeManifest) => Object.entries(nodeManifest.status?.children ?? {}) as [Address, ModuleName | null][])
    return asAddress(childPairs?.find(([_, childName]) => childName === name)?.[0])
  }

  async childAddressMap(): Promise<Record<Address, ModuleName | null>> {
    let nodeManifests: NodeManifestPayload[] | undefined =
      isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema)(this.params.manifest) ? [this.params.manifest] : undefined
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
          if (address) {
            result[address] = child.config.name ?? null
          }
        }
      }
    }
    return result
  }

  override async manifest(maxDepth?: number): Promise<ModuleManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return (await this.sendQuery(queryPayload))[0] as WithMeta<ModuleManifestPayload>
  }

  override async moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return (await this.sendQuery(queryPayload)) as WithMeta<AddressPreviousHashPayload>[]
  }

  override async previousHash(): Promise<string | undefined> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return ((await this.sendQuery(queryPayload)).pop() as WithMeta<AddressPreviousHashPayload>).previousHash
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
        this.params.onQuerySendFinished?.({ payloads, query, result, status: 'success' })
        if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
          forget(this.storeToArchivists(result.flat()))
        }
        forget(this.emit('moduleQueried', { mod: this, payloads, query, result }))
        return result
      } catch (ex) {
        this.params.onQuerySendFinished?.({ payloads, query, status: 'failure' })
        const error = ex as Error
        this._lastError = error
        //this.status = 'dead'
        const deadError = new DeadModuleError(this.address, error)
        const errorPayload: ModuleError = {
          message: deadError.message,
          name: deadError.name,
          schema: ModuleErrorSchema,
        }
        const sourceQuery = await PayloadBuilder.build(assertEx(QueryBoundWitnessWrapper.unwrap(query), () => 'Invalid query'))
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

  override async startHandler(): Promise<boolean> {
    let manifest: ModuleManifestPayload | undefined = this.params.manifest
    if (!manifest) {
      const state = await this.state()
      const manifestPayload = state.find(
        (payload) => isPayloadOfSchemaType(NodeManifestPayloadSchema)(payload) || isPayloadOfSchemaType(ModuleManifestPayloadSchema)(payload),
      ) as ModuleManifestPayload
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
    return await super.startHandler()
  }

  override async state(): Promise<Payload[]> {
    if (this._state === undefined) {
      //temporarily add ModuleStateQuerySchema to the schema list so we can wrap it and get the real query list
      const stateQueryPayload: QueryPayload = { query: ModuleStateQuerySchema, schema: QuerySchema }
      const manifestQueryPayload: QueryPayload = { query: ModuleManifestQuerySchema, schema: QuerySchema }
      this._state = [stateQueryPayload, manifestQueryPayload]
      const wrapper = ModuleWrapper.wrap(this, this.account)
      this._state = await wrapper.state()
    }
    return this._state
  }

  protected async filterErrors(result: ModuleQueryResult): Promise<ModuleError[]> {
    const wrapper = await BoundWitnessWrapper.wrap(result[0], result[1])
    return wrapper.payloadsBySchema<WithMeta<ModuleError>>(ModuleErrorSchema)
  }

  //this checks and warns if we are getting spammed by the same query
  private async checkSpam(query: QueryBoundWitness) {
    const hash = await PayloadBuilder.hash(query)
    const previousCount = this._spamTrap.get(hash) ?? 0
    if (previousCount > 0) {
      this.logger?.warn(`Spam trap triggered for query: ${hash} from ${toJsonString(query.addresses)}`)
    }
    this._spamTrap.set(hash, previousCount + 1)
  }

  abstract proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult>
}
