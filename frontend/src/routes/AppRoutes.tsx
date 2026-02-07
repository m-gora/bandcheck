import { Box } from "@mui/material"
import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import Home from "../pages/Home"
import BandDetails from "../components/BandDetails"
import Discover from "../pages/Discover"
import ArtistDetail from "../pages/ArtistDetail"
import SubmitArtist from "../pages/SubmitArtist"
import WriteReview from "../pages/WriteReview"
import About from "../pages/About"
import SafetyReports from "../pages/SafetyReports"
import PrivacyPolicy from "../pages/PrivacyPolicy"
import TermsOfService from "../pages/TermsOfService"
import Imprint from "../pages/Imprint"

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <NavBar />
          
          <Box sx={{ flex: 1 }}>
            <Routes> {/* Define your routes */}
              <Route path="/" element={<Home />} />
              <Route path="/bands/:id" element={<BandDetails />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/artist/:id" element={<ArtistDetail />} />
              <Route path="/submit-artist" element={<SubmitArtist />} />
              <Route path="/artist/:id/review" element={<WriteReview />} />
              <Route path="/about" element={<About />} />
              <Route path="/safety-reports" element={<SafetyReports />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/imprint" element={<Imprint />} />
            </Routes>
          </Box>

          <Footer />
        </Box>
    </BrowserRouter>
  )
}

export default AppRoutes
