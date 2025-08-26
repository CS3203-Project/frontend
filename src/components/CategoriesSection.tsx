import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Grid3X3, Home, Briefcase, Monitor, GraduationCap, Car, Calendar, Building2 } from 'lucide-react';
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

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const subcategoryCount = category.children?.length || 0;
  const serviceCount = category._count?.services || 0;
  
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
      
      {/* Subcategories Preview */}
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

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse Service Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover services across various categories and find the perfect provider for your needs
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
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
      </section>
    );
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Grid3X3 className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Browse Service Categories
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover services across various categories and find the perfect provider for your needs
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Show More/Less Button */}
        {categories.length > 6 && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronRight className="ml-2 h-4 w-4 rotate-90" />
                </>
              ) : (
                <>
                  View All Categories ({categories.length})
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-xl p-8 border border-gray-200">
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
    </section>
  );
};

export default CategoriesSection;
