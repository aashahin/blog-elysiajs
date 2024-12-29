import { db } from "../../db";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { TLogin, TSignUp } from "./auth.controller";
import { GlobalError } from "../../lib/errors";

// Function to generate a unique username
async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;
  const exists = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (exists.length > 0) {
    username = `${baseUsername}_${new Date().getTime()}`;
    return generateUniqueUsername(username);
  }
  return username;
}

export async function signup(
  body: TSignUp,
  auth: Record<string, any>,
  jwt: Record<string, any>,
) {
  const { email, name, password } = body;

  // Verify if user already exists
  const userExists = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (userExists.length > 0) {
    throw new GlobalError("User already exists", 400);
  }

  // Generate a unique username
  const baseUsername = name.split(" ").join("").toLowerCase();
  const username = await generateUniqueUsername(baseUsername);

  // Hash the password
  const hashedPassword = await Bun.password.hash(password);

  await db.insert(usersTable).values({
    name,
    email,
    password: hashedPassword,
    username: username,
  });

  // Generate a JWT token
  const token = await jwt.sign({ name, email });

  // Set the auth cookie
  auth.set({
    value: token,
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return {
    token,
    user: {
      name,
      username,
    },
  };
}

export async function login(
  body: TLogin,
  auth: Record<string, any>,
  jwt: Record<string, any>,
) {
  const { email, password } = body;

  // Verify if user exists
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (user.length === 0) {
    throw new GlobalError("User not found", 400);
  }

  // Verify password
  const validPassword = await Bun.password.verify(password, user[0].password);

  if (!validPassword) {
    throw new GlobalError("Invalid password", 400);
  }

  // Generate a JWT token
  const token = await jwt.sign({ name: user[0].name, email: user[0].email });

  // Set the auth cookie
  auth.set({
    value: token,
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return {
    token,
    user: {
      name: user[0].name,
      username: user[0].username,
    },
  };
}

export async function logout(auth: Record<string, any>) {
  auth.remove();
}

export async function profile(
  jwt: Record<string, any>,
  auth: Record<string, any>,
) {
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

  return {
      name: user[0].name,
      username: user[0].username,
      email: user[0].email,
      role: user[0].role,
      bio: user[0].bio,
      avatar: user[0].avatar,
      emailVerified: user[0].emailVerified,
  };
}
