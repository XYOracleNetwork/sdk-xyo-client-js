import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { globallyUnique } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleManifestPayload, NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  duplicateModules,
  ModuleConfig,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
} from '@xyo-network/module-model'
import {
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeConfigSchema,
  NodeDetachQuerySchema,
  NodeModule,
  NodeModuleEventData,
  NodeParams,
  NodeQueries,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export abstract class AbstractNode<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements NodeModule<TParams['config'], TEventData>
{
  static override readonly configSchemas: string[] = [NodeConfigSchema]
  static override readonly uniqueName = globallyUnique('AbstractNode', AbstractNode, 'xyo')

  private readonly isNode = true

  override get queries(): string[] {
    return [NodeAttachQuerySchema, NodeDetachQuerySchema, NodeAttachedQuerySchema, NodeRegisteredQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<NodeQueries['schema'], string> {
    return {
      'network.xyo.query.node.attach': '1/1',
      'network.xyo.query.node.attached': '1/2',
      'network.xyo.query.node.detach': '1/3',
      'network.xyo.query.node.registered': '1/4',
    }
  }

  static isNode(module: unknown) {
    return (module as AbstractNode).isNode
  }

  async attached(): Promise<Address[]> {
    return [
      ...(await this.attachedPublicModules()).map((module) => module.address),
      ...(await this.attachedPrivateModules()).map((module) => module.address),
    ]
  }

  override async manifest(maxDepth = 10, ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    return await this.manifestHandler(maxDepth, ignoreAddresses)
  }

  protected async attachedPrivateModules(maxDepth = 1): Promise<ModuleInstance[]> {
    return (await (this.resolvePrivate('*', { maxDepth }) ?? [])).filter((module) => module.address !== this.address)
  }

  protected async attachedPublicModules(maxDepth = 1): Promise<ModuleInstance[]> {
    return (await (this.downResolver.resolve('*', { direction: 'down', maxDepth }) ?? [])).filter((module) => module.address !== this.address)
  }

  protected override async generateConfigAndAddress(maxDepth = 10): Promise<Payload[]> {
    const childMods = await this.attachedPublicModules(maxDepth)
    //console.log(`childMods: ${toJsonString(childMods)}`)
    const childModAddresses = await Promise.all(
      childMods.map((mod) =>
        new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address, name: mod.config?.name }).build(),
      ),
    )

    return [...(await super.generateConfigAndAddress(maxDepth)), ...childModAddresses]
  }

  protected override async manifestHandler(maxDepth = 10, ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    const manifest: NodeManifestPayload = { ...(await super.manifestHandler(maxDepth, ignoreAddresses)), schema: NodeManifestPayloadSchema }
    const newIgnoreAddresses = [...ignoreAddresses, this.address]

    const notThisModule = (module: ModuleInstance) => module.address !== this.address && !ignoreAddresses.includes(module.address)
    const toManifest = (module: ModuleInstance) => module.manifest(maxDepth - 1, newIgnoreAddresses)

    const publicChildren = await this.resolve('*', { direction: 'down', maxDepth: 1 })
    const publicModules = await Promise.all(publicChildren.filter(notThisModule).map(toManifest))
    if (publicModules.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.public = publicModules
    }

    return manifest
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<NodeQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case NodeAttachQuerySchema: {
        const address = await this.attach(queryPayload.nameOrAddress, queryPayload.external)
        if (address) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeDetachQuerySchema: {
        const address = await this.detach(queryPayload.nameOrAddress)
        if (address) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeAttachedQuerySchema: {
        const addresses = await this.attached()
        for (const address of addresses) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeRegisteredQuerySchema: {
        const addresses = await this.registered()
        for (const address of addresses) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      default: {
        return await super.queryHandler(query, payloads)
      }
    }
    return resultPayloads
  }

  private async resolveAll(all: '*', options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolveAll(filter: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolveAll(id: ModuleIdentifier, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  private async resolveAll(
    idOrFilter: ModuleFilter | ModuleIdentifier,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    if (idOrFilter === '*') {
      return [...(await this.resolvePrivate('*', options)), ...(await super.resolve(idOrFilter, options))].filter(duplicateModules)
    }
    switch (typeof idOrFilter) {
      case 'string': {
        return (await this.resolvePrivate(idOrFilter, options)) ?? (await super.resolve(idOrFilter, options))
      }
      default: {
        return [...(await super.resolve(idOrFilter, options))].filter(duplicateModules)
      }
    }
  }

  abstract attach(id: ModuleIdentifier, external?: boolean): Promisable<Address | undefined>
  abstract detach(id: ModuleIdentifier): Promisable<Address | undefined>
  abstract registered(): Promisable<Address[]>
}
