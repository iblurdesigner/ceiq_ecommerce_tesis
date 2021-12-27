import React, { useContext, useEffect, useState } from "react";
import getCommerce from "../utils/commerce";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useStyles } from "../utils/styles";
import { Store } from "../components/Store";
import Router from "next/router";
import { ORDER_SET } from "../utils/constants";
import dynamic from "next/dynamic";
import { Alert } from "@material-ui/lab";
const dev = process.env.NODE_ENV === "development" || true; // remover "|| true" en production
function Checkout(props) {
  const classes = useStyles();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const [errors, setErrors] = useState([]);
  const [checkoutToken, setCheckoutToken] = useState({});
  // Detalles del cliente
  const [firstName, setFirstName] = useState(dev ? "David" : "");
  const [lastName, setLastName] = useState(dev ? "Flores" : "");
  const [email, setEmail] = useState(dev ? "example@email.com" : "");
  // Detalles de envío
  const [shippingName, setShippingName] = useState(dev ? "David Flores" : "");
  const [shippingStreet, setShippingStreet] = useState(
    dev ? "Quito Centro 123" : ""
  );
  const [shippingCity, setShippingCity] = useState(dev ? "Quito" : "");
  const [shippingStateProvince, setShippingStateProvince] = useState(
    dev ? "PH" : ""
  );
  const [shippingPostalZipCode, setShippingPostalZipCode] = useState(
    dev ? "170402" : ""
  );
  const [shippingCountry, setShippingCountry] = useState(dev ? "EC" : "");
  // Detalles del pago
  const [cardNum, setCardNum] = useState(dev ? "4242 4242 4242 4242" : "");
  const [expMonth, setExpMonth] = useState(dev ? "11" : "");
  const [expYear, setExpYear] = useState(dev ? "2023" : "");
  const [cvv, setCvv] = useState(dev ? "123" : "");
  const [billingPostalZipcode, setBillingPostalZipcode] = useState(
    dev ? "170402" : ""
  );
  // Datos de envío
  const [shippingCountries, setShippingCountries] = useState({});
  const [shippingSubdivisions, setShippingSubdivisions] = useState({});
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingOption, setShippingOption] = useState({});

  useEffect(() => {
    if (!cart.loading) {
      generateCheckoutToken();
    }
  }, [cart.loading]);
  const generateCheckoutToken = async () => {
    if (cart.data.line_items.length) {
      const commerce = getCommerce(props.commercePublicKey);
      const token = await commerce.checkout.generateToken(cart.data.id, {
        type: "cart",
      });
      setCheckoutToken(token);
      fetchShippingCountries(token.id);
    } else {
      Router.push("/cart");
    }
  };

  const fetchShippingCountries = async (checkoutTokenId) => {
    const commerce = getCommerce(props.commercePublicKey);
    const countries = await commerce.services.localeListShippingCountries(
      checkoutTokenId
    );
    setShippingCountries(countries.countries);
  };

  const fetchSubdivisions = async (countryCode) => {
    const commerce = getCommerce(props.commercePublicKey);
    const subdivisions = await commerce.services.localeListSubdivisions(
      countryCode
    );
    setShippingSubdivisions(subdivisions.subdivisions);
  };

  const fetchShippingOptions = async (
    checkoutTokenId,
    country,
    stateProvince = null
  ) => {
    const commerce = getCommerce(props.commercePublicKey);
    const options = await commerce.checkout.getShippingOptions(
      checkoutTokenId,
      {
        country: country,
        region: stateProvince,
      }
    );

    const shippingOption = options[0] ? options[0].id : null;
    setShippingOption(shippingOption);
    setShippingOptions(options);
    console.log(shippingOption);
  };

  const handleShippingCountryChange = (e) => {
    const currentValue = e.target.value;
    setShippingCountry(e.target.value);
    fetchSubdivisions(currentValue);
  };

  const handleSubdivisionChange = (e) => {
    const currentValue = e.target.value;
    setShippingStateProvince(currentValue);
    fetchShippingOptions(checkoutToken.id, shippingCountry, currentValue);
  };

  const handleShippingOptionChange = (e) => {
    const currentValue = e.target.value;
    setShippingOption(currentValue);
    console.log(currentValue);
  };

  const handleCaptureCheckout = async () => {
    const orderData = {
      line_items: checkoutToken.live.line_items,
      customer: {
        firstname: firstName,
        lastname: lastName,
        email: email,
      },
      shipping: {
        name: shippingName,
        street: shippingStreet,
        town_city: shippingCity,
        county_state: shippingStateProvince,
        postal_zip_code: shippingPostalZipCode,
        country: shippingCountry,
      },
      fulfillment: {
        shipping_method: shippingOption,
      },
      payment: {
        gateway: "test_gateway",
        card: {
          number: cardNum,
          expiry_month: expMonth,
          expiry_year: expYear,
          cvc: cvv,
          postal_zip_code: billingPostalZipcode,
        },
      },
    };

    const commerce = getCommerce(props.commercePublicKey);
    try {
      const order = await commerce.checkout.capture(
        checkoutToken.id,
        orderData
      );
      dispatch({ type: ORDER_SET, payload: order });
      localStorage.setItem("order_receipt", JSON.stringify(order));
      await refreshCart();
      Router.push("/confirmation");
    } catch (err) {
      const errList = [err.data.error.message];
      const errs = err.data.error.errors;
      for (const index in errs) {
        errList.push(`${index}: ${errs[index]}`);
      }
      setErrors(errList);
    }
  };

  const refreshCart = async () => {
    const commerce = getCommerce(props.commercePublicKey);

    commerce.cart
      .refresh()
      .then((newCart) => {
        this.setState({
          cart: newCart,
        });
      })
      .catch((error) => {
        console.log("Hubo un error al actualizar su carrito", error);
      });
  };

  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    if (activeStep === steps.length - 1) {
      handleCaptureCheckout();
    }
  };

  const handleBack = () => {
    setErrors([]);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  function getSteps() {
    return [
      "Información al cliente",
      "Detalles de envío",
      "Información del pago",
    ];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="Nombres"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Apellidos"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingName"
              label="Nombres completos"
              name="name"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingStreet"
              label="Dirección"
              name="address"
              value={shippingStreet}
              onChange={(e) => setShippingStreet(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingCity"
              label="Ciudad"
              name="city"
              value={shippingCity}
              onChange={(e) => setShippingCity(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingPostalZipCode"
              label="Código Postal"
              name="postalCode"
              value={shippingPostalZipCode}
              onChange={(e) => setShippingPostalZipCode(e.target.value)}
            />
            <FormControl className={classes.formControl}>
              <InputLabel id="shippingCountry-label">País</InputLabel>
              <Select
                labelId="shippingCountry-label"
                id="shippingCountry"
                label="País"
                fullWidth
                onChange={handleShippingCountryChange}
                value={shippingCountry}
              >
                {Object.keys(shippingCountries).map((index) => (
                  <MenuItem value={index} key={index}>
                    {shippingCountries[index]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel id="shippingStateProvince-label">
                Estado / Provincia
              </InputLabel>

              <Select
                labelId="shippingStateProvince-label"
                id="shippingStateProvince"
                label="Provincia"
                fullWidth
                onChange={handleSubdivisionChange}
                value={shippingStateProvince}
                required
                className={classes.mt1}
              >
                {Object.keys(shippingSubdivisions).map((index) => (
                  <MenuItem value={index} key={index}>
                    {shippingSubdivisions[index]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel id="shippingOption-label">Opción de envío</InputLabel>

              <Select
                labelId="shippingOption-label"
                id="shippingOption"
                label="Opción de envío"
                fullWidth
                onChange={handleShippingOptionChange}
                value={shippingOption}
                required
                className={classes.mt1}
              >
                {shippingOptions.map((method, index) => (
                  <MenuItem
                    value={method.id}
                    key={index}
                  >{`${method.description} - $${method.price.formatted_with_code}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      case 2:
        return (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="cardNum"
              label="Número de Tarjeta"
              name="cardNum"
              value={cardNum}
              onChange={(e) => setCardNum(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="expMonth"
              label="Mes de Expiración"
              name="expMonth"
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="expYear"
              label="Año de Expiración"
              name="expYear"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="cvv"
              label="CVV"
              name="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="billingPostalZipcode"
              label="Código Postal"
              name="postalCode"
              value={billingPostalZipcode}
              onChange={(e) => setBillingPostalZipcode(e.target.value)}
            />
          </>
        );
      default:
        return "Unknown step";
    }
  }

  const renderCheckoutForm = () => {
    return (
      <form>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {activeStep === steps.length ? (
            errors && errors.length > 0 ? (
              <Box>
                <List>
                  {errors.map((error) => (
                    <ListItem key={error}>
                      <Alert severity="error">{error}</Alert>
                    </ListItem>
                  ))}
                </List>
                <Box className={classes.mt1}>
                  <Button onClick={handleBack} className={classes.button}>
                    Anterior
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <CircularProgress />
                <Typography className={classes.instructions}>
                  Confirmando Orden...
                </Typography>
              </Box>
            )
          ) : (
            <Box>
              {getStepContent(activeStep)}
              <Box className={classes.mt1}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={classes.button}
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                >
                  {activeStep === steps.length - 1
                    ? "Confirmar Orden"
                    : "Siguiente"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </form>
    );
  };

  const renderCheckoutSummary = () => {
    return (
      <>
        <List>
          <ListItem>
            <Typography variant="h2">Resumen de pedido</Typography>
          </ListItem>

          {cart.data.line_items.map((lineItem) => (
            <ListItem key={lineItem.id}>
              <Grid container>
                <Grid xs={6} item>
                  {lineItem.quantity} x {lineItem.name}
                </Grid>
                <Grid xs={6} item>
                  <Typography align="right">
                    {lineItem.line_total.formatted_with_symbol}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
          <ListItem>
            <Grid container>
              <Grid xs={6} item>
                Subtotal
              </Grid>
              <Grid xs={6} item>
                <Typography align="right">
                  {cart.data.subtotal.formatted_with_symbol}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        </List>
      </>
    );
  };

  return (
    <Layout title="Checkout" commercePublicKey={props.commercePublicKey}>
      <Typography gutterBottom variant="h6" color="textPrimary" component="h1">
        Checkout
      </Typography>
      {cart.loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          <Grid item md={8}>
            <Card className={classes.p1}>{renderCheckoutForm()}</Card>
          </Grid>
          <Grid item md={4}>
            <Card>{renderCheckoutSummary()}</Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}
export default dynamic(() => Promise.resolve(Checkout), {
  ssr: false,
});
