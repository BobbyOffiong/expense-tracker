// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string; // Add the id property to the user object
    };
  }

  interface User extends DefaultUser {
    id: string; // Ensure the User type also has an id
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}