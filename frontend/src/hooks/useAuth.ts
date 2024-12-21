import { useRouter } from 'next/navigation'; // For App Router
import { useEffect } from 'react';
import { getCookie } from 'cookies-next';

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    const publicPaths = ['/login', '/register']; // Define public routes

    if (!token && !publicPaths.includes(window.location.pathname)) {
      router.replace('/login'); // Redirect to login if unauthenticated
    }
  }, [router]);
}



// import { useEffect } from "react";
// import { useRouter } from 'next/navigation'; // For App Router
// import jwt from "jsonwebtoken";
// import Cookies from "js-cookie"; // Manage cookies client-side

// interface DecodedToken {
//   userId?: string;
//   role?: string;
// }

// export const useAuth = (allowedRoles: string[] = []) => {
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = Cookies.get("token");
//       if (!token) {
//         router.replace("/login");
//         return;
//       }

//       try {
//         const decodedToken = jwt.decode(token) as DecodedToken;
//         const userRole = decodedToken?.role;

//         if (allowedRoles.length && !allowedRoles.includes(userRole || "")) {
//           router.replace("/login");
//         }
//       } catch (err) {
//         Cookies.remove("token");
//         router.replace("/login");
//       }
//     };

//     checkAuth();
//   }, [allowedRoles, router]);
// };
