import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from "@/app/utils/axiosInstance";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = new URLSearchParams({
      category: searchParams.get('category') || "",
      title: searchParams.get('title') || "",
      key_word: searchParams.get('key_word') || "",
      difficulty: searchParams.get('difficulty') || "",
      instructor: searchParams.get('instructor') || ""
    });

    const response = await axiosInstance.get(`courses?${params}`);

    if (response.status !== 200) {
      return NextResponse.json({ message: 'error' }, { status: response.status });
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

