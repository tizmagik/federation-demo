const { gql } = require("apollo-server");
const { ApolloServer } = require("apollo-server-express");
const { buildFederatedSchema } = require("@apollo/federation");
const express = require("express");

const typeDefs = gql`
  extend type Product @key(fields: "upc") {
    upc: String! @external
    weight: Int @external
    price: Int @external
    inStock: Boolean
    shippingEstimate: Int @requires(fields: "price weight")
  }
`;

const resolvers = {
  Product: {
    __resolveReference(object) {
      return {
        ...object,
        ...inventory.find(product => product.upc === object.upc)
      };
    },
    shippingEstimate(object) {
      // free for expensive items
      if (object.price > 1000) return 0;
      // estimate is based on weight
      return object.weight * 0.5;
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

const serviceName = __dirname.split("/").pop();
const app = express();
app.use(express.json());
let ctr = 0;
app.use((req, res, next) => {
  console.log(`${serviceName} request count: ${++ctr}`);
  next();
});

server.applyMiddleware({ app });
app.listen({ port: 4004, path: "/" }, function() {
  console.log(`🚀  [${serviceName}] Server ready at ::${this.address().port}`);
});

const inventory = [
  { upc: "1", inStock: true },
  { upc: "2", inStock: false },
  { upc: "3", inStock: true }
];
