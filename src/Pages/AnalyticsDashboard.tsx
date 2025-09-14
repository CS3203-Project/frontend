import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Star, Eye, Target } from 'lucide-react';
import Button from '../components/Button';

const AnalyticsDashboard = () => {
  const metrics = [
    {
      title: "Revenue Tracking",
      description: "Monitor earnings, payment trends, and financial performance",
      icon: DollarSign,
      gradient: "from-green-400 to-emerald-500",
      features: ["Monthly Revenue", "Payment Analytics", "Profit Margins", "Growth Trends"]
    },
    {
      title: "Customer Analytics",
      description: "Understand your customer base and behavior patterns",
      icon: Users,
      gradient: "from-blue-400 to-indigo-500",
      features: ["Customer Demographics", "Retention Rates", "Lifetime Value", "Satisfaction Scores"]
    },
    {
      title: "Booking Insights",
      description: "Analyze booking patterns and optimize your schedule",
      icon: Calendar,
      gradient: "from-purple-400 to-pink-500",
      features: ["Booking Trends", "Peak Hours", "Cancellation Rates", "Capacity Utilization"]
    },
    {
      title: "Performance Metrics",
      description: "Track service quality and business growth indicators",
      icon: TrendingUp,
      gradient: "from-orange-400 to-red-500",
      features: ["Service Ratings", "Response Times", "Completion Rates", "Growth Metrics"]
    }
  ];

  const dashboardFeatures = [
    {
      title: "Real-time Data",
      description: "Live updates on all your business metrics",
      icon: Eye,
      color: "text-blue-400"
    },
    {
      title: "Custom Reports",
      description: "Generate detailed reports for any time period",
      icon: BarChart3,
      color: "text-green-400"
    },
    {
      title: "Goal Tracking",
      description: "Set and monitor your business objectives",
      icon: Target,
      color: "text-purple-400"
    },
    {
      title: "Performance Alerts",
      description: "Get notified about important business changes",
      icon: Star,
      color: "text-yellow-400"
    }
  ];

  const sampleData = [
    { month: "Jan", revenue: 2400, bookings: 45 },
    { month: "Feb", revenue: 2800, bookings: 52 },
    { month: "Mar", revenue: 3200, bookings: 60 },
    { month: "Apr", revenue: 2900, bookings: 55 },
    { month: "May", revenue: 3800, bookings: 72 },
    { month: "Jun", revenue: 4200, bookings: 78 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-500/20 to-orange-600/20 blur-3xl"></div>
              <h1 className="relative text-4xl md:text-6xl font-bold text-white mb-6">
                Monitor Your Business
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"> Performance</span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Get deep insights into your service business with comprehensive analytics and performance tracking.
            </p>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold px-8 py-3 hover:from-orange-600 hover:to-red-700 transition-all duration-300">
              View Analytics Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comprehensive Business Intelligence
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track every aspect of your business with detailed analytics and actionable insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-orange-500/30 transition-all duration-300 group"
              >
                <div className="flex items-start mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.gradient} mr-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{metric.title}</h3>
                    <p className="text-gray-300 mb-4">{metric.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {metric.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Business at a Glance
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how your analytics dashboard brings all your data together
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Monthly Revenue</h3>
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">$4,200</div>
              <div className="text-green-300 text-sm">+23% from last month</div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Total Bookings</h3>
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">78</div>
              <div className="text-blue-300 text-sm">+8 new this week</div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Avg Rating</h3>
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">4.9</div>
              <div className="text-yellow-300 text-sm">+0.2 improvement</div>
            </div>
          </div>

          {/* Chart Preview */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-4">Revenue Trend</h3>
            <div className="h-48 flex items-end justify-between space-x-2">
              {sampleData.map((data, index) => {
                const heightClass = data.revenue > 4000 ? "h-full" : data.revenue > 3000 ? "h-3/4" : data.revenue > 2500 ? "h-1/2" : "h-1/3";
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div className={`bg-gradient-to-t from-orange-500 to-red-400 rounded-t w-full transition-all duration-500 hover:from-orange-400 hover:to-red-300 ${heightClass}`}></div>
                    <span className="text-gray-400 text-xs">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Advanced Dashboard Features
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Powerful tools to help you make data-driven business decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dashboardFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-2xl p-12 border border-orange-500/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Data-Driven Growth
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See how analytics help service providers make better business decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">35%</div>
              <div className="text-white font-semibold mb-1">Revenue Increase</div>
              <div className="text-gray-400 text-sm">Average within 6 months</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-400 mb-2">50%</div>
              <div className="text-white font-semibold mb-1">Better Decisions</div>
              <div className="text-gray-400 text-sm">Data-backed choices</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">90%</div>
              <div className="text-white font-semibold mb-1">User Satisfaction</div>
              <div className="text-gray-400 text-sm">Love the insights</div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold px-8 py-3 hover:from-orange-600 hover:to-red-700 transition-all duration-300">
              Start Tracking Your Performance
            </Button>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Providers Use Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Optimize Pricing",
              description: "Use demand patterns and competitor analysis to set the perfect prices",
              example: "Increased bookings by 40% after adjusting pricing based on peak hour data"
            },
            {
              title: "Improve Service Quality",
              description: "Track customer feedback to identify areas for improvement",
              example: "Achieved 4.9/5 rating by addressing common customer concerns"
            },
            {
              title: "Grow Revenue",
              description: "Identify your most profitable services and focus on growth",
              example: "Doubled revenue by promoting high-margin services to the right customers"
            }
          ].map((useCase, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-3">{useCase.title}</h3>
              <p className="text-gray-300 mb-4">{useCase.description}</p>
              <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-lg p-3 border border-orange-500/20">
                <p className="text-orange-300 text-sm italic">"{useCase.example}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;