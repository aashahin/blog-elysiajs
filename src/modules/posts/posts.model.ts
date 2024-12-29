import { t } from "elysia";

enum postsStatus {
  draft = "draft",
  published = "published",
  archived = "archived",
}

const create = t.Object({
  title: t.String(),
  slug: t.String(),
  cover: t.String(),
  description: t.String(),
  keywords: t.String(),
  status: t.Enum(postsStatus),
  content: t.String(),
  tags: t.Array(t.String()),
  userId: t.Integer(),
});

const update = t.Object({
  title: t.Optional(t.String()),
  slug: t.Optional(t.String()),
  cover: t.Optional(t.String()),
  description: t.Optional(t.String()),
  keywords: t.Optional(t.String()),
  status: t.Optional(t.Enum(postsStatus)),
  content: t.Optional(t.String()),
  viewCount: t.Optional(t.Number()),
  tags: t.Optional(t.Array(t.String())),
  userId: t.Optional(t.Integer()),
});

const query = t.Object({
  limit: t.Number({ default: 10 }),
  cursor: t.String(),
  search: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  include: t.Optional(t.String()),
  sortBy: t.Optional(t.String()),
  sortOrder: t.Optional(t.String()),
});

export type TCreatePost = typeof create.static;
export type TUpdatePost = typeof update.static;
export type TQueryPosts = typeof query.static;

export const PostsModel = {
  "posts.create": create,
  "posts.update": update,
  "posts.query": query,
};
