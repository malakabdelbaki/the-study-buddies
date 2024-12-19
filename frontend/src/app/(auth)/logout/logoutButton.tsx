'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Make the request to the logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST', // Assuming POST request for logout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // On success, redirect the user to the login page
        router.push('/login'); // Redirect to login or home page
      } else {
        // Handle any errors (e.g., token not provided)
        const errorData = await response.json();
        console.error('Logout failed:', errorData.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
      Logout
    </button>
  );
}



// 'use client';

// import logout from './logout.server'; // Import the server action

// export default function LogoutButton() {
//   const handleLogout = async () => {
//     await logout(); // Call the server-side logout action
//   };

//   return (
//     <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
//       Logout
//     </button>
//   );
// }
