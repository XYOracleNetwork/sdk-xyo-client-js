import type { ModuleStatus } from './instance/index.ts'

export interface ModuleStatusReporter {
  reportStatus: (name: string, status: ModuleStatus, progress?: number) => void
}
