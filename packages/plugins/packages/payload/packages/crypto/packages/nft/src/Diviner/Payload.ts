import { Payload } from "@xyo-network/payload-model";
import { NftScoreSchema } from "./Schema";

export type NftScorePayload = Payload<{ schema: NftScoreSchema } & Partial<Omit<NftAnalysis, 'schema'>>>
