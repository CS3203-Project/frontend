import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import Homepage from './Pages/Homepage'
import Support from './Pages/Support'
import Articles from './Pages/Articles'
import SucessStories from './Pages/SucessStories'
import HowWorks from './Pages/HowWorks'
import ServiceProviderProfile from './Pages/ServiceProviderProfile'
import PageTransition from "./components/PageTransition";

function App() {
  const location = useLocation();
  return (
    <PageTransition locationKey={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Homepage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/stories" element={<SucessStories />} />
        <Route path="/howWorks" element={<HowWorks />} />
        <Route path="/provider/:id" element={<ServiceProviderProfile />} />
      </Routes>
    </PageTransition>
  );
}

function Root() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default Root;
