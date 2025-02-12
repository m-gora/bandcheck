import { Box } from "@mui/material"
import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from "../components/NavBar"
import SignIn from "../pages/SignIn"
import Home from "../pages/Home"

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Box sx={{ display: "flex" }}>
          <NavBar />
        </Box>

        <Routes> {/* Define your routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
