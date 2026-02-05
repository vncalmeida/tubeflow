import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
  <div className="mb-8">
    <div className="flex items-center space-x-3 mb-2">
      <div className="w-2 h-8 bg-red-600 rounded-full"></div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
    </div>
    <p className="text-gray-600 dark:text-gray-300 ml-5">{description}</p>
  </div>
);

export default PageHeader;
