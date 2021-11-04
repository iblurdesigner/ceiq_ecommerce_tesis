import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import Head from "next/head";
import NextLink from "next/link";
import { theme, useStyles } from "../utils/styles";

export default function Layout({
  children,
  commercePublicKey,
  title = "CEIQ commerce",
}) {
  const classes = useStyles();
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{`${title} - CEIQ commerce`}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar
          position="static"
          color="default"
          elevation={0}
          className={classes.appBar}
        >
          <Toolbar className={classes.toolbar}>
            <NextLink href="/">
              <Link
                variant="h6"
                color="inherit"
                noWrap
                href="/"
                className={classes.toolbarTitle}
              >
                CEIQ commerce
              </Link>
            </NextLink>
            <nav>
              <NextLink href="/cart">
                <Link
                  variant="button"
                  color="textPrimary"
                  href="/cart"
                  className={classes.link}
                >
                  Cart
                </Link>
              </NextLink>
            </nav>
          </Toolbar>
        </AppBar>
        <Container component="main" className={classes.main}>
          {children}
        </Container>
        <Container maxWidth="md" component="footer">
          <Box mt={5}>
            <Typography variant="body2" color="textSecondary" align="center">
              CEIQ Simuladores 2021
            </Typography>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}
