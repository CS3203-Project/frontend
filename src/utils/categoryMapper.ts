import type { Category } from '../api/categoryApi';
import { Home, Briefcase, Sparkles, Globe, UserCheck, BarChart3, Wrench, Paintbrush, BookOpen, Code, Video, PenTool, Camera, Shield, DollarSign, Users, TrendingUp, Heart, Zap } from 'lucide-react';

// Icon mapping for categories
const categoryIconMap: Record<string, any> = {
  'home-services': Home,
  'professional-services': Briefcase,
  'creative-services': Sparkles,
  'technical-services': Globe,
  'personal-care': UserCheck,
  'business-services': BarChart3,
};

// Gradient mapping for categories
const categoryGradientMap: Record<string, string> = {
  'home-services': 'from-green-400 to-blue-500',
  'professional-services': 'from-blue-400 to-purple-500',
  'creative-services': 'from-purple-400 to-pink-500',
  'technical-services': 'from-cyan-400 to-blue-500',
  'personal-care': 'from-pink-400 to-red-500',
  'business-services': 'from-indigo-400 to-purple-500',
};

// Sub-category icon mapping
const subcategoryIconMap: Record<string, any> = {
  // Home Services
  'cleaning': Sparkles,
  'plumbing': Wrench,
  'electrical': Zap,
  'hvac': Home,
  'landscaping': Heart,
  
  // Professional Services
  'tutoring': BookOpen,
  'business-consulting': BarChart3,
  'life-coaching': Users,
  'career-counseling': TrendingUp,
  'financial-planning': DollarSign,
  
  // Creative Services
  'graphic-design': PenTool,
  'photography': Camera,
  'video-production': Video,
  'content-writing': PenTool,
  'web-design': Paintbrush,
  
  // Technical Services
  'web-development': Code,
  'mobile-app-development': Code,
  'it-support': Shield,
  'database-management': BarChart3,
  'cybersecurity': Shield,
  
  // Business Services
  'accounting': DollarSign,
  'digital-marketing': TrendingUp,
  'legal-services': Shield,
  'human-resources': Users,
  'project-management': BarChart3,
  
  // Personal Care
  'fitness-training': TrendingUp,
  'beauty-services': Sparkles,
  'wellness-coaching': Heart,
  'massage-therapy': Heart,
  'mental-health': Heart,
};

export interface NavbarCategoryData {
  slug: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: React.ComponentType<any>;
  }>;
}

export const mapCategoriesToNavbarFormat = (categories: Category[]): NavbarCategoryData[] => {
  return categories.map(category => ({
    slug: category.slug,
    title: category.name || category.slug,
    description: category.description || `Services related to ${category.name || category.slug}`,
    icon: categoryIconMap[category.slug] || Briefcase,
    gradient: categoryGradientMap[category.slug] || 'from-gray-400 to-gray-600',
    subcategories: (category.children || []).map(subcategory => ({
      id: subcategory.id,
      name: subcategory.name || subcategory.slug,
      slug: subcategory.slug,
      description: subcategory.description || `${subcategory.name || subcategory.slug} services`,
      icon: subcategoryIconMap[subcategory.slug] || Briefcase,
    }))
  }));
};

// Export utility functions for getting category icons and gradients
export const getCategoryIcon = (slug: string) => {
  return categoryIconMap[slug] || Briefcase;
};

export const getCategoryGradient = (slug: string) => {
  return categoryGradientMap[slug] || 'from-gray-400 to-gray-600';
};

export const getSubcategoryIcon = (slug: string) => {
  return subcategoryIconMap[slug] || Briefcase;
};
