import { createTheme, makeStyles } from "@material-ui/core";

export const theme = createTheme({
  typography: {
    h1: {
      fontSize: "2.2rem",
      fontWeight: 400,
      margin: " 2rem 0",
    },
    h2: {
      fontSize: "1.8rem",
      fontWeight: 400,
      margin: " 1rem 0",
    },
    h3: {
      fontSize: "1.4rem",
      fontWeight: 400,
      margin: " 1rem 0",
    },
  },
  palette: {
    primary: {
      main: "#f0c000",
    },
    secondary: {
      main: "#208080",
    },
    error: {
      main: "#f04000",
    },
    background: {
      main: "#fff",
    },
  },
});

export const useStyles = makeStyles((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: "wrap",
  },
  grid: {
    width: "100%",
    margin: "0px",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: "1rem",
  },
  main: {
    padding: "1rem",
  },
  largeImage: {
    maxWidth: "50rem",
    width: "100%",
  },
  mt1: {
    marginTop: "1rem !important",
  },
  p1: {
    padding: "1rem !important",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "100%",
  },
}));
