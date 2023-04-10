import { IndexDescription } from 'mongodb'

import { IX__hash } from './IX__hash'
import { IX__timestamp } from './IX__timestamp'
import { IX_schema__timestamp } from './IX_schema__timestamp'

export const PayloadsIndexes: IndexDescription[] = [IX__hash, IX__timestamp, IX_schema__timestamp]
