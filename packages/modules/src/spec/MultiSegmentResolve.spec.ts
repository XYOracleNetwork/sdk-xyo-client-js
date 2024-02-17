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
  test.skip('two archivists same name, different nodes', async () => {
    const rootNode = await MemoryNode.create()
    const nodeA = await MemoryNode.create({ config: { name: nodeAName, schema: NodeConfigSchema } })
    const nodeB = await MemoryNode.create({ config: { name: nodeBName, schema: NodeConfigSchema } })
    const moduleA = await MemoryArchivist.create({ config: { name: moduleAName, schema: ArchivistConfigSchema } })
    const moduleB = await MemoryArchivist.create({ config: { name: moduleBName, schema: ArchivistConfigSchema } })

    await nodeA.register(moduleA)
    await nodeA.attach(moduleA.address)

    await nodeB.register(moduleB)
    await nodeB.attach(moduleB.address)

    await rootNode.register(nodeA)
    await rootNode.attach(nodeA.address)
    await rootNode.register(nodeB)
    await rootNode.attach(nodeB.address)

    const resolvedModuleA = rootNode.resolve(`${nodeAName}:${moduleAName}`)
    const resolvedModuleB = rootNode.resolve(`${nodeBName}:${moduleBName}`)

    expect(resolvedModuleA).toBe(moduleA.address)
    expect(resolvedModuleB).toBe(moduleB.address)
  })
})
