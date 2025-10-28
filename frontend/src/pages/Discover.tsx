import { CssBaseline, Box } from "@mui/material"
import AppTheme from "../styles/Theme"
import BandsList from "../components/BandsList"

const Discover = () => {
  return (
    <AppTheme>
      <CssBaseline />
      <BandsList />
    </AppTheme>
  )
}

export default Discover