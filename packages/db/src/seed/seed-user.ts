import { db } from "../client";
import { SYSTEM_USER_ID } from "../id";
import { User } from "../schema";

async function seedSystemUser() {
  await db.insert(User).values({
    id: SYSTEM_USER_ID,
    name: "System",
    email: "sys.services@bucharim.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "system",
  });
}

seedSystemUser().catch(console.error);
