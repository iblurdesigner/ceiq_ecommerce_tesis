import Commerce from "@chec/commerce.js";

let commerce = null;

function getCommerce(commercePublicKey) {
  if (commerce) {
    return commerce;
  } else {
    const publicKey = commercePublicKey || process.env.COMMERCE_PUBLIC_KEY;
    const devEnvironment = process.env.NODE_ENV === "development";
    if (devEnvironment && !publicKey) {
      throw Error("Commerce Public API key no encontrada!");
    }
    commerce = new Commerce(publicKey, devEnvironment);
    return commerce;
  }
}
export default getCommerce;
