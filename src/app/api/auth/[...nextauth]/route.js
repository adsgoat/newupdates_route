// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { cookies } from "next/headers";
// import client from "@/lib/redis"
// export const authOptions = {
//     secret: process.env.NEXTAUTH_SECRET,
//     providers: [
//         GoogleProvider({
//             clientId: process.env.Next_Auth_Client_Id,
//             clientSecret: process.env.Next_Auth_Client_Secret
//         }),
//     ],
//     callbacks: {
//         async signIn({ user }) {
//             const response = await fetch(`http://localhost:4000/auth/create/auth?email=${user.email}`)
//             const cookieStore = await cookies();
//             if (response.status !== 200) {
//                 cookieStore.set("invalid_user", "true",
//                     {
//                         httpOnly: true,
//                         secure: true,
//                         sameSite: "lax",
//                         path: "/",
//                     }
//                 );
//                 cookieStore.set(`user`, user.email);
//                 return "/";
//             }
//             // const tokenApi = await fetch(`http://localhost:4000/auth/create/auth?email=${user.email}`);
//             const tokenJson = await response.json();
//             // console.log(tokenJson);
//             // await Promise.all([
//             //     client.set(
//             //         `auth_token_${user.email}`,
//             //         tokenJson.data.token,
//             //     ),
//             //     client.set(
//             //         `role_${user.email}`,
//             //         tokenJson.data.role,
//             //     ),
//             //     client.set(
//             //         `userData_${user.email}`,
//             //         JSON.stringify(tokenJson.data.userData),
//             //     ),
//             //     client.set(
//             //         `profileImage_${user.email}`,
//             //         tokenJson.data.profileImage,
//             //     ),
//             //     client.set(
//             //         `stickyNotes_${user.email}`,
//             //         JSON.stringify(tokenJson.data.stickyNotes),
//             //     ),
//             // ]);
//             // cookieStore.delete("invalid_user");
//             // cookieStore.delete("user");
//             // client.set(`auth_token_${user.email}`, tokenJson.data.token);
//             // client.set(`role_${user.email}`, tokenJson.data.role,);
//             // client.set(`userData_${user.email}`, JSON.stringify(tokenJson.data.userData),);
//             // client.set(`profileImage_${user.email}`, tokenJson.data.profileImage,);
//             // client.set(`stickyNotes_${user.email}`, JSON.stringify(tokenJson.data.stickyNotes),);
//             await Promise.all([
//                 client.set(`auth_token_${user.email}`, tokenJson.data.token),
//                 client.set(`role_${user.email}`, tokenJson.data.role),
//                 client.set(`userData_${user.email}`, JSON.stringify(tokenJson.data.userData)),
//                 client.set(`profileImage_${user.email}`, tokenJson.data.profileImage ?? ""),
//                 client.set(`stickyNotes_${user.email}`, JSON.stringify(tokenJson.data.stickyNotes ?? [])),
//             ]);
//             cookieStore.delete("invalid_user");
//             cookieStore.delete("user");
//             return true;
//         },
//         async jwt({ token, user }) {
//             if (user) {
//                 token.email = user.email;
//             }

//             return token;
//         },

//         async session({ session, token }) {
//             session.user.email = token.email;

//             return session;
//         },
//     },
// };
// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

// 1 keycloak

// import NextAuth from "next-auth";
// import KeycloakProvider from "next-auth/providers/keycloak";

// export const authOptions = {
//     secret: process.env.NEXTAUTH_SECRET,

//     providers: [
//         KeycloakProvider({
//             clientId: process.env.KEYCLOAK_CLIENT_ID,
//             clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
//             issuer: process.env.KEYCLOAK_ISSUER,

//             authorization: {
//                 params: {
//                     scope: "openid profile email",
//                     kc_idp_hint: "google",
//                 },
//             },
//         }),
//     ],

//     callbacks: {
//         async jwt({ token, account }) {
//             console.log(account);
//             if (account) {
//                 token.accessToken = account.access_token;
//                 token.refreshToken = account.refresh_token;
//                 token.idToken = account.id_token;
//                 token.expiresAt = account.expires_at;
//             }

//             return token;
//         },

//         async session({ session, token }) {
//             session.accessToken = token.accessToken;
//             session.refreshToken = token.refreshToken;
//             session.idToken = token.idToken;
//             session.expiresAt = token.expiresAt;

//             return session;
//         },
//     },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import getRedisClient from "@/lib/redis"
import { decodeJwt } from "jose";
import jwt from 'jsonwebtoken';

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    // debug: true,
    // logger: {
    //     error(code, metadata) {
    //         console.error("ERROR:", code);
    //         console.dir(metadata, { depth: null });
    //     },
    // },

    session: {
        strategy: "jwt",
    },

    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
            issuer: process.env.KEYCLOAK_ISSUER,

            authorization: {
                params: {
                    scope: "openid profile email",
                    kc_idp_hint: "google",
                },
            },
        }),
    ],

    callbacks: {
        async jwt({ token, account, profile }) {
            const client = await getRedisClient();
            /**
             * First login
             */
            // console.log(account, "account");
            if (account) {
                const email = profile?.email || token.email;
                const payload = decodeJwt(account.access_token);
                const userData = {
                    ...(payload?.FB_Mnet ? { FB_Mnet: payload?.FB_Mnet } : {}),
                    ...(payload?.FB_TonicRsoc ? { FB_TonicRsoc: payload?.FB_TonicRsoc } : {}),
                    ...(payload?.FB_Predicto ? { FB_Predicto: payload?.FB_Predicto } : {}),
                    ...(payload?.FB_Botup ? { FB_Botup: payload?.FB_Botup } : {}),
                    ...(payload?.FB_Media ? { FB_Media: payload?.FB_Media } : {}),
                    ...(payload?.FB_Affinity ? { FB_Affinity: payload?.FB_Affinity } : {}),
                }

                const jwttoken = jwt.sign({ email: email }, process.env.Jwt_Secret, { expiresIn: '6h' });
                // console.log(userData, "userData");
                await client.set(`auth_token_${email}`, jwttoken)
                await client.set(
                    `auth_${email}`,
                    JSON.stringify({
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token,
                        idToken: account.id_token,
                        expiresAt: account.expires_at,
                    })
                );
                await client.set(
                    `userdetails_${email}`,
                    JSON.stringify({
                        email: payload.email,
                        role: payload.role,
                        username: payload.preferred_username,
                        gender: payload.gender
                    })
                );
                await client.set(
                    `permissions_${email}`,
                    JSON.stringify({
                        permissions: (payload.permissions)
                    })
                );
                await client.set(`userData_${email}`, JSON.stringify(userData))
                return {
                    ...token,
                    email,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    idToken: account.id_token,
                    expiresAt: account.expires_at,
                };
            }

            // Don't refresh here if the proxy is responsible for refreshing.
            return token;
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.idToken = token.idToken;
            session.expiresAt = token.expiresAt;
            session.error = token.error;

            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };