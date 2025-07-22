import React, { useState } from 'react'
import { FiStar, FiTrendingUp, FiUsers, FiDollarSign, FiClock, FiArrowRight, FiPlay, FiMessageCircle, FiHeart, FiAward, FiHeadphones } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function SuccessStories() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStory, setSelectedStory] = useState<any>(null)

  const categories = [
    { id: 'all', name: 'All Stories', count: 156 },
    { id: 'design', name: 'Design & Creative', count: 45 },
    { id: 'development', name: 'Development', count: 38 },
    { id: 'marketing', name: 'Marketing', count: 32 },
    { id: 'writing', name: 'Writing & Content', count: 25 },
    { id: 'business', name: 'Business Services', count: 16 }
  ]

  const featuredStats = [
    {
      icon: <FiHeart className="w-8 h-8 text-white" />,
      number: '2.5M+',
      label: 'Happy Clients',
      description: 'Satisfied customers worldwide'
    },
    {
      icon: <FiDollarSign className="w-8 h-8 text-white" />,
      number: '$1.2B+',
      label: 'Total Earnings',
      description: 'Paid to freelancers globally'
    },
    {
      icon: <FiAward className="w-8 h-8 text-white" />,
      number: '98%',
      label: 'Success Rate',
      description: 'Projects completed successfully'
    },
    {
      icon: <FiHeadphones className="w-8 h-8 text-white" />,
      number: '24/7',
      label: 'Support Available',
      description: 'Round-the-clock assistance'
    }
  ]

  const successStories = [
    {
      id: 1,
      category: 'design',
      clientName: 'Sarah Johnson',
      clientTitle: 'Marketing Director',
      company: 'TechStart Inc.',
      freelancerName: 'Alex Chen',
      freelancerTitle: 'Brand Designer',
      projectTitle: 'Complete Brand Identity Redesign',
      description: 'Transformed our outdated brand into a modern, cohesive identity that increased customer engagement by 340%.',
      results: [
        '340% increase in customer engagement',
        '25% boost in sales conversion',
        'Featured in 5 design publications',
        'Won 2 industry awards'
      ],
      testimonial: "Alex didn't just deliver a logo - they delivered a complete brand transformation. Our new identity perfectly captures our company's vision and has dramatically improved our market presence.",
      rating: 5,
      projectValue: '$2,500',
      duration: '3 weeks',
      image: '/api/placeholder/300/200',
      beforeAfter: true,
      featured: true
    },
    {
      id: 2,
      category: 'development',
      clientName: 'Marcus Rodriguez',
      clientTitle: 'Founder',
      company: 'FoodieApp',
      freelancerName: 'Priya Patel',
      freelancerTitle: 'Full-Stack Developer',
      projectTitle: 'Mobile App Development',
      description: 'Built a food delivery app from scratch that now serves 50K+ users daily with 99.9% uptime.',
      results: [
        '50K+ daily active users',
        '99.9% uptime achieved',
        '$500K revenue in first year',
        '4.8★ app store rating'
      ],
      testimonial: "Priya's technical expertise and attention to detail resulted in an app that exceeded all our expectations. The scalability she built in has been crucial to our growth.",
      rating: 5,
      projectValue: '$15,000',
      duration: '8 weeks',
      image: '/api/placeholder/300/200',
      beforeAfter: false,
      featured: true
    },
    {
      id: 3,
      category: 'marketing',
      clientName: 'Emma Thompson',
      clientTitle: 'CEO',
      company: 'GreenEarth Solutions',
      freelancerName: 'David Kim',
      freelancerTitle: 'Digital Marketing Strategist',
      projectTitle: 'Complete Digital Marketing Overhaul',
      description: 'Developed and executed a comprehensive digital strategy that tripled our online presence and doubled sales.',
      results: [
        '300% increase in online visibility',
        '200% boost in sales',
        '150% growth in social media following',
        '45% reduction in customer acquisition cost'
      ],
      testimonial: "David's strategic approach to our digital marketing completely transformed our business. We went from struggling to find customers to having a waitlist.",
      rating: 5,
      projectValue: '$8,500',
      duration: '12 weeks',
      image: '/api/placeholder/300/200',
      beforeAfter: false,
      featured: true
    },
    {
      id: 4,
      category: 'writing',
      clientName: 'James Wilson',
      clientTitle: 'Product Manager',
      company: 'InnovateNow',
      freelancerName: 'Lisa Park',
      freelancerTitle: 'Content Strategist',
      projectTitle: 'Content Strategy & Implementation',
      description: 'Created a comprehensive content strategy that increased organic traffic by 400% and established thought leadership.',
      results: [
        '400% increase in organic traffic',
        '250% boost in lead generation',
        'Achieved #1 Google rankings for 15 keywords',
        'Published in 10 industry publications'
      ],
      testimonial: "Lisa's content strategy didn't just improve our SEO - it positioned us as industry leaders. Our thought leadership content now drives most of our qualified leads.",
      rating: 5,
      projectValue: '$4,200',
      duration: '6 weeks',
      image: '/api/placeholder/300/200',
      beforeAfter: false,
      featured: false
    },
    {
      id: 5,
      category: 'business',
      clientName: 'Robert Chen',
      clientTitle: 'Operations Director',
      company: 'ScaleUp Corp',
      freelancerName: 'Michael Davis',
      freelancerTitle: 'Business Consultant',
      projectTitle: 'Business Process Optimization',
      description: 'Streamlined operations and implemented automation that reduced costs by 35% while improving efficiency.',
      results: [
        '35% reduction in operational costs',
        '60% improvement in process efficiency',
        '90% reduction in manual tasks',
        '$200K annual cost savings'
      ],
      testimonial: "Michael's business optimization saved us hundreds of thousands while making our team more productive. The ROI was immediate and substantial.",
      rating: 5,
      projectValue: '$12,000',
      duration: '10 weeks',
      image: '/api/placeholder/300/200',
      beforeAfter: false,
      featured: false
    },
    {
      id: 6,
      category: 'design',
      clientName: 'Anna Martinez',
      clientTitle: 'E-commerce Manager',
      company: 'StyleHub',
      freelancerName: 'Sophie Laurent',
      freelancerTitle: 'UX/UI Designer',
      projectTitle: 'E-commerce Website Redesign',
      description: 'Redesigned our e-commerce platform with a focus on user experience, resulting in significantly higher conversions.',
      results: [
        '85% increase in conversion rate',
        '40% reduction in cart abandonment',
        '65% improvement in user engagement',
        '4.9★ customer satisfaction rating'
      ],
      testimonial: "Sophie's UX expertise transformed our struggling e-commerce site into a conversion machine. The user experience is now seamless and intuitive.",
      rating: 5,
      projectValue: '$6,800',
      duration: '5 weeks',
      image: '/api/placeholder/300/200',
      beforeAfter: true,
      featured: false
    }
  ]

  const filteredStories = selectedCategory === 'all' 
    ? successStories 
    : successStories.filter(story => story.category === selectedCategory)

  const featuredStories = successStories.filter(story => story.featured)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-8">
              Success Stories
            </h1>
            <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Discover how businesses and freelancers achieve extraordinary results through our platform. 
              Real projects, real impact, real success.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {featuredStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-lg font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-300">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Success Stories */}
      {selectedCategory === 'all' && (
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Featured Success Stories
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedStory(story)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <FiPlay className="w-12 h-12 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(story.rating)].map((_, i) => (
                          <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">5.0</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {story.projectTitle}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {story.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{story.projectValue}</span>
                      <span>{story.duration}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{story.clientName}</p>
                          <p className="text-sm text-gray-600">{story.company}</p>
                        </div>
                        <FiArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Success Stories Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {selectedCategory === 'all' ? 'All Success Stories' : `${categories.find(c => c.id === selectedCategory)?.name} Success Stories`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
                onClick={() => setSelectedStory(story)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-gray-500 font-medium">Project Showcase</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {[...Array(story.rating)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                      {story.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {story.projectTitle}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {story.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">Value:</span> {story.projectValue}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {story.duration}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{story.clientName}</p>
                        <p className="text-xs text-gray-600">{story.company}</p>
                      </div>
                      <button className="text-black hover:text-gray-700 transition-colors">
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedStory.projectTitle}</h3>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-6">
                    <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                      <span className="text-gray-500 font-medium">Project Showcase</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Key Results</h4>
                    <ul className="space-y-2">
                      {selectedStory.results.map((result, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      {[...Array(selectedStory.rating)].map((_, i) => (
                        <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-2 text-gray-600">5.0 stars</span>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <FiMessageCircle className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="text-gray-700 italic mb-3">"{selectedStory.testimonial}"</p>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{selectedStory.clientName}</p>
                        <p className="text-gray-600">{selectedStory.clientTitle}, {selectedStory.company}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedStory.projectValue}</div>
                      <div className="text-sm text-gray-600">Project Value</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedStory.duration}</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Freelancer</h4>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                        <span className="text-gray-600 font-medium">
                          {selectedStory.freelancerName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedStory.freelancerName}</p>
                        <p className="text-sm text-gray-600">{selectedStory.freelancerTitle}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStory(null)}
                    className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}