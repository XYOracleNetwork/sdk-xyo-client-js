/* eslint-disable max-statements */
import { delay } from '@xylabs/delay'
import { Account, HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { AttachableArchivistInstance } from '@xyo-network/archivist-model'
import { AttachableModuleInstance, Module, ModuleDescription, ModuleDescriptionPayload, ModuleDescriptionSchema } from '@xyo-network/module-model'
import { MemoryNode, NodeHelper } from '@xyo-network/node-memory'
import { ModuleAttachedEventArgs, NodeConfigSchema } from '@xyo-network/node-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload'

/**
 * @group node
 * @group module
 */

describe('MemoryNode', () => {
  let testAccount1: AccountInstance
  let testAccount2: AccountInstance
  let testAccount3: AccountInstance
  let testAccount4: AccountInstance
  const archivistConfig = { schema: MemoryArchivist.configSchema }
  const nodeConfig = { schema: NodeConfigSchema }
  let node: MemoryNode
  beforeAll(async () => {
    testAccount1 = await HDWallet.fromPhrase('cushion student broken thing poet mistake item dutch traffic gloom awful still')
    testAccount2 = await HDWallet.fromPhrase('siren tenant achieve enough tone roof album champion tiny civil lottery hundred')
    testAccount3 = await HDWallet.fromPhrase('person wheat floor tumble pond develop sauce attract neither toilet build enrich')
    testAccount4 = await HDWallet.fromPhrase('kit sound script century margin into guilt region engine garment lab rifle')
    //jest.spyOn(console, 'log').mockImplementation(() => {
    // Stop expected logs from being generated during tests
    //})
  })
  beforeEach(async () => {
    const nodeModule = await MemoryNode.create({ account: testAccount1, config: nodeConfig })
    node = nodeModule
  })
  describe('create', () => {
    /*describe('with autoAttachExternallyResolved true', () => {
      it('attaches external modules to internal resolver', async () => {
        // Arrange
        // Create a MemoryNode with no modules in the internal
        // resolver and one module in the external resolver
        const resolver = new CompositeModuleResolver({})
        const internalResolver = new CompositeModuleResolver({})
        const params: MemoryNodeParams = {
          config: { schema: NodeConfigSchema },
          internalResolver,
          resolver,
        }
        const module = await MemoryArchivist.create()
        const filter = { address: [module.address] }
        resolver.add(module)
        // No modules exist in internal resolver
        expect(await internalResolver.resolve(filter)).toBeArrayOfSize(0)
        // Module exists in external resolver
        expect(await resolver.resolve(filter)).toBeArrayOfSize(1)
        const node = await MemoryNode.create(params)
        // No modules are attached
        expect(await node.attached()).toBeArrayOfSize(0)

        // Act
        // Query for unattached module (by address) that exists in
        // external resolver
        expect(await node.resolve(filter)).toBeArrayOfSize(1)

        // Assert
        // Module is now attached
        expect(await node.attached()).toBeArrayOfSize(1)
        // Module exists in internal resolver
        expect(await internalResolver.resolve(filter)).toBeArrayOfSize(1)
        // Module still exists in external resolver
        expect(await resolver.resolve(filter)).toBeArrayOfSize(1)
      })
    })*/
  })
  describe('register', () => {
    it('registers module', async () => {
      const module = await MemoryArchivist.create({ account: Account.randomSync() })
      await node.register(module)
    })
  })
  describe('registered', () => {
    describe('with no modules registered', () => {
      it('returns empty array', () => {
        const result = node.registered()
        expect(result).toBeArrayOfSize(0)
      })
    })
    describe('with modules registered', () => {
      let module: AttachableModuleInstance
      beforeEach(async () => {
        module = await MemoryArchivist.create({ account: Account.randomSync() })
        await node.register(module)
      })
      it('lists addresses of registered modules', () => {
        const result = node.registered()
        expect(result).toBeArrayOfSize(1)
        expect(result).toEqual([module.address])
      })
    })
  })
  describe('attach', () => {
    let module: AttachableModuleInstance
    beforeEach(async () => {
      module = await MemoryArchivist.create({ account: Account.randomSync() })
      await node.register(module)
    })
    it('attaches module', async () => {
      await node.attach(module.address, true)
    })
    it('emits event on module attach', async () => {
      let eventDone = false
      return await new Promise<void>((resolve, reject) => {
        node.on('moduleAttached', (args) => {
          const { module } = args as ModuleAttachedEventArgs
          expect(module).toBeObject()
          expect(module.address).toBe(module.address)
          expect(module).toBe(module)
          eventDone = true
        })
        node
          .attach(module.address, true)
          .then(async () => {
            //wait for up to 5 seconds
            let waitFrames = 50
            while (waitFrames) {
              if (eventDone) {
                resolve()
                return
              }
              await delay(100)
              waitFrames--
            }
            reject('Event not fired [within 5 seconds]')
          })
          .catch(() => {
            reject('Attach failed')
          })
      })
    })
  })
  describe('attached', () => {
    let module: AttachableModuleInstance
    beforeEach(async () => {
      module = await MemoryArchivist.create({ account: Account.randomSync() })
      await node.register(module)
    })
    describe('with no modules attached', () => {
      it('returns empty array', async () => {
        const result = await node.attached()
        expect(result).toBeArrayOfSize(0)
      })
    })
    describe('with modules attached', () => {
      it('lists addresses of attached modules', async () => {
        await node.attach(module.address, true)
        const result = await node.attached()
        expect(result.length).toBe(1)
        expect(result).toEqual([module.address])
      })
    })
  })
  describe('detach', () => {
    let module: AttachableModuleInstance
    beforeEach(async () => {
      module = await MemoryArchivist.create({ account: Account.randomSync() })
      await node.register(module)
      await node.attach(module.address, true)
    })
    it('deregisters existing module', async () => {
      await node.detach(module.address)
    })
    /*it('allows deregistering non-existent module', () => {
      node.detach('4a15a6c96665931b76c1d2a587ea1132dbfdc266')
    })*/
  })
  describe('registeredModules', () => {
    let module: AttachableModuleInstance
    beforeEach(async () => {
      module = await MemoryArchivist.create({ account: Account.randomSync() })
    })
    describe('with no modules registered', () => {
      it('returns empty array', () => {
        const modules = node.registeredModules()
        expect(modules).toBeArrayOfSize(0)
      })
    })
    describe('with modules registered', () => {
      it('returns registered modules', async () => {
        await node.register(module)
        const modules = node.registeredModules()
        expect(modules).toBeArrayOfSize(1)
        expect(modules).toContain(module)
      })
    })
  })
  describe('unregister', () => {
    it('un-registers module', async () => {
      const module = await MemoryArchivist.create({ account: Account.randomSync() })
      await node.register(module)
      expect(node.registeredModules()).toContain(module)
      await node.unregister(module)
      expect(node.registeredModules()).not.toContain(module)
    })
  })
  describe('description', () => {
    const validateModuleDescription = (description?: ModuleDescription) => {
      expect(description).toBeObject()
      expect(description?.address).toBeString()
      expect(description?.queries).toBeArray()
      description?.queries.map((query) => {
        expect(query).toBeString()
      })
    }
    describe('node without child modules', () => {
      it('describes node alone', async () => {
        const description = (await node.state()).find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
        validateModuleDescription(description)
        expect(description?.children).toBeArrayOfSize(0)
      })
      it('serializes to JSON consistently', async () => {
        const description = (await node.state()).find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with child modules', () => {
      beforeEach(async () => {
        const modules = await Promise.all([
          await MemoryArchivist.create({ account: testAccount2, config: { ...archivistConfig, name: 'testAccount2' } }),
          await MemoryArchivist.create({ account: testAccount3, config: { ...archivistConfig, name: 'testAccount3' } }),
        ])
        await Promise.all(
          modules.map(async (mod) => {
            await node.register(mod)
            expect(await node.attach(mod.address, true)).toEqual(mod.address)
            expect(await node.detach(mod.address)).toEqual(mod.address)
            if (mod.config.name) {
              expect(await node.attach(mod.config.name, true)).toEqual(mod.address)
              expect(await node.detach(mod.config.name)).toEqual(mod.address)
            }
            expect(await node.attach(mod.address, true)).toEqual(mod.address)
          }),
        )
      })
      it('describes node and child modules', async () => {
        const description = (await node.state()).find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
        validateModuleDescription(description)
        expect(description?.children).toBeArrayOfSize(2)
        //description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const description = (await node.state()).find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
    })
    describe('node with nested nodes and modules', () => {
      beforeEach(async () => {
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules: AttachableArchivistInstance[] = await Promise.all([
          await MemoryArchivist.create({ account: testAccount3, config: archivistConfig }),
        ])
        await Promise.all(
          nestedModules.map(async (mod) => {
            await nestedNode.register?.(mod)
            await nestedNode.attach(mod.address, true)
          }),
        )
        const rootModules: AttachableModuleInstance[] = await Promise.all([
          await MemoryArchivist.create({ account: testAccount4, config: archivistConfig }),
        ])
        rootModules.push(nestedNode)
        await Promise.all(
          rootModules.map(async (mod) => {
            await node.register(mod)
            await node.attach(mod.address, true)
          }),
        )
      })
      it('describes node and all nested nodes and child modules', async () => {
        const memoryNode = await MemoryNode.create({ account: Account.randomSync() })
        const archivist1 = await MemoryArchivist.create({ account: Account.randomSync() })
        const archivist2 = await MemoryArchivist.create({ account: Account.randomSync() })
        await memoryNode.register(archivist1)
        await memoryNode.attach(archivist1.address, true)
        await memoryNode.register(archivist2)
        await memoryNode.attach(archivist2.address, true)
        console.log('status:', memoryNode.status)
        const description = (await memoryNode.state()).find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
        validateModuleDescription(description)
        expect(description?.children).toBeArrayOfSize(2)
        //description.children?.map(validateModuleDescription)
      })
      it('serializes to JSON consistently', async () => {
        const description = (await node.state()).find<ModuleDescriptionPayload>(isPayloadOfSchemaType(ModuleDescriptionSchema))
        expect(prettyPrintDescription(description)).toMatchSnapshot()
      })
      it('clone-all', async () => {
        const newNode = await NodeHelper.attachToNewNode(node, '*')
        const newNodeChildren = await newNode.resolve('*', { maxDepth: 1 })
        const nodeChildren = await node.resolve('*', { maxDepth: 1 })
        expect(newNodeChildren.length).toEqual(nodeChildren.length)
        expect(newNodeChildren.includes(nodeChildren[0])).toBe(true)
      })
      it('clone-one (public)', async () => {
        const module = await MemoryArchivist.create({ account: Account.randomSync(), config: { ...archivistConfig, name: 'CloneModule' } })
        await node.register(module)
        await node.attach(module.address, true)

        const newNode = await NodeHelper.attachToNewNode(node, 'CloneModule')
        const newNodeChild = await newNode.resolve('CloneModule')
        const nodeChild = await node.resolve('CloneModule', { maxDepth: 1 })
        expect(newNodeChild?.id).toEqual(nodeChild?.id)
        expect(newNodeChild?.address).toEqual(nodeChild?.address)
        expect(newNodeChild).toEqual(nodeChild)
      })
      it('clone-one (private)', async () => {
        const module = await MemoryArchivist.create({ account: Account.randomSync(), config: { ...archivistConfig, name: 'CloneModulePrivate' } })
        await node.register(module)
        await node.attach(module.address)

        try {
          //this should except
          await NodeHelper.attachToNewNode(node, 'CloneModulePrivate')
          expect(false).toBeTrue()
        } catch (e) {
          expect(e).toBeInstanceOf(Error)
        }
      })
    })
  })
  describe('discover', () => {
    const archivistConfig = { schema: MemoryArchivist.configSchema }
    const validateStateResponse = (mod: Module, response: Payload[]) => {
      expect(response).toBeArray()
      const address = response.find((p) => p.schema === AddressSchema) as AddressPayload
      expect(address).toBeObject()
      expect(address.address).toEqual(mod.address)
      const config = response.find((p) => p.schema === mod.config.schema)
      expect(config).toBeObject()
      expect(config?.schema).toBe(mod.config.schema)
      const queries = response.filter((p) => mod.queries.includes(p.schema))
      expect(queries.length).toBeGreaterThanOrEqual(0)
      queries.map((query) => {
        expect(query).toBeObject()
      })
    }
    describe('node without child modules', () => {
      it('describes node alone', async () => {
        const state = await node.state()
        validateStateResponse(node, state)
      })
    })
    describe('node with child modules', () => {
      it('describes node and child modules', async () => {
        const memoryNode = await MemoryNode.create({ account: Account.randomSync() })
        const modules = await Promise.all([
          await MemoryArchivist.create({ account: testAccount2, config: archivistConfig }),
          await MemoryArchivist.create({ account: testAccount3, config: archivistConfig }),
        ])
        await Promise.all(
          modules.map(async (mod) => {
            await memoryNode.register(mod)
            await memoryNode.attach(mod.address, true)
          }),
        )
        const state = await memoryNode.state()

        const address0 = state.find((p) => p.schema === AddressSchema && (p as AddressPayload).address === modules[0].address) as AddressPayload
        expect(address0).toBeObject()
        const address1 = state.find((p) => p.schema === AddressSchema && (p as AddressPayload).address === modules[1].address) as AddressPayload
        expect(address1).toBeObject()
      })
    })
    describe('node with nested nodes and modules', () => {
      beforeEach(async () => {
        node = await MemoryNode.create({ account: Account.randomSync() })
        const attachEvents: Module[] = []
        node.on('moduleAttached', (args) => {
          const { module } = args as ModuleAttachedEventArgs
          attachEvents.push(module)
        })
        const nestedNode = await MemoryNode.create({ account: testAccount2, config: nodeConfig })
        const nestedModules = await Promise.all([await MemoryArchivist.create({ account: testAccount3, config: archivistConfig })])
        await Promise.all(
          nestedModules.map(async (mod) => {
            await nestedNode.register(mod)
            await nestedNode.attach(mod.address, true)
          }),
        )
        const rootModules: AttachableModuleInstance[] = await Promise.all([
          await MemoryArchivist.create({ account: testAccount4, config: archivistConfig }),
        ])
        rootModules.push(nestedNode)
        await Promise.all(
          rootModules.map(async (mod) => {
            await node.register(mod)
            await node.attach(mod.address, true)
          }),
        )
        expect(attachEvents.includes(nestedNode)).toBeTrue()
        expect(attachEvents.includes(node)).toBeFalse()
        expect(nestedModules.length).toBe(1)
        for (const nestedModule of nestedModules) {
          expect(attachEvents.includes(nestedModule)).toBeTrue()
        }
        expect(rootModules.length).toBe(2)
        for (const rootModule of rootModules) {
          expect(attachEvents.includes(rootModule)).toBeTrue()
        }
        const eventAddresses = attachEvents.map((module) => module.address)
        expect(eventAddresses.length).toBe(3)
      })
      it('describes node and all nested nodes and child modules', async () => {
        const state = await node.state()
        validateStateResponse(node, state)
      })
    })
  })
})

const prettyPrintDescription = (description?: ModuleDescription) => {
  return JSON.stringify(description, null, 2)
}
