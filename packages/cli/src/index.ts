import { MemoryArchivist } from '@xyo-network/archivist'
import { MemoryNode } from '@xyo-network/node'

import { getOptionsParser, loadModule } from './lib'
import { startTerminal } from './terminal'

const xyo = async () => {
  const node = await MemoryNode.create()
  node.register(await MemoryArchivist.create())
  const args = await getOptionsParser()
    .command(
      'node',
      'Start an XYO Node',
      (yargs) => {
        return yargs
      },
      async (yargs) => {
        console.log(`yargs: ${JSON.stringify(yargs, null, 2)}`)
        const { verbose, module } = yargs
        const modules = Array.isArray(module) ? module : [module]
        if (verbose) console.info('Starting Node')

        node.register(await MemoryArchivist.create())

        await Promise.all(
          modules.map(async (module) => {
            const [pkg, name] = module.split('.')
            const instance = await loadModule(pkg, name, node)
            console.log(`Arg: ${instance.address}`)
            node.register(instance)
            node.attach(instance.address)
            console.log(`Module Loaded: ${instance.address}`)
          }),
        )
      },
    )
    .help().argv
  return node
}

const start = async () => {
  await startTerminal(await xyo())
}

start()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
  })
