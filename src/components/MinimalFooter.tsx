import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon, Grid2X2Plus } from 'lucide-react';

export function MinimalFooter() {
  const year = new Date().getFullYear();

  const company = [
    { title: 'About Us', href: '#' },
    { title: 'Careers', href: '#' },
    { title: 'Brand assets', href: '#' },
    { title: 'Privacy Policy', href: '#' },
    { title: 'Terms of Service', href: '#' },
  ];

  const resources = [
    { title: 'Blog', href: '#' },
    { title: 'Help Center', href: '#' },
    { title: 'Contact Support', href: '#' },
    { title: 'Community', href: '#' },
    { title: 'Security', href: '#' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon className="size-4" />, link: 'https://www.facebook.com/profile.php?id=61578604951668' },
    { icon: <InstagramIcon className="size-4" />, link: 'https://www.instagram.com/zia.contact' },
    { icon: <LinkedinIcon className="size-4" />, link: 'https://www.linkedin.com/in/zia2025' },
    { icon: <TwitterIcon className="size-4" />, link: 'https://twitter.com' },
    { icon: <YoutubeIcon className="size-4" />, link: 'https://youtube.com' },
  ];

  return (
    <footer className="relative bg-white dark:bg-black">
      <div className="bg-[radial-gradient(35%_80%_at_30%_0%,hsl(var(--foreground)/.1),transparent)] mx-auto max-w-4xl md:border-x border-gray-200 dark:border-white/10">
        <div className="bg-border absolute inset-x-0 top-0 h-px w-full bg-gray-200 dark:bg-white/10" />
        
        <div className="grid max-w-4xl grid-cols-6 gap-6 p-4 md:p-8">
          <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
            <a href="/" className="flex items-center gap-3 group w-max" title="Zia - Service Marketplace">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-300 dark:border-white/30 group-hover:border-gray-400 dark:group-hover:border-white/50">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 group-hover:from-gray-200 dark:group-hover:from-white/20 dark:group-hover:to-white/10 transition-all duration-300"></div>
                <img
                  src="/logo_svg_only_dark.svg"
                  alt="Zia Logo"
                  className="h-8 w-8 relative z-10 filter brightness-0 dark:invert"
                />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">Zia</span>
            </a>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm text-sm leading-relaxed text-balance">
              Your premier service marketplace connecting customers with trusted professionals. Find and book quality services with confidence.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a 
                  key={i} 
                  className="rounded-md border border-gray-200 dark:border-white/10 p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  href={item.link}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div className="col-span-3 w-full md:col-span-1">
            <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Resources
            </span>
            <div className="flex flex-col gap-2">
              {resources.map(({ href, title }, i) => (
                <a 
                  key={i} 
                  className="w-max py-1 text-sm duration-200 hover:underline text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors" 
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
          
          <div className="col-span-3 w-full md:col-span-1">
            <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Company
            </span>
            <div className="flex flex-col gap-2">
              {company.map(({ href, title }, i) => (
                <a 
                  key={i} 
                  className="w-max py-1 text-sm duration-200 hover:underline text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors" 
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-border h-px w-full bg-gray-200 dark:bg-white/10" />
        
        <div className="flex max-w-4xl flex-col justify-between gap-2 pt-4 pb-6 px-4">
          <p className="text-center font-thin text-sm text-gray-600 dark:text-gray-400">
            © {year} <a href="/" className="font-medium hover:underline hover:text-black dark:hover:text-white transition-colors">Zia</a>. All rights reserved. | Contact: <a href="mailto:zia.contact.team@gmail.com" className="hover:underline hover:text-black dark:hover:text-white transition-colors">zia.contact.team@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default MinimalFooter;
