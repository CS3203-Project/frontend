import { FaFacebook, FaInstagram, FaLinkedin, FaMailBulk } from "react-icons/fa";
import PropTypes from "prop-types";

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "https://www.instagram.com/zia.contact", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "https://www.facebook.com/profile.php?id=61578604951668", label: "Facebook" },
  { icon: <FaMailBulk className="size-5" />, href: "mailto:zia.contact.team@gmail.com", label: "Email" },
  { icon: <FaLinkedin className="size-5" />, href: "https://www.linkedin.com/in/zia2025", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

const Footer = ({
  logo = {
    url: "/",
    src: "/logo_svg_only_dark.svg",
    alt: "logo",
    title: "Zia",
  },
  sections = defaultSections,
  description = "Your premier service marketplace connecting customers with trusted professionals.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} Zia. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}) => {
  return (
    <footer className="relative bg-black/95 backdrop-blur-xl border-t border-white/10 mt-20 overflow-hidden">
      {/* Glittering top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Brand Section */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <a href={logo.url} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                  {/* Glittering background effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10 transition-all duration-300"></div>
                  <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                  
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-8 w-8 relative z-10 filter brightness-0 invert"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">{logo.title}</h2>
              </a>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">{description}</p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 group border border-white/10 hover:border-white/30 relative overflow-hidden"
                >
                  {/* Glitter effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                  <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-4">
                <h3 className="text-white font-semibold text-sm tracking-wide relative group">
                  {section.title}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-gray-300 group-hover:w-full transition-all duration-300"></div>
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a 
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors duration-300 relative group py-1 block"
                      >
                        <span className="relative">
                          {link.name}
                          <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-white/50 to-gray-300/50 group-hover:w-full transition-all duration-300"></div>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">{copyright}</p>
          <div className="flex items-center gap-6">
            {legalLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-gray-400 hover:text-white text-sm transition-colors duration-300 relative group"
              >
                <span className="relative">
                  {link.name}
                  <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-white/50 to-gray-300/50 group-hover:w-full transition-all duration-300"></div>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string,
    src: PropTypes.string,
    alt: PropTypes.string,
    title: PropTypes.string,
  }),
  sections: PropTypes.array,
  description: PropTypes.string,
  socialLinks: PropTypes.array,
  copyright: PropTypes.string,
  legalLinks: PropTypes.array,
};

export default Footer;
