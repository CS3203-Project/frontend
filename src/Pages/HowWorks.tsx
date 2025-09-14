import { useState } from 'react'
import { Search, MessageCircle, CreditCard, Star, Users, Shield, TrendingUp, CheckCircle, ArrowRight, Clock, Award, Heart, Play, Sparkles, Zap, Target } from 'lucide-react'
import Button from '../components/Button'

export default function HowWorks() {
  const [activeTab, setActiveTab] = useState('buyers')
  const [selectedStep, setSelectedStep] = useState<any>(null)

  const buyerSteps = [
    {
      id: 1,
      icon: <Search className="w-8 h-8 text-white" />,
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
      icon: <MessageCircle className="w-8 h-8 text-white" />,
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
      icon: <CreditCard className="w-8 h-8 text-white" />,
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
      icon: <Star className="w-8 h-8 text-white" />,
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
      icon: <Users className="w-8 h-8 text-white" />,
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
      icon: <TrendingUp className="w-8 h-8 text-white" />,
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
      icon: <CheckCircle className="w-8 h-8 text-white" />,
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
      icon: <Award className="w-8 h-8 text-white" />,
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
      icon: <Shield className="w-12 h-12 text-blue-400" />,
      title: "Secure & Protected",
      description: "Advanced security measures and buyer protection policies",
      stats: "99.9% secure transactions",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Clock className="w-12 h-12 text-green-400" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all users",
      stats: "Average 2-hour response time",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: <Heart className="w-12 h-12 text-pink-400" />,
      title: "Quality Guaranteed",
      description: "Satisfaction guarantee on every project completion",
      stats: "98% customer satisfaction",
      gradient: "from-pink-400 to-rose-500"
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-purple-400" />,
      title: "Growing Community",
      description: "Join millions of satisfied buyers and sellers worldwide",
      stats: "2.5M+ active users",
      gradient: "from-purple-400 to-violet-500"
    }
  ]

  const currentSteps = activeTab === 'buyers' ? buyerSteps : sellerSteps

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-500/20 to-pink-600/20 blur-3xl"></div>
            <h1 className="relative text-4xl md:text-6xl font-bold text-white mb-6">
              How It
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"> Works</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Discover how our platform connects buyers and sellers in a simple, 
            secure, and efficient marketplace for digital services.
          </p>
          
          {/* Video Demo */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 p-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-600/10"></div>
              <div className="relative z-10">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">Watch How Our Platform Works</h3>
                  <p className="text-gray-300 text-sm">See our marketplace in action</p>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/POIjIq1VMfw"
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
      </div>

      {/* User Type Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-center">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeTab === 'buyers'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
              <span className="relative z-10 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                For Buyers
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeTab === 'sellers'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
              <span className="relative z-10 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                For Sellers
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {activeTab === 'buyers' ? 'How to Buy Services' : 'How to Sell Services'}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 border border-white/20">
                  {step.id}
                </div>
                
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-white/20 group-hover:scale-110 transition-all duration-300">
                  {step.icon}
                </div>
                
                {/* Connecting Line */}
                {index < currentSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-white/10 -z-10">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                {step.title}
              </h3>
              
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We provide a secure, reliable, and user-friendly environment for all your service needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {platformFeatures.map((feature, index) => (
            <div key={index} className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300 mb-4">
                {feature.description}
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/20">
                <span className="text-sm font-medium text-white">{feature.stats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join millions of users who trust our platform for their service needs
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold px-8 py-4 hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
              Start Buying Services
            </Button>
            <Button className="bg-white/10 text-white border border-white/20 font-semibold px-8 py-4 hover:bg-white/20 hover:border-white/30 transition-all duration-300">
              Start Selling Services
            </Button>
          </div>
        </div>
      </div>

      {/* Step Detail Modal */}
      {selectedStep && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl mr-4 border border-white/20">
                    {selectedStep.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedStep.title}</h3>
                    <p className="text-purple-300">Step {selectedStep.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300 border border-white/20"
                  aria-label="Close modal"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>

              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed mb-6">
                  {selectedStep.details}
                </p>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                    Key Features:
                  </h4>
                  <ul className="space-y-3">
                    {selectedStep.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setSelectedStep(null)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
