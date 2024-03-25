import { assertEx } from '@xylabs/assert'
import { Address, asAddress } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { BaseParams, toJsonString } from '@xylabs/object'
import { AccountInstance } from '@xyo-network/account-model'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleManifestPayload, ModuleManifestPayloadSchema, NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModule } from '@xyo-network/module-abstract'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  DeadModuleError,
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
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleName,
  ModuleQueriedEventArgs,
  ModuleQueryHandlerResult,
  ModuleQueryResult,
  ModuleResolver,
  ModuleStateQuerySchema,
} from '@xyo-network/module-model'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { asPayload, isPayloadOfSchemaType, ModuleError, ModuleErrorSchema, Payload, Query, WithMeta } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

import { ModuleProxyResolver } from './ModuleProxyResolver'

export type ModuleProxyParams = BaseParams<{
  account: AccountInstance
  host: ModuleResolver
  moduleAddress: Address
}>

export abstract class AbstractModuleProxy<TParams extends ModuleProxyParams = ModuleProxyParams, TWrappedModule extends Module = Module>
  extends AbstractModule<TWrappedModule['params'], TWrappedModule['eventData']>
  implements ModuleInstance<TWrappedModule['params'], TWrappedModule['eventData']>
{
  static requiredQueries: string[] = [ModuleDiscoverQuerySchema]

  protected _state: Payload[] | undefined = undefined
  protected _stateInProcess = false
  protected readonly proxyParams: TParams

  constructor(params: TParams) {
    super(AbstractModuleProxy.privateConstructorKey, { config: { schema: ModuleConfigSchema } }, params.account)
    this.proxyParams = params
  }

  override get account() {
    return this.proxyParams.account
  }

  override get address() {
    return this.proxyParams.moduleAddress
  }

  override get queries(): string[] {
    const queryPayloads = assertEx(this._state, () => 'Module state not found.  Make sure proxy has been started').filter((item) =>
      isPayloadOfSchemaType<QueryPayload>(QuerySchema)(item),
    ) as QueryPayload[]
    return queryPayloads.map((payload) => payload.query)
  }

  protected override get _queryAccountPaths() {
    return this._baseModuleQueryAccountPaths
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
      () => 'Result did not include correct payload',
    )
  }

  childAddressByName(name: ModuleName): Address | undefined {
    const nodeManifests = this._state?.filter(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
    const childPairs = nodeManifests?.flatMap((nodeManifest) => Object.entries(nodeManifest.status?.children ?? {}) as [Address, ModuleName | null][])
    return asAddress(childPairs?.find(([_, childName]) => childName === name)?.[0])
  }

  async childAddressMap(): Promise<Record<Address, ModuleName | null>> {
    const state = await this.state()
    const result: Record<Address, ModuleName | null> = {}
    const nodeManifests = state.filter(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
    for (const manifest of nodeManifests) {
      const children = manifest.modules?.public ?? []
      for (const child of children) {
        const address = child.status?.address
        if (address) {
          result[address] = child.config.name ?? null
        }
      }
    }
    return result
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

  override async previousHash(): Promise<string | undefined> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return ((await this.sendQuery(queryPayload)).pop() as WithMeta<AddressPreviousHashPayload>).previousHash
  }

  override async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    this._checkDead()
    return await this.busy(async () => {
      try {
        const result = await this.proxyQueryHandler<T>(query, payloads)
        const args: ModuleQueriedEventArgs = { module: this, payloads, query, result }
        await this.emit('moduleQueried', args)
        return result
      } catch (ex) {
        const error = ex as Error
        this._lastError = error
        this.status = 'dead'
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

  override async startHandler(): Promise<boolean> {
    const state = await this.state()
    const manifestPayload = state.find(
      (payload) => isPayloadOfSchemaType(NodeManifestPayloadSchema)(payload) || isPayloadOfSchemaType(ModuleManifestPayloadSchema)(payload),
    ) as ModuleManifestPayload
    const manifest = assertEx(manifestPayload, () => "Can't find manifest payload")
    this.params.config = { ...manifest.config }
    this.downResolver.addResolver(
      new ModuleProxyResolver({ childAddressMap: await this.childAddressMap(), host: this.proxyParams.host, module: this }),
    )
    return await super.startHandler()
  }

  async state(): Promise<Payload[]> {
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

  abstract proxyQueryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult>
}
