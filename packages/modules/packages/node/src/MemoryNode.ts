import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled, rejected } from '@xylabs/promise'
import { AnyConfigSchema, duplicateModules, EventListener, Module, ModuleFilter, ModuleWrapper } from '@xyo-network/module'
import compact from 'lodash/compact'

import { AbstractNode } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'
import { NodeModule, NodeModuleParams } from './Node'
import { NodeWrapper } from './NodeWrapper'

export type MemoryNodeParams = NodeModuleParams<AnyConfigSchema<NodeConfig>>

export class MemoryNode<TParams extends MemoryNodeParams = MemoryNodeParams>
  extends AbstractNode<TParams>
  implements NodeModule<TParams>, NodeModule
{
  static override configSchema = NodeConfigSchema

  private registeredModuleMap: Record<string, Module> = {}

  static override async create<TParams extends MemoryNodeParams>(params?: TParams) {
    return (await super.create(params)) as MemoryNode
  }

  override async attach(address: string, external?: boolean) {
    const existingModule = (await this.resolve({ address: [address] })).pop()
    assertEx(!existingModule, `Module [${existingModule?.config.name ?? existingModule?.address}] already attached at address [${address}]`)
    const module = assertEx(this.registeredModuleMap[address], 'No module registered at that address')

    const wrapper = ModuleWrapper.wrap(module)
    const notifiedAddresses: string[] = []

    const getModulesToNotifyAbout = async (node: ModuleWrapper) => {
      //send attach events for all existing attached modules
      const childModules = await node.resolve()
      return compact(
        childModules.map((child) => {
          //don't report self
          if (node.address === child.address) {
            return
          }

          //prevent loop
          if (notifiedAddresses.includes(child.address)) {
            return
          }

          notifiedAddresses.push(child.address)

          return child
        }),
      )
    }

    const notificationList = await getModulesToNotifyAbout(wrapper)

    this.privateResolver.addResolver(module.downResolver)

    //give it inside access
    module.upResolver.addResolver?.(this.privateResolver)

    //give it outside access
    module.upResolver.addResolver?.(this.upResolver)

    if (external) {
      //expose it externally
      this.downResolver.addResolver(module.downResolver)
    }

    const args = { module, name: module.config.name }
    await this.emit('moduleAttached', args)

    if (NodeWrapper.isNodeModule(module)) {
      if (external) {
        const wrappedAsNode = NodeWrapper.wrap(module as NodeModule)

        const attachedListener: EventListener<TParams['eventData']> = async (args: TParams['eventData']['moduleAttached']) =>
          await this.emit('moduleAttached', args)

        const detachedListener: EventListener<TParams['eventData']> = async (args: TParams['eventData']['moduleDetached']) =>
          await this.emit('moduleDetached', args)

        wrappedAsNode.on('moduleAttached', attachedListener)
        wrappedAsNode.on('moduleDetached', detachedListener)
      }
    }

    const notifyOfExistingModules = async (childModules: Module[]) => {
      await Promise.all(
        childModules.map(async (child) => {
          const args = { module: child, name: child.config.name }
          await this.emit('moduleAttached', args)
        }),
      )
    }

    await notifyOfExistingModules(notificationList)
  }

  override async detach(address: string) {
    const module = assertEx(this.registeredModuleMap[address], 'No module found at that address')

    this.privateResolver.removeResolver(module.downResolver)

    //remove inside access
    module.upResolver?.removeResolver?.(this.privateResolver)

    //remove outside access
    module.upResolver?.removeResolver?.(this.upResolver)

    //remove external exposure
    this.downResolver.removeResolver(module.downResolver)

    const args = { module, name: module.config.name }
    await this.emit('moduleDetached', args)

    //notify of all sub node children detach
    const wrapper = ModuleWrapper.tryWrap(module as NodeModule)
    const notifiedAddresses: string[] = []
    if (wrapper) {
      const notifyOfExistingModules = async (node: ModuleWrapper) => {
        //send attach events for all existing attached modules
        const childModules = await node.resolve()
        await Promise.all(
          childModules.map(async (child) => {
            //don't report self
            if (node.address === child.address) {
              return
            }

            //prevent loop
            if (notifiedAddresses.includes(child.address)) {
              return
            }
            notifiedAddresses.push(child.address)
            await this.emit('moduleDetached', { module: child })
          }),
        )
      }
      await notifyOfExistingModules(wrapper)
    }
  }

  override register(module: Module) {
    assertEx(!this.registeredModuleMap[module.address], `Module already registered at that address[${module.address}]`)
    this.registeredModuleMap[module.address] = module
    return this
  }

  override registered() {
    return Object.keys(this.registeredModuleMap).map((key) => {
      return key
    })
  }

  override registeredModules() {
    return Object.values(this.registeredModuleMap).map((value) => {
      return value
    })
  }

  override async unregister(module: Module) {
    await this.detach(module.address)
    delete this.registeredModuleMap[module.address]
    return this
  }

  protected override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    const internal: Promise<TModule[]> = this.privateResolver.resolve<TModule>(filter)
    const up: Promise<TModule[]> = this.upResolver?.resolve<TModule>(filter) || []
    const down: Promise<TModule[]> = this.downResolver?.resolve<TModule>(filter) || []
    const resolved = await Promise.allSettled([internal, up, down])

    const errors = resolved.filter(rejected).map((r) => Error(r.reason))

    if (errors.length) {
      this.logger?.error(`Resolve Errors: ${JSON.stringify(errors, null, 2)}`)
    }

    return resolved
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
      .filter(exists)
      .filter(duplicateModules)
  }
}
