import { TCreatePost, TQueryPosts, TUpdatePost } from "./posts.model";
import { db } from "../../db";
import { postsTable } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

export class PostsService {
  async create(data: TCreatePost, userId: number) {
    return db.insert(postsTable).values({
      ...data,
      userId: userId,
    });
  }

  async update(id: number, data: TUpdatePost) {
    return db.update(postsTable).set(data).where(eq(postsTable.id, id));
  }

  async findAll(query: TQueryPosts) {
    const {
      limit = 10,
      cursor,
      search = "",
      userId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    let baseQuery = db.select().from(postsTable).$dynamic();

    // Add userId filter
    if (userId !== undefined && userId !== null) {
      const userIdNum = Number(userId);
      if (!isNaN(userIdNum)) {
        baseQuery = baseQuery.where(eq(postsTable.userId, userIdNum));
      }
    }

    // Add search filter
    if (search) {
      baseQuery = baseQuery.where(
        sql`(${postsTable.title} LIKE '%' || ${search} || '%' OR ${postsTable.description} LIKE '%' || ${search} || '%')`,
      );
    }

    // Add cursor-based pagination
    if (cursor) {
      const cursorNum = Number(cursor);
      if (!isNaN(cursorNum)) {
        baseQuery = baseQuery.where(
          sortOrder === "desc"
            ? sql`${postsTable.id}
                            <
                            ${cursorNum}`
            : sql`${postsTable.id}
                            >
                            ${cursorNum}`,
        );
      }
    }

    // Add sorting
    if (sortBy === "createdAt") {
      baseQuery = baseQuery.orderBy(
        sortOrder === "desc"
          ? sql`${postsTable.createdAt}
                        DESC`
          : sql`${postsTable.createdAt}
                        ASC`,
      );
    } else {
      baseQuery = baseQuery.orderBy(
        sortOrder === "desc"
          ? sql`${postsTable.id}
                        DESC`
          : sql`${postsTable.id}
                        ASC`,
      );
    }

    // Add limit
    const limitNum = Number(limit);
    baseQuery = baseQuery.limit(isNaN(limitNum) ? 10 : limitNum);

    // Execute query and count total
    const [posts, countResult] = await Promise.all([
      baseQuery,
      db
        .select({ count: sql<number>`count(*)` })
        .from(postsTable)
        .where(
          userId !== undefined && userId !== null
            ? eq(postsTable.userId, Number(userId))
            : undefined,
        )
        .$dynamic()
        .get(),
    ]);

    const total = countResult?.count ?? 0;

    return {
      data: posts,
      meta: {
        total,
        limit: limitNum,
        nextCursor:
          posts.length === limitNum ? posts[posts.length - 1].id : undefined,
        search: search || undefined,
        userId: userId || undefined,
        sortBy,
        sortOrder,
      },
    };
  }

  async findOne(id: number) {
    return db.select().from(postsTable).where(eq(postsTable.id, id)).get();
  }

  async delete(id: number) {
    return db.delete(postsTable).where(eq(postsTable.id, id)).execute();
  }
}
