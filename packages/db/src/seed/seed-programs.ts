import {
  AvrechimPassoverGrantProgram,
  AvrechimPassoverGrantProgramVersion,
} from "@congress/validators/constants";

import { db } from "../client";
import { Program, ProgramVersion } from "../schema";

export async function seedPrograms() {
  await db.transaction(async (tx) => {
    await tx.insert(Program).values(AvrechimPassoverGrantProgram);
    await tx.insert(ProgramVersion).values(AvrechimPassoverGrantProgramVersion);
  });
}

await seedPrograms();
