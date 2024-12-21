import React, { useState } from 'react';
import { uploadModuleResource } from '../../../app/api/courses/instructor/moduleRoute';


const AddResourceForm = ({ moduleId, InstructorId }: { moduleId: string; InstructorId: string }) => {
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: '',
    file: null as File | null,
    module_id: moduleId,
    instructor_id: InstructorId,
  });


  // Handle input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewResource((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Handle changes for select fields
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewResource((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewResource((prev) => ({
      ...prev,
      file,
    }));
  };


  const handleAddResource = async () => {
    console.log('New Resource:', newResource);


    // Create form data for file upload
    const formData = new FormData();
    formData.append('title', newResource.title);
    formData.append('description', newResource.description || '');
    formData.append('type', newResource.type || '');
    formData.append('file', newResource.file as File);
  
    let response = await uploadModuleResource(moduleId,formData);

    console.log(response);
    if (response) {
      // Reset form after successful submission
      setNewResource({
        title: '',
        description: '',
        type: '',
        file: null,
        module_id: moduleId,
        instructor_id: InstructorId,
      });
    }
  };


  return (
    <div className="add-resource">
      <h1>Add A New Resource</h1>
      <div>
        {/* Title */}
        <input
          type="text"
          name="title"
          value={newResource.title}
          onChange={handleInputChange}
          placeholder="Resource Title"
          className="border p-2 w-full mb-2"
        />


        {/* Description */}
        <textarea
          name="description"
          value={newResource.description}
          onChange={handleInputChange}
          placeholder="Resource Description"
          className="border p-2 w-full mb-2"
        />


        {/* Type */}
        <select
          name="type"
          value={newResource.type}
          onChange={handleSelectChange}
          className="border p-2 w-full mb-2"
        >
          <option value="">Select Resource Type</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="other">Other</option>
        </select>


        {/* File Upload */}
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 w-full mb-2"
        />


        {/* Add Resource Button */}
        <button onClick={handleAddResource} className="bg-blue-500 text-white px-4 py-2">
          Add Resource
        </button>
      </div>
    </div>
  );
};


export default AddResourceForm;