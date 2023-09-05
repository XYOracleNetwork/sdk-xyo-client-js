import { assertEx } from '@xylabs/assert'
import { AnyConfigSchema, CompositeModuleResolver, EventListener, Module, ModuleInstance, ModuleResolver } from '@xyo-network/module'
import { AbstractNode } from '@xyo-network/node-abstract'
import { isNodeModule, NodeConfig, NodeConfigSchema, NodeInstance, NodeModuleEventData, NodeModuleParams } from '@xyo-network/node-model'
import compact from 'lodash/compact'

export type MemoryNodeParams = NodeModuleParams<AnyConfigSchema<NodeConfig>>

export class MemoryNode<TParams extends MemoryNodeParams = MemoryNodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractNode<TParams, TEventData>
  implements NodeInstance
{
  static override configSchemas = [NodeConfigSchema]

  private registeredModuleMap: Record<string, ModuleInstance> = {}

  override async attach(nameOrAddress: string, external?: boolean) {
    await this.started('throw')
    return (await this.attachUsingAddress(nameOrAddress, external)) ?? (await this.attachUsingName(nameOrAddress, external))
  }

  override async detach(nameOrAddress: string) {
    await this.started('throw')
    return (await this.detachUsingAddress(nameOrAddress)) ?? (await this.detachUsingName(nameOrAddress))
  }

  override async register(module: ModuleInstance) {
    await this.started('throw')
    assertEx(!this.registeredModuleMap[module.address], `Module already registered at that address[${module.address}][${module.config.schema}]`)
    this.registeredModuleMap[module.address] = module
    const args = { module, name: module.config.name }
    await this.emit('moduleRegistered', args)
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

  override async unregister(module: ModuleInstance) {
    await this.started('throw')
    await this.detach(module.address)
    delete this.registeredModuleMap[module.address]
    const args = { module, name: module.config.name }
    await this.emit('moduleUnregistered', args)
    return this
  }

  protected override startHandler() {
    return super.startHandler()
  }

  private async attachUsingAddress(address: string, external?: boolean) {
    const existingModule = (await this.resolve({ address: [address] })).pop()
    assertEx(!existingModule, `Module [${existingModule?.config.name ?? existingModule?.address}] already attached at address [${address}]`)
    const module = this.registeredModuleMap[address]

    if (!module) {
      return
    }

    const notifiedAddresses: string[] = []

    const getModulesToNotifyAbout = async (node: ModuleInstance) => {
      //send attach events for all existing attached modules
      const childModules = await node.resolve(undefined, { direction: 'down' })
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
      this.downResolver.addResolver(module.downResolver as ModuleResolver)
    } else {
      this.privateResolver.addResolver(module.downResolver as ModuleResolver)
    }

    const args = { module, name: module.config.name }
    await this.emit('moduleAttached', args)

    if (isNodeModule(module)) {
      if (external) {
        const attachedListener: EventListener<TEventData['moduleAttached']> = async (args: TEventData['moduleAttached']) =>
          await this.emit('moduleAttached', args)

        const detachedListener: EventListener<TEventData['moduleDetached']> = async (args: TEventData['moduleDetached']) =>
          await this.emit('moduleDetached', args)

        module.on('moduleAttached', attachedListener)
        module.on('moduleDetached', detachedListener)
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

    return address
  }

  private async attachUsingName(name: string, external?: boolean) {
    const address = this.moduleAddressFromName(name)
    if (address) {
      return await this.attachUsingAddress(address, external)
    }
  }

  private async detachUsingAddress(address: string) {
    const module = this.registeredModuleMap[address]

    if (!module) {
      return
    }

    //remove inside access
    module.upResolver?.removeResolver?.(this.privateResolver)

    //remove outside access
    module.upResolver?.removeResolver?.(this.upResolver)

    //remove external exposure
    this.downResolver.removeResolver(module.downResolver as ModuleResolver)

    const args = { module, name: module.config.name }
    await this.emit('moduleDetached', args)

    //notify of all sub node children detach
    const notifiedAddresses: string[] = []
    if (isNodeModule(module)) {
      const notifyOfExistingModules = async (node: ModuleInstance) => {
        //send attach events for all existing attached modules
        const childModules = await node.resolve(undefined, { direction: 'down' })
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

  private async detachUsingName(name: string) {
    const address = this.moduleAddressFromName(name)
    if (address) {
      return await this.detachUsingAddress(address)
    }
    return
  }

  private moduleAddressFromName(name: string) {
    const address = Object.values(this.registeredModuleMap).find((value) => {
      return value.config.name === name
    }, undefined)?.address
    return address
  }
}
