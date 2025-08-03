import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { servicesData, categoriesData } from '../data/servicesData';
import ServiceCard from '../components/services/ServiceCard';
import Breadcrumb from '../components/services/Breadcrumb';
import type { ServiceCategory as ServiceCategoryType } from '../data/servicesData';
import { ChevronDown } from 'lucide-react';

const SubCategorySidebar: React.FC<{
  category: ServiceCategoryType;
  selectedSubCategory: string | null;
  onSelectSubCategory: (slug: string | null) => void;
}> = ({ category, selectedSubCategory, onSelectSubCategory }) => {
  return (
    <div className="w-full md:w-1/4 lg:w-1/5 p-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Subcategories</h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectSubCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
              selectedSubCategory === null
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All {category.title}
          </button>
        </li>
        {category.subcategories.map((sub) => (
          <li key={sub.slug}>
            <button
              onClick={() => onSelectSubCategory(sub.slug)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-between ${
                selectedSubCategory === sub.slug
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{sub.name}</span>
              <sub.icon className="w-4 h-4 text-gray-500" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ServiceCategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const category = categoriesData.find(c => c.slug === categorySlug);
  
  if (!category) {
    return <div className="text-center py-20">Category not found.</div>;
  }

  const filteredServices = selectedSubCategory
    ? servicesData.filter(s => s.category === category.slug && s.subcategory === selectedSubCategory)
    : servicesData.filter(s => s.category === category.slug);

  const breadcrumbItems = [
    { label: 'Services', href: '/services' },
    { label: category.title }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-4 flex items-center">
            <category.icon className={`w-12 h-12 p-2 rounded-lg text-white bg-gradient-to-r ${category.gradient}`} />
            <div className="ml-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{category.title}</h1>
              <p className="text-md text-gray-600 mt-1">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row -mx-4">
          {/* Sidebar for Subcategories */}
          <SubCategorySidebar 
            category={category}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={setSelectedSubCategory}
          />

          {/* Main Content */}
          <div className="w-full md:w-3/4 lg:w-4/5 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedSubCategory 
                  ? category.subcategories.find(s => s.slug === selectedSubCategory)?.name 
                  : `All ${category.title}`
                }
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{filteredServices.length} services</span>
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Sort by: Relevance</option>
                    <option>Sort by: Price (Low to High)</option>
                    <option>Sort by: Price (High to Low)</option>
                    <option>Sort by: Rating</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700">No services found</h3>
                <p className="text-gray-500 mt-2">There are currently no services available in this subcategory.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategoryPage;
