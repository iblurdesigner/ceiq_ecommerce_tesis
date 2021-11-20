import Link from "next/link";
import { useContext, useState } from "react";
import { Alert } from "@material-ui/lab";
import Layout from "../../components/Layout";
import getCommerce from "../../utils/commerce";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Slide,
  Typography,
} from "@material-ui/core";

import Router from "next/router";

import { CART_RETRIEVE_SUCCESS } from "../../utils/constants";

import { useStyles } from "../../utils/styles";
import { Store } from "../../components/Store";

export default function Product(props) {
  const { product } = props;
  const [quantity, setQuantity] = useState(1);

  const classes = useStyles();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  console.log(product);

  const addToCartHandler = async () => {
    const commerce = getCommerce(props.commercePublicKey);
    const lineItem = cart.data.line_items.find(
      (x) => x.product_id === product.id
    );
    if (lineItem) {
      const cartData = await commerce.cart.update(lineItem.id, {
        quantity: quantity,
      });
      dispatch({ type: CART_RETRIEVE_SUCCESS, payload: cartData.cart });
      Router.push("/cart");
    } else {
      const cartData = await commerce.cart.add(product.id, quantity);
      dispatch({ type: CART_RETRIEVE_SUCCESS, payload: cartData.cart });
      Router.push("/cart");
    }
  };

  return (
    <Layout title={product.name} commercePublicKey={props.commercePublicKey}>
      <Slide direction="up" in={true}>
        <Container>
          <Grid container spacing={1}>
            <Grid item md={6} xs={12}>
              <img
                src={product.image.url}
                alt={product.name}
                className={classes.largeImage}
              />
            </Grid>

            <Grid item md={3} xs={12}>
              <List>
                <ListItem>
                  <Typography
                    gutterBottom
                    variant="h6"
                    color="textPrimary"
                    component="h1"
                  >
                    {product.name}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Box
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  ></Box>
                </ListItem>
              </List>
            </Grid>

            <Grid item md={3} xs={12}>
              <Card>
                <List>
                  <ListItem>
                    <Grid container>
                      <Grid item xs={6}>
                        Precio
                      </Grid>
                      <Grid item xs={6}>
                        {product.price.formatted_with_symbol}
                      </Grid>
                    </Grid>
                  </ListItem>

                  <ListItem>
                    <Grid alignItems="center" container>
                      <Grid item xs={6}>
                        Estado
                      </Grid>
                      <Grid item xs={6}>
                        {product.inventory.available > 0 ? (
                          <Alert icon={false} severity="success">
                            En Stock
                          </Alert>
                        ) : (
                          <Alert icon={false} severity="error">
                            No Disponible
                          </Alert>
                        )}
                      </Grid>
                    </Grid>
                  </ListItem>
                  {product.inventory.available > 0 && (
                    <>
                      <ListItem>
                        <Grid container justify="flex-end">
                          <Grid item xs={6}>
                            Cantidad
                          </Grid>
                          <Grid item xs={6}>
                            <Select
                              labelId="quantity-label"
                              id="quantity"
                              fullWidth
                              onChange={(e) => setQuantity(e.target.value)}
                              value={product.quantity}
                            >
                              {[
                                ...Array(product.inventory.available).keys(),
                              ].map((x) => (
                                <MenuItem key={x + 1} value={x + 1}>
                                  {x + 1}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <ListItem>
                        <Button
                          type="button"
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={addToCartHandler}
                        >
                          Añadir al carrito
                        </Button>
                      </ListItem>
                    </>
                  )}
                </List>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Slide>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  const commerce = getCommerce();
  const product = await commerce.products.retrieve(id, {
    type: "permalink",
  });
  return {
    props: {
      product,
    },
  };
}
