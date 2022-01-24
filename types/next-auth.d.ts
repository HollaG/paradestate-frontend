import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      email: string,
      google_ID: string,
      photo: string;
      unit: string;
      company: string;
      platoon: string;
      permissions: string;
      username:string;
    }
  }
}