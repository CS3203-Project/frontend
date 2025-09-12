import { Home, Briefcase, Sparkles, Globe, UserCheck, BarChart3, Wrench, BookOpen, Code, Video, PenTool, Camera, Shield, DollarSign, Users, TrendingUp, Heart, Zap } from 'lucide-react';

export interface Service {
  id: string;
  title: string;
  provider: {
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
  };
  price: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  image: string;
  category: string;
  subcategory: string;
}

export interface SubCategory {
    id: string;
    name:string;
    slug: string;
    description: string;
    icon: React.ComponentType<any>;
}

export interface ServiceCategory {
  slug: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  subcategories: SubCategory[];
}

export const servicesData: Service[] = [
    {
        id: '1',
        title: 'Deep House Cleaning',
        provider: { name: 'CleanCo', avatar: '/api/placeholder/40/40', rating: 4.9, reviews: 120 },
        price: { amount: 150, currency: 'USD', type: 'fixed' },
        image: 'https://picsum.photos/seed/cleaning/400/300',
        category: 'home-services',
        subcategory: 'cleaning'
    },
    {
        id: '2',
        title: 'Leaky Faucet Repair',
        provider: { name: 'PlumbPerfect', avatar: '/api/placeholder/40/40', rating: 4.8, reviews: 88 },
        price: { amount: 75, currency: 'USD', type: 'hourly' },
        image: 'https://picsum.photos/seed/plumbing/400/300',
        category: 'home-services',
        subcategory: 'plumbing'
    },
    {
        id: '3',
        title: 'Math Tutoring for High School',
        provider: { name: 'Brainy Tutors', avatar: '/api/placeholder/40/40', rating: 5.0, reviews: 210 },
        price: { amount: 50, currency: 'USD', type: 'hourly' },
        image: 'https://picsum.photos/seed/tutoring/400/300',
        category: 'professional-services',
        subcategory: 'tutoring'
    },
    {
        id: '4',
        title: 'React Web Application Development',
        provider: { name: 'CodeCrafters', avatar: '/api/placeholder/40/40', rating: 4.9, reviews: 150 },
        price: { amount: 2500, currency: 'USD', type: 'fixed' },
        image: 'https://picsum.photos/seed/webdev/400/300',
        category: 'technical-services',
        subcategory: 'web-development'
    },
    {
        id: '5',
        title: 'Modern Logo Design',
        provider: { name: 'PixelPerfect', avatar: '/api/placeholder/40/40', rating: 4.9, reviews: 300 },
        price: { amount: 500, currency: 'USD', type: 'fixed' },
        image: 'https://picsum.photos/seed/logodesign/400/300',
        category: 'creative-services',
        subcategory: 'graphic-design'
    },
];

export const categoriesData: ServiceCategory[] = [
  {
    slug: "home-services",
    title: "Home Services",
    description: "Cleaning, repairs, maintenance",
    icon: Home,
    gradient: "from-green-400 to-blue-500",
    subcategories: [
      { id: 's1', name: "Cleaning", slug: "cleaning", description: "Residential and commercial cleaning.", icon: Sparkles },
      { id: 's2', name: "Plumbing", slug: "plumbing", description: "Fix leaks, install fixtures.", icon: Wrench },
      { id: 's3', name: "Electrician", slug: "electrician", description: "Wiring, repairs, and installations.", icon: Zap },
    ]
  },
  {
    slug: "professional-services",
    title: "Professional Services",
    description: "Tutoring, consulting, coaching",
    icon: Briefcase,
    gradient: "from-blue-400 to-purple-500",
    subcategories: [
        { id: 'p1', name: "Tutoring", slug: "tutoring", description: "Academic help for all subjects.", icon: BookOpen },
        { id: 'p2', name: "Business Consulting", slug: "business-consulting", description: "Strategy and management advice.", icon: BarChart3 },
        { id: 'p3', name: "Life Coaching", slug: "life-coaching", description: "Personal and professional growth.", icon: Users },
    ]
  },
  {
    slug: "creative-services",
    title: "Creative Services",
    description: "Design, photography, writing",
    icon: Sparkles,
    gradient: "from-purple-400 to-pink-500",
    subcategories: [
        { id: 'c1', name: "Graphic Design", slug: "graphic-design", description: "Logos, branding, and illustrations.", icon: PenTool },
        { id: 'c2', name: "Photography", slug: "photography", description: "Portraits, events, and products.", icon: Camera },
        { id: 'c3', name: "Video Editing", slug: "video-editing", description: "Promotional and personal videos.", icon: Video },
    ]
  },
  {
    slug: "technical-services",
    title: "Technical Services",
    description: "IT support, web development",
    icon: Globe,
    gradient: "from-cyan-400 to-blue-500",
    subcategories: [
        { id: 't1', name: "Web Development", slug: "web-development", description: "Custom websites and applications.", icon: Code },
        { id: 't2', name: "IT Support", slug: "it-support", description: "Troubleshooting and tech help.", icon: Shield },
        { id: 't3', name: "Mobile App Development", slug: "mobile-app-development", description: "iOS and Android applications.", icon: Code },
    ]
  },
  {
    slug: "personal-care",
    title: "Personal Care",
    description: "Beauty, wellness, fitness",
    icon: UserCheck,
    gradient: "from-pink-400 to-red-500",
    subcategories: [
        { id: 'pc1', name: "Fitness Training", slug: "fitness-training", description: "Personal trainers and workout plans.", icon: TrendingUp },
        { id: 'pc2', name: "Beauty Services", slug: "beauty-services", description: "Makeup, hair, and skin care.", icon: Sparkles },
        { id: 'pc3', name: "Wellness Coaching", slug: "wellness-coaching", description: "Nutrition and mental well-being.", icon: Heart },
    ]
  },
  {
    slug: "business-services",
    title: "Business Services",
    description: "Accounting, marketing, legal",
    icon: BarChart3,
    gradient: "from-indigo-400 to-purple-500",
    subcategories: [
        { id: 'b1', name: "Accounting", slug: "accounting", description: "Bookkeeping and financial advice.", icon: DollarSign },
        { id: 'b2', name: "Digital Marketing", slug: "digital-marketing", description: "SEO, social media, and ads.", icon: TrendingUp },
        { id: 'b3', name: "Legal Services", slug: "legal-services", description: "Consultations and document review.", icon: Shield },
    ]
  },
];
