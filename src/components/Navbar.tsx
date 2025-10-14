import { useState, useEffect } from 'react';
import { Menu, ChevronDown, Shield, Users, Sparkles, ArrowRight, BarChart3, LogOut, User, Bell, DollarSign, Trophy, Lightbulb, MessageCircle } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/utils';
import { useAuth } from '../contexts/AuthContext';
import { clearMessages } from '../utils/messageDB';
import { Link, useLocation } from 'react-router-dom';
import { categoriesData } from '../data/servicesData';
import { useNotifications } from '../hooks/useNotifications';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [forProvidersOpen, setForProvidersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesTimeout, setServicesTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [providersTimeout, setProvidersTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [helpTimeout, setHelpTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Use AuthContext and location hook
  const { user, isLoggedIn, logout } = useAuth();
  const location = useLocation();

  // Use notifications hook for unread count
  const { stats } = useNotifications();

  // Use translation hook
  const { t } = useTranslation('common');

  // Helper function to check if a route is active
  const isActiveRoute = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  // Helper function to check if provider-related routes are active
  const isProviderRouteActive = () => {
    const providerRoutes = ['/easy-setup', '/secure-payments', '/customer-management', '/analytics-dashboard'];
    return providerRoutes.some(route => location.pathname.startsWith(route));
  };

  // Helper function to check if help-related routes are active
  const isHelpRouteActive = () => {
    const helpRoutes = ['/howWorks', '/pricing', '/stories', '/support'];
    return helpRoutes.some(route => location.pathname.startsWith(route));
  };

  // Helper function to check if services-related routes are active
  const isServicesRouteActive = () => {
    return location.pathname.startsWith('/services');
  };

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

  const handleLogout = async () => {
    try {
      await clearMessages(); // Clear IndexedDB messages on logout
      await logout(); // Use AuthContext logout
      setUserMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleServicesEnter = () => {
    if (servicesTimeout) clearTimeout(servicesTimeout);
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    const timeout = setTimeout(() => setServicesOpen(false), 150);
    setServicesTimeout(timeout);
  };

  const handleProvidersEnter = () => {
    if (providersTimeout) clearTimeout(providersTimeout);
    setForProvidersOpen(true);
  };

  const handleProvidersLeave = () => {
    const timeout = setTimeout(() => setForProvidersOpen(false), 150);
    setProvidersTimeout(timeout);
  };

  const handleHelpEnter = () => {
    if (helpTimeout) clearTimeout(helpTimeout);
    setHelpOpen(true);
  };

  const handleHelpLeave = () => {
    const timeout = setTimeout(() => setHelpOpen(false), 150);
    setHelpTimeout(timeout);
  };

  const providerFeatures = [
    {
      title: "Easy Setup",
      description: "Get your service online in minutes",
      href: "/easy-setup",
      icon: Sparkles,
      gradient: "from-green-400 to-blue-500"
    },
    {
      title: "Secure Payments",
      description: "Get paid safely and on time",
      href: "/secure-payments",
      icon: Shield,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "Customer Management",
      description: "Track bookings and communications",
      href: "/customer-management",
      icon: Users,
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Analytics Dashboard",
      description: "Monitor your business performance",
      href: "/analytics-dashboard",
      icon: BarChart3,
      gradient: "from-orange-400 to-red-500"
    },
  ];

  const helpResources = [
    {
      title: "How It Works",
      description: "Learn how our platform works",
      href: "/howWorks",
      icon: Lightbulb,
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      title: "Pricing",
      description: "View our pricing plans",
      href: "/pricing",
      icon: DollarSign,
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Success Stories",
      description: "Read customer testimonials",
      href: "/stories",
      icon: Trophy,
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "Support",
      description: "Get help when you need it",
      href: "/support",
      icon: MessageCircle,
      gradient: "from-purple-400 to-pink-500"
    },
  ];

  const navLinks = [
    { name: t('navbar.messages'), href: "/conversation-hub" },
    { name: t('navbar.serviceRequest'), href: "/service-request" }
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-40 transition-all duration-500",
      scrolled 
        ? "bg-black/95 backdrop-blur-xl shadow-2xl border-b border-white/10" 
        : "bg-black/90 backdrop-blur-lg"
    )}>
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Subtle gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer py-2 px-3 rounded-xl transition-all duration-300 hover:bg-white/5">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                {/* Glittering background effect */}
                <div className="absolute inset-0 rounded-xl transition-all duration-300 bg-gradient-to-r from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10"></div>
                <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                
                <img 
                  src="/logo_svg_only_dark.svg" 
                  alt="Zia Logo" 
                  className="h-8 w-8 relative z-10 filter brightness-0 invert"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    if (img.nextSibling && img.nextSibling instanceof HTMLElement) {
                      (img.nextSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden h-8 w-8 bg-gradient-to-r from-white to-gray-300 rounded-lg items-center justify-center text-black font-bold text-lg relative z-10">
                  Z
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300 whitespace-nowrap">
                  Zia <span className="text-xs font-normal text-gray-400 group-hover:text-gray-300">Service Marketplace</span>
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 flex-nowrap">
            {/* Services Dropdown */}
            <div className="relative">
               <div
                className={cn(
                  "flex items-center space-x-1 font-medium transition-all duration-300 py-2 px-3 rounded-lg group",
                  isServicesRouteActive() 
                    ? "text-white bg-white/10 shadow-lg border border-white/20" 
                    : "text-white/90 hover:text-white hover:bg-white/5"
                )}
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                <Link to="/services" className="hover:text-white">
                  <span>{t('navbar.browseServices')}</span>
                </Link>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-all duration-300",
                  servicesOpen && "rotate-180 text-white",
                  isServicesRouteActive() ? "text-white" : "group-hover:text-white"
                )} />
              </div>
              
              {/* Services Mega Menu */}
              <div 
                className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[700px] bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 transition-all duration-300 origin-top",
                  servicesOpen 
                    ? "opacity-100 visible scale-100" 
                    : "opacity-0 invisible scale-95 pointer-events-none"
                )}
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                {/* Glittering border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {categoriesData.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <Link
                        key={index}
                        to={`/services/${service.slug}`}
                        className="group p-4 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 relative overflow-hidden"
                        onClick={() => setServicesOpen(false)}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                        
                        <div className="flex items-start space-x-3 relative z-10">
                          <div className={cn(
                            "w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative",
                            "from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                          )}>
                            {/* Glitter effect */}
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                            <IconComponent className="h-5 w-5 text-white relative z-10" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white group-hover:text-gray-100 transition-colors duration-300">
                              {service.title}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* For Providers Dropdown */}
            <div className="relative">
              <button 
                className={cn(
                  "flex items-center space-x-1 font-medium transition-all duration-300 py-2 px-3 rounded-lg group",
                  isProviderRouteActive() 
                    ? "text-white bg-white/10 shadow-lg border border-white/20" 
                    : "text-white/90 hover:text-white hover:bg-white/5"
                )}
                onMouseEnter={handleProvidersEnter}
                onMouseLeave={handleProvidersLeave}
              >
                <span>{t('navbar.forProviders')}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-all duration-300",
                  forProvidersOpen && "rotate-180 text-white",
                  isProviderRouteActive() ? "text-white" : "group-hover:text-white"
                )} />
              </button>
              
              {/* Provider Features Menu */}
              <div 
                className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[500px] bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 transition-all duration-300 origin-top",
                  forProvidersOpen 
                    ? "opacity-100 visible scale-100" 
                    : "opacity-0 invisible scale-95 pointer-events-none"
                )}
                onMouseEnter={handleProvidersEnter}
                onMouseLeave={handleProvidersLeave}
              >
                {/* Glittering border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {providerFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Link
                        key={index}
                        to={feature.href}
                        className="group p-3 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 relative overflow-hidden"
                        onClick={() => {
                          setForProvidersOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                        
                        <div className="flex items-start space-x-3 relative z-10">
                          <div className={cn(
                            "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative",
                            "from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                          )}>
                            {/* Glitter effect */}
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                            <IconComponent className="h-4 w-4 text-white relative z-10" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-white text-sm group-hover:text-gray-100 transition-colors duration-300">
                              {feature.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Help Dropdown */}
            <div className="relative">
              <button 
                className={cn(
                  "flex items-center space-x-1 font-medium transition-all duration-300 py-2 px-3 rounded-lg group",
                  isHelpRouteActive() 
                    ? "text-white bg-white/10 shadow-lg border border-white/20" 
                    : "text-white/90 hover:text-white hover:bg-white/5"
                )}
                onMouseEnter={handleHelpEnter}
                onMouseLeave={handleHelpLeave}
              >
                <span>{t('navbar.help')}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-all duration-300",
                  helpOpen && "rotate-180 text-white",
                  isHelpRouteActive() ? "text-white" : "group-hover:text-white"
                )} />
              </button>
              
              {/* Help Resources Menu */}
              <div 
                className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[500px] bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 transition-all duration-300 origin-top",
                  helpOpen 
                    ? "opacity-100 visible scale-100" 
                    : "opacity-0 invisible scale-95 pointer-events-none"
                )}
                onMouseEnter={handleHelpEnter}
                onMouseLeave={handleHelpLeave}
              >
                {/* Glittering border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {helpResources.map((resource, index) => {
                    const IconComponent = resource.icon;
                    return (
                      <Link
                        key={index}
                        to={resource.href}
                        className="group p-3 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 relative overflow-hidden"
                        onClick={() => {
                          setHelpOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                        
                        <div className="flex items-start space-x-3 relative z-10">
                          <div className={cn(
                            "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative",
                            "from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                          )}>
                            {/* Glitter effect */}
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                            <IconComponent className="h-4 w-4 text-white relative z-10" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-white text-sm group-hover:text-gray-100 transition-colors duration-300">
                              {resource.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors duration-300">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {navLinks.map((link, index) => {
              const isActive = isActiveRoute(link.href);
              return (
                <Link
                  key={index}
                  to={link.href}
                  className={cn(
                    "font-medium transition-all duration-300 relative group py-2 px-3 rounded-lg whitespace-nowrap",
                    isActive 
                      ? "text-white bg-white/10 shadow-lg border border-white/20" 
                      : "text-white/90 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <LanguageSwitcher />
            {isLoggedIn && user ? (
              <>
                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-white/20 relative"
                >
                  <Bell className="h-5 w-5 text-white/90 group-hover:text-white transition-colors duration-300" />
                  {stats && stats.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {stats.unread > 99 ? '99+' : stats.unread}
                    </span>
                  )}
                </Link>
              </>
            ) : null}

            {isLoggedIn && user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-white/20"
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center text-white font-medium text-sm group-hover:from-white/30 group-hover:to-white/20 transition-all duration-300 relative overflow-hidden">
                      {/* Glitter effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                      <span className="relative z-10">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-white font-medium group-hover:text-gray-100 transition-colors duration-300">{user.firstName}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-all duration-300 text-white/70 group-hover:text-white",
                    userMenuOpen && "rotate-180"
                  )} />
                </button>

                {/* User Dropdown Menu */}
                <div className={cn(
                  "absolute top-full right-0 mt-2 w-48 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-2 transition-all duration-300 origin-top-right",
                  userMenuOpen 
                    ? "opacity-100 visible scale-100" 
                    : "opacity-0 invisible scale-95 pointer-events-none"
                )}>
                  {/* Glittering border effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                  
                  <div className="px-4 py-2 border-b border-white/10 relative z-10">
                    <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 relative z-10 group"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    {t('navbar.myProfile')}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 relative z-10 group"
                  >
                    <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    {t('navbar.logOut')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <a href="/signin">
                  <Button variant="ghost" className="font-medium text-white/90 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300 relative overflow-hidden group">
                    {/* Button glitter effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                    <span className="relative z-10">{t('navbar.signIn')}</span>
                  </Button>
                </a>
                <a href="/signup">
                  <Button className="font-medium shadow-lg bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30 hover:from-white/30 hover:to-white/20 hover:border-white/40 transition-all duration-300 relative overflow-hidden group">
                    {/* Button glitter effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                    <span className="relative z-10 flex items-center">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
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
              className="text-white/90 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Button glitter effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
              <Menu className="h-6 w-6 relative z-10" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black/95 backdrop-blur-xl border-t border-white/10",
          mobileMenuOpen ? "max-h-screen opacity-100 pb-6" : "max-h-0 opacity-0"
        )}>
          {/* Glittering top border */}
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="px-4 py-6 space-y-6 relative z-10">
            {/* Mobile Services */}
            <div>
              <div
                className={cn(
                  "flex items-center justify-between w-full text-left font-medium py-2 px-3 rounded-lg transition-all duration-300 group",
                  isServicesRouteActive() 
                    ? "text-white bg-white/10 shadow-lg border border-white/20" 
                    : "text-white hover:bg-white/10"
                )}
              >
                <Link 
                  to="/services" 
                  className="text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Browse Services</span>
                </Link>
                <ChevronDown 
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={cn(
                    "h-4 w-4 transition-all duration-300 text-white/70 group-hover:text-white",
                    servicesOpen && "rotate-180"
                  )} />
              </div>
              <div className={cn(
                "mt-2 overflow-hidden transition-all duration-300",
                servicesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="space-y-2 pl-4">
                  {categoriesData.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <Link
                        key={index}
                        to={`/services/${service.slug}`}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 relative overflow-hidden group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                        
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center relative group-hover:scale-110 transition-all duration-300",
                          "from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                        )}>
                          {/* Glitter effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                          <IconComponent className="h-4 w-4 text-white relative z-10" />
                        </div>
                        <div className="relative z-10">
                          <div className="font-medium text-white group-hover:text-gray-100 transition-colors duration-300">{service.title}</div>
                          <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{service.description}</div>
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
                className={cn(
                  "flex items-center justify-between w-full text-left font-medium py-2 px-3 rounded-lg transition-all duration-300 group",
                  isProviderRouteActive() 
                    ? "text-white bg-white/10 shadow-lg border border-white/20" 
                    : "text-white hover:bg-white/10"
                )}
              >
                <span>For Service Providers</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-all duration-300 text-white/70 group-hover:text-white",
                  forProvidersOpen && "rotate-180"
                )} />
              </button>
              <div className={cn(
                "mt-2 overflow-hidden transition-all duration-300",
                forProvidersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="space-y-2 pl-4">
                  {providerFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Link
                        key={index}
                        to={feature.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 relative overflow-hidden group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                        
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center relative group-hover:scale-110 transition-all duration-300",
                          "from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                        )}>
                          {/* Glitter effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                          <IconComponent className="h-4 w-4 text-white relative z-10" />
                        </div>
                        <div className="relative z-10">
                          <div className="font-medium text-white group-hover:text-gray-100 transition-colors duration-300">{feature.title}</div>
                          <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Help */}
            <div>
              <button
                onClick={() => setHelpOpen(!helpOpen)}
                className={cn(
                  "flex items-center justify-between w-full text-left font-medium py-2 px-3 rounded-lg transition-all duration-300 group",
                  isHelpRouteActive() 
                    ? "text-white bg-white/10 shadow-lg border border-white/20" 
                    : "text-white hover:bg-white/10"
                )}
              >
                <span>Help</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-all duration-300 text-white/70 group-hover:text-white",
                  helpOpen && "rotate-180"
                )} />
              </button>
              <div className={cn(
                "mt-2 overflow-hidden transition-all duration-300",
                helpOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="space-y-2 pl-4">
                  {helpResources.map((resource, index) => {
                    const IconComponent = resource.icon;
                    return (
                      <Link
                        key={index}
                        to={resource.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 relative overflow-hidden group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                        
                        <div className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center relative group-hover:scale-110 transition-all duration-300",
                          "from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                        )}>
                          {/* Glitter effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                          <IconComponent className="h-4 w-4 text-white relative z-10" />
                        </div>
                        <div className="relative z-10">
                          <div className="font-medium text-white group-hover:text-gray-100 transition-colors duration-300">{resource.title}</div>
                          <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{resource.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link, index) => {
                const isActive = isActiveRoute(link.href);
                return (
                  <Link
                    key={index}
                    to={link.href}
                    className={cn(
                      "block py-3 px-3 text-lg font-medium rounded-lg transition-all duration-300 relative group",
                      isActive 
                        ? "text-white bg-white/20 border border-white/30 shadow-lg" 
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile CTA */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {isLoggedIn && user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm relative overflow-hidden group">
                    {/* Glittering background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                    
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300 relative z-10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center text-white font-medium relative z-10 group-hover:from-white/30 group-hover:to-white/20 transition-all duration-300">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                    )}
                    <div className="relative z-10">
                      <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <a
                    href="/profile"
                    className="w-full justify-center inline-flex items-center px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 hover:border-white/30 transition-all duration-300 relative overflow-hidden group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {/* Button glitter effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                    <User className="h-4 w-4 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative z-10">My Profile</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 hover:text-red-300 hover:border-red-500/40 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Button glitter effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                    <LogOut className="h-4 w-4 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative z-10">Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <a
                    href="/signin"
                    className="w-full justify-center inline-flex items-center px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 hover:border-white/30 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Button glitter effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                    <span className="relative z-10">Sign In</span>
                  </a>
                  <a href="/signup" className="w-full">
                    <Button className="w-full justify-center bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30 hover:from-white/30 hover:to-white/20 hover:border-white/40 transition-all duration-300 relative overflow-hidden group">
                      {/* Button glitter effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                      <span className="relative z-10 flex items-center">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
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
};

export default Navbar;
