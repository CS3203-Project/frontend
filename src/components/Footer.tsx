

import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaMailBulk, FaMailchimp, FaTwitter } from "react-icons/fa";
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
  description = "A collection of components for your startup business or side project.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} Zia. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}) => {
  return (
    <section className="py-20 bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-8"
                />
              </a>
            <h2 className="text-xl font-semibold text-gray-900">{logo.title}</h2>
            </div>
            <p className="max-w-[70%] text-sm text-gray-500">{description}</p>
            <ul className="flex items-center space-x-6 text-gray-500">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-blue-600">
                  <a href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-gray-900">{section.title}</h3>
                <ul className="space-y-3 text-sm text-gray-500">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-blue-600"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-gray-200 py-8 text-xs font-medium text-gray-500 md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-blue-600">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
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
