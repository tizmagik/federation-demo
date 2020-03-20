const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  extend type User {
    id: ID! @external
    
    ABRA(
      integration: String!, 
      tests: [String], 
      overrides: [String]
    ): ABRA
  }

  type ABRAVariant {
    name: String, # e.g. 'test1'
    variant: String, # e.g. 'variant1'
    data: String,
  }

  type ABRA {
    ABRAVariants: [ABRAVariant] # can be whatever, even JSON.stringified response
  }

  type Product @key(fields: "upc") {
    upc: String! 
    weight: Int 
    price: Int 
    inStock: Boolean
    shippingEstimate: Int # @requires(fields: "price weight")
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

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 graphiti-general (programmer) ready at ${url}`);
});

const inventory = [
  { upc: "1", inStock: true },
  { upc: "2", inStock: false },
  { upc: "3", inStock: true }
];
