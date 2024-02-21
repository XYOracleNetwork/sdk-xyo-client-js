import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'

const nodeAName = 'nodeA'
const nodeBName = 'nodeB'
const moduleAName = 'module'
const moduleBName = 'module'

/**
 * @group module
 */

describe('SimpleModuleResolverDeep', () => {
  test('two archivists same name, different nodes', async () => {
    const rootNode = await MemoryNode.create({ account: 'random' })
    const nodeA = await MemoryNode.create({ account: 'random', config: { name: nodeAName, schema: NodeConfigSchema } })
    const nodeB = await MemoryNode.create({ account: 'random', config: { name: nodeBName, schema: NodeConfigSchema } })
    const moduleA = await MemoryArchivist.create({ account: 'random', config: { name: moduleAName, schema: ArchivistConfigSchema } })
    const moduleB = await MemoryArchivist.create({ account: 'random', config: { name: moduleBName, schema: ArchivistConfigSchema } })

    await nodeA.register(moduleA)
    await nodeA.attach(moduleA.address, true)

    const resolvedModuleAFromNodeA = await nodeA.resolve(moduleAName)
    expect(resolvedModuleAFromNodeA?.address).toBe(moduleA.address)

    await nodeB.register(moduleB)
    await nodeB.attach(moduleB.address, true)

    const resolvedModuleBFromNodeB = await nodeB.resolve(moduleBName)
    expect(resolvedModuleBFromNodeB?.address).toBe(moduleB.address)

    await rootNode.register(nodeA)
    await rootNode.attach(nodeA.address, true)
    await rootNode.register(nodeB)
    await rootNode.attach(nodeB.address, true)

    const resolvedModuleA = await rootNode.resolve(moduleAName)
    expect([moduleA.address, moduleB.address]).toInclude(resolvedModuleA?.address ?? '')
    const resolvedModuleB = await rootNode.resolve(moduleBName)
    expect([moduleA.address, moduleB.address]).toInclude(resolvedModuleB?.address ?? '')

    const resolvedModuleAMulti = await rootNode.resolve(`${nodeAName}:${moduleAName}`)
    expect(resolvedModuleAMulti?.address).toBe(moduleA.address)
    const resolvedModuleBMulti = await rootNode.resolve(`${nodeBName}:${moduleBName}`)
    expect(resolvedModuleBMulti?.address).toBe(moduleB.address)
  })
})
