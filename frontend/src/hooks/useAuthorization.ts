import { useRouter } from 'next/navigation'; // For App Router
import { useEffect, useState } from 'react';
import { extractToken } from '@/app/_lib/tokenExtract'; // Adjust the import to match your project structure

export function useAuthorization(requiredRoles: string[]) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Call the extractToken function to get the user role and ID
    const fetchUserRoleAndId = async () => {
      try {
        const tokenData = await extractToken();
        
        if (tokenData instanceof Response) {
          // If the result is a Response (Unauthorized or Invalid Token)
          console.log(tokenData.statusText); // You can handle the response here
          return;
        }

        // Otherwise, destructure userId and userRole from the returned object
        const { userRole } = tokenData;
        setUserRole(userRole);
      } catch (error) {
        console.error('Failed to extract token or retrieve role', error);
      }
    };

    // Fetch the role and ID when the component mounts
    fetchUserRoleAndId();
  }, []);

  useEffect(() => {
    // Redirect to the unauthorized page if the role doesn't match the required role
    if (userRole && requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      router.replace('/unauthorized');
    }
  }, [userRole, requiredRoles, router]);
}

























// import { useRouter } from 'next/navigation'; // For App Router
// import { useEffect, useState } from 'react';
// import { extractToken } from '@/app/_lib/tokenExtract'; // Adjust the import to match your project structure

// export async function useAuthorization(requiredRole?: string) {
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [userId, setUserId] = useState<any>(null);  // Add a state to store userId as well
//   const router = useRouter();

//   useEffect(() => {
//     // Call the extractToken function to get the user role and ID
//     const fetchUserRoleAndId = async () => {
//       try {
//         const tokenData = await extractToken();
        
//         if (tokenData instanceof Response) {
//           // If the result is a Response (Unauthorized or Invalid Token)
//           console.log(tokenData.statusText); // You can handle the response here
//           return;
//         }

//         // Otherwise, destructure userId and userRole from the returned object
//         const { userId, userRole } = tokenData;
//         setUserRole(userRole);
//         setUserId(userId);
//       } catch (error) {
//         console.error('Failed to extract token or retrieve role', error);
//       }
//     };

//     // Fetch the role and ID when the component mounts
//     fetchUserRoleAndId();
//   }, []);

//   useEffect(() => {
//     // Redirect to the unauthorized page if the role doesn't match the required role
//     if (userRole && requiredRole && userRole !== requiredRole) {
//       router.replace('/unauthorized');
//     }
//   }, [userRole, requiredRole, router]);
// }










// import { useRouter } from 'next/navigation'; // For App Router
// import { useEffect } from 'react';
// import { getCookie } from 'cookies-next';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';

// export async function useAuthorization(requiredRole?: string) {
//     const router = useRouter();
  
//     useEffect(() => {
//       const userRole = getCookie('role');
//       console.log("hello from hook!");
//       console.log(userRole); //undefined!
  
//       if (requiredRole && userRole !== requiredRole) {
//         router.replace('/unauthorized');
//       }
//     }, [router, requiredRole]);
//   }
  