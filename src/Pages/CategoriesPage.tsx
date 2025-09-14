import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, ChevronRight, Loader2, Home, Briefcase, Monitor, GraduationCap, Car, Calendar, Building2 } from 'lucide-react';
import { categoryApi, type Category } from '../api/categoryApi';
import Orb from '../components/ui/Orb';

// Icon mapping for categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('home') || name.includes('garden')) {
    return <Home className="h-6 w-6" />;
  } else if (name.includes('health') || name.includes('wellness')) {
    return <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
      <span className="text-white text-xs font-bold">+</span>
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
        className="group block bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/20 hover:shadow-2xl transition-all duration-500 p-6 relative overflow-hidden"
      >
        {/* Enhanced multi-layer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 opacity-0 group-hover:animate-pulse group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 text-white group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-purple-500/25 relative overflow-hidden">
              {/* Icon glitter effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              <div className="relative z-10">
                {getCategoryIcon(category.name || category.slug)}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-500 relative">
                {category.name}
                {/* Text underline effect */}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-500"></div>
              </h3>
              {category.description && (
                <p className="text-sm text-gray-300 group-hover:text-gray-200 mt-1 line-clamp-1 transition-colors duration-300">
                  {category.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                <span className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-60"></div>
                  <span>{subcategoryCount} subcategories</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60"></div>
                  <span>{serviceCount} services</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-500" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">
              <ChevronRight className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
        
        {/* Subcategories Preview for List View */}
        {category.children && category.children.length > 0 && (
          <div className="mt-4 pl-16 relative">
            {/* Glowing line connector */}
            <div className="absolute left-8 top-0 w-px h-full bg-gradient-to-b from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex flex-wrap gap-2">
              {category.children.slice(0, 5).map((sub, index) => (
                <span
                  key={sub.id}
                  className={`inline-block px-3 py-1 bg-black/30 backdrop-blur-sm text-gray-300 group-hover:text-gray-200 text-xs rounded-full border border-white/20 group-hover:border-white/30 transition-all duration-300 relative overflow-hidden opacity-0 group-hover:opacity-100 animate-in slide-in-from-bottom-${index + 1}`}
                >
                  {/* Subtle shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 opacity-0 group-hover:animate-pulse"></div>
                  <span className="relative z-10">{sub.name}</span>
                </span>
              ))}
              {category.children.length > 5 && (
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm text-blue-300 group-hover:text-blue-200 text-xs rounded-full border border-blue-400/30 group-hover:border-blue-400/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-pulse"></div>
                  <span className="relative z-10">+{category.children.length - 5} more</span>
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
      className="group block bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/20 hover:shadow-2xl transition-all duration-500 p-6 h-full relative overflow-hidden"
    >
      {/* Enhanced multi-layer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 opacity-0 group-hover:animate-pulse group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 text-white group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-purple-500/25 relative overflow-hidden">
            {/* Icon glitter effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              {getCategoryIcon(category.name || category.slug)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-500 relative">
              {category.name}
              {/* Text underline effect */}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-500"></div>
            </h3>
            {category.description && (
              <p className="text-sm text-gray-300 group-hover:text-gray-200 mt-1 line-clamp-2 transition-colors duration-300">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-500" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">
            <ChevronRight className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
      
      <div className="relative flex items-center justify-between text-sm text-gray-400 group-hover:text-gray-300 mb-3 transition-colors duration-300">
        <span className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span>{subcategoryCount} subcategories</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span>{serviceCount} services</span>
        </span>
      </div>
      
      {/* Subcategories Preview for Grid View */}
      {category.children && category.children.length > 0 && (
        <div className="relative mt-3 pt-3 border-t border-white/20 group-hover:border-white/30 transition-colors duration-300">
          <div className="flex flex-wrap gap-1">
            {category.children.slice(0, 3).map((sub, index) => (
              <span
                key={sub.id}
                className={`inline-block px-2 py-1 bg-black/30 backdrop-blur-sm text-gray-300 group-hover:text-gray-200 text-xs rounded-full border border-white/20 group-hover:border-white/30 transition-all duration-300 relative overflow-hidden opacity-0 group-hover:opacity-100 animate-in slide-in-from-bottom-${index + 1}`}
              >
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 opacity-0 group-hover:animate-pulse"></div>
                <span className="relative z-10">{sub.name}</span>
              </span>
            ))}
            {category.children.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm text-blue-300 group-hover:text-blue-200 text-xs rounded-full border border-blue-400/30 group-hover:border-blue-400/50 transition-all duration-300 relative overflow-hidden opacity-0 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-pulse"></div>
                <span className="relative z-10">+{category.children.length - 3} more</span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'services' | 'subcategories'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await categoryApi.getCategories({
          includeChildren: true,
          includeServices: true,
          withCounts: true
        });
        
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          setError(response.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('An error occurred while fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const matchesName = category.name?.toLowerCase().includes(query);
    const matchesDescription = category.description?.toLowerCase().includes(query);
    const matchesSubcategory = category.children?.some(child => 
      child.name?.toLowerCase().includes(query)
    );
    
    return matchesName || matchesDescription || matchesSubcategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'services':
        return (b._count?.services || 0) - (a._count?.services || 0);
      case 'subcategories':
        return (b.children?.length || 0) - (a.children?.length || 0);
      case 'name':
      default:
        return (a.name || '').localeCompare(b.name || '');
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
                <p className="text-gray-300">Loading categories...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Categories</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 opacity-20">
        <Orb hue={240} hoverIntensity={0.3} rotateOnHover={true} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 opacity-15">
        <Orb hue={280} hoverIntensity={0.4} rotateOnHover={true} />
      </div>
      
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent mb-4">
            Service Categories
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our comprehensive range of professional services organized by category
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 p-6 relative overflow-hidden group">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 opacity-0 group-hover:animate-pulse group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 focus:bg-white/15"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-300" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'services' | 'subcategories')}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white transition-all duration-300 hover:bg-white/15 focus:bg-white/15"
              >
                <option value="name" className="bg-gray-800 text-white">Sort by Name</option>
                <option value="services" className="bg-gray-800 text-white">Sort by Services Count</option>
                <option value="subcategories" className="bg-gray-800 text-white">Sort by Subcategories</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-gray-300">
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
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/10 relative overflow-hidden group">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-orange-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            
            <div className="relative">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No categories found
              </h3>
              <p className="text-gray-300 mb-6">
                {searchQuery 
                  ? `No categories match your search for "${searchQuery}"`
                  : 'No categories are available at the moment'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-16 bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          
          <div className="relative">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Platform Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="group/stat p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                  {categories.length}
                </div>
                <div className="text-gray-300 text-sm">Main Categories</div>
              </div>
              <div className="group/stat p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-green-400/30 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                  {categories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0)}
                </div>
                <div className="text-gray-300 text-sm">Subcategories</div>
              </div>
              <div className="group/stat p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-400/30 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                  {categories.reduce((sum, cat) => sum + (cat._count?.services || 0), 0)}
                </div>
                <div className="text-gray-300 text-sm">Total Services</div>
              </div>
              <div className="group/stat p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-orange-400/30 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2 group-hover/stat:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-gray-300 text-sm">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;