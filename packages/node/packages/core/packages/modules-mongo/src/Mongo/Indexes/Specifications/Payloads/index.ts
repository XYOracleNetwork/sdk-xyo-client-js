import { IndexDescription } from 'mongodb'

import { IX__archive__hash } from './IX__archive__hash'
import { IX__archive__timestamp } from './IX__archive__timestamp'
import { IX__archive_schema__timestamp } from './IX__archive_schema__timestamp'
import { IX__hash } from './IX__hash'
import { IX__timestamp } from './IX__timestamp'

export const PayloadsIndexes: IndexDescription[] = [IX__archive__hash, IX__archive__timestamp, IX__archive_schema__timestamp, IX__hash, IX__timestamp]
