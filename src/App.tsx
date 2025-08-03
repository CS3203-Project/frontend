import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Homepage from './Pages/Homepage.js'
import Support from './Pages/Support.jsx'
import Articles from './Pages/Articles.jsx'
import SucessStories from './Pages/SucessStories.jsx'
import HowWorks from './Pages/HowWorks.jsx'
import ServiceProviderProfile from './Pages/ServiceProviderProfile';
import Signup from './Pages/Signup.tsx'
import SignIn from './Pages/SignIn.tsx'
import BrowseServices from './Pages/BrowseServices';
import ServiceCategoryPage from './Pages/ServiceCategoryPage';
import Profile from "./Pages/Profile.tsx";
import BecomeProvider from "./Pages/BecomeProvider.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/stories" element={<SucessStories />} />
        <Route path="/howWorks" element={<HowWorks />} />
        <Route path="/provider/:id" element={<ServiceProviderProfile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/services" element={<BrowseServices />} />
        <Route path="/services/:categorySlug" element={<ServiceCategoryPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/become-provider" element={<BecomeProvider />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
