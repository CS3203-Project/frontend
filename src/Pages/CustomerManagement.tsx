import { Users, MessageCircle, Calendar, Star, Bell, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Button from '../components/Button';

const CustomerManagement = () => {
  const features = [
    {
      title: "Customer Profiles",
      description: "Detailed customer history, preferences, and contact information",
      icon: Users,
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Booking Management",
      description: "Track all appointments, schedules, and service requests",
      icon: Calendar,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "Communication Hub",
      description: "Centralized messaging and communication with all customers",
      icon: MessageCircle,
      gradient: "from-green-400 to-blue-500"
    },
    {
      title: "Review & Ratings",
      description: "Monitor customer feedback and improve your services",
      icon: Star,
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "Smart Notifications",
      description: "Stay updated with automated alerts and reminders",
      icon: Bell,
      gradient: "from-red-400 to-pink-500"
    },
    {
      title: "Performance Insights",
      description: "Track customer satisfaction and retention metrics",
      icon: TrendingUp,
      gradient: "from-indigo-400 to-purple-500"
    }
  ];

  const tools = [
    {
      title: "Customer Database",
      description: "Comprehensive customer profiles with service history and preferences",
      icon: Users,
      benefits: ["Contact Management", "Service History", "Preference Tracking", "Notes & Tags"]
    },
    {
      title: "Appointment Scheduler",
      description: "Advanced booking system with calendar integration",
      icon: Calendar,
      benefits: ["Online Booking", "Calendar Sync", "Automated Reminders", "Rescheduling Tools"]
    },
    {
      title: "Communication Tools",
      description: "Built-in messaging and notification system",
      icon: MessageCircle,
      benefits: ["Real-time Chat", "Email Integration", "SMS Notifications", "File Sharing"]
    },
    {
      title: "Feedback System",
      description: "Collect and manage customer reviews and ratings",
      icon: Star,
      benefits: ["Review Collection", "Rating Analytics", "Response Management", "Improvement Insights"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-500/20 to-purple-600/20 blur-3xl"></div>
              <h1 className="relative text-4xl md:text-6xl font-bold text-white mb-6">
                Manage Customers Like a
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"> Pro</span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Streamline your customer relationships with powerful tools for bookings, communications, and performance tracking.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold px-8 py-3 hover:from-purple-600 hover:to-pink-700 transition-all duration-300">
              Try Customer Management
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Manage Customers
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive tools to build stronger relationships and grow your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Tools Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful Management Tools
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Deep dive into the tools that will transform how you manage your customers
          </p>
        </div>

        <div className="space-y-12">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 mr-4 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{tool.title}</h3>
                  </div>
                  <p className="text-gray-300 mb-6">{tool.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {tool.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 h-80 flex items-center justify-center">
                    <div className="text-center">
                      <IconComponent className="h-24 w-24 text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-300">Interactive Demo Available</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Proven Results
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See how our customer management tools help service providers succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">85%</div>
              <div className="text-white font-semibold mb-1">Customer Retention</div>
              <div className="text-gray-400 text-sm">Average improvement</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">60%</div>
              <div className="text-white font-semibold mb-1">Time Saved</div>
              <div className="text-gray-400 text-sm">On admin tasks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">4.8/5</div>
              <div className="text-white font-semibold mb-1">Customer Rating</div>
              <div className="text-gray-400 text-sm">Average provider score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">2x</div>
              <div className="text-white font-semibold mb-1">Booking Growth</div>
              <div className="text-gray-400 text-sm">In first 6 months</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Streamlined Customer Workflow
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            From first contact to repeat bookings - manage every step efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: 1,
              title: "Customer Inquiry",
              description: "Receive and track all customer inquiries in one place",
              icon: MessageCircle
            },
            {
              step: 2,
              title: "Schedule Service",
              description: "Book appointments with automated calendar sync",
              icon: Calendar
            },
            {
              step: 3,
              title: "Service Delivery",
              description: "Track service progress and communicate updates",
              icon: Clock
            },
            {
              step: 4,
              title: "Follow-up",
              description: "Collect feedback and schedule future services",
              icon: Star
            }
          ].map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 mx-auto mb-4 flex items-center justify-center relative">
                  <IconComponent className="h-8 w-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Customer Management?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of service providers already using our customer management tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold px-8 py-3 hover:from-purple-600 hover:to-pink-700 transition-all duration-300">
              Start Free Trial
            </Button>
            <Button className="bg-white/10 text-white border border-white/20 font-semibold px-8 py-3 hover:bg-white/20 hover:border-white/30 transition-all duration-300">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;