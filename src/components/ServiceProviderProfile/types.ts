export interface ServiceProviderProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  verified: boolean;
  premiumProvider: boolean;
  rating: number;
  totalReviews: number;
  completedProjects: number;
  responseTime: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    timezone: string;
    servicesArea: string[];
  };
  joinedDate: string;
  lastActive: string;
  languages: string[];
  hourlyRate: {
    min: number;
    max: number;
    currency: string;
  };
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    nextAvailable: string;
    workingHours: {
      [key: string]: {
        start: string;
        end: string;
        available: boolean;
      };
    };
  };
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    duration: string;
    category: string;
    images: string[];
    features: string[];
    addOns: Array<{
      name: string;
      price: number;
      description: string;
    }>;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    completedDate: string;
    clientRating: number;
    technologies?: string[];
  }>;
  reviews: Array<{
    id: string;
    clientName: string;
    clientAvatar: string;
    rating: number;
    comment: string;
    date: string;
    projectTitle: string;
    helpful: number;
  }>;
  socialMedia: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    github?: string;
  };
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
    endorsed: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
    url?: string;
  }>;
  about: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  stats: {
    totalEarnings: number;
    repeatClients: number;
    onTimeDelivery: number;
    clientSatisfaction: number;
  };
}