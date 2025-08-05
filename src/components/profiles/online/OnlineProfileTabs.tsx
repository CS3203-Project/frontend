import { FiUser, FiDollarSign, FiCamera, FiStar, FiMessageCircle } from "react-icons/fi";
import { cn } from "../../../utils/utils";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiUser /> },
    { id: 'services', label: 'Services', icon: <FiDollarSign /> },
    { id: 'portfolio', label: 'Portfolio', icon: <FiCamera /> },
    { id: 'reviews', label: 'Reviews', icon: <FiStar /> },
    { id: 'about', label: 'About', icon: <FiMessageCircle /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-6 py-4 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-black text-black bg-gray-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}