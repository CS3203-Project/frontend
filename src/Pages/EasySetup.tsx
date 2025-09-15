import { Sparkles, Clock, CheckCircle, ArrowRight, Play, Zap, Star } from 'lucide-react';
import Button from '../components/Button';

const EasySetup = () => {
  const steps = [
    {
      step: 1,
      title: "Create Your Profile",
      description: "Add your basic information, skills, and professional photos",
      time: "2 minutes",
      icon: CheckCircle
    },
    {
      step: 2,
      title: "Add Your Services",
      description: "List what you offer with descriptions and pricing",
      time: "5 minutes",
      icon: Sparkles
    },
    {
      step: 3,
      title: "Set Your Availability",
      description: "Choose when you're available for bookings",
      time: "1 minute",
      icon: Clock
    },
    {
      step: 4,
      title: "Go Live",
      description: "Your profile is now live and ready to receive bookings",
      time: "Instant",
      icon: Zap
    }
  ];

  const features = [
    {
      title: "Guided Setup Wizard",
      description: "Step-by-step guidance to get you started quickly",
      icon: Star
    },
    {
      title: "Pre-built Templates",
      description: "Professional service templates ready to customize",
      icon: Sparkles
    },
    {
      title: "Instant Preview",
      description: "See how your profile looks to customers in real-time",
      icon: Play
    },
    {
      title: "Quick Launch",
      description: "Go live immediately after completing setup",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-green-600/20 blur-3xl"></div>
              <h1 className="relative text-4xl md:text-6xl font-bold text-white mb-6">
                Get Your Service Online in
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"> Minutes</span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Our streamlined setup process gets you from zero to earning in just 8 minutes. No technical skills required.
            </p>
            <Button className="bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold px-8 py-3 hover:from-green-600 hover:to-blue-700 transition-all duration-300">
              Start Setup Now
            </Button>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple 4-Step Process
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Follow our guided setup wizard and you'll be ready to serve customers in no time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-green-500/30 transition-all duration-300 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-green-400 mb-2">
                    Step {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300 mb-4">{step.description}</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-400">
                    <Clock className="h-4 w-4" />
                    <span>{step.time}</span>
                  </div>
                </div>
                
                {/* Arrow connector (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Setup Made Simple
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We've designed every aspect of the setup process to be intuitive and fast
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-green-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-12 border border-green-500/30 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Watch how easy it is to set up your service profile
          </p>
          <div className="relative bg-black/50 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-center h-64">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                <Play className="h-10 w-10 text-white ml-1" />
              </div>
            </div>
            <p className="text-gray-400 mt-4">Click to watch 2-minute setup demo</p>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold px-8 py-3 hover:from-green-600 hover:to-blue-700 transition-all duration-300">
            Start Your Setup Now
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-white/10">
            <div className="text-4xl font-bold text-green-400 mb-2">8 min</div>
            <div className="text-white font-semibold mb-1">Average Setup Time</div>
            <div className="text-gray-400 text-sm">From start to first booking</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">95%</div>
            <div className="text-white font-semibold mb-1">Success Rate</div>
            <div className="text-gray-400 text-sm">Complete setup on first try</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-white/10">
            <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-white font-semibold mb-1">Support Available</div>
            <div className="text-gray-400 text-sm">Help when you need it</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EasySetup;