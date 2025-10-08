import { useState } from 'react'
import { Mail, Phone, MessageCircle, Book, Users, Shield, DollarSign, ChevronDown, ChevronUp, Headphones, Clock, Star, Zap, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { showSuccessToast } from '../utils/toastUtils'
import Button from '../components/Button'

export default function Support() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const navigate = useNavigate()

  const helpCategories = [
    {
      icon: <Book className="w-8 h-8 text-blue-400" />,
      title: "Getting Started",
      description: "Learn the basics of using our platform",
      articles: "25 articles",
      categoryId: "getting-started",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "For Buyers",
      description: "Find and purchase services with confidence",
      articles: "18 articles",
      categoryId: "buyers",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-yellow-400" />,
      title: "For Sellers",
      description: "Start selling your services and grow your business",
      articles: "32 articles",
      categoryId: "sellers",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-400" />,
      title: "Trust & Safety",
      description: "Keep your account and transactions secure",
      articles: "15 articles",
      categoryId: "trust-safety",
      gradient: "from-purple-400 to-violet-500"
    }
  ]

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Sign Up' button in the top right corner of the page. Fill in your details and verify your email address to get started."
    },
    {
      question: "How do payments work?",
      answer: "We use secure payment processing. Funds are held in escrow until the service is completed to your satisfaction. We accept major credit cards, PayPal, and other payment methods."
    },
    {
      question: "What if I'm not satisfied with a service?",
      answer: "We offer a satisfaction guarantee. If you're not happy with the delivered work, you can request revisions or contact our support team for assistance with refunds."
    },
    {
      question: "How do I become a seller?",
      answer: "To become a seller, create an account and complete your profile. Then create your first service listing with clear descriptions, pricing, and portfolio samples."
    },
    {
      question: "What fees do you charge?",
      answer: "We charge a small service fee on completed transactions. Buyers pay a processing fee, and sellers pay a commission. View our pricing page for detailed information."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can contact our support team 24/7 through live chat, email, or phone. We typically respond within 2-4 hours."
    }
  ]

  const supportStats = [
    {
      icon: <Clock className="w-8 h-8 text-blue-400" />,
      number: "2 min",
      label: "Average Response Time",
      description: "Quick support when you need it",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      number: "98%",
      label: "Customer Satisfaction",
      description: "Highly rated support team",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Headphones className="w-8 h-8 text-green-400" />,
      number: "24/7",
      label: "Available Support",
      description: "Round-the-clock assistance",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-400" />,
      number: "50k+",
      label: "Issues Resolved",
      description: "Proven track record",
      gradient: "from-purple-400 to-violet-500"
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

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
              How can we
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"> help you?</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Find answers to your questions and get the support you need to succeed on our platform
          </p>
          
          {/* Support Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {supportStats.map((stat, index) => (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm font-semibold text-gray-200 mb-1">{stat.label}</div>
                <div className="text-gray-400 text-xs">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Browse Help Topics
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find comprehensive guides and tutorials for every aspect of our platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {helpCategories.map((category, index) => (
            <div 
              key={index} 
              onClick={() => navigate(`/articles?category=${category.categoryId}`)}
              className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-300 group text-center"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${category.gradient} mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                {category.title}
              </h3>
              <p className="text-gray-300 mb-4">
                {category.description}
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/20">
                <span className="text-sm font-medium text-white">{category.articles}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Quick answers to the most common questions about our platform
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none group"
              >
                <span className="text-lg font-medium text-white group-hover:text-purple-300 transition-colors duration-300">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 ml-4">
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                  )}
                </div>
              </button>
              {openFAQ === index && (
                <div className="px-8 pb-6">
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose your preferred way to get in touch with our support team
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Live Chat */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Live Chat
            </h3>
            <p className="text-gray-300 mb-6">
              Chat with our support team in real-time. Average response time: 2 minutes
            </p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 mb-4">
              Start Live Chat
            </Button>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 inline-block border border-white/20">
              <span className="text-sm text-gray-300">Available 24/7</span>
            </div>
          </div>

          {/* Email Support */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Email Support
            </h3>
            <p className="text-gray-300 mb-6">
              Send us an email and we'll get back to you within 4 hours
            </p>
            <Button 
              onClick={() => window.location.href = 'mailto:zia.contact.team@gmail.com?subject=Support Request&body=Hello Zia Support Team,%0D%0A%0D%0APlease describe your issue or question here...'}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-3 hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 mb-4"
            >
              Send Email
            </Button>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 inline-block border border-white/20">
              <span className="text-sm text-gray-300">zia.contact.team@gmail.com</span>
            </div>
          </div>

          {/* Phone Support */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Phone Support
            </h3>
            <p className="text-gray-300 mb-6">
              Speak directly with a support representative
            </p>
            <Button 
              onClick={() => setShowPhoneModal(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-3 hover:from-purple-600 hover:to-violet-700 transition-all duration-300 mb-4"
            >
              Call Support
            </Button>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 inline-block border border-white/20">
              <span className="text-sm text-gray-300">+94 355 3579</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/30">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6 flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need Priority Support?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Upgrade to our Premium plan for priority support, dedicated account management, and enhanced features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold px-8 py-4 hover:from-yellow-600 hover:to-orange-700 transition-all duration-300">
              Upgrade to Premium
            </Button>
            <Button className="bg-white/10 text-white border border-white/20 font-semibold px-8 py-4 hover:bg-white/20 hover:border-white/30 transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Phone Support Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Phone Support</h3>
                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300 border border-white/20"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 mx-auto mb-6 flex items-center justify-center">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                
                <h4 className="text-xl font-semibold text-white mb-4">
                  Call Our Support Team
                </h4>
                
                <p className="text-gray-300 mb-8">
                  Speak directly with our support representatives for immediate assistance.
                </p>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-purple-300 mb-1">Main Support Line</p>
                      <p className="text-2xl font-bold text-white">+94 713553579</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-sm font-medium text-purple-300 mb-2">Business Hours</p>
                      <p className="text-gray-300 text-sm">Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                      <p className="text-gray-300 text-sm">Saturday - Sunday: 10:00 AM - 6:00 PM EST</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-sm font-medium text-purple-300 mb-2">After Hours</p>
                      <p className="text-gray-300 text-sm">24/7 Emergency Support: +94 713553579</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <a
                    href="tel:+94713553579"
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 font-medium"
                    onClick={() => {
                      setShowPhoneModal(false)
                      showSuccessToast("Connecting you to our support team...")
                    }}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now
                  </a>
                  
                  <Button
                    onClick={() => setShowPhoneModal(false)}
                    className="w-full bg-white/10 text-white border border-white/20 py-4 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    Close
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl border border-white/10">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Have your account information ready for faster assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* React Hot Toast Container */}
      <Toaster 
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            backdropFilter: 'blur(12px)',
          },
        }}
        position="top-right"
      />
    </div>
  )
}
