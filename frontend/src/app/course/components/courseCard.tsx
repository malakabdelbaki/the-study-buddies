// app/courses/components/CourseCard.tsx
import React from "react";
import Link from "next/link";
import { User } from "@/types/User";
import { Course } from "@/types/Course";

const CourseCard = ({ course }: { course: Course }) => {

  let inst_info = course.instructor_id as unknown as User;

  return (
    <div className="course-card">
      {/* <img src={course} alt={course.name} /> */}
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <p>Category: {course.category}</p>
      <p>Level: {course.difficulty_level}</p>
      <p>Number of Modules: {course.modules?.length}</p>
      <p>Instructor : {inst_info?.name}</p>
      {course.key_words?.length && <><p>keywords :</p><ul>
          {course.key_words?.map((word, index) => <li key={index}>{word}</li>)}</ul></>
      }
      <br/>
      <Link href={`course/${course._id}`}>Click To course details</Link>
      <p>______________________________________________</p>
    </div>
  );
};

export default CourseCard;
