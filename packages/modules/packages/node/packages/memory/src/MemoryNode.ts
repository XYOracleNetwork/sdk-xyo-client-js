import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { EventListener } from '@xyo-network/module-events'
import {
  AnyConfigSchema,
  AttachableModuleInstance,
  Module,
  ModuleIdentifier,
  ModuleInstance,
  ModuleResolverInstance,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { AbstractNode } from '@xyo-network/node-abstract'
import { AttachableNodeInstance, isNodeModule, NodeConfig, NodeConfigSchema, NodeModuleEventData, NodeParams } from '@xyo-network/node-model'
import { Schema } from '@xyo-network/payload-model'

export type MemoryNodeParams = NodeParams<AnyConfigSchema<NodeConfig>>

export class MemoryNode<TParams extends MemoryNodeParams = MemoryNodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractNode<TParams, TEventData>
  implements AttachableNodeInstance
{
  static override configSchemas: Schema[] = [...super.configSchemas, NodeConfigSchema]
  static override defaultConfigSchema: Schema = NodeConfigSchema

  protected registeredModuleMap: Record<Address, AttachableModuleInstance> = {}

  override async attach(nameOrAddress: ModuleIdentifier, external?: boolean) {
    await this.started('throw')
    const attachedModule = assertEx(
      (await this.attachUsingAddress(nameOrAddress as Address, external)) ?? (await this.attachUsingName(nameOrAddress, external)),
      () => `Unable to locate module [${nameOrAddress}]`,
    )
    return attachedModule
  }

  override async detach(nameOrAddress: ModuleIdentifier) {
    await this.started('throw')
    return (await this.detachUsingAddress(nameOrAddress as Address)) ?? (await this.detachUsingName(nameOrAddress))
  }

  override privateChildren(): Promise<ModuleInstance[]> {
    return this.attachedPrivateModules()
  }

  override publicChildren(): Promise<ModuleInstance[]> {
    return this.attachedPublicModules()
  }

  async register(module: AttachableModuleInstance) {
    await this.started('throw')
    assertEx(!this.registeredModuleMap[module.address], () => `Module already registered at that address[${module.address}][${module.config.schema}]`)
    this.registeredModuleMap[module.address] = module
    const args = { module, name: module.config.name }
    await this.emit('moduleRegistered', args)
  }

  override registered() {
    return (Object.keys(this.registeredModuleMap) as Address[]).map((key) => {
      return key
    })
  }

  registeredModules() {
    return Object.values(this.registeredModuleMap).map((value) => {
      return value
    })
  }

  async unregister(module: ModuleInstance): Promise<ModuleInstance> {
    await this.started('throw')
    await this.detach(module.address)
    delete this.registeredModuleMap[module.address]
    const args = { module, name: module.config.name }
    await this.emit('moduleUnregistered', args)
    return this
  }

  protected async attachUsingAddress(address: Address, external?: boolean) {
    const existingModule = (await this.resolve({ address: [address] })).pop()
    assertEx(!existingModule, () => `Module [${existingModule?.config.name ?? existingModule?.address}] already attached at address [${address}]`)
    const module = this.registeredModuleMap[address]

    if (!module) {
      return
    }

    const notifiedAddresses: string[] = []

    const getModulesToNotifyAbout = async (node: ModuleInstance) => {
      //send attach events for all existing attached modules
      const childModules = await node.resolve('*', { direction: 'down' })
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

    const notificationList = await getModulesToNotifyAbout(module)

    //give it private access
    module.upResolver.addResolver?.(this.privateResolver)

    //give it public access
    module.upResolver.addResolver?.(this.downResolver as CompositeModuleResolver)

    //give it outside access
    module.upResolver.addResolver?.(this.upResolver)

    if (external) {
      //expose it externally
      this.downResolver.addResolver(module.downResolver as ModuleResolverInstance)
    } else {
      this.privateResolver.addResolver(module.downResolver as ModuleResolverInstance)
    }

    module.addParent(this)

    const args = { module, name: module.config.name }
    await this.emit('moduleAttached', args)

    if (isNodeModule(module) && external) {
      const attachedListener: EventListener<TEventData['moduleAttached']> = async (args: TEventData['moduleAttached']) =>
        await this.emit('moduleAttached', args)

      const detachedListener: EventListener<TEventData['moduleDetached']> = async (args: TEventData['moduleDetached']) =>
        await this.emit('moduleDetached', args)

      module.on('moduleAttached', attachedListener)
      module.on('moduleDetached', detachedListener)
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

    return address
  }

  protected async detachUsingAddress(address: Address) {
    const module = this.registeredModuleMap[address]

    if (!module) {
      return
    }

    //remove inside access
    module.upResolver?.removeResolver?.(this.privateResolver)

    //remove outside access
    module.upResolver?.removeResolver?.(this.upResolver)

    //remove external exposure
    this.downResolver.removeResolver(module.downResolver as ModuleResolverInstance)

    module.removeParent(this.address)

    const args = { module, name: module.config.name }
    await this.emit('moduleDetached', args)

    //notify of all sub node children detach
    const notifiedAddresses: string[] = []
    if (isNodeModule(module)) {
      const notifyOfExistingModules = async (node: ModuleInstance) => {
        //send attach events for all existing attached modules
        const childModules = await node.resolve('*', { direction: 'down' })
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
      await notifyOfExistingModules(module)
    }
    return address
  }

  protected override startHandler() {
    return super.startHandler()
  }

  private async attachUsingName(name: string, external?: boolean) {
    const address = this.registeredModuleAddressFromName(name)
    if (address) {
      return await this.attachUsingAddress(address, external)
    }
  }

  private async detachUsingName(name: string) {
    const address = this.registeredModuleAddressFromName(name)
    if (address) {
      return await this.detachUsingAddress(address)
    }
    return
  }

  private registeredModuleAddressFromName(name: string) {
    const address = Object.values(this.registeredModuleMap).find((value) => {
      return value.config.name === name
    })?.address
    return address
  }
}
