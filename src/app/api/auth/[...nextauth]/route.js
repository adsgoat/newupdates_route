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

// import NextAuth from "next-auth";
// import KeycloakProvider from "next-auth/providers/keycloak";
// import getRedisClient from "@/lib/redis"
// import { decodeJwt } from "jose";
// import jwt from 'jsonwebtoken';

// export const authOptions = {
//     secret: process.env.NEXTAUTH_SECRET,
//     // debug: true,
//     // logger: {
//     //     error(code, metadata) {
//     //         console.error("ERROR:", code);
//     //         console.dir(metadata, { depth: null });
//     //     },
//     // },

//     session: {
//         strategy: "jwt",
//     },

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
//         async jwt({ token, account, profile }) {
//             const client = await getRedisClient();
//             /**
//              * First login
//              */
//             // console.log(account, "account");
//             if (account) {
//                 const email = profile?.email || token.email;
//                 const existingTheme = await client.get(`theme_${email}`);

//                 if (!existingTheme) {
//                     await client.set(`theme_${email}`, "light");
//                 }
//                 const payload = decodeJwt(account.access_token);
//                 const userData = {
//                     ...(payload?.FB_Mnet ? { FB_Mnet: payload?.FB_Mnet } : {}),
//                     ...(payload?.FB_TonicRsoc ? { FB_TonicRsoc: payload?.FB_TonicRsoc } : {}),
//                     ...(payload?.FB_Predicto ? { FB_Predicto: payload?.FB_Predicto } : {}),
//                     ...(payload?.FB_Botup ? { FB_Botup: payload?.FB_Botup } : {}),
//                     ...(payload?.FB_Media ? { FB_Media: payload?.FB_Media } : {}),
//                     ...(payload?.FB_Affinity ? { FB_Affinity: payload?.FB_Affinity } : {}),
//                 }

//                 const jwttoken = jwt.sign({ email: email }, process.env.Jwt_Secret, { expiresIn: '6h' });
//                 // console.log(userData, "userData");
//                 await client.set(`auth_token_${email}`, jwttoken)
//                 await client.set(
//                     `auth_${email}`,
//                     JSON.stringify({
//                         accessToken: account.access_token,
//                         refreshToken: account.refresh_token,
//                         idToken: account.id_token,
//                         expiresAt: account.expires_at,
//                     })
//                 );
//                 await client.set(
//                     `userdetails_${email}`,
//                     JSON.stringify({
//                         email: payload.email,
//                         role: payload.role,
//                         username: payload.preferred_username,
//                         gender: payload.gender
//                     })
//                 );
//                 await client.set(
//                     `permissions_${email}`,
//                     JSON.stringify({
//                         permissions: (payload.permissions)
//                     })
//                 );
//                 await client.set(`userData_${email}`, JSON.stringify(userData))
//                 return {
//                     ...token,
//                     email,
//                     accessToken: account.access_token,
//                     refreshToken: account.refresh_token,
//                     idToken: account.id_token,
//                     expiresAt: account.expires_at,
//                 };
//             }

//             // Don't refresh here if the proxy is responsible for refreshing.
//             return token;
//         },

//         async session({ session, token }) {
//             session.accessToken = token.accessToken;
//             session.refreshToken = token.refreshToken;
//             session.idToken = token.idToken;
//             session.expiresAt = token.expiresAt;
//             session.error = token.error;

//             return session;
//         },
//     },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };



// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import getRedisClient from "@/lib/redis";
// import { decodeJwt } from "jose";
// import jwt from "jsonwebtoken";
// import axios from "axios";
// import { cookies } from "next/headers";


// export const authOptions = {
//     secret: process.env.NEXTAUTH_SECRET,

//     pages: {
//         signIn: "/",
//         error: "/",
//     },

//     session: {
//         strategy: "jwt",
//         maxAge: 6 * 60 * 60,
//     },

//     providers: [
//         GoogleProvider({
//             clientId: process.env.Next_Auth_Client_Id,
//             clientSecret: process.env.Next_Auth_Client_Secret,
//         }),
//     ],

//     // callbacks: {
//     //     // async jwt({ token, account, profile }) {
//     //     //     // Run verification and Redis initialization only at login.
//     //     //     if (!account || account.provider !== "google") {
//     //     //         return token;
//     //     //     }

//     //     //     const email = String(profile?.email || token.email || "")
//     //     //         .trim()
//     //     //         .toLowerCase();

//     //     //     // Require Google's verified email.
//     //     //     if (!email || profile?.email_verified !== true) {
//     //     //         throw new Error("Google email is not verified");
//     //     //     }

//     //     //     // Verify the Google user with your own backend.
//     //     //     const response = await axios.get(`https://app.com/auth/version2?email=${email}`);

//     //     //     if (response.status !== 200) {
//     //     //         const cookieStore = await cookies();

//     //     //         cookieStore.set("invalid_user", "true", {
//     //     //             path: "/",
//     //     //             maxAge: 60 * 60,
//     //     //             sameSite: "lax",
//     //     //             secure: process.env.NODE_ENV === "production",
//     //     //             httpOnly: false,
//     //     //         });

//     //     //         throw new Error("Invalid user");
//     //     //     }

//     //     //     const result = response.data.data;

//     //     //     console.log(result, "result from backend");

//     //     //     const { token: customToken, userdetails, permissions, userData } = result;

//     //     //     // const user = result.user;
//     //     //     const client = await getRedisClient();

//     //     //     const existingTheme = await client.get(`theme_${email}`);

//     //     //     if (!existingTheme) {
//     //     //         await client.set(`theme_${email}`, "light");
//     //     //     }

//     //     //     await Promise.all([
//     //     //         client.set(`auth_token_${email}`, customToken),

//     //     //         // client.set(
//     //     //         //     `auth_${email}`,
//     //     //         //     JSON.stringify({
//     //     //         //         provider: "google",
//     //     //         //         idToken: account.id_token,
//     //     //         //         expiresAt: account.expires_at,
//     //     //         //     })
//     //     //         // ),

//     //     //         client.set(
//     //     //             `userdetails_${email}`,
//     //     //             JSON.stringify(userdetails)
//     //     //         ),

//     //     //         client.set(
//     //     //             `permissions_${email}`,
//     //     //             JSON.stringify(permissions)
//     //     //         ),

//     //     //         client.set(
//     //     //             `userData_${email}`,
//     //     //             JSON.stringify(userData)
//     //     //         ),
//     //     //     ]);

//     //     //     return {
//     //     //         // ...customToken,
//     //     //         email,
//     //     //         // role: user.role,
//     //     //         // username: user.username,
//     //     //         // customToken,
//     //     //         // customTokenExpiresAt: Date.now() + 6 * 60 * 60 * 1000,
//     //     //     };
//     //     // },

//     //     async jwt({ token, account, profile }) {
//     //         // Run verification and Redis initialization only at login.
//     //         if (!account || account.provider !== "google") {
//     //             return token;
//     //         }

//     //         const email = String(profile?.email || token.email || "")
//     //             .trim()
//     //             .toLowerCase();

//     //         if (!email || profile?.email_verified !== true) {
//     //             throw new Error("Google email is not verified");
//     //         }

//     //         try {
//     //             const response = await axios.get(
//     //                 "https://app.com/auth/version2",
//     //                 {
//     //                     params: { email },
//     //                     timeout: 10000,
//     //                 }
//     //             );

//     //             const result = response.data?.data;

//     //             if (
//     //                 response.status !== 200 ||
//     //                 !result?.token ||
//     //                 !result?.userdetails
//     //             ) {
//     //                 await setInvalidUserCookie();
//     //                 throw new Error("Invalid user");
//     //             }

//     //             const {
//     //                 token: customToken,
//     //                 userdetails,
//     //                 permissions,
//     //                 userData,
//     //             } = result;

//     //             const client = await getRedisClient();
//     //             const existingTheme = await client.get(`theme_${email}`);

//     //             const redisOperations = [
//     //                 client.set(`auth_token_${email}`, customToken),
//     //                 client.set(
//     //                     `userdetails_${email}`,
//     //                     JSON.stringify(userdetails)
//     //                 ),
//     //                 client.set(
//     //                     `permissions_${email}`,
//     //                     JSON.stringify(permissions)
//     //                 ),
//     //                 client.set(
//     //                     `userData_${email}`,
//     //                     JSON.stringify(userData)
//     //                 ),
//     //             ];

//     //             if (!existingTheme) {
//     //                 redisOperations.push(
//     //                     client.set(`theme_${email}`, "light")
//     //                 );
//     //             }

//     //             await Promise.all(redisOperations);

//     //             return {
//     //                 ...token,
//     //                 email,
//     //             };
//     //         } catch (error) {
//     //             if (error.response?.status === 404) {
//     //                 await setInvalidUserCookie();
//     //             }

//     //             throw error;
//     //         }
//     //     },
//     //     async session({ session, token }) {
//     //         if (session.user) {
//     //             session.user.email = token.email;
//     //             session.user.role = token.role;
//     //             session.user.username = token.username;
//     //         }

//     //         // Expose the custom token only if your frontend needs
//     //         // to send it to your backend.
//     //         session.customToken = token.customToken;
//     //         session.customTokenExpiresAt = token.customTokenExpiresAt;

//     //         return session;
//     //     },
//     // },
//     callbacks: {
//         async signIn({ account, profile }) {
//             if (account?.provider !== "google") return true;

//             const email = String(profile?.email || "")
//                 .trim()
//                 .toLowerCase();

//             if (!email || profile?.email_verified !== true) {
//                 return false;
//             }

//             try {
//                 const response = await axios.get(
//                     "https://app.com/auth/version2",
//                     {
//                         params: { email },
//                         timeout: 10000,
//                     }
//                 );

//                 const result = response.data?.data;

//                 if (
//                     response.status !== 200 ||
//                     !result?.token ||
//                     !result?.userdetails
//                 ) {
//                     return "/?authError=invalid_user";
//                 }

//                 const {
//                     token: customToken,
//                     userdetails,
//                     permissions,
//                     userData,
//                 } = result;

//                 const client = await getRedisClient();
//                 const existingTheme = await client.get(`theme_${email}`);

//                 const operations = [
//                     client.set(`auth_token_${email}`, customToken),
//                     client.set(
//                         `userdetails_${email}`,
//                         JSON.stringify(userdetails)
//                     ),
//                     client.set(
//                         `permissions_${email}`,
//                         JSON.stringify(permissions)
//                     ),
//                     client.set(
//                         `userData_${email}`,
//                         JSON.stringify(userData)
//                     ),

//                     // Preserve the key used by your existing login page.
//                     client.set(
//                         `auth_${email}`,
//                         JSON.stringify({
//                             provider: "google",
//                             idToken: account.id_token,
//                             expiresAt: account.expires_at,
//                         })
//                     ),
//                 ];

//                 if (!existingTheme) {
//                     operations.push(client.set(`theme_${email}`, "light"));
//                 }

//                 await Promise.all(operations);

//                 return true;
//             } catch (error) {
//                 if (error.response?.status !== 200) {
//                     return "/?authError=invalid_user";
//                 }

//                 throw error;
//             }
//         },

//         async jwt({ token, account, profile }) {
//             if (account?.provider === "google") {
//                 token.email = String(
//                     profile?.email || token.email || ""
//                 ).trim().toLowerCase();
//             }

//             return token;
//         },

//         async session({ session, token }) {
//             if (session.user) {
//                 session.user.email = token.email;
//                 session.user.role = token.role;
//                 session.user.username = token.username;
//             }

//             session.customToken = token.customToken;
//             session.customTokenExpiresAt = token.customTokenExpiresAt;

//             return session;
//         },
//     },
// };

// // const handler = NextAuth(authOptions);

// // export { handler as GET, handler as POST };

// const nextAuthHandler = NextAuth(authOptions);

// async function handler(req, ctx) {
//     const response = await nextAuthHandler(req, ctx);
//     const location = response.headers.get("location");

//     if (!location) return response;

//     let redirectUrl;

//     try {
//         redirectUrl = new URL(location, req.url);
//     } catch {
//         return response;
//     }

//     if (
//         redirectUrl.searchParams.get("authError") !== "invalid_user"
//     ) {
//         return response;
//     }

//     const headers = new Headers(response.headers);

//     headers.set("location", new URL("/", req.url).toString());

//     headers.append(
//         "set-cookie",
//         [
//             "invalid_user=true",
//             "Path=/",
//             "Max-Age=3600",
//             "SameSite=Lax",
//             ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
//         ].join("; ")
//     );

//     return new Response(response.body, {
//         status: response.status,
//         statusText: response.statusText,
//         headers,
//     });
// }

// export { handler as GET, handler as POST };


// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import getRedisClient from "@/lib/redis";
// import axios from "axios";

// export const authOptions = {
//     secret: process.env.NEXTAUTH_SECRET,

//     pages: {
//         signIn: "/",
//         error: "/",
//     },

//     session: {
//         strategy: "jwt",
//         maxAge: 6 * 60 * 60,
//     },

//     providers: [
//         GoogleProvider({
//             clientId: process.env.Next_Auth_Client_Id,
//             clientSecret: process.env.Next_Auth_Client_Secret,
//         }),
//     ],

//     callbacks: {
//         async signIn({ account, profile }) {
//             if (account?.provider !== "google") return false;

//             if (
//                 !profile?.email ||
//                 profile.email_verified !== true
//             ) {
//                 return false;
//             }

//             const email = profile.email.trim().toLowerCase();

//             try {
//                 const response = await axios.get(
//                     "https://app.com/auth/version2",
//                     {
//                         params: { email },
//                         timeout: 10000,
//                         validateStatus: () => true,
//                     }
//                 );

//                 if (response.status !== 200) {
//                     return "/?authError=invalid_user";
//                 }

//                 const result = response.data?.data;

//                 if (!result?.token || !result?.userdetails) {
//                     return "/?authError=invalid_user";
//                 }

//                 const {
//                     token: customToken,
//                     userdetails,
//                     permissions,
//                     userData,
//                 } = result;

//                 const client = await getRedisClient();
//                 const existingTheme = await client.get(`theme_${email}`);

//                 const operations = [
//                     client.set(`auth_token_${email}`, customToken),
//                     client.set(
//                         `userdetails_${email}`,
//                         JSON.stringify(userdetails)
//                     ),
//                     client.set(
//                         `permissions_${email}`,
//                         JSON.stringify(permissions)
//                     ),
//                     client.set(
//                         `userData_${email}`,
//                         JSON.stringify(userData)
//                     ),
//                     client.set(
//                         `auth_${email}`,
//                         JSON.stringify({
//                             provider: "google",
//                             idToken: account.id_token,
//                             expiresAt: account.expires_at,
//                         })
//                     ),
//                 ];

//                 if (!existingTheme) {
//                     operations.push(
//                         client.set(`theme_${email}`, "light")
//                     );
//                 }

//                 await Promise.all(operations);

//                 return true;
//             } catch (error) {
//                 console.error("Authentication verification failed:", error.message);
//                 return "/?authError=invalid_user";
//             }
//         },

//         async jwt({ token, account, profile }) {
//             if (account?.provider === "google") {
//                 token.email = String(profile?.email || "")
//                     .trim()
//                     .toLowerCase();
//             }

//             return token;
//         },

//         async session({ session, token }) {
//             if (session.user) {
//                 session.user.email = token.email;
//                 session.user.role = token.role;
//                 session.user.username = token.username;
//             }

//             session.customToken = token.customToken;
//             session.customTokenExpiresAt = token.customTokenExpiresAt;

//             return session;
//         },
//     },
// };

// const nextAuthHandler = NextAuth(authOptions);

// async function handler(req, ctx) {
//     const response = await nextAuthHandler(req, ctx);
//     const location = response.headers.get("location");

//     if (!location) return response;

//     let redirectUrl;

//     try {
//         redirectUrl = new URL(location, req.url);
//     } catch {
//         return response;
//     }

//     if (redirectUrl.searchParams.get("authError") !== "invalid_user") {
//         return response;
//     }

//     const destination = new URL("/", req.url);
//     const callbackUrl = req.cookies?.get("__Secure-next-auth.callback-url")?.value
//         || req.cookies?.get("next-auth.callback-url")?.value;

//     if (callbackUrl) {
//         destination.searchParams.set("callbackUrl", callbackUrl);
//     }

//     const headers = new Headers(response.headers);
//     headers.set("Location", destination.toString());
//     headers.append(
//         "Set-Cookie",
//         [
//             "invalid_user=true",
//             "Path=/",
//             "Max-Age=3600",
//             "SameSite=Lax",
//             ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
//         ].join("; ")
//     );

//     return new Response(response.body, {
//         status: response.status,
//         statusText: response.statusText,
//         headers,
//     });
// }

// export { handler as GET, handler as POST };



import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import getRedisClient from "@/lib/redis";
import axios from "axios";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: "/",
        error: "/",
    },

    session: {
        strategy: "jwt",
        maxAge: 6 * 60 * 60,
    },

    providers: [
        GoogleProvider({
            clientId: process.env.Next_Auth_Client_Id,
            clientSecret: process.env.Next_Auth_Client_Secret,
        }),
    ],

    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider !== "google") return false;

            if (!profile?.email || profile.email_verified !== true) {
                return "/?authError=invalid_user";
            }

            const email = profile.email.trim().toLowerCase();

            try {
                const response = await axios.get(
                    "https://app.vyaktimetrics.com/auth/version2",
                    {
                        params: { email },
                        timeout: 10000,
                        validateStatus: () => true,
                    }
                );

                if (response.status !== 200) {
                    return "/?authError=invalid_user";
                }

                const result = response.data?.data;

                if (!result?.token || !result?.userdetails) {
                    return "/?authError=invalid_user";
                }

                const {
                    token: customToken,
                    userdetails,
                    permissions,
                    userData,
                } = result;

                const client = await getRedisClient();
                const existingTheme = await client.get(`theme_${email}`);

                const operations = [
                    client.set(`auth_token_${email}`, customToken),
                    client.set(
                        `userdetails_${email}`,
                        JSON.stringify(userdetails)
                    ),
                    client.set(
                        `permissions_${email}`,
                        JSON.stringify(permissions)
                    ),
                    client.set(
                        `userData_${email}`,
                        JSON.stringify(userData)
                    ),
                    client.set(
                        `auth_${email}`,
                        JSON.stringify({
                            provider: "google",
                            idToken: account.id_token,
                            expiresAt: account.expires_at,
                        })
                    ),
                ];

                if (!existingTheme) {
                    operations.push(
                        client.set(`theme_${email}`, "light")
                    );
                }

                await Promise.all(operations);

                return true;
            } catch (error) {
                console.error(
                    "Authentication verification failed:",
                    error.message
                );

                return "/?authError=invalid_user";
            }
        },

        async jwt({ token, account, profile }) {
            if (account?.provider === "google") {
                token.email = String(profile?.email || "")
                    .trim()
                    .toLowerCase();
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.username = token.username;
            }

            session.customToken = token.customToken;
            session.customTokenExpiresAt = token.customTokenExpiresAt;

            return session;
        },
    },
};

const nextAuthHandler = NextAuth(authOptions);

async function handler(req, ctx) {
    const response = await nextAuthHandler(req, ctx);
    const location = response.headers.get("location");

    if (!location) return response;

    let redirectUrl;

    try {
        redirectUrl = new URL(location, req.url);
    } catch {
        return response;
    }

    if (redirectUrl.searchParams.get("authError") !== "invalid_user") {
        return response;
    }

    // Preserve the originally requested route.
    const callbackUrl =
        redirectUrl.searchParams.get("callbackUrl") ||
        req.nextUrl?.searchParams.get("callbackUrl") ||
        req.cookies?.get("__Secure-next-auth.callback-url")?.value ||
        req.cookies?.get("next-auth.callback-url")?.value;

    const destination = new URL("/", req.url);

    if (callbackUrl) {
        try {
            const parsedCallbackUrl = new URL(callbackUrl, req.url);
            const currentOrigin = new URL(req.url).origin;

            // Preserve only same-origin destinations.
            if (parsedCallbackUrl.origin === currentOrigin) {
                destination.searchParams.set(
                    "callbackUrl",
                    `${parsedCallbackUrl.pathname}${parsedCallbackUrl.search}${parsedCallbackUrl.hash}`
                );
            }
        } catch {
            // Ignore malformed callback URLs.
        }
    }

    const headers = new Headers(response.headers);

    headers.set("Location", destination.toString());

    headers.append(
        "Set-Cookie",
        [
            "invalid_user=true",
            "Path=/",
            "Max-Age=3600",
            "SameSite=Lax",
            ...(process.env.NODE_ENV === "production"
                ? ["Secure"]
                : []),
        ].join("; ")
    );

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

export { handler as GET, handler as POST };


