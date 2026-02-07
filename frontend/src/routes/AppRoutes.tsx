import { Box } from "@mui/material"
import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from "../components/NavBar"
import Home from "../pages/Home"
import BandDetails from "../components/BandDetails"
import Discover from "../pages/Discover"
import ArtistDetail from "../pages/ArtistDetail"
import SubmitArtist from "../pages/SubmitArtist"
import WriteReview from "../pages/WriteReview"
import About from "../pages/About"
import SafetyReports from "../pages/SafetyReports"

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Box sx={{ display: "flex" }}>
          <NavBar />
        </Box>

        <Routes> {/* Define your routes */}
          <Route path="/" element={<Home />} />
          <Route path="/bands/:id" element={<BandDetails />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/artist/:id" element={<ArtistDetail />} />
          <Route path="/submit-artist" element={<SubmitArtist />} />
          <Route path="/artist/:id/review" element={<WriteReview />} />
          <Route path="/about" element={<About />} />
          <Route path="/safety-reports" element={<SafetyReports />} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
