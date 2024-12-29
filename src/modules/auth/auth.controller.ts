import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { login, logout, profile, signup } from "./auth.service";
import { isAuthenticated } from "./auth.guard";

const tSignup = t.Object({
  name: t.String(),
  email: t.String(),
  password: t.String(),
});
const tLogin = t.Object({
  email: t.String(),
  password: t.String(),
});
export type TSignUp = typeof tSignup.static;
export type TLogin = typeof tLogin.static;

export const authController = new Elysia({
  prefix: "/auth",
  name: "Auth",
})
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: process.env.JWT_EXPIRES!,
    }),
  )
  .model({
    "auth.login": tLogin,
    "auth.signup": tSignup,
  })
  .post(
    "/signup",
    async ({ jwt, body, cookie: { auth } }) => {
      return signup(body, auth, jwt);
    },
    {
      body: "auth.signup",
    },
  )
  .post(
    "/login",
    async ({ jwt, body, cookie: { auth } }) => {
      return login(body, auth, jwt);
    },
    {
      body: "auth.login",
    },
  )
  .macro({
    isAuthenticated,
  })
  .delete(
    "/logout",
    async ({ cookie: { auth } }) => {
      console.log(auth);
      return logout(auth);
    },
    {
      isAuthenticated: ["all"],
    },
  )
  .get(
    "/profile",
    async ({ jwt, cookie: { auth } }) => {
      return profile(jwt, auth);
    },
    {
      isAuthenticated: ["all"],
    },
  )
  .listen(3000);
