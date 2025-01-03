
'use server'
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';
//import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import axiosInstance from '@/app/utils/axiosInstance';

// Helper to decode JWT and extract user info
const getUserFromToken = async () => {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) throw new Error('Unauthorized');
  const decodedToken = jwt.decode(tokenCookie.value);

  if (!decodedToken) throw new Error('Invalid Token');

  return {
    userId: (decodedToken as any)?.userid,
    role: (decodedToken as any)?.role,
    token: tokenCookie.value, // Include the raw token for external requests
  };
};

// GET: Retrieve User Details
export async function GET() {
  try {
    const { userId, token } = await getUserFromToken();

    // External call to fetch user by ID
    const response = await axios.get(
      `http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching user details:', error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// PUT: Update User Personal Information
export async function PUT(req: Request) {
  try {
    const { userId, token } = await getUserFromToken();
     

    // Extract data for updating personal information
    const updateData = await req.json();

    // External call to update personal info
    const response = await axios.put(
      `http://localhost:3000/api/users/${userId}/personal-info`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error updating personal information:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PATCH: Change User Password
export async function PATCH(req: Request) {
  try {
    const { userId, token } = await getUserFromToken();

    // Extract password change details from the request body
    const { newPassword, confirmPassword } = await req.json();

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Admin can optionally pass userId; others change their own password
    const response = await axios.patch(
      `http://localhost:3000/api/users/change-password/${userId}`,
      { newPassword }, // DTO
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json({ message: response.data });
  } catch (error: any) {
    console.error('Error changing password:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE: Delete User Account
export async function DELETE() {
  try {
    const { userId, token } = await getUserFromToken();

    const response = await axios.delete(
      `http://localhost:3000/api/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data)

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error deleting user:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function uploadPic(fileData:any) {
  try {
    const { userId, role, token } = await getUserFromToken();
   
    const formData =new FormData();
    console.log(fileData);
    // formData.append('title', fileData.get('title'));
    // formData.append('description', fileData.get('description'));
    // formData.append('type', fileData.get('type'));
    formData.append('profilePicture', fileData);

    //const blob = new Blob([], { type: 'application/pdf' });
    //formData.append('file', fileData.get('file'));
    const { data } = await axiosInstance.post(`users/${userId}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data ;
  } catch (error:any) {
    console.error('Error uploading resource:', error);
    throw error;
  }
}



