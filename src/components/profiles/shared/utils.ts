import { 
  FiStar, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiGlobe, 
  FiCamera, 
  FiPlay, 
  FiMessageCircle, 
  FiHeart, 
  FiShare2, 
  FiFlag, 
  FiAward, 
  FiCheck, 
  FiCalendar, 
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiExternalLink,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import { 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaTwitter, 
  FaWhatsapp,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa';

// Utility function for class names
export const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// Toast notification utilities
export const showSuccessToast = (message: string) => {
  // Implementation would be here - using react-hot-toast or similar
  console.log('Success:', message);
};

export const showErrorToast = (message: string) => {
  // Implementation would be here - using react-hot-toast or similar
  console.log('Error:', message);
};

// Export icons for use in other components
export {
  FiStar,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiUser,
  FiPhone,
  FiMail,
  FiGlobe,
  FiCamera,
  FiPlay,
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiFlag,
  FiAward,
  FiCheck,
  FiCalendar,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiExternalLink,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
  FaTiktok
};