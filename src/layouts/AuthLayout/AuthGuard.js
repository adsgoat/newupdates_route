"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login"];

export default function AuthGuard() {
//   const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
//   console.log(status);
  console.log(pathname);

  const verifiedRef = useRef(false);

  useEffect(() => {
    // if (PUBLIC_ROUTES.includes(pathname)) {
    //   return;
    // }

    // if (status !== "authenticated") {
    //   return;
    // }

    // if (status === "loading") {
    //   return;
    // }

    // if (status === "unauthenticated") {
    //   router.replace("/login");
    //   return;
    // }

    const navigation =
      performance.getEntriesByType("navigation")[0];

    const isReload =
      navigation?.type === "reload";

    if (!isReload) {
      return;
    }

    if (verifiedRef.current) {
      return;
    }

    verifiedRef.current = true;

    // verifyUser();
  }, [pathname]);

//   const verifyUser = async () => {
//     try {
//       const response = await fetch(
//         "/api/auth/verify-session",
//         {
//           cache: "no-store",
//         }
//       );

//       const data = await response.json();

//       if (!data.valid) {
//         await signOut({
//           callbackUrl: "/login",
//         });
//       }
//     } catch (error) {
//       console.error(error);

//       await signOut({
//         callbackUrl: "/login",
//       });
//     }
//   };

  return null;
}