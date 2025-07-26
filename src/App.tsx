import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Homepage from './Pages/Homepage.js'
import Support from './Pages/Support.jsx'
import Articles from './Pages/Articles.jsx'
import SucessStories from './Pages/SucessStories.jsx'
import HowWorks from './Pages/HowWorks.jsx'
import ServiceProviderProfile from './Pages/ServiceProviderProfile.tsx'

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
      </Routes>
    </Router>
  )
}

export default App
