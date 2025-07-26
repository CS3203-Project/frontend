import { useState, useEffect } from 'react'
import { 
  FiStar, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiGlobe, 
  FiCamera, 
  FiPlay, 
  FiMessageCircle, 
  FiHeart, 
  FiShare2, 
  FiFlag, 
  FiAward, 
  FiCheck, 
  FiCalendar, 
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiExternalLink,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi'
import { 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaTwitter, 
  FaWhatsapp,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { cn } from '../utils/utils'
import { showSuccessToast, showErrorToast } from '../utils/toastUtils'
import { Toaster } from 'react-hot-toast'

interface ServiceProviderProfile {
  id: string
  name: string
  title: string
  avatar: string
  coverImage: string
  verified: boolean
  premiumProvider: boolean
  rating: number
  totalReviews: number
  completedProjects: number
  responseTime: string
  location: {
    city: string
    state: string
    country: string
    coordinates: {
      lat: number
      lng: number
    }
    timezone: string
    servicesArea: string[]
  }
  joinedDate: string
  lastActive: string
  languages: string[]
  hourlyRate: {
    min: number
    max: number
    currency: string
  }
  availability: {
    status: 'available' | 'busy' | 'unavailable'
    nextAvailable: string
    workingHours: {
      [key: string]: {
        start: string
        end: string
        available: boolean
      }
    }
  }
  services: Array<{
    id: string
    title: string
    description: string
    price: number
    duration: string
    category: string
    images: string[]
    features: string[]
    addOns: Array<{
      name: string
      price: number
      description: string
    }>
  }>
  portfolio: Array<{
    id: string
    title: string
    description: string
    images: string[]
    category: string
    completedDate: string
    clientRating: number
    technologies?: string[]
  }>
  reviews: Array<{
    id: string
    clientName: string
    clientAvatar: string
    rating: number
    comment: string
    date: string
    projectTitle: string
    helpful: number
  }>
  socialMedia: {
    website?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    youtube?: string
    tiktok?: string
    github?: string
  }
  skills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'expert'
    endorsed: number
  }>
  certifications: Array<{
    name: string
    issuer: string
    date: string
    credentialId?: string
    url?: string
  }>
  about: string
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  stats: {
    totalEarnings: number
    repeatClients: number
    onTimeDelivery: number
    clientSatisfaction: number
  }
}

export default function ServiceProviderProfile() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [reviewFilter, setReviewFilter] = useState('all')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBannerUpload, setShowBannerUpload] = useState(false)

  // Mock data - in real app this would come from API
  const provider: ServiceProviderProfile = {
    id: 'provider-1',
    name: 'Samantha Rodriguez',
    title: 'Senior Full-Stack Developer & UI/UX Designer',
    avatar: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/1200/400', // This will be the service banner
    verified: true,
    premiumProvider: true,
    rating: 4.9,
    totalReviews: 347,
    completedProjects: 892,
    responseTime: '< 1 hour',
    location: {
      city: 'Colombo',
      state: 'Western Province',
      country: 'Sri Lanka',
      coordinates: {
        lat: 6.9271,
        lng: 79.8612
      },
      timezone: 'Asia/Colombo',
      servicesArea: ['Colombo', 'Gampaha', 'Kalutara', 'Remote Worldwide']
    },
    joinedDate: '2019-03-15',
    lastActive: '2 hours ago',
    languages: ['English', 'Sinhala', 'Tamil', 'Spanish'],
    hourlyRate: {
      min: 25,
      max: 85,
      currency: 'USD'
    },
    availability: {
      status: 'available',
      nextAvailable: 'Now',
      workingHours: {
        monday: { start: '09:00', end: '18:00', available: true },
        tuesday: { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday: { start: '09:00', end: '18:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '10:00', end: '16:00', available: true },
        sunday: { start: '10:00', end: '14:00', available: false }
      }
    },
    services: [
      {
        id: 'service-1',
        title: 'Full-Stack Web Application Development',
        description: 'Complete web application development using modern technologies like React, Node.js, and MongoDB.',
        price: 2500,
        duration: '2-4 weeks',
        category: 'Web Development',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        features: [
          'Responsive Design',
          'Database Integration',
          'API Development',
          'Authentication System',
          'Admin Dashboard',
          '3 Months Support'
        ],
        addOns: [
          { name: 'Mobile App Version', price: 1500, description: 'React Native mobile app' },
          { name: 'Advanced Analytics', price: 500, description: 'Google Analytics & custom tracking' },
          { name: 'SEO Optimization', price: 300, description: 'Complete SEO setup and optimization' }
        ]
      },
      {
        id: 'service-2',
        title: 'UI/UX Design & Prototyping',
        description: 'Modern, user-centered design for web and mobile applications with interactive prototypes.',
        price: 1200,
        duration: '1-2 weeks',
        category: 'Design',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        features: [
          'User Research',
          'Wireframing',
          'High-Fidelity Mockups',
          'Interactive Prototypes',
          'Design System',
          'Handoff Documentation'
        ],
        addOns: [
          { name: 'User Testing', price: 400, description: '5 user testing sessions with report' },
          { name: 'Animation Design', price: 300, description: 'Micro-interactions and animations' }
        ]
      }
    ],
    portfolio: [
      {
        id: 'portfolio-1',
        title: 'E-commerce Platform for Fashion Brand',
        description: 'Complete e-commerce solution with inventory management, payment processing, and analytics dashboard.',
        images: ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400'],
        category: 'Web Development',
        completedDate: '2024-12-15',
        clientRating: 5,
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS']
      },
      {
        id: 'portfolio-2',
        title: 'Mobile Banking App UI/UX',
        description: 'Modern and secure mobile banking application design with focus on user experience and accessibility.',
        images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
        category: 'Design',
        completedDate: '2024-11-20',
        clientRating: 5,
        technologies: ['Figma', 'Adobe XD', 'Principle']
      }
    ],
    reviews: [
      {
        id: 'review-1',
        clientName: 'John Smith',
        clientAvatar: '/api/placeholder/50/50',
        rating: 5,
        comment: 'Samantha exceeded all expectations! The website she built is not only visually stunning but also performs excellently. Her attention to detail and communication throughout the project was outstanding.',
        date: '2024-12-20',
        projectTitle: 'E-commerce Website Development',
        helpful: 12
      },
      {
        id: 'review-2',
        clientName: 'Maria Garcia',
        clientAvatar: '/api/placeholder/50/50',
        rating: 5,
        comment: 'Amazing work on our mobile app design. The user experience is intuitive and the design is modern. Highly recommend!',
        date: '2024-12-18',
        projectTitle: 'Mobile App UI/UX Design',
        helpful: 8
      }
    ],
    socialMedia: {
      website: 'https://samantharodriguez.dev',
      linkedin: 'https://linkedin.com/in/samantharodriguez',
      github: 'https://github.com/samantharodriguez',
      instagram: 'https://instagram.com/samdesigns',
      twitter: 'https://twitter.com/samcodes'
    },
    skills: [
      { name: 'React.js', level: 'expert', endorsed: 45 },
      { name: 'Node.js', level: 'expert', endorsed: 38 },
      { name: 'UI/UX Design', level: 'expert', endorsed: 52 },
      { name: 'MongoDB', level: 'intermediate', endorsed: 23 },
      { name: 'TypeScript', level: 'expert', endorsed: 31 },
      { name: 'Figma', level: 'expert', endorsed: 41 }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023-06-15',
        credentialId: 'AWS-SA-2023-001',
        url: 'https://aws.amazon.com/certification/'
      },
      {
        name: 'Google UX Design Certificate',
        issuer: 'Google Career Certificates',
        date: '2022-09-20',
        credentialId: 'GOOGLE-UX-2022-001'
      }
    ],
    about: 'Passionate full-stack developer and UI/UX designer with 6+ years of experience creating digital solutions that drive business growth. I specialize in modern web technologies and user-centered design, helping startups and enterprises build scalable, beautiful applications that users love. My approach combines technical excellence with creative problem-solving to deliver results that exceed expectations.',
    experience: [
      {
        title: 'Senior Full-Stack Developer',
        company: 'TechCorp Solutions',
        duration: '2021 - Present',
        description: 'Leading development of enterprise web applications and mentoring junior developers.'
      },
      {
        title: 'UI/UX Designer & Frontend Developer',
        company: 'CreativeFlow Agency',
        duration: '2019 - 2021',
        description: 'Designed and developed user interfaces for various client projects across different industries.'
      }
    ],
    education: [
      {
        degree: 'Master of Computer Science',
        institution: 'University of Colombo',
        year: '2019'
      },
      {
        degree: 'Bachelor of Software Engineering',
        institution: 'SLIIT',
        year: '2017'
      }
    ],
    stats: {
      totalEarnings: 125000,
      repeatClients: 78,
      onTimeDelivery: 98,
      clientSatisfaction: 99
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiUser /> },
    { id: 'services', label: 'Services', icon: <FiDollarSign /> },
    { id: 'portfolio', label: 'Portfolio', icon: <FiCamera /> },
    { id: 'reviews', label: 'Reviews', icon: <FiStar /> },
    { id: 'about', label: 'About', icon: <FiMessageCircle /> }
  ]

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'unavailable': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'beginner': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const handleContact = () => {
    setShowContactModal(true)
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    showSuccessToast(isFollowing ? 'Unfollowed provider' : 'Following provider')
  }

  const handleBannerUpload = () => {
    setShowBannerUpload(true)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    showSuccessToast('Profile link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Service Banner */}
      <div className="relative h-64 md:h-80 bg-gray-200 overflow-hidden group">
        {provider.coverImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${provider.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
            <div className="text-center text-white">
              <FiCamera className="w-16 h-16 mx-auto mb-4 opacity-60" />
              <h3 className="text-xl font-semibold mb-2">Showcase Your Services</h3>
              <p className="text-white/80 mb-4">Upload a banner to highlight your expertise</p>
              <button
                onClick={handleBannerUpload}
                className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                Upload Banner
              </button>
            </div>
          </div>
        )}
        
        {/* Banner Overlay - Shows on hover when banner exists */}
        {provider.coverImage && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleBannerUpload}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors flex items-center space-x-2"
            >
              <FiCamera className="w-5 h-5" />
              <span>Change Banner</span>
            </button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <FiFlag className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Info Overlay */}
        {provider.coverImage && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-1">
                Professional Web Development & Design Services
              </h2>
              <p className="text-white/90 text-sm md:text-base">
                Creating modern, scalable solutions for your business needs
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={provider.avatar} 
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={cn(
                "absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white",
                getAvailabilityColor(provider.availability.status)
              )}></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{provider.name}</h1>
                    {provider.verified && (
                      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        <FiCheck className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                    {provider.premiumProvider && (
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        <FiAward className="w-3 h-3 mr-1" />
                        Premium
                      </div>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-600 mb-3">{provider.title}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      <button 
                        onClick={() => setShowLocationModal(true)}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {provider.location.city}, {provider.location.country}
                      </button>
                    </div>
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 mr-1 text-yellow-400" />
                      {provider.rating} ({provider.totalReviews} reviews)
                    </div>
                    <div className="flex items-center">
                      <FiClock className="w-4 h-4 mr-1" />
                      Responds in {provider.responseTime}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                  <Button onClick={handleContact} className="px-6">
                    <FiMessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleFollow}
                    className={cn(
                      "px-6",
                      isFollowing && "bg-gray-50 text-gray-700"
                    )}
                  >
                    <FiHeart className={cn("w-4 h-4 mr-2", isFollowing && "fill-current text-red-500")} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{provider.completedProjects}</div>
              <div className="text-sm text-gray-500">Projects Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{provider.stats.onTimeDelivery}%</div>
              <div className="text-sm text-gray-500">On-Time Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{provider.stats.repeatClients}%</div>
              <div className="text-sm text-gray-500">Repeat Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${provider.hourlyRate.min}-${provider.hourlyRate.max}</div>
              <div className="text-sm text-gray-500">Hourly Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center px-6 py-4 text-sm font-medium transition-colors border-b-2",
                  activeTab === tab.id
                    ? "border-black text-black bg-gray-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-600 leading-relaxed">{provider.about}</p>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs text-white",
                            getSkillLevelColor(skill.level)
                          )}>
                            {skill.level}
                          </span>
                          <span className="text-sm text-gray-500">{skill.endorsed} endorsements</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {provider.reviews.slice(0, 2).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={review.clientAvatar} 
                          alt={review.clientName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{review.clientName}</span>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                          <div className="text-xs text-gray-500">
                            {review.projectTitle} • {review.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-2 h-2 rounded-full", getAvailabilityColor(provider.availability.status))}></div>
                      <span className="text-sm font-medium capitalize">{provider.availability.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next Available</span>
                    <span className="text-sm font-medium">{provider.availability.nextAvailable}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">{provider.responseTime}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Service Areas</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {provider.location.city}, {provider.location.state}, {provider.location.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{provider.location.timezone}</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Service Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.location.servicesArea.map((area, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.languages.map((language, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="grid grid-cols-3 gap-3">
                  {provider.socialMedia.website && (
                    <a 
                      href={provider.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <FiGlobe className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {provider.socialMedia.linkedin && (
                    <a 
                      href={provider.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <FaLinkedin className="w-5 h-5 text-blue-600" />
                    </a>
                  )}
                  {provider.socialMedia.instagram && (
                    <a 
                      href={provider.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors"
                    >
                      <FaInstagram className="w-5 h-5 text-pink-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {provider.services.map((service) => (
              <div 
                key={service.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img 
                    src={service.images[0]} 
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {service.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">${service.price}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiClock className="w-4 h-4 mr-1" />
                      {service.duration}
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {provider.portfolio.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPortfolio(item)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {item.category}
                    </span>
                    <div className="flex items-center">
                      {[...Array(item.clientRating)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  {item.technologies && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.technologies.slice(0, 3).map((tech, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {item.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{item.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Completed: {item.completedDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reviews ({provider.totalReviews})
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={cn(
                            "w-4 h-4",
                            i < Math.floor(provider.rating) 
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300"
                          )} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{provider.rating} out of 5</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <select 
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="all">All Reviews</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {provider.reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={review.clientAvatar} 
                      alt={review.clientName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.clientName}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Project: {review.projectTitle}</span>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                <p className="text-gray-600 leading-relaxed">{provider.about}</p>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                <div className="space-y-4">
                  {provider.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900">{exp.title}</h4>
                      <p className="text-blue-600">{exp.company}</p>
                      <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                      <p className="text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                <div className="space-y-3">
                  {provider.education.map((edu, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Certifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                <div className="space-y-4">
                  {provider.certifications.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-gray-600 text-sm">{cert.issuer}</p>
                      <p className="text-gray-500 text-sm">{cert.date}</p>
                      {cert.url && (
                        <a 
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                        >
                          <FiExternalLink className="w-3 h-3 mr-1" />
                          Verify
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Since */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Since</h3>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{provider.joinedDate}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Last active: {provider.lastActive}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Contact {provider.name}</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <FiMessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  WhatsApp
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FiPhone className="w-4 h-4 mr-2" />
                  Schedule Call
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiMail className="w-4 h-4 mr-2" />
                  Email
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Response time is typically {provider.responseTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Location & Service Areas</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Map Placeholder */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive map would be displayed here</p>
                    <p className="text-sm text-gray-400">
                      Coordinates: {provider.location.coordinates.lat}, {provider.location.coordinates.lng}
                    </p>
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Primary Location</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{provider.location.city}, {provider.location.state}</p>
                      <p>{provider.location.country}</p>
                      <p>Timezone: {provider.location.timezone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service Areas</h4>
                    <div className="space-y-1">
                      {provider.location.servicesArea.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <FiMapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster />
      <Footer />
    </div>
  )
}