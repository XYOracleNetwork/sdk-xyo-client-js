import { assertEx } from '@xylabs/assert'
import { NodeModule, NodeWrapper } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { ModuleFactory } from './ModuleFactory'
import { DappManifest, ManifestPayload, ModuleManifest } from './Payload'

export class ManifestWrapper extends PayloadWrapper<ManifestPayload> {
  dAppManifest(id: string) {
    return this.payload.dapps?.find((dapp) => dapp.id === id)
  }

  async loadDappFromId(node: NodeModule, id: string, moduleFactory?: ModuleFactory) {
    return await this.loadDappFromManifest(node, assertEx(this.dAppManifest(id), 'Failed to find dApp Manifest'), moduleFactory)
  }

  async loadDappFromManifest(node: NodeModule, manifest: DappManifest, moduleFactory?: ModuleFactory) {
    // Load Private Modules
    await Promise.all(
      manifest.modules.private?.map(async (manifest) => {
        await this.loadPrivateModule(node, manifest, moduleFactory)
      }) ?? [() => null],
    )

    // Load Public Modules
    await Promise.all(
      manifest.modules.public?.map(async (manifest) => {
        await this.loadPublicModule(node, manifest, moduleFactory)
      }) ?? [() => null],
    )

    return node
  }

  async loadPrivateModule(node: NodeModule, manifest: ModuleManifest, moduleFactory?: ModuleFactory) {
    const nodeWrapper = NodeWrapper.wrap(node)
    if ((await nodeWrapper.downResolver.resolve({ name: [manifest.name] })).length === 0) {
      if (manifest.language && manifest.language === 'javascript') {
        assertEx(await node.attach(manifest.name, false), `No module named [${manifest.name}] registered`)
      }
    }
  }

  async loadPublicModule(node: NodeModule, manifest: ModuleManifest, moduleFactory?: ModuleFactory) {
    const nodeWrapper = NodeWrapper.wrap(node)
    if ((await nodeWrapper.upResolver.resolve({ name: [manifest.name] })).length === 0) {
      if (manifest.language && manifest.language === 'javascript') {
        assertEx(await node.attach(manifest.name, true), `No module named [${manifest.name}] registered`)
      }
    }
  }
}
