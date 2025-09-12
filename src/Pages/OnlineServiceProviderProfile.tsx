import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import ProfileHeader from '../components/profiles/shared/ProfileHeader';
import OnlineProfileTabs from '../components/profiles/online/OnlineProfileTabs';
import OnlineProfileContent from '../components/profiles/online/OnlineProfileContent';
import {ContactModal,LocationModal} from '../components/profiles/shared/Modals';
import type { ServiceProviderProfile } from '../components/profiles/shared/types';

export default function ServiceProviderProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');

  // Mock data - in real app this would come from API
  const provider: ServiceProviderProfile = {
    id: 'provider-1',
    name: 'Samantha Rodriguez',
    title: 'Senior Full-Stack Developer & UI/UX Designer',
    avatar: 'https://www.perfocal.com/blog/content/images/size/w960/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg',
    coverImage: 'https://bairesdev.mo.cloudinary.net/blog/2023/06/Is-Python-good-for-software-development.jpg?tx=w_1024,q_auto',
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
        images: [
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
          // sample images
          'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
          // more worked images
          'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
          // another sample image
          'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
        ],
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
        images: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
          // sample images
          'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80',
          // more worked images
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
          // another sample image
          'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=400&q=80'
        ],
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
        images: [
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=600&q=80',
          // sample images
          'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
          // more worked images
          'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
          // another sample image
          'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80'
        ],
        category: 'Web Development',
        completedDate: '2024-12-15',
        clientRating: 5,
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS']
      },
      {
        id: 'portfolio-2',
        title: 'Mobile Banking App UI/UX',
        description: 'Modern and secure mobile banking application design with focus on user experience and accessibility.',
        images: [
          'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
          // sample images
          'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=600&q=80',
          // more worked images
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=80',
          // another sample image
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80'
        ],
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
        clientAvatar: 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 5,
        comment: 'Samantha exceeded all expectations! The website she built is not only visually stunning but also performs excellently. Her attention to detail and communication throughout the project was outstanding.',
        date: '2024-12-20',
        projectTitle: 'E-commerce Website Development',
        helpful: 12
      },
      {
        id: 'review-2',
        clientName: 'Maria Garcia',
        clientAvatar: 'https://images.unsplash.com/photo-1464863979621-258859e62245?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z2lybCUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col ">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 shadow-md bg-white/80 backdrop-blur-md animate-fade-in-down">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Profile Header Section */}
        <section className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-8 pt-8 pb-2 mt-16">
          <div className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-md p-0 md:p-2 lg:p-4">
            <ProfileHeader 
              provider={provider}
              setShowContactModal={setShowContactModal}
              setShowLocationModal={setShowLocationModal}
              isFollowing={isFollowing}
              setIsFollowing={setIsFollowing}
              setShowBannerUpload={() => console.log('Banner upload requested')}
            />
          </div>
        </section>

        {/* Tabs and Content Section */}
        <section className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 animate-fade-in-up">
          <div className="rounded-2xl shadow-lg bg-white/95 backdrop-blur-md p-0 md:p-4 lg:p-8">
            <OnlineProfileTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <div className="mt-8">
              <OnlineProfileContent 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                provider={provider}
                reviewFilter={reviewFilter}
                setReviewFilter={setReviewFilter}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <ContactModal 
        showContactModal={showContactModal}
        setShowContactModal={setShowContactModal}
        provider={provider}
      />
      <LocationModal 
        showLocationModal={showLocationModal}
        setShowLocationModal={setShowLocationModal}
        provider={provider}
      />

      {/* Toasts */}
      <Toaster />

      {/* Footer */}
      <footer className="mt-16 animate-fade-in-up">
        <Footer />
      </footer>
    </div>
  );
}