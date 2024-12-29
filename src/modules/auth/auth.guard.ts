import { db } from "../../db";
import { GlobalError } from "../../lib/errors";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export function isAuthenticated(roles: string[]) {
  if (roles.length <= 0) return;
  return {
    async beforeHandle({ cookie: { auth }, jwt, store }: any) {
      if (!auth.value) {
        throw new GlobalError("Unauthorized", 401);
      }

      const profile = await jwt.verify(auth.value);

      if (!profile) {
        throw new GlobalError("Unauthorized", 401);
      }

      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, profile.email));

      if (user.length === 0) {
        throw new GlobalError("User not found", 400);
      }

      if (user[0].role && roles.includes("all")) {
        store.user = profile;
        return;
      }

      if (user[0].role && roles.includes(user[0].role)) {
        store.user = profile;
        return;
      }

      throw new GlobalError("Forbidden", 403);
    },
  };
}
