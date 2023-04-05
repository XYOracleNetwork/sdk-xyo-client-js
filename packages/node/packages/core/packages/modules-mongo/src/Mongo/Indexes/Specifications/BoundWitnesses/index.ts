import { IndexDescription } from 'mongodb'

import { IX__archive__hash } from './IX__archive__hash'
import { IX__archive__timestamp } from './IX__archive__timestamp'
import { IX__archive_payload_hashes } from './IX__archive_payload_hashes'
import { IX__archive_payload_schemas__timestamp } from './IX__archive_payload_schemas__timestamp'
import { IX__hash } from './IX__hash'
import { IX__timestamp } from './IX__timestamp'
import { IX_payload_hashes } from './IX_payload_hashes'

export const BoundWitnessesIndexes: IndexDescription[] = [
  IX__archive__hash,
  IX__archive__timestamp,
  IX__archive_payload_hashes,
  IX__archive_payload_schemas__timestamp,
  IX__hash,
  IX__timestamp,
  IX_payload_hashes,
]
