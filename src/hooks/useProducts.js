import { useQuery } from "react-query";
import { Query } from "appwrite";
import db from "../appwrite/Services/dbServices";

export const useProducts = () => {
  // Function to fetch all products with pagination
  const fetchAllProducts = async () => {
    let products = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const productResponse = await db.Products.list([
        Query.limit(limit),
        Query.offset(offset),
      ]);

      products = products.concat(productResponse.documents);

      if (productResponse.documents.length < limit) {
        break;
      }

      offset += limit;
    }

    // Map and parse the product data
    products = products.map((product) => ({
      ...product,
      price: parseFloat(product.price),
      isOnSale: Boolean(product.isOnSale),
      isWholesaleProduct: Boolean(product.isWholesaleProduct),
      stockQuantity: parseInt(product.stockQuantity),
    }));

    return products;
  };

  return useQuery("products", fetchAllProducts, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};
