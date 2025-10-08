import { useState } from 'react'
import { Star, DollarSign, ArrowRight, Play, MessageCircle, Heart, Award, Headphones, Sparkles, Users, CheckCircle } from 'lucide-react'
import Button from '../components/Button'

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
      icon: <Heart className="w-8 h-8 text-pink-400" />,
      number: '2.5M+',
      label: 'Happy Clients',
      description: 'Satisfied customers worldwide',
      gradient: 'from-pink-400 to-rose-500'
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-400" />,
      number: '$1.2B+',
      label: 'Total Earnings',
      description: 'Paid to freelancers globally',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-400" />,
      number: '98%',
      label: 'Success Rate',
      description: 'Projects completed successfully',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: <Headphones className="w-8 h-8 text-blue-400" />,
      number: '24/7',
      label: 'Support Available',
      description: 'Round-the-clock assistance',
      gradient: 'from-blue-400 to-indigo-500'
    }
  ]

  const successStories = [
    {
      id: 1,
      category: 'design',
      clientName: 'Sarah Johnson',
      company: 'TechStartup Inc.',
      clientTitle: 'CEO',
      projectTitle: 'Complete Brand Identity & Website Design',
      description: 'Transformed our startup vision into a stunning brand identity that resonates with our target audience. The designer exceeded expectations with creative solutions.',
      testimonial: 'Working with this freelancer was a game-changer for our business. They understood our vision perfectly and delivered beyond our expectations.',
      projectValue: '$5,200',
      duration: '3 weeks',
      rating: 5,
      freelancerName: 'Alex Chen',
      freelancerTitle: 'Brand Designer & Web Developer',
      results: [
        '300% increase in website conversions',
        'Brand recognition improved by 85%',
        'Social media engagement up 250%',
        'Customer inquiries increased 180%'
      ],
      technologies: ['Adobe Creative Suite', 'Figma', 'React', 'Tailwind CSS'],
      image: '/api/placeholder/400/300'
    },
    {
      id: 2,
      category: 'development',
      clientName: 'Michael Rodriguez',
      company: 'E-commerce Solutions',
      clientTitle: 'CTO',
      projectTitle: 'Full-Stack E-commerce Platform',
      description: 'Built a comprehensive e-commerce platform with advanced features including AI-powered recommendations and real-time analytics.',
      testimonial: 'The technical expertise and attention to detail were outstanding. Our platform now handles 10x more traffic seamlessly.',
      projectValue: '$12,800',
      duration: '8 weeks',
      rating: 5,
      freelancerName: 'Maria Santos',
      freelancerTitle: 'Full-Stack Developer',
      results: [
        'Platform handles 50,000+ concurrent users',
        'Page load times reduced by 70%',
        'Sales increased by 400%',
        'Customer satisfaction up 95%'
      ],
      technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
      image: '/api/placeholder/400/300'
    },
    {
      id: 3,
      category: 'marketing',
      clientName: 'Emma Thompson',
      company: 'Green Energy Co.',
      clientTitle: 'Marketing Director',
      projectTitle: 'Digital Marketing Campaign & SEO',
      description: 'Comprehensive digital marketing strategy that boosted our online presence and generated qualified leads consistently.',
      testimonial: 'The ROI from this campaign exceeded our projections by 300%. Professional, data-driven, and results-focused.',
      projectValue: '$8,500',
      duration: '6 weeks',
      rating: 5,
      freelancerName: 'David Kim',
      freelancerTitle: 'Digital Marketing Specialist',
      results: [
        'Organic traffic increased 450%',
        'Lead generation up 320%',
        'Cost per acquisition reduced 60%',
        'ROAS improved to 8:1'
      ],
      technologies: ['Google Ads', 'SEO Tools', 'Analytics', 'Social Media'],
      image: '/api/placeholder/400/300'
    }
  ]

  const filteredStories = selectedCategory === 'all' 
    ? successStories 
    : successStories.filter(story => story.category === selectedCategory)

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
              Success Stories That
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"> Inspire</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Discover how our platform has transformed businesses and careers. Real stories from real people achieving extraordinary results.
          </p>
          
          {/* Animated CTA */}
          <div className="relative inline-block">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-3 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
              <span className="relative z-10 flex items-center">
                Start Your Success Story
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredStats.map((stat, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${stat.gradient} mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-200 mb-1">{stat.label}</div>
              <div className="text-gray-400 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20 hover:border-white/30'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <span className="relative z-10 flex items-center">
                  {category.name}
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {selectedCategory === 'all' ? 'All Success Stories' : `${categories.find(c => c.id === selectedCategory)?.name} Stories`}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real projects, real results, real impact on businesses and careers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => setSelectedStory(story)}
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-blue-600/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full capitalize border border-white/30">
                    {story.category}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                  {story.projectTitle}
                </h3>
                
                <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                  {story.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-lg font-bold text-green-400">{story.projectValue}</div>
                    <div className="text-xs text-gray-400">Project Value</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-lg font-bold text-blue-400">{story.duration}</div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{story.clientName}</p>
                      <p className="text-xs text-gray-400">{story.company}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-white">{selectedStory.projectTitle}</h3>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300 border border-white/20"
                  aria-label="Close modal"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div>
                  <div className="h-80 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl mb-8 border border-white/10 flex items-center justify-center">
                    <span className="text-gray-300 font-medium">Project Showcase</span>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                      <h4 className="font-semibold text-white">Key Results</h4>
                    </div>
                    <ul className="space-y-3">
                      {selectedStory.results.map((result: string, index: number) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3"></div>
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStory.technologies.map((tech: string, index: number) => (
                        <span key={index} className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 text-white px-3 py-1 rounded-full text-sm border border-white/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      {[...Array(selectedStory.rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-3 text-gray-300 font-medium">5.0 stars</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                      <MessageCircle className="w-8 h-8 text-blue-400 mb-4" />
                      <p className="text-white italic text-lg mb-4">"{selectedStory.testimonial}"</p>
                      <div className="border-t border-white/20 pt-4">
                        <p className="font-semibold text-white">{selectedStory.clientName}</p>
                        <p className="text-gray-300">{selectedStory.clientTitle}, {selectedStory.company}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                      <div className="text-3xl font-bold text-green-400 mb-2">{selectedStory.projectValue}</div>
                      <div className="text-gray-400">Project Value</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                      <div className="text-3xl font-bold text-blue-400 mb-2">{selectedStory.duration}</div>
                      <div className="text-gray-400">Duration</div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-400" />
                      Freelancer
                    </h4>
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">
                          {selectedStory.freelancerName.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{selectedStory.freelancerName}</p>
                        <p className="text-gray-300">{selectedStory.freelancerTitle}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedStory(null)}
                    className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Close Story
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who have transformed their careers and businesses on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold px-8 py-3 hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
              Start as a Freelancer
            </Button>
            <Button className="bg-white/10 text-white border border-white/20 font-semibold px-8 py-3 hover:bg-white/20 hover:border-white/30 transition-all duration-300">
              Hire Talent
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}