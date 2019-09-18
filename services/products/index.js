const { gql } = require("apollo-server");
const { ApolloServer } = require("apollo-server-express");
const { buildFederatedSchema } = require("@apollo/federation");
const express = require("express");

const typeDefs = gql`
  extend type Query {
    topProducts(first: Int = 5): [Product]
  }

  type Product @key(fields: "upc") {
    upc: String!
    name: String
    price: Int
    weight: Int
  }
`;

const resolvers = {
  Product: {
    __resolveReference(object) {
      console.log("Product resolver looking for: ", object.upc);
      return products.find(product => product.upc === object.upc);
    }
  },
  Query: {
    topProducts(_, args) {
      return products.slice(0, args.first);
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
app.listen({ port: 4003, path: "/" }, function() {
  console.log(`🚀  [${serviceName}] Server ready at ::${this.address().port}`);
});

const products = [
  {
    upc: "1",
    name: "Table",
    price: 899,
    weight: 100
  },
  {
    upc: "2",
    name: "Couch",
    price: 1299,
    weight: 1000
  },
  {
    upc: "3",
    name: "Chair",
    price: 54,
    weight: 50
  }
];
