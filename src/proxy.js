// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import client from "@/lib/redis"
// // import getSessionEmail from "@/lib/sessionemail";
// import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

// export async function proxy(request) {
//     const email = await getSessionEmailByAuth();
//     const token = await client.get(`auth_token_${email}`);
//     const pathname = request.nextUrl.pathname;
//     const redirectToLogin = () => {
//         const loginUrl = new URL("/", request.url);
//         loginUrl.searchParams.set("callbackUrl", pathname);
//         return NextResponse.redirect(loginUrl);
//     };
//     if (!token) {
//         return redirectToLogin();
//     }

//     try {
//         jwt.verify(token, process.env.Jwt_Secret);
//         return NextResponse.next();
//     }
//     catch (error) {
//         const response = redirectToLogin();
//         await Promise.all([
//             client.del(`auth_token_${email}`),
//             client.del(`role_${email}`),
//             client.del(`userData_${email}`),
//             client.del(`profileImage_${email}`),
//             client.del(`stickyNotes_${email}`),
//         ]);
//         response.cookies.delete("user");
//         return response;
//     }
// }

// export const config = {
//     matcher: [
//         "/dashboard/:path*",
//         "/reports/:path*",
//         "/api/dashboard/:path*",
//     ],
// };

// 2 keycloak

// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { createRemoteJWKSet, jwtVerify } from "jose";

// const JWKS = createRemoteJWKSet(
//     new URL(
//         `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
//     )
// );

// // async function verifyAccessToken(accessToken) {
// //     const { payload } = await jwtVerify(accessToken, JWKS, {
// //         issuer: process.env.KEYCLOAK_ISSUER,
// //         audience: process.env.KEYCLOAK_CLIENT_ID,
// //     });

// //     return payload;
// // }
// async function verifyAccessToken(accessToken) {
//     try {
//         console.log("Issuer:", process.env.KEYCLOAK_ISSUER);

//         const { payload, protectedHeader } = await jwtVerify(accessToken, JWKS, {
//             issuer: process.env.KEYCLOAK_ISSUER,
//         });

//         // console.log("Header:", protectedHeader);
//         // console.log("Payload:", payload);

//         return payload;
//     } catch (err) {
//         // console.error("Verification failed:");
//         // console.error("Name:", err.name);
//         // console.error("Message:", err.message);
//         // console.error(err);

//         throw err;
//     }
// }

// export async function proxy(request) {
//     const pathname = request.nextUrl.pathname;

//     const redirectToLogin = () => {
//         const loginUrl = new URL("/", request.url);
//         loginUrl.searchParams.set("callbackUrl", pathname);
//         return NextResponse.redirect(loginUrl);
//     };

//     const token = await getToken({
//         req: request,
//         secret: process.env.NEXTAUTH_SECRET,
//     });

//     // console.log("Proxy token:", token);

//     if (!token?.accessToken) {
//         return redirectToLogin();
//     }

//     try {
//         await verifyAccessToken(token.accessToken);

//         // return NextResponse.next();
//         // console.log("Access Token:", "test");

//         // const payload = await verifyAccessToken(token.accessToken);

//         // console.log("Payload:", "payload");

//         return NextResponse.next();
//     } catch (error) {
//         console.log("hi");
//         const response = redirectToLogin();

//         // response.cookies.delete("next-auth.session-token");
//         // response.cookies.delete("__Secure-next-auth.session-token");
//         for (const cookie of request.cookies.getAll()) {
//             if (
//                 cookie.name !== "next-auth.callback-url" &&
//                 cookie.name !== "__Secure-next-auth.callback-url"
//             ) {
//                 response.cookies.delete(cookie.name);
//             }
//         }

//         return response;
//     }
// }

// export const config = {
//     matcher: [
//         "/dashboard/:path*",
//         "/reports/:path*",
//         "/api/dashboard/:path*",
//     ],
// };

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createRemoteJWKSet, jwtVerify, decodeJwt } from "jose";
import getRedisClient from "@/lib/redis"; // <-- your redis client
// const client = 

const JWKS = createRemoteJWKSet(
    new URL(
        `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
    )
);

async function verifyAccessToken(accessToken) {
    const { payload } = await jwtVerify(accessToken, JWKS, {
        issuer: process.env.KEYCLOAK_ISSUER,
    });

    return payload;
}

async function refreshAccessToken(refreshToken) {
    console.log("Called refersh access token")
    const response = await fetch(
        `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_CLIENT_ID,
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
            cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data;
}

export async function proxy(request) {
    const pathname = request.nextUrl.pathname;
    const client = await getRedisClient();

    const redirectToLogin = () => {
        const loginUrl = new URL("/", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);

        const response = NextResponse.redirect(loginUrl);

        for (const cookie of request.cookies.getAll()) {
            if (
                cookie.name !== "next-auth.callback-url" &&
                cookie.name !== "__Secure-next-auth.callback-url"
            ) {
                response.cookies.delete(cookie.name);
            }
        }

        return response;
    };

    const session = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session?.email) {
        return redirectToLogin();
    }

    const email = session.email;

    const authData = await client.get(`auth_${email}`);

    if (!authData) {
        return redirectToLogin();
    }

    let auth = JSON.parse(authData);

    try {
        await verifyAccessToken(auth.accessToken);

        // Token still valid
        return NextResponse.next();
    } catch (err) {
        console.log("Access token expired. Refreshing...");

        try {
            const refreshed = await refreshAccessToken(auth.refreshToken);

            auth = {
                accessToken: refreshed.access_token,
                refreshToken:
                    refreshed.refresh_token ?? auth.refreshToken,
                idToken:
                    refreshed.id_token ?? auth.idToken,
                expiresAt:
                    Math.floor(Date.now() / 1000) +
                    refreshed.expires_in,
            };
            const payload = decodeJwt(refreshed.access_token);

            await client.set(
                `auth_${email}`,
                JSON.stringify(auth)
            );
            await client.set(
                `permissions_${email}`,
                JSON.stringify({
                    permissions: (payload.permissions)
                })
            );

            console.log("Access token refreshed.");

            return NextResponse.next();
        } catch (refreshError) {
            console.error("Refresh failed:", refreshError);

            await client.del(`auth_${email}`);

            return redirectToLogin();
        }
    }
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/reports/:path*",
        "/api/dashboard/:path*",
        "/creatives/:path*",
        "/api/creatives/:path*",
        "/newuser/:path*",
        "/api/newuser/:path*",
        "daily/:path",
        "live/:path"
    ],
};