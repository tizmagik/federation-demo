const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const {
  FEED_DATA,
  FEEDEXPRESSIONS_DATA,
  USER_DATA,
  ABRA_DATA
} = require("../../data");

const typeDefs = gql`


  extend type User @key(fields: "id") {
    id: ID! @external
    subscriptionStatus: String @external

    # fields owned by graphiti-general
    ABRA(integration: String!, tests: [String], overrides: [String]): ABRA
      @requires(fields: "id")

    # fields owned by graphiti-general, but extended from graphiti-publishing
    PersonalizedFeed(uri: String!): PersonalizedFeed @requires(fields: "subscriptionStatus id")
  }

  type PersonalizedFeed {
    uri: String!
    feed: Feed
  }

  # denote that we're using the "uri" field as the key for extension
  extend type Feed @key(fields: "uri") {
    uri: String! @external
  }

  extend type Article {
    uri: String! @external
  }


  type ABRAVariant {
    name: String # e.g. 'test1'
    variant: String # e.g. 'variant1'
    data: String
  }

  type ABRA {
    ABRAVariants: [ABRAVariant] # can be whatever, even JSON.stringified response
  }


  # stub types (to support federation inter-op)

  type Product @key(fields: "upc") {
    upc: String!
    weight: Int
    price: Int
    inStock: Boolean
    shippingEstimate: Int # @requires(fields: "price weight")
  }
`;

// signature: fieldName(obj, args, context, info) { result }
// https://www.apollographql.com/docs/graphql-tools/resolvers/#resolver-function-signature
const resolvers = {
  User: {
    __resolveReference(obj, args, context, info) {
      console.log("[gg] User resolveRef", { obj, args, context, info });
      // since we `@requires` the user ID, we have it available here
      // we'll attach it to context for use later
      context.userId = obj.id;
      return obj;
    },
    PersonalizedFeed(obj, args, context, info) {
      console.log("PersonalizedFeed", { obj, args, context, info });
      // We can make a call to ABRA at this point
      // if we need to make decisions on which FEED_DATA to return
      // We're within the User type, so we have user context available
      return FEED_DATA.find(f => f.uri === args.uri);
    },
    // feed(obj, args, context, info) {
    //   console.log("[gg] feed resolver", args);
    //   return FEED_DATA.find(f => f.uri === args.uri);
    // },
    ABRA(obj, args, context, info) {
      // since we `@requires` the user ID, we have it available here
      // so we can make the call to ABRA with this ID later,
      // we'll rename for use with ABRA API:
      console.log("ABRA", { args });

      return {
        ...obj,
        abraParams: {
          integration: args.integration,
          agent_id: obj.id,

          // if this is based on some Feed input, we probably
          // instead want to put this data on context as we go
          // Lots of assumptions being made here for now. ¯\_(ツ)_/¯
          tests: "programmer"
        }
      };
    }
  },

  ABRA: {
    ABRAVariants(obj, args, context, info) {
      // user ID was made available as agentId in the parent resolver
      console.log("abraVariants", { obj, args });

      const abraUrl =
        `https://abra.api.nytimes.com/v12/allocations?` +
        Object.entries(obj.abraParams)
          .map(([k, v]) => `${k}=${v}`)
          .join("&");

      // We'd now make a request like:
      // const ABRA_DATA = await axios.get(abraUrl);

      return ABRA_DATA;
    }
  },


};

const server = new ApolloServer({
  context: ({ req }) => {
    // attach headers to context for use by resolvers
  },
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
