import { Manifest, WithJsonSchema } from './Manifest'
import { NodeManifest } from './Node'

export interface PackageManifest extends Manifest {
  nodes: NodeManifest[]
}

export type PackageManifestJsonSchema = WithJsonSchema<PackageManifest>
