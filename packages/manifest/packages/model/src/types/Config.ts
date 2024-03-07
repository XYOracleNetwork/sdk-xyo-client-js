import { Manifest } from './Manifest'

export interface ConfigManifest<S extends string = string> extends Manifest {
  accountPath?: string
  name: string
  schema: S
}
