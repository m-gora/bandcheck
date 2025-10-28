import { CssBaseline, Box } from "@mui/material"
import AppTheme from "../styles/Theme"
import HeroSection from "../components/HeroSection"
import FeaturesSection from "../components/FeaturesSection"

const Home = () => {
  return (
    <AppTheme>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            zIndex: -1,
            inset: 0,
            backgroundImage:
              'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
            backgroundRepeat: 'no-repeat',
          },
        }}
      >
        <HeroSection />
        <FeaturesSection />
      </Box>
    </AppTheme>
  )
}

export default Home
