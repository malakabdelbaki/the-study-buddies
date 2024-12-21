import { Resource } from '@/types/Resource';
import React, { useState } from 'react';
import { format } from 'date-fns';


type ResourceCardProps = {
  resource: Resource;
  onUpdate: (updatedResource: Resource) => void;
  onDelete: (resourceId: string) => void;
};

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const [editedResource, setEditedResource] = useState<Resource>({
    ...resource,
  });

  const handleInputChange = (field: keyof Resource, value: string) => {
    setEditedResource((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(editedResource);
    setIsEditing(false);
  };

  return  (
    <div
      className={`border p-4 mb-4 rounded ${
        resource.isOutdated ? 'bg-gray-200' : ''
      }`}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedResource.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="border p-2 w-full mb-2"
            placeholder="Enter title"
          />
          <textarea
            value={editedResource.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="border p-2 w-full mb-2"
            placeholder="Enter description"
            rows={4}
          />
          <p className="mb-2">
            <span className="font-bold">Is Outdated:</span> {resource.isOutdated ? 'YES' : 'NO'}
          </p>
          <p className="mb-2">
          <span className="font-bold">Last Edited:</span> {resource.updatedAt ? format(new Date(resource.updatedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
          </p>
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 text-white px-4 py-2"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
          <p className="mb-2">
            <span className="font-bold">Description:</span> {(resource.description)?resource.description:'no specified'}
          </p>
          <p className="mb-2">
            <span className="font-bold">Content Type:</span> {(resource.type)?resource.type:'no specified' }
          </p>
          <p className="mb-2">
            <span className="font-bold">Is Outdated:</span> {resource.isOutdated ? 'YES' : 'NO'}
          </p>
          <p className="mb-2">
          <span className="font-bold">Last Edited:</span> {resource.updatedAt ? format(new Date(resource.updatedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
          </p>

          <button
            onClick={() => window.open(resource.url, '_blank')}
            className="bg-blue-500 text-white px-4 py-2 mr-2"
          >
            Open
          </button>
          <button
            onClick={() => (window.location.href = resource.url as string)}
            className="bg-green-500 text-white px-4 py-2 mr-2"
          >
            Download
          </button>
          {!resource.isOutdated && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 text-white px-4 py-2 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(resource._id as string)}
                className="bg-red-500 text-white px-4 py-2"
              >
                Delete
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ResourceCard;
