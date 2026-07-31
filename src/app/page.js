import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { useSearchParams } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LoginPage from "../layouts/AuthLayout/LoginLayout"
import getRedisClient from "@/lib/redis";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth"
export default async function LoginPageLayout({
    searchParams,
}) {
    const client = await getRedisClient();
    //  const session = await getSessionEmailByAuth();
    // const session = await getServerSession(authOptions);

    const email = await getSessionEmailByAuth();
    // // const searchParams = useSearchParams();
    // // const params = await searchParams;
    // // const token = (await cookies()).get("auth_token")?.value;
    // // const token = await client.get("auth_token");
    // // const user = (await cookies()).get("user")?.value;
    const token = await client.get(`auth_${email}`);
    // const callbackUrl = (await cookies()).get("redirect_after_login")?.value;
    const callbackUrl = (await searchParams)?.callbackUrl || "/dashboard";
    const isValidUser = (await cookies()).get("invalid_user")?.value === "true";

    if (token) {
        redirect(callbackUrl || "/dashboard");
    }
    // if (session) {
    //     redirect(callbackUrl);
    // }
    return <LoginPage callbackUrl={callbackUrl} isValidUser={isValidUser} />;
}