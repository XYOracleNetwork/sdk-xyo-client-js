import { IndexDescription } from 'mongodb'

import { IX__hash } from './IX__hash'
import { IX__timestamp_addresses } from './IX__timestamp_addresses'
import { IX_addresses } from './IX_addresses'
import { IX_addresses__timestamp } from './IX_addresses__timestamp'
import { IX_payload_hashes } from './IX_payload_hashes'

export const BoundWitnessesIndexes: IndexDescription[] = [IX__hash, IX__timestamp_addresses, IX_addresses__timestamp, IX_addresses, IX_payload_hashes]
