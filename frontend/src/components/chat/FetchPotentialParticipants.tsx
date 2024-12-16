'use server';
import axiosInstance from '@/app/utils/axiosInstance';
import { User } from '@/types/User';
import { Course } from '@/types/Course';
import Chat from '@/components/chat/Chat';


export async function fetchPotentialParticipants(userId:string, courseId:string) :Promise<User[]> {

  const userListResponse = await axiosInstance.get(`chat/potential-participants/${courseId}`);

  return userListResponse.data;
};

