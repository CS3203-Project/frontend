import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Homepage from './Pages/Homepage.js'
import Support from './Pages/Support.jsx'
import Articles from './Pages/Articles.jsx'
import SucessStories from './Pages/SucessStories.jsx'
import HowWorks from './Pages/HowWorks.jsx'
import ServiceProviderProfile from './Pages/ServiceProviderProfile.tsx'
import Signup from './Pages/Signup.tsx'
import SignIn from './Pages/SignIn.tsx'
import Profile from './Pages/Profile.tsx'

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
        <Route path="/profile" element={<Profile />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
