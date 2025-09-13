import { useState } from 'react'
import { FiSearch, FiMessageCircle, FiCreditCard, FiStar, FiUsers, FiShield, FiTrendingUp, FiCheckCircle, FiArrowRight, FiClock, FiAward, FiHeart } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function HowWorks() {
  const [activeTab, setActiveTab] = useState('buyers')
  const [selectedStep, setSelectedStep] = useState<any>(null)

  const buyerSteps = [
    {
      id: 1,
      icon: <FiSearch className="w-8 h-8 text-white" />,
      title: "Browse & Discover",
      description: "Search through thousands of services across different categories",
      details: "Use our advanced search filters to find exactly what you need. Browse by category, price range, delivery time, seller rating, and more. Our intelligent recommendation system helps you discover services that match your requirements.",
      features: [
        "Advanced search filters",
        "Category-based browsing",
        "Price and delivery comparisons",
        "Seller rating and reviews",
        "Personalized recommendations"
      ]
    },
    {
      id: 2,
      icon: <FiMessageCircle className="w-8 h-8 text-white" />,
      title: "Contact & Negotiate",
      description: "Communicate directly with sellers to discuss your project requirements",
      details: "Our built-in messaging system allows secure communication with sellers. Discuss project details, ask questions, request custom quotes, and negotiate terms before placing an order.",
      features: [
        "Real-time messaging",
        "File sharing capabilities",
        "Custom quote requests",
        "Project requirement discussions",
        "Secure communication"
      ]
    },
    {
      id: 3,
      icon: <FiCreditCard className="w-8 h-8 text-white" />,
      title: "Secure Payment",
      description: "Pay safely with our escrow system that protects your money",
      details: "Your payment is held securely in escrow until you're completely satisfied with the delivered work. We support multiple payment methods and provide buyer protection on every transaction.",
      features: [
        "Escrow protection",
        "Multiple payment methods",
        "Milestone payments",
        "Automatic refund protection",
        "Secure transaction processing"
      ]
    },
    {
      id: 4,
      icon: <FiStar className="w-8 h-8 text-white" />,
      title: "Review & Rate",
      description: "Leave feedback to help other buyers and improve the community",
      details: "After project completion, share your experience by rating the seller and leaving a detailed review. Your feedback helps maintain quality standards and assists other buyers in making informed decisions.",
      features: [
        "5-star rating system",
        "Detailed review writing",
        "Photo/video attachments",
        "Public feedback display",
        "Quality assurance contribution"
      ]
    }
  ]

  const sellerSteps = [
    {
      id: 1,
      icon: <FiUsers className="w-8 h-8 text-white" />,
      title: "Create Profile",
      description: "Set up your professional profile and showcase your skills",
      details: "Build a compelling profile that highlights your expertise, experience, and portfolio. Add your skills, certifications, and previous work samples to attract potential buyers.",
      features: [
        "Professional profile setup",
        "Portfolio showcase",
        "Skill verification",
        "Certification uploads",
        "Experience highlighting"
      ]
    },
    {
      id: 2,
      icon: <FiTrendingUp className="w-8 h-8 text-white" />,
      title: "List Services",
      description: "Create attractive service listings with clear pricing and delivery times",
      details: "Create detailed service offerings with competitive pricing, clear descriptions, and realistic delivery timelines. Use high-quality images and videos to showcase your work.",
      features: [
        "Service listing creation",
        "Competitive pricing",
        "Clear descriptions",
        "Media uploads",
        "Package offerings"
      ]
    },
    {
      id: 3,
      icon: <FiCheckCircle className="w-8 h-8 text-white" />,
      title: "Deliver Quality",
      description: "Complete projects on time and exceed client expectations",
      details: "Focus on delivering high-quality work within the agreed timeline. Use our project management tools to track progress, communicate updates, and ensure client satisfaction.",
      features: [
        "Project management tools",
        "Progress tracking",
        "Client communication",
        "Quality assurance",
        "Timely delivery"
      ]
    },
    {
      id: 4,
      icon: <FiAward className="w-8 h-8 text-white" />,
      title: "Grow & Earn",
      description: "Build your reputation and increase your earnings over time",
      details: "As you complete more projects and receive positive reviews, your profile ranking improves, leading to more visibility and higher-paying opportunities.",
      features: [
        "Reputation building",
        "Increased visibility",
        "Higher earnings potential",
        "Repeat client relationships",
        "Professional growth"
      ]
    }
  ]

  const platformFeatures = [
    {
      icon: <FiShield className="w-12 h-12 text-blue-600" />,
      title: "Secure & Protected",
      description: "Advanced security measures and buyer protection policies",
      stats: "99.9% secure transactions"
    },
    {
      icon: <FiClock className="w-12 h-12 text-green-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all users",
      stats: "Average 2-hour response time"
    },
    {
      icon: <FiHeart className="w-12 h-12 text-red-600" />,
      title: "Quality Guaranteed",
      description: "Satisfaction guarantee on every project completion",
      stats: "98% customer satisfaction"
    },
    {
      icon: <FiTrendingUp className="w-12 h-12 text-purple-600" />,
      title: "Growing Community",
      description: "Join millions of satisfied buyers and sellers worldwide",
      stats: "2.5M+ active users"
    }
  ]

  const currentSteps = activeTab === 'buyers' ? buyerSteps : sellerSteps

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-8">
              How It Works
            </h1>
            <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Discover how our platform connects buyers and sellers in a simple, 
              secure, and efficient marketplace for digital services.
            </p>
            
            {/* Video Demo */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/2rgNHyzP6ZQ"
                  title="How Our Platform Works"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Type Tabs */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-2 shadow-md">
              <button
                onClick={() => setActiveTab('buyers')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'buyers'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                For Buyers
              </button>
              <button
                onClick={() => setActiveTab('sellers')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'sellers'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                For Sellers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {activeTab === 'buyers' ? 'How to Buy Services' : 'How to Sell Services'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {activeTab === 'buyers' 
                ? 'Follow these simple steps to find and purchase the perfect service for your needs'
                : 'Start your freelancing journey and build a successful business on our platform'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentSteps.map((step, index) => (
              <div
                key={step.id}
                className="text-center cursor-pointer group"
                onClick={() => setSelectedStep(step)}
              >
                <div className="relative mb-6">
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                    {step.id}
                  </div>
                  
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full group-hover:scale-110 transition-transform duration-200">
                    {step.icon}
                  </div>
                  
                  {/* Connecting Line */}
                  {index < currentSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-300 -z-10">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                        <FiArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-black transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a secure, reliable, and user-friendly environment for all your service needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <div className="text-sm font-medium text-gray-500 bg-gray-50 rounded-full px-3 py-1 inline-block">
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join millions of users who trust our platform for their service needs
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Start Buying Services
            </button>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-200">
              Start Selling Services
            </button>
          </div>
        </div>
      </div>

      {/* Step Detail Modal */}
      {selectedStep && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full mr-4">
                    {selectedStep.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedStep.title}</h3>
                    <p className="text-gray-600">Step {selectedStep.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedStep.details}
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {selectedStep.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-sm">
                        <FiCheckCircle className="w-4 h-4 text-green-500 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedStep(null)}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
