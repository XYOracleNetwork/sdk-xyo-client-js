import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
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
import { AttachableNodeInstance, ChildCertificationFields, isNodeModule, NodeConfig, NodeModuleEventData, NodeParams } from '@xyo-network/node-model'

import { Mutex } from 'async-mutex'

export type MemoryNodeParams = NodeParams<AnyConfigSchema<NodeConfig>>

export class MemoryNode<TParams extends MemoryNodeParams = MemoryNodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractNode<TParams, TEventData>
  implements AttachableNodeInstance<TParams, TEventData>
{
  protected registeredModuleMap: Record<Address, AttachableModuleInstance> = {}

  private _attachMutex = new Mutex()

  private _attachedPrivateModules = new Set<Address>()
  private _attachedPublicModules = new Set<Address>()

  async attachHandler(id: ModuleIdentifier, external?: boolean) {
    await this.started('throw')
    const attachedModule = assertEx(
      isAddress(id) ? await this.attachUsingAddress(id as Address, external) : await this.attachUsingName(id, external),
      () => `Unable to locate module [${id}]`,
    )
    return attachedModule
  }

  async certifyHandler(id: ModuleIdentifier): Promise<ChildCertificationFields> {
    const child = (await this.publicChildren()).find((child) => child.modName === id || child.address === id)
    if (child) {
      return { address: child.address, expiration: Date.now() + 1000 * 60 * 10 /* 10 minutes */ }
    }
    throw new Error(`Unable to certify child module [${id}]`)
  }

  async detachHandler(id: ModuleIdentifier) {
    await this.started('throw')
    return isAddress(id) ? await this.detachUsingAddress(id as Address) : await this.detachUsingName(id)
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
    const args = { module, name: module.modName }
    await this.emit('moduleRegistered', args)
  }

  registeredHandler(): Promisable<Address[]> {
    return Promise.resolve(
      (Object.keys(this.registeredModuleMap) as Address[]).map((key) => {
        return key
      }),
    )
  }

  registeredModules(): AttachableModuleInstance[] {
    return Object.values(this.registeredModuleMap).map((value) => {
      return value
    })
  }

  async unregister(module: ModuleInstance): Promise<ModuleInstance> {
    await this.started('throw')
    //try to detach if it is attached
    try {
      await this.detach(module.address)
    } catch {}
    delete this.registeredModuleMap[module.address]
    const args = { module, name: module.modName }
    await this.emit('moduleUnregistered', args)
    return this
  }

  protected async attachUsingAddress(address: Address, external?: boolean) {
    return await this._attachMutex.runExclusive(async () => {
      const existingModule = (await this.resolve({ address: [address] })).pop()
      assertEx(!existingModule, () => `Module [${existingModule?.modName ?? existingModule?.address}] already attached at address [${address}]`)
      const module = assertEx(this.registeredModuleMap[address], () => `No Module Registered at address [${address}]`)

      assertEx(!this._attachedPublicModules.has(module.address), () => `Module [${module.modName}] already attached at [${address}] (public)`)
      assertEx(!this._attachedPrivateModules.has(module.address), () => `Module [${module.modName}] already attached at [${address}] (private)`)

      const notificationList = await this.getModulesToNotifyAbout(module)

      //give it private access
      module.upResolver.addResolver?.(this.privateResolver)

      //give it public access
      module.upResolver.addResolver?.(this.downResolver as CompositeModuleResolver)

      //give it outside access
      module.upResolver.addResolver?.(this.upResolver)

      if (external) {
        //expose it externally
        this._attachedPublicModules.add(module.address)
        this.downResolver.addResolver(module.downResolver as ModuleResolverInstance)
      } else {
        this._attachedPrivateModules.add(module.address)
        this.privateResolver.addResolver(module.downResolver as ModuleResolverInstance)
      }

      module.addParent(this)

      const args = { module, name: module.modName }
      await this.emit('moduleAttached', args)

      if (isNodeModule(module) && external) {
        const attachedListener: EventListener<TEventData['moduleAttached']> = async (args: TEventData['moduleAttached']) =>
          await this.emit('moduleAttached', args)

        const detachedListener: EventListener<TEventData['moduleDetached']> = async (args: TEventData['moduleDetached']) =>
          await this.emit('moduleDetached', args)

        module.on('moduleAttached', attachedListener)
        module.on('moduleDetached', detachedListener)
      }

      await this.notifyOfExistingModulesAttached(notificationList)

      return address
    })
  }

  protected async detachUsingAddress(address: Address) {
    const module = assertEx(this.registeredModuleMap[address], () => `No Module Registered at address [${address}]`)

    const isAttachedPublic = this._attachedPublicModules.has(module.address)
    const isAttachedPrivate = this._attachedPrivateModules.has(module.address)

    assertEx(isAttachedPublic || isAttachedPrivate, () => `Module [${module.modName}] not attached at [${address}]`)

    //remove inside access
    module.upResolver?.removeResolver?.(this.privateResolver)

    //remove outside access
    module.upResolver?.removeResolver?.(this.upResolver)

    //remove external exposure
    this.downResolver.removeResolver(module.downResolver as ModuleResolverInstance)

    module.removeParent(this.address)

    if (isAttachedPublic) {
      this._attachedPublicModules.delete(module.address)
    }

    if (isAttachedPrivate) {
      this._attachedPrivateModules.delete(module.address)
    }

    const args = { module, name: module.modName }
    await this.emit('moduleDetached', args)

    //notify of all sub node children detach
    if (isNodeModule(module)) {
      const notificationList = await this.getModulesToNotifyAbout(module)
      await this.notifyOfExistingModulesDetached(notificationList)
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

  private async getModulesToNotifyAbout(node: ModuleInstance) {
    const notifiedAddresses: string[] = []
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

  private async notifyOfExistingModulesAttached(childModules: Module[]) {
    await Promise.all(
      childModules.map(async (child) => {
        const args = { module: child, name: child.modName }
        await this.emit('moduleAttached', args)
      }),
    )
  }

  private async notifyOfExistingModulesDetached(childModules: Module[]) {
    await Promise.all(
      childModules.map(async (child) => {
        const args = { module: child, name: child.modName }
        await this.emit('moduleDetached', args)
      }),
    )
  }

  private registeredModuleAddressFromName(name: string) {
    const address = Object.values(this.registeredModuleMap).find((value) => {
      return value.modName === name
    })?.address
    return address
  }
}
