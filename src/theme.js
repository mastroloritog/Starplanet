// // src/theme.js

// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#8B0000', // Colore rosso scuro
//     },
//     secondary: {
//       main: '#A52A2A', // Colore secondario per hover o altri elementi
//     },
//     background: {
//       default: 'transparent', // Sfondo trasparente per far vedere il gradient
//       paper: '#2e2e2e', // Sfondo per componenti che usano il "paper"
//     },
//     text: {
//       primary: '#ffffff', // Testo bianco
//     },
//   },
//   typography: {
//     allVariants: {
//       color: '#ffffff', // Assicurarsi che tutto il testo sia bianco
//     },
//   },
// });

// export default theme;

// src/theme.js

// src/theme.js

// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8B0000', // Dark red color for primary elements
    },
    secondary: {
      main: '#B22222', // Darker red for secondary elements
    },
    background: {
      default: '#001c3b', // Dark blue background for the entire app
      paper: '#022463', // Slightly lighter dark blue for paper elements
    },
    text: {
      primary: '#FFFFFF', // White text for readability
    },
  },
  typography: {
    allVariants: {
      color: '#FFFFFF', // Ensure all text is white by default
    },
    h4: {
      fontWeight: 'bold', // Make headers bold
      fontFamily: 'Poppins, sans-serif', // Use a modern, clean font
    },
    body2: {
      fontFamily: 'Poppins, sans-serif', // Use the same font for body text
    },
  },
});

export default theme;

