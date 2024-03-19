import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address, asAddress, toAddress } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { BaseParams } from '@xylabs/object'
import { PromiseEx } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleManifestPayload, ModuleManifestPayloadSchema, NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { BaseEmitter } from '@xyo-network/module-abstract'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  DeadModuleError,
  isAddressModuleFilter,
  isNameModuleFilter,
  Module,
  ModuleAddressQuery,
  ModuleAddressQuerySchema,
  ModuleConfigSchema,
  ModuleDescribeQuery,
  ModuleDescribeQuerySchema,
  ModuleDescription,
  ModuleDescriptionPayload,
  ModuleDescriptionSchema,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleName,
  ModuleQueryResult,
  ModuleResolver,
  ModuleResolverInstance,
  ModuleStateQuerySchema,
  ModuleStatus,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { asPayload, isPayloadOfSchemaType, ModuleError, ModuleErrorSchema, Payload, Query, WithMeta } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

export type ModuleProxyParams = BaseParams<{
  account: AccountInstance
  host: ModuleResolver
  moduleAddress: Address
}>

export abstract class AbstractModuleProxy<TParams extends ModuleProxyParams = ModuleProxyParams, TWrappedModule extends Module = Module>
  extends BaseEmitter<TWrappedModule['params'], TWrappedModule['eventData']>
  implements ModuleInstance<TWrappedModule['params'], TWrappedModule['eventData']>
{
  static requiredQueries: string[] = [ModuleDiscoverQuerySchema]

  protected _lastError?: Error
  protected _state: Payload[] | undefined = undefined
  protected readonly proxyParams: TParams

  private _downResolver = new CompositeModuleResolver()
  private _status: ModuleStatus = 'proxy'
  private _upResolver = new CompositeModuleResolver()

  constructor(params: TParams) {
    super({ config: { schema: ModuleConfigSchema } })
    this.proxyParams = params
  }

  get account() {
    return this.proxyParams.account
  }

  get address() {
    return this.proxyParams.moduleAddress
  }

  get config() {
    return this.params.config
  }

  get dead() {
    return this.status === 'dead'
  }

  get downResolver(): ModuleResolverInstance {
    return this._downResolver
  }

  get id() {
    return this.config.name ?? this.proxyParams.moduleAddress
  }

  get queries(): string[] {
    const queryPayloads = assertEx(this._state, 'Module state not found.  Make sure proxy has been started').filter((item) =>
      isPayloadOfSchemaType<QueryPayload>(QuerySchema)(item),
    ) as QueryPayload[]
    return queryPayloads.map((payload) => payload.query)
  }

  get status() {
    return this._status
  }

  get upResolver(): ModuleResolverInstance {
    return this._upResolver
  }

  protected set status(value: ModuleStatus) {
    if (this._status !== 'dead') {
      this._status = value
    }
  }

  static hasRequiredQueries(module: Module) {
    return this.missingRequiredQueries(module).length === 0
  }

  static missingRequiredQueries(module: Module): string[] {
    const moduleQueries = module.queries
    return compact(
      this.requiredQueries.map((query) => {
        return moduleQueries.includes(query) ? null : query
      }),
    )
  }

  async addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return assertEx(
      (await this.sendQuery(queryPayload)).find((payload) => payload.schema === AddressPreviousHashSchema) as WithMeta<AddressPreviousHashPayload>,
      'Result did not include correct payload',
    )
  }

  //TODO: Make ModuleDescription into real payload
  async describe(): Promise<ModuleDescription> {
    const queryPayload: ModuleDescribeQuery = { schema: ModuleDescribeQuerySchema }
    const response = (await this.sendQuery(queryPayload)).at(0)
    return assertEx(asPayload<ModuleDescriptionPayload>([ModuleDescriptionSchema])(response), () => `Invalid payload [${response?.schema}]`)
  }

  async discover(): Promise<Payload[]> {
    const queryPayload: ModuleDiscoverQuery = { schema: ModuleDiscoverQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  async manifest(maxDepth?: number): Promise<ModuleManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return (await this.sendQuery(queryPayload))[0] as WithMeta<ModuleManifestPayload>
  }

  async moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return (await this.sendQuery(queryPayload)) as WithMeta<AddressPreviousHashPayload>[]
  }

  async previousHash(): Promise<string | undefined> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return ((await this.sendQuery(queryPayload)).pop() as WithMeta<AddressPreviousHashPayload>).previousHash
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    this._checkDead()
    try {
      return await this.queryHandler<T>(query, payloads)
    } catch (ex) {
      const error = ex as Error
      this._lastError = error
      this.status = 'dead'
      throw new DeadModuleError(this.id, this._lastError)
    }
  }

  queryable<T extends QueryBoundWitness = QueryBoundWitness>(_query: T, _payloads?: Payload[]) {
    return true
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  async resolve(): Promise<ModuleInstance[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<ModuleInstance> | undefined): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter, options?: ModuleFilterOptions<ModuleInstance>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<ModuleInstance>,
  ): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter, options?: ModuleFilterOptions<ModuleInstance>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter?: ModuleIdentifier | ModuleFilter,
    options?: ModuleFilterOptions<ModuleInstance>,
  ): Promise<T | T[] | undefined> {
    if (idOrFilter === '*') {
      throw new Error('Not supported: *')
    }
    if (typeof idOrFilter === 'string') {
      const address = toAddress(this.childAddressByName(idOrFilter) ?? idOrFilter, { prefix: false })
      return address ? await this.proxyParams.host.resolve<T>(address) : undefined
    } else {
      const filter = idOrFilter
      if (isAddressModuleFilter(filter)) {
        return (await Promise.all(filter.address.map((item) => this.resolve<T>(item, options)))).filter(exists)
      } else if (isNameModuleFilter(filter)) {
        return (await Promise.all(filter.name.map((item) => this.resolve<T>(item, options)))).filter(exists)
      }
      throw new Error('Not supported')
    }
  }

  async start(): Promise<boolean> {
    const state = await this.state()
    const manifestPayload = state.find(
      (payload) => isPayloadOfSchemaType(NodeManifestPayloadSchema)(payload) || isPayloadOfSchemaType(ModuleManifestPayloadSchema)(payload),
    ) as ModuleManifestPayload
    const manifest = assertEx(manifestPayload, "Can't find manifest payload")
    this.params.config = { ...manifest.config }
    return true
  }

  async state(): Promise<Payload[]> {
    if (this._state === undefined) {
      //temporarily add ModuleStateQuerySchema to the schema list so we can wrap it and get the real query list
      const queryPayload: QueryPayload = { query: ModuleStateQuerySchema, schema: QuerySchema }
      this._state = [queryPayload]
      const wrapper = ModuleWrapper.wrap(this, this.account)
      this._state = await wrapper.state()
    }
    return this._state
  }

  protected _checkDead() {
    if (this.dead) {
      throw new DeadModuleError(this.id, this._lastError)
    }
  }

  protected bindQuery<T extends Query>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance | undefined = this.account,
  ): PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const promise = new PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance>(async (resolve) => {
      const result = await this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected async bindQueryInternal<T extends Query>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance | undefined = this.account,
  ): Promise<[QueryBoundWitness, Payload[], ModuleError[]]> {
    const builder = await new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected childAddressByName(name: ModuleName): Address | undefined {
    const nodeManifests = this._state?.filter(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
    const children = nodeManifests?.flatMap((nodeManifest) => nodeManifest.modules?.public).filter(exists)
    return asAddress(children?.find((child) => child.config.name === name)?.status?.address)
  }

  protected async filterErrors(result: ModuleQueryResult): Promise<ModuleError[]> {
    const wrapper = await BoundWitnessWrapper.wrap(result[0], result[1])
    return wrapper.payloadsBySchema<WithMeta<ModuleError>>(ModuleErrorSchema)
  }

  protected async sendQuery<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
  ): Promise<WithMeta<R>[]> {
    // Bind them
    const query = await this.bindQuery(queryPayload, payloads)

    // Send them off
    const [, resultPayloads, errors] = await this.query(query[0], query[1])

    /* TODO: Figure out what to do with the returning BW.  Should we store them in a queue in case the caller wants to see them? */

    if (errors && errors.length > 0) {
      /* TODO: Figure out how to rollup multiple Errors */
      throw errors[0]
    }

    return resultPayloads as WithMeta<R>[]
  }

  abstract queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult>
}
