import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, ChevronRight, Loader2, Home, Briefcase, Monitor, GraduationCap, Car, Calendar, Building2 } from 'lucide-react';
import { categoryApi, type Category } from '../api/categoryApi';

// Icon mapping for categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('home') || name.includes('garden')) {
    return <Home className="h-6 w-6" />;
  } else if (name.includes('health') || name.includes('wellness')) {
    return <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
      <span className="text-white text-sm font-bold">+</span>
    </div>;
  } else if (name.includes('technology') || name.includes('tech')) {
    return <Monitor className="h-6 w-6" />;
  } else if (name.includes('education') || name.includes('tutoring')) {
    return <GraduationCap className="h-6 w-6" />;
  } else if (name.includes('transport') || name.includes('vehicle')) {
    return <Car className="h-6 w-6" />;
  } else if (name.includes('event') || name.includes('entertainment')) {
    return <Calendar className="h-6 w-6" />;
  } else if (name.includes('business') || name.includes('professional')) {
    return <Building2 className="h-6 w-6" />;
  } else {
    return <Briefcase className="h-6 w-6" />;
  }
};

const CategoryCard: React.FC<{ 
  category: Category; 
  viewMode: 'grid' | 'list' 
}> = ({ category, viewMode }) => {
  const subcategoryCount = category.children?.length || 0;
  const serviceCount = category._count?.services || 0;
  
  if (viewMode === 'list') {
    return (
      <Link
        to={`/services/${category.slug}`}
        className="group block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300">
              {getCategoryIcon(category.name || category.slug)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {category.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{subcategoryCount} subcategories</span>
                <span>{serviceCount} services</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        
        {/* Subcategories Preview for List View */}
        {category.children && category.children.length > 0 && (
          <div className="mt-3 pl-16">
            <div className="flex flex-wrap gap-1">
              {category.children.slice(0, 5).map((sub) => (
                <span
                  key={sub.id}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {sub.name}
                </span>
              ))}
              {category.children.length > 5 && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md">
                  +{category.children.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={`/services/${category.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-6 h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300">
            {getCategoryIcon(category.name || category.slug)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{subcategoryCount} subcategories</span>
        <span>{serviceCount} services</span>
      </div>
      
      {/* Subcategories Preview for Grid View */}
      {category.children && category.children.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {category.children.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {sub.name}
              </span>
            ))}
            {category.children.length > 3 && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md">
                +{category.children.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'services' | 'subcategories'>('name');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await categoryApi.getRootCategories({ 
          includeChildren: true 
        });
        
        if (response.success) {
          setCategories(response.data);
          setFilteredCategories(response.data);
        } else {
          setError(response.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter and sort categories
  useEffect(() => {
    let filtered = categories.filter(category =>
      category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.children?.some(child => 
        child.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Sort categories
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'services':
          return (b._count?.services || 0) - (a._count?.services || 0);
        case 'subcategories':
          return (b.children?.length || 0) - (a.children?.length || 0);
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Unable to Load Categories
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Grid3X3 className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Service Categories
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse through our comprehensive list of service categories to find exactly what you need.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'services' | 'subcategories')}
                className="border border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="services">Sort by Services Count</option>
                <option value="subcategories">Sort by Subcategories</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing {filteredCategories.length} of {categories.length} categories
              {searchQuery && (
                <span> matching "{searchQuery}"</span>
              )}
            </p>
          </div>
        </div>

        {/* Categories Grid/List */}
        {filteredCategories.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredCategories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `No categories match your search for "${searchQuery}"`
                : 'No categories are available at the moment'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-16 bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600">Main Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0)}
              </div>
              <div className="text-gray-600">Subcategories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {categories.reduce((sum, cat) => sum + (cat._count?.services || 0), 0)}
              </div>
              <div className="text-gray-600">Total Services</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
