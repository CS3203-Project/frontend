import React, { useState } from 'react'
import { FiMail, FiPhone, FiMessageCircle, FiBook, FiUsers, FiShield, FiDollarSign, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { showSuccessToast } from '../utils/toastUtils'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Support() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const navigate = useNavigate()

  const helpCategories = [
    {
      icon: <FiBook className="w-8 h-8 text-gray-800" />,
      title: "Getting Started",
      description: "Learn the basics of using our platform",
      articles: "25 articles",
      categoryId: "getting-started"
    },
    {
      icon: <FiUsers className="w-8 h-8 text-gray-600" />,
      title: "For Buyers",
      description: "Find and purchase services with confidence",
      articles: "18 articles",
      categoryId: "buyers"
    },
    {
      icon: <FiDollarSign className="w-8 h-8 text-gray-700" />,
      title: "For Sellers",
      description: "Start selling your services and grow your business",
      articles: "32 articles",
      categoryId: "sellers"
    },
    {
      icon: <FiShield className="w-8 h-8 text-gray-800" />,
      title: "Trust & Safety",
      description: "Keep your account and transactions secure",
      articles: "15 articles",
      categoryId: "trust-safety"
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

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const handleEmailFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmailForm({
      ...emailForm,
      [e.target.name]: e.target.value
    })
  }

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log('Email form submitted:', emailForm)
    setShowEmailModal(false)
    setEmailForm({ name: '', email: '', subject: '', message: '' })
    
    // Show success toast
    showSuccessToast("Message sent successfully! We'll get back to you within 4 hours.")
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-8">
              How can we help you?
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Find answers to your questions and get the support you need
            </p>
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Browse Help Topics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {helpCategories.map((category, index) => (
            <div 
              key={index} 
              onClick={() => navigate(`/articles?category=${category.categoryId}`)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <span className="text-sm text-gray-600 font-medium">
                  {category.articles}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                >
                  <span className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <FiChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Still Need Help?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Live Chat */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <FiMessageCircle className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Live Chat
              </h3>
              <p className="text-gray-600 mb-6">
                Chat with our support team in real-time. Average response time: 2 minutes
              </p>
              <div className="flex justify-center">
                <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200">
                  Start Live Chat
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
            </div>

            {/* Email Support */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <FiMail className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Email Support
              </h3>
              <p className="text-gray-600 mb-6">
                Send us an email and we'll get back to you within 4 hours
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Send Email
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">support@marketplace.com</p>
            </div>

            {/* Phone Support */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <FiPhone className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Phone Support
              </h3>
              <p className="text-gray-600 mb-6">
                Speak directly with a support representative people
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowPhoneModal(true)}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Call Support
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">+94 355 3579</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Send us an Email</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={emailForm.name}
                    onChange={handleEmailFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={emailForm.email}
                    onChange={handleEmailFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={emailForm.subject}
                    onChange={handleEmailFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={emailForm.message}
                    onChange={handleEmailFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                    placeholder="Please describe your issue or question in detail..."
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Phone Support Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Phone Support</h3>
                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <FiPhone className="w-10 h-10 text-gray-800" />
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Call Our Support Team
                </h4>
                
                <p className="text-gray-600 mb-6">
                  Speak directly with our support representatives for immediate assistance.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Main Support Line</p>
                      <p className="text-lg font-semibold text-gray-900">+94 713553579</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Business Hours</p>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                      <p className="text-gray-600">Saturday - Sunday: 10:00 AM - 6:00 PM EST</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">After Hours</p>
                      <p className="text-gray-600">24/7 Emergency Support: +94 713553579</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href="tel:+94 713553579"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => {
                      setShowPhoneModal(false)
                      showSuccessToast("Connecting you to our support team...")
                    }}
                  >
                    <FiPhone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                  
                  <button
                    onClick={() => setShowPhoneModal(false)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
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
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
          },
        }}
        position="top-right"
      />

      <Footer />
    </div>
  )
}
