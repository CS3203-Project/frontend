import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import { Chatbot } from './components/Chatbot';
import Homepage from './Pages/Homepage.js'
import Support from './Pages/Support.jsx'
import Articles from './Pages/Articles.jsx'
import SucessStories from './Pages/SucessStories.jsx'
import HowWorks from './Pages/HowWorks.jsx'

import OnlineServiceProviderProfile from './Pages/OnlineServiceProviderProfile';
import PrintingServiceProviderProfile from "./Pages/PrintingServiceProviderProfile";


import Signup from './Pages/Signup.tsx'
import SignIn from './Pages/SignIn.tsx'
import BrowseServices from './Pages/BrowseServices';
import ServiceCategoryPage from './Pages/ServiceCategoryPage';
import ServiceDetailPage from './Pages/ServiceDetailPage';
import SearchResultsPage from './Pages/SearchResultsPage';
import Profile from "./Pages/Profile.tsx";
import BecomeProvider from "./Pages/BecomeProvider.tsx";
import Provider from "./Pages/Provider.tsx";
import CreateService from "./Pages/CreateService.tsx";
import MessagingPage from "./Pages/NewMessagingPage.tsx";
import ConversationHub from "./Pages/ConversationHub.tsx";
import ConversationView from "./Pages/ConversationView.tsx";
import AdminDashboard from "./Pages/AdminDashboard.tsx";
import RateCustomerPage from "./Pages/RateCustomerPage.tsx";
import RateServicePage from "./Pages/RateServicePage.tsx";
import AdminLogin from "./Pages/AdminLogin.tsx";
import Pricing from "./Pages/Pricing.tsx";
import EasySetup from "./Pages/EasySetup.tsx";
import SecurePayments from "./Pages/SecurePayments.tsx";
import CustomerManagement from "./Pages/CustomerManagement.tsx";
import AnalyticsDashboard from "./Pages/AnalyticsDashboard.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/support" element={<Support />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/stories" element={<SucessStories />} />
            <Route path="/howWorks" element={<HowWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/easy-setup" element={<EasySetup />} />
            <Route path="/secure-payments" element={<SecurePayments />} />
            <Route path="/customer-management" element={<CustomerManagement />} />
            <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/services" element={<BrowseServices />} />
            <Route path="/services/search" element={<SearchResultsPage />} />
            <Route path="/services/:categorySlug" element={<ServiceCategoryPage />} />
            <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/become-provider" element={<BecomeProvider />} />
            <Route path="/provider/:id" element={<Provider />} />
            <Route path="/provider/online/:id" element={<OnlineServiceProviderProfile />} />
            <Route path="/provider/printing/:id" element={<PrintingServiceProviderProfile />} />
            <Route path="/create-service" element={<CreateService />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="/conversation-hub" element={<ConversationHub />} />
            <Route path="/conversation/:conversationId" element={<ConversationView />} />
            <Route path="/rate-customer/:conversationId" element={<RateCustomerPage />} />
            <Route path="/rate-service/:serviceId" element={<RateServicePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-login" element={<AdminLogin/>} />

            <Route path="/provider/online/:id" element={<OnlineServiceProviderProfile />} />
            <Route path="/provider/printing/:id" element={<PrintingServiceProviderProfile />} />  
                    
          </Routes>
          
          {/* Global Chatbot - appears on all pages */}
          <Chatbot />
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
