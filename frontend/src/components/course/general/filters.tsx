// // app/courses/components/Filters.tsx
// import React from "react";

// const Filters = ({ setFilters }) => {
//   const handleCategoryChange = (e) => {
//     setFilters((prev) => ({ ...prev, category: e.target.value }));
//   };

//   const handleLevelChange = (e) => {
//     setFilters((prev) => ({ ...prev, level: e.target.value }));
//   };

//   return (
//     <div className="filters">
//       <select onChange={handleCategoryChange}>
//         <option value="">All Categories</option>
//         <option value="tech">Tech</option>
//         <option value="design">Design</option>
//         {/* Add more categories */}
//       </select>
//       <select onChange={handleLevelChange}>
//         <option value="">All Levels</option>
//         <option value="beginner">Beginner</option>
//         <option value="advanced">Advanced</option>
//         {/* Add more levels */}
//       </select>
//     </div>
//   );
// };

// export default Filters;
