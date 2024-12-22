// import axiosInstance from '@/utils/axiosInstance';
'use server';
import axiosInstance from "@/app/utils/axiosInstance";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Module } from "@/types/Module";
import { Question } from "@/types/Question";
import { Resource } from "@/types/Resource";
import { fetchInstructor } from "./courseRoute";
import { Types } from "mongoose";


// Create a new module
export async function createModule(moduleData: Module) {
  try {
    console.log(moduleData);
    let instr =  await fetchInstructor() as {id:string,role:string};
    const { data } = await axiosInstance.post('/modules',{...moduleData,instructor_id:instr.id});
    console.log(data);
    return data;
  } catch (error: any) {
    console.error('Error creating module:', error.message);
    throw error;
  }
}



// Update a module by ID
export async function updateModule(moduleId: string, updateData: Module) {
  try {
    console.log(moduleId);
    console.log(updateData);
    const { data } = await axiosInstance.patch(`/modules/${moduleId}`, updateData);
    return data;
  } catch (error: any) {
    console.error('Error updating module:', error.message);
    throw error;
  }
}


export async function getModule(moduleId: string) {
    try {
      const { data } = await axiosInstance.get(`/modules/${moduleId}`);
      return data;
    } catch (error: any) {
      console.error('Error updating module:', error.message);
    }
  }



// Add a question to a module's question bank
export async function addQuestionToModule(createQuestionDto:Question) {
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('token');
  
      if (!tokenCookie) {
        return new Response('Unauthorized', { status: 401 });
      }
  
      const decodedToken = jwt.decode(tokenCookie.value);
  
      if (!decodedToken) {
        console.log("Decoded token is invalid");
        return new Response('Invalid Token', { status: 401 });
      }
  
      const userid = (decodedToken as any)?.userid;
      const userRole = (decodedToken as any)?.role;
  
      if (userRole !== 'instructor') {
        console.log("Not an instructor");
        return new Response('Not an instructor', { status: 401 });
      }
      console.log('dddddddddd');
      const { data } = await axiosInstance.post(`/modules/question-bank`, {
        ...createQuestionDto,
        instructor_id: userid,
      });
      console.log(data);
  
      return data;
    } catch (error:any) {
      console.error('Error adding question:', error.message);
      throw error;
    }
  }
  
  // Update a question in the module's question bank
  export async function updateQuestionInModule(quesId:string, updateQuestionDto:Question) {
    try {
      console.log("anat3bt",quesId,updateQuestionDto)
      let sentq = {
        correct_answer: updateQuestionDto.correct_answer,
        difficulty_level: updateQuestionDto.difficulty_level,
        question_type: updateQuestionDto.question_type,
        question: updateQuestionDto.question,
        //options: updateQuestionDto.options,
      }
      console.log(sentq);
      const { data } = await axiosInstance.patch(`/modules/question-bank/${quesId}`, sentq);
      return data;
    } catch (error:any) {
      console.error('Error updating question:', error.message);
      throw error;
    }
  }
  
  // Delete a question from the module's question bank
  export async function deleteQuestionFromModule(quesId:string) {
    try {
      const { data } = await axiosInstance.delete(`/modules/question-bank/${quesId}`);
      return data;
    } catch (error:any) {
      console.error('Error deleting question:', error.message);
      throw error;
    }
  }
  
  // Fetch the question bank for a specific module
  export async function fetchQuestionBank(moduleId:string) :Promise<Question[] | {message:string}>{
    try {
      const { data } = await axiosInstance.get(`/modules/${moduleId}/question-bank`);

      const questions = await Promise.all(
      data.map(async (question: Types.ObjectId) => {
              return await getQuestion(question.toString());
            })
          );
          
      return questions;
    } catch (error:any) {
      console.error('Error fetching question bank:', error.message);
      //throw error;
      return {message:error}
    }
  }

  export async function getQuestion(questionId:string) {
    try {
      const { data } = await axiosInstance.get(`/modules/question-bank/${questionId}`);
      return data;
    } catch (error:any) {
      console.error('Error fetching resource:', error.message);
      throw error;
    }
  }
  

  
  // Upload a resource file to a module
  export async function uploadModuleResource(moduleId:string, fileData:any) {
    try {
     
      const formData =new FormData();
      console.log(fileData);
      formData.append('title', fileData.get('title'));
      formData.append('description', fileData.get('description'));
      formData.append('type', fileData.get('type'));

      //const blob = new Blob([], { type: 'application/pdf' });
      formData.append('file', fileData.get('file'));
      const { data } = await axiosInstance.post(`/modules/${moduleId}/resource`, formData, {
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

  
  // Delete a resource from a module
  export async function deleteModuleResource(resourceId:string) {
    try {
      const { data } = await axiosInstance.delete(`/modules/resources/${resourceId}`);
      return data;
    } catch (error:any) {
      console.error('Error deleting resource:', error.message);
      throw error;
    }
  }
  
  // Fetch all resources for a module
  export async function fetchModuleResources(moduleId:string) {
    try {
      const { data } = await axiosInstance.get(`/modules/${moduleId}/resources`);

      const resources = data ;
      // await Promise.all(
      //   data.map(async (resource: Types.ObjectId) => {
      //     console.log('kk',resource);
      //           return await fetchResourceById(resource.toString());
      //         })
      //       );
      console.log(resources);
      return resources;
    } catch (error:any) {
      console.error('Error fetching resources:', error.message);
      throw error;
    }
  }
  
  // Fetch a specific resource by ID
  export async function fetchResourceById(resourceId:string) {
    try {
      const { data } = await axiosInstance.get(`/modules/resources/${resourceId}`);
      return data;
    } catch (error:any) {
      console.error('Error fetching resource:', error.message);
      throw error;
    }
  }
  
  // Download a resource file
  export async function downloadResourceFile(filename:string) {
    try {
      const { data } = await axiosInstance.get(`/modules/download/${filename}`, { responseType: 'blob' });
      return data;
    } catch (error:any) {
      console.error('Error downloading resource:', error.message);
      throw error;
    }
  }
  
  // Update resource metadata
  export async function updateResourceMetadata(resourceId:string, updateData:Resource) {
    try {
      const { data } = await axiosInstance.patch(`/modules/resources/${resourceId}`, updateData);
      return data;
    } catch (error:any) {
      console.error('Error updating resource metadata:', error.message);
      throw error;
    }
  }
  