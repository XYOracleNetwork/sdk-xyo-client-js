export interface ArchivingReentrancyConfig {
  readonly reentrancy?: {
    action: 'skip' | 'wait'
    scope: 'global'
  }
}
