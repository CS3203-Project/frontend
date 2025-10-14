import { Shield, Lock, CreditCard, CheckCircle, Star, DollarSign, Clock, Users } from 'lucide-react';
import Button from '../components/Button';

const SecurePayments = () => {
  const securityFeatures = [
    {
      title: "Bank-Level Encryption",
      description: "All transactions protected with 256-bit SSL encryption",
      icon: Lock,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "PCI DSS Compliant",
      description: "Meets the highest payment card industry standards",
      icon: Shield,
      gradient: "bg-black dark:bg-white"
    },
    {
      title: "Fraud Protection",
      description: "Advanced AI-powered fraud detection and prevention",
      icon: CheckCircle,
      gradient: "bg-black dark:bg-white"
    },
    {
      title: "Dispute Management",
      description: "24/7 support for payment disputes and chargebacks",
      icon: Users,
      gradient: "bg-black dark:bg-white"
    }
  ];

  const paymentMethods = [
    "Visa", "Mastercard", "American Express", "Discover", 
    "PayPal", "Apple Pay", "Google Pay", "Bank Transfer"
  ];

  const benefits = [
    {
      title: "Fast Payouts",
      description: "Get paid within 24-48 hours of service completion",
      icon: Clock,
      stats: "24-48h"
    },
    {
      title: "Low Fees",
      description: "Competitive transaction rates starting at just 2.9%",
      icon: DollarSign,
      stats: "2.9%"
    },
    {
      title: "Global Reach",
      description: "Accept payments from customers worldwide",
      icon: Star,
      stats: "190+ Countries"
    },
    {
      title: "Automatic Tax",
      description: "Automatic tax calculation and reporting",
      icon: CheckCircle,
      stats: "100% Automated"
    }
  ];

  return (
    <div className="min-h-screen min-h-screen relative">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent dark:from-white/10 dark:to-transparent blur-3xl"></div>
              <h1 className="relative text-4xl md:text-6xl font-bold text-black dark:text-white mb-6">
                Get Paid
                <span className="bg-gradient-to-r text-black dark:text-white"> Safely & On Time</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Enterprise-grade payment security with fast payouts. Focus on your service while we handle the payments securely.
            </p>
            <Button className="bg-black dark:bg-white text-black dark:text-white font-semibold px-8 py-3 hover:scale-105 transition-all duration-300">
              Setup Secure Payments
            </Button>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            Military-Grade Security
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your money and your customers' data are protected by the same security used by major banks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-white/15 hover:border-blue-500/30 transition-all duration-300 text-center group"
              >
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r ${feature.gradient} mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 dark:border-white/15">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Accept All Popular Payment Methods
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Make it easy for customers to pay you however they prefer
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <p className="text-black dark:text-white font-medium text-sm">{method}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            Payment Benefits
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            More than just security - we make payments work better for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-white/15 hover:border-white/20 transition-all duration-300 text-center group"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-black dark:text-white mb-2">{benefit.stats}</div>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl p-12 border border-blue-500/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join service providers who trust us with their payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-black dark:text-white mb-2">$50M+</div>
              <div className="text-black dark:text-white font-semibold mb-1">Processed Safely</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">In the last year alone</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">99.9%</div>
              <div className="text-black dark:text-white font-semibold mb-1">Uptime</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Always available for payments</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black dark:text-white mb-2">24/7</div>
              <div className="text-black dark:text-white font-semibold mb-1">Monitoring</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Round-the-clock security</div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button className="bg-black dark:bg-white text-black dark:text-white font-semibold px-8 py-3 hover:scale-105 transition-all duration-300">
              Get Started with Secure Payments
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            Payment Security FAQ
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              question: "How secure are the payments?",
              answer: "We use bank-level 256-bit SSL encryption and are PCI DSS compliant, meeting the highest industry security standards."
            },
            {
              question: "When do I get paid?",
              answer: "Payments are typically processed within 24-48 hours after service completion and customer approval."
            },
            {
              question: "What are the transaction fees?",
              answer: "Our competitive rates start at 2.9% + $0.30 per transaction, with lower rates available for high-volume providers."
            },
            {
              question: "What if there's a payment dispute?",
              answer: "We have a dedicated dispute resolution team available 24/7 to help resolve any payment issues quickly and fairly."
            }
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 dark:border-white/15"
            >
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurePayments;
