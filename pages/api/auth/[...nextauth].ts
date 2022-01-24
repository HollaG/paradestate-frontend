import NextAuth, { Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import executeQuery from "../../../lib/db";
import { User } from "../../../types/database";

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    // jwt: {
    //     secret: "asbdfjbajsdfbjkadbfjdkasbjk",
    // },
    secret: "my-super-secret-token",
    callbacks: {
        async signIn({ account, profile }) {
            // if (account.provider === "google") {
            //     return (
            //         profile.email_verified &&
            //         profile.email.endsWith("@example.com")
            //     );
            // }
            // console.log({account, profile})

            
            // set('user', user)
         
            return true; // Do different verification for other providers that don't have `email_verified`
        },
        // async jwt({ token, account }) {
        //     if (account?.access_token) {
        //         token.accessToken = account.accessToken;
        //     }
        //     return token;
        // },
        redirect: ({ url, baseUrl }) => {
            if (url.startsWith(baseUrl)) return url;
            // Allows relative callback URLs
            else if (url.startsWith("/"))
                return new URL(url, baseUrl).toString();
            return baseUrl;
        },
        async session({session, token}) { 
            
            const userResult:User[] = await executeQuery({query: `SELECT * FROM users WHERE email = ?`, values: [session.user?.email]})
            session.user = userResult[0] 
            // set('user', userResult[0])
            // console.log({session})
            return session
        }
    },
});
