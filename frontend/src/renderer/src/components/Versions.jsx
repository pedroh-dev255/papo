import { useState } from 'react'
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Badge,
    Box,
    Menu,
    MenuItem,
    Divider,
} from "@mui/material";
function Versions() {
  const [versions] = useState(window.electron.process.versions)

  return (
    <Box sx={{
      color: "#555555",
      py: 1,
      px: 2,
    }}>
      <Typography
        sx={{fontSize: 10}}
      >
        Electron v{versions.electron}
      </Typography>
      <Typography
        sx={{fontSize: 10}}
      >
        Chromium v{versions.chrome}
      </Typography>
      <Typography
        sx={{fontSize: 10}}
      >
        Node v{versions.node}
      </Typography>
    </Box>
  )
}

export default Versions
