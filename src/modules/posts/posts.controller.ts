import { Elysia, t } from "elysia";
import { isAuthenticated } from "../auth/auth.guard";
import { PostsService } from "./posts.service";
import { PostsModel } from "./posts.model";

const posts = new PostsService();

export const postsController = new Elysia({
  prefix: "/posts",
  name: "Posts",
})
  .macro({
    isAuthenticated,
  })
  .model(PostsModel)
  .get(
    "/",
    ({ query }) => {
      return posts.findAll(query);
    },
    {
      query: "posts.query",
    },
  )
  .get(
    "/:id",
    ({ params }) => {
      return posts.findOne(params.id);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    },
  )
  .post(
    "/",
    ({ body, store: {user} }: any) => {
      return posts.create(body, user!.id);
    },
    {
      body: "posts.create",
      isAuthenticated: ["all"],
    },
  )
  .patch(
    "/:id",
    ({ params, body }) => {
      return posts.update(params.id, body);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      body: "posts.update",
      isAuthenticated: ["all"],
    },
  )
  .delete(
    "/:id",
    ({ params }) => {
      return posts.delete(params.id);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      isAuthenticated: ["all"],
    },
  );
