import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey(),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  username: text("username").unique().notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  digestCode: text("digest_code"),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  comments: many(commentsTable),
  likes: many(likesTable),
}));

export const postsTable = sqliteTable("posts", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  cover: text("cover"),
  description: text("description"),
  keywords: text("keywords"),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),
  content: text("content").notNull(),
  viewCount: integer("view_count").default(0),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(UNIXEPOCH())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const postsRelations = relations(postsTable, ({ many, one }) => ({
  comments: many(commentsTable),
  likes: many(likesTable),
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
}));

export const commentsTable = sqliteTable("comments", {
  id: integer("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(UNIXEPOCH())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
}));

export const likesTable = sqliteTable("likes", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(UNIXEPOCH())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const likesRelations = relations(likesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [likesTable.userId],
    references: [usersTable.id],
  }),
  post: one(postsTable, {
    fields: [likesTable.postId],
    references: [postsTable.id],
  }),
}));
