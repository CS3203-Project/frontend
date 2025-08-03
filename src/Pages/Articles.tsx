import { useState, useEffect } from 'react'
import { FiSearch, FiBook, FiUsers, FiShield, FiDollarSign, FiClock, FiEye, FiChevronRight } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchParams] = useSearchParams()

  // Set initial category from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  const categories = [
    { id: 'all', name: 'All Articles', icon: <FiBook className="w-5 h-5" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <FiBook className="w-5 h-5" /> },
    { id: 'buyers', name: 'For Buyers', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'sellers', name: 'For Sellers', icon: <FiDollarSign className="w-5 h-5" /> },
    { id: 'trust-safety', name: 'Trust & Safety', icon: <FiShield className="w-5 h-5" /> }
  ]

  const articles = [
    {
      id: 1,
      title: "How to Create Your First Account",
      excerpt: "Step-by-step guide to setting up your account and getting started on our platform.",
      category: "getting-started",
      readTime: "5 min read",
      views: "2.1k views",
      lastUpdated: "2 days ago",
      featured: true
    },
    {
      id: 2,
      title: "Understanding Our Payment System",
      excerpt: "Learn how payments work, escrow protection, and available payment methods.",
      category: "getting-started",
      readTime: "7 min read",
      views: "1.8k views",
      lastUpdated: "1 week ago",
      featured: true
    },
    {
      id: 3,
      title: "How to Find the Right Service",
      excerpt: "Tips for searching, filtering, and choosing the perfect service for your needs.",
      category: "buyers",
      readTime: "6 min read",
      views: "1.5k views",
      lastUpdated: "3 days ago",
      featured: false
    },
    {
      id: 4,
      title: "Working with Sellers Effectively",
      excerpt: "Best practices for communicating with sellers and managing your orders.",
      category: "buyers",
      readTime: "8 min read",
      views: "1.2k views",
      lastUpdated: "5 days ago",
      featured: false
    },
    {
      id: 5,
      title: "Creating Your First Service Listing",
      excerpt: "Complete guide to setting up your service, pricing, and attracting customers.",
      category: "sellers",
      readTime: "12 min read",
      views: "3.2k views",
      lastUpdated: "1 day ago",
      featured: true
    },
    {
      id: 6,
      title: "Optimizing Your Profile for Success",
      excerpt: "How to build a compelling profile that attracts more buyers to your services.",
      category: "sellers",
      readTime: "9 min read",
      views: "2.7k views",
      lastUpdated: "4 days ago",
      featured: false
    },
    {
      id: 7,
      title: "Managing Orders and Deadlines",
      excerpt: "Tips for handling multiple orders, meeting deadlines, and maintaining quality.",
      category: "sellers",
      readTime: "10 min read",
      views: "1.9k views",
      lastUpdated: "6 days ago",
      featured: false
    },
    {
      id: 8,
      title: "Keeping Your Account Secure",
      excerpt: "Essential security practices to protect your account and personal information.",
      category: "trust-safety",
      readTime: "6 min read",
      views: "1.1k views",
      lastUpdated: "2 days ago",
      featured: false
    },
    {
      id: 9,
      title: "Reporting Issues and Disputes",
      excerpt: "How to report problems, file disputes, and resolve conflicts with other users.",
      category: "trust-safety",
      readTime: "8 min read",
      views: "900 views",
      lastUpdated: "1 week ago",
      featured: false
    },
    {
      id: 10,
      title: "Understanding Our Community Guidelines",
      excerpt: "Learn about our rules, policies, and what we expect from all platform users.",
      category: "trust-safety",
      readTime: "7 min read",
      views: "1.3k views",
      lastUpdated: "3 days ago",
      featured: false
    }
  ]

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredArticles = articles.filter(article => article.featured)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-8">
              Help Articles
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Browse our comprehensive knowledge base to find answers to your questions
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.icon}
                    <span className="ml-3">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Articles Section */}
            {selectedCategory === 'all' && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
                            Featured
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiClock className="w-4 h-4 mr-1" />
                            {article.readTime}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiEye className="w-4 h-4 mr-1" />
                            {article.views}
                          </div>
                          <button className="inline-flex items-center text-black hover:text-gray-700 font-medium">
                            Read More
                            <FiChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Articles Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name + ' Articles'}
                </h2>
                <span className="text-gray-500">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiClock className="w-4 h-4 mr-1" />
                            {article.readTime}
                          </div>
                          <div className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            {article.views}
                          </div>
                          <span>Updated {article.lastUpdated}</span>
                        </div>
                      </div>
                      <button className="ml-6 inline-flex items-center text-black hover:text-gray-700 font-medium">
                        Read More
                        <FiChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FiSearch className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search or browse different categories.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
