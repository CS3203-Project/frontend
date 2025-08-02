import React from 'react';
import { Link } from 'react-router-dom';
import { categoriesData } from '../data/servicesData';
import { ArrowRight } from 'lucide-react';
import SpecificSearchCard from '../components/services/SpecificSearchCard';

const BrowseServices: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Browse Our Services
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
            Find the right professional for any job, from home repairs to business consulting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categoriesData.map((category) => (
            <Link
              key={category.slug}
              to={`/services/${category.slug}`}
              className="group block rounded-xl border border-gray-200/80 p-6 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${category.gradient} text-white`}>
                  <category.icon className="h-7 w-7" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                  <p className="mt-1 text-gray-600">{category.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm font-medium text-blue-600">
                <span>View Services</span>
                <ArrowRight className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <SpecificSearchCard />
        </div>
      </div>
    </div>
  );
};

export default BrowseServices;
