import React from 'react';
import { Search } from 'lucide-react';
import Button from '../Button';

const SpecificSearchCard: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">Need something specific?</h4>
          <p className="text-sm text-gray-600">Search through thousands of service providers</p>
        </div>
        <Button size="sm" className="shrink-0">
          <Search className="mr-1 h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
};

export default SpecificSearchCard;
