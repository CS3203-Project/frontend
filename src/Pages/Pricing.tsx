import { Check, Star, Zap, Crown, Users, TrendingUp } from 'lucide-react';
import Button from '../components/Button';

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 3 service listings",
        "Basic profile customization",
        "Customer messaging",
        "Payment processing (5% fee)",
        "Mobile app access",
        "Email support"
      ],
      icon: Users,
      popular: false,
      buttonText: "Get Started Free",
      gradient: "from-gray-400 to-gray-600"
    },
    {
      name: "Professional",
      price: "$19",
      period: "per month",
      description: "Best for growing businesses",
      features: [
        "Unlimited service listings",
        "Advanced profile customization",
        "Priority customer messaging",
        "Payment processing (3% fee)",
        "Analytics dashboard",
        "Marketing tools",
        "Priority support",
        "Custom booking calendar"
      ],
      icon: Zap,
      popular: true,
      buttonText: "Start Free Trial",
      gradient: "from-purple-400 to-blue-500"
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      description: "For established service providers",
      features: [
        "Everything in Professional",
        "White-label solutions",
        "API access",
        "Payment processing (2% fee)",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 phone support",
        "Multi-location management"
      ],
      icon: Crown,
      popular: false,
      buttonText: "Contact Sales",
      gradient: "from-yellow-400 to-orange-500"
    }
  ];

  const features = [
    {
      title: "No Setup Fees",
      description: "Get started without any upfront costs",
      icon: Check
    },
    {
      title: "Secure Payments",
      description: "Industry-leading payment security",
      icon: Star
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock assistance when you need it",
      icon: Users
    },
    {
      title: "Growth Analytics",
      description: "Track your business performance",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-500/20 to-purple-600/20 blur-3xl"></div>
            <h1 className="relative text-4xl md:text-6xl font-bold text-white mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"> Pricing</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Choose the perfect plan for your service business. Start free and scale as you grow.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? "border-purple-500/50 shadow-2xl shadow-purple-500/20" 
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-400 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${plan.gradient} mx-auto mb-4 flex items-center justify-center`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We provide everything you need to succeed in the service marketplace
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-400 to-blue-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              question: "Can I change my plan at any time?",
              answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers."
            },
            {
              question: "Is there a contract or can I cancel anytime?",
              answer: "No contracts required. You can cancel your subscription at any time with no penalties."
            },
            {
              question: "Do you offer refunds?",
              answer: "We offer a 30-day money-back guarantee for all paid plans. No questions asked."
            }
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
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
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of service providers already growing their business with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold px-8 py-3 hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
              Start Free Trial
            </Button>
            <Button className="bg-white/10 text-white border border-white/20 font-semibold px-8 py-3 hover:bg-white/20 hover:border-white/30 transition-all duration-300">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;