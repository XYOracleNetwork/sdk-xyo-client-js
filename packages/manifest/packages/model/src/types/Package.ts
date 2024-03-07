import { Manifest } from './Manifest'
import { NodeManifest } from './Node'

export interface PackageManifest extends Manifest {
  nodes: NodeManifest[]
}
