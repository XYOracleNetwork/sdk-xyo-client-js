import { Manifest } from './Manifest'
import { NodeManifest } from './Node'

export type PackageManifest = Manifest & {
  nodes: NodeManifest[]
}
