import { useState, useEffect, useCallback, memo } from 'react';
import { Menu, ChevronDown, X, Search, Shield, Users, Globe, Sparkles, ArrowRight, Home, Briefcase, UserCheck, BarChart3, LogOut, User } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/utils';
import { Link } from 'react-router-dom';
import SpecificSearchCard from './services/SpecificSearchCard';
import { categoriesData } from '../data/servicesData';
import { useAuth } from '../contexts/AuthContext';

// Move static data outside component to prevent recreation on each render
const services = [
  {
    title: "Home Services",
    description: "Cleaning, repairs, maintenance",
    href: "#",
    icon: Home,
    gradient: "from-green-400 to-blue-500"
  },
  {
    title: "Professional Services",
    description: "Tutoring, consulting, coaching",
    href: "#",
    icon: Briefcase,
    gradient: "from-blue-400 to-purple-500"
  },
  {
    title: "Creative Services",
    description: "Design, photography, writing",
    href: "#",
    icon: Sparkles,
    gradient: "from-purple-400 to-pink-500"
  },
  {
    title: "Technical Services",
    description: "IT support, web development",
    href: "#",
    icon: Globe,
    gradient: "from-cyan-400 to-blue-500"
  },
  {
    title: "Personal Care",
    description: "Beauty, wellness, fitness",
    href: "#",
    icon: UserCheck,
    gradient: "from-pink-400 to-red-500"
  },
  {
    title: "Business Services",
    description: "Accounting, marketing, legal",
    href: "#",
    icon: BarChart3,
    gradient: "from-indigo-400 to-purple-500"
  },
];

const providerFeatures = [
  {
    title: "Easy Setup",
    description: "Get your service online in minutes",
    href: "#",
    icon: Sparkles,
    gradient: "from-green-400 to-blue-500"
  },
  {
    title: "Secure Payments",
    description: "Get paid safely and on time",
    href: "#",
    icon: Shield,
    gradient: "from-blue-400 to-indigo-500"
  },
  {
    title: "Customer Management",
    description: "Track bookings and communications",
    href: "#",
    icon: Users,
    gradient: "from-purple-400 to-pink-500"
  },
  {
    title: "Analytics Dashboard",
    description: "Monitor your business performance",
    href: "#",
    icon: BarChart3,
    gradient: "from-orange-400 to-red-500"
  },
];

const navLinks = [
  { name: "How It Works", href: "/howWorks" },
  { name: "Pricing", href: "#" },
  { name: "Success Stories", href: "/stories" },
  { name: "Support", href: "/support" }
];

const Navbar = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [forProvidersOpen, setForProvidersOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesTimeout, setServicesTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [providersTimeout, setProvidersTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Use AuthContext instead of local state
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const handleServicesEnter = useCallback(() => {
    if (servicesTimeout) clearTimeout(servicesTimeout);
    setServicesOpen(true);
  }, [servicesTimeout]);

  const handleServicesLeave = useCallback(() => {
    const timeout = setTimeout(() => setServicesOpen(false), 150);
    setServicesTimeout(timeout);
  }, []);

  const handleProvidersEnter = useCallback(() => {
    if (providersTimeout) clearTimeout(providersTimeout);
    setForProvidersOpen(true);
  }, [providersTimeout]);

  const handleProvidersLeave = useCallback(() => {
    const timeout = setTimeout(() => setForProvidersOpen(false), 150);
    setProvidersTimeout(timeout);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-40 transition-all duration-300",
      scrolled 
        ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200" 
        : "bg-white/90 backdrop-blur-sm"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <img 
                  src="/logo_svg_only_dark.svg" 
                  alt="Zia Logo" 
                  className="h-8 w-8"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    if (img.nextSibling && img.nextSibling instanceof HTMLElement) {
                      (img.nextSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg items-center justify-center text-white font-bold text-lg">
                  Z
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  Zia
                </h1>
                <p className="text-xs text-gray-600 -mt-1">Service Marketplace</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Services Dropdown */}
            <div className="relative">
               <Link
                to="/services"
                className="flex items-center space-x-1 text-gray-700 hover:text-black font-medium transition-colors duration-200 py-2"
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                <span>Browse Services</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  servicesOpen && "rotate-180"
                )} />
              </Link>
              
              {/* Services Mega Menu */}
              <div 
                className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 transition-all duration-200 origin-top",
                  servicesOpen 
                    ? "opacity-100 visible scale-100" 
                    : "opacity-0 invisible scale-95 pointer-events-none"
                )}
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                <div className="grid grid-cols-2 gap-4">
                  {categoriesData.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <Link
                        key={index}
                        to={`/services/${service.slug}`}
                        className="group p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                        onClick={() => setServicesOpen(false)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-transform duration-200",
                            service.gradient
                          )}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors duration-200">
                              {service.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <SpecificSearchCard />
              </div>
            </div>

            {/* For Providers Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-1 text-gray-700 hover:text-black font-medium transition-colors duration-200 py-2"
                onMouseEnter={handleProvidersEnter}
                onMouseLeave={handleProvidersLeave}
              >
                <span>For Providers</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  forProvidersOpen && "rotate-180"
                )} />
              </button>
              
              {/* Provider Features Menu */}
              <div 
                className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 transition-all duration-200 origin-top",
                  forProvidersOpen 
                    ? "opacity-100 visible scale-100" 
                    : "opacity-0 invisible scale-95 pointer-events-none"
                )}
                onMouseEnter={handleProvidersEnter}
                onMouseLeave={handleProvidersLeave}
              >
                <div className="grid grid-cols-2 gap-4">
                  {providerFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <a
                        key={index}
                        href={feature.href}
                        className="group p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-transform duration-200",
                            feature.gradient
                          )}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">
                              {feature.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 text-sm">Start earning today!</h4>
                    <p className="text-xs text-gray-600 mt-1">Join thousands of service providers</p>
                    <Button size="sm" className="mt-2 w-full">
                      Start Selling
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-700 hover:text-black font-medium transition-colors duration-200 relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-200"></span>
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">            
            {isLoggedIn && user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {(user.firstName || '').charAt(0)}{(user.lastName || '').charAt(0)}
                    </div>
                  )}
                  <span className="text-gray-700 font-medium">{user.firstName}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )} />
                </button>

                {/* User Dropdown Menu */}
                <div className={cn(
                  "absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 transition-all duration-200 origin-top-right",
                  userMenuOpen 
                    ? "opacity-100 visible scale-100" 
                    : "opacity-0 invisible scale-95 pointer-events-none"
                )}>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    My Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <a href="/signin">
                  <Button variant="ghost" className="font-medium">
                    Sign In
                  </Button>
                </a>
                <a href="/signup">
                  <Button className="font-medium shadow-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-gray-50 border-t border-gray-200",
          mobileMenuOpen ? "max-h-screen opacity-100 pb-6" : "max-h-0 opacity-0"
        )}>
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Services */}
            <div>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 py-2"
              >
                Browse Services
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  servicesOpen && "rotate-180"
                )} />
              </button>
              <div className={cn(
                "mt-2 overflow-hidden transition-all duration-200",
                servicesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="space-y-2 pl-4">
                  {categoriesData.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <Link
                        key={index}
                        to={`/services/${service.slug}`}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center",
                          service.gradient
                        )}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{service.title}</div>
                          <div className="text-sm text-gray-600">{service.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Providers */}
            <div>
              <button
                onClick={() => setForProvidersOpen(!forProvidersOpen)}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 py-2"
              >
                For Service Providers
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  forProvidersOpen && "rotate-180"
                )} />
              </button>
              <div className={cn(
                "mt-2 overflow-hidden transition-all duration-200",
                forProvidersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="space-y-2 pl-4">
                  {providerFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <a
                        key={index}
                        href={feature.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center",
                          feature.gradient
                        )}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{feature.title}</div>
                          <div className="text-sm text-gray-600">{feature.description}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="block py-3 text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="pt-4 border-t border-gray-300 space-y-3">
              {isLoggedIn && user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {(user.firstName || '').charAt(0)}{(user.lastName || '').charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <a
                    href="/profile"
                    className="w-full justify-center inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <a
                    href="/signin"
                    className="w-full justify-center inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors duration-200"
                  >
                    Sign In
                  </a>
                  <a href="/signup" className="w-full">
                    <Button className="w-full justify-center">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;