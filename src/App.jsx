import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Homepage from './pages/Homepage.jsx'
import Support from './Pages/Support.jsx'
import Articles from './Pages/Articles.jsx'
import SucessStories from './Pages/SucessStories.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/stories" element={<SucessStories />} />
      </Routes>
    </Router>
  )
}

export default App
