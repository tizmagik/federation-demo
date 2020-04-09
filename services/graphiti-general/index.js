const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const fetch = require("node-fetch");
const {
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
    PersonalizedFeed(uri: String!): Feed @requires(fields: "subscriptionStatus id")
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
`;

// signature: fieldName(obj, args, context, info) { result }
// https://www.apollographql.com/docs/graphql-tools/resolvers/#resolver-function-signature
const resolvers = {
  User: {
    __resolveReference(obj, args, context, info) {
      // since we `@requires` the user ID, we have it available here
      // and can attach it to context for use later
      context.userId = obj.id;
      return obj;
    },
    async PersonalizedFeed(obj, args, context, info) {
      // This is not ideal, but one way we can get the "static" Feed data 
      // is to essentially "forward" the query onto graphiti-publishing.
      // We _should_ be able to forward the exact FieldSet requested by the client,
      // but for now, I'm just going to hard-code as an example.
      // Note that we won't query against graphiti-publishing directly but rather
      // go through the Gateway in case there are other services involved in resolving
      // any other fields in the future.

      const { uri } = args;

      const staticFeedReq = await fetch("http://localhost:4000/", {
        method: "POST",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          // As mentioned above, this query should actually be based on the client query
          // which we can probably pull off of context or the info object.
          // Hard-coding something simple for now just to illustrate the idea:
          query: `query O1StaticFeed($uri: String!) {
            feed(uri: $uri) {
              uri
              expressions {
                uri
                packages {
                  uri
                  layout
                  articles {
                    uri
                    headline {
                      default
                    }
                  }
                }
              }
            }
          }`,
          variables: { uri }
        })
      });

      const { feed } = (await staticFeedReq.json()).data;

      // Here is where we can apply business logic to the StaticFeed
      // to produce the "PersonalizedFeed". This can be based on user data
      // (available on context) or really anything else.
      
      // As an example, we could filter feed.expressions[] array based on some logic

      return feed;
    },
    ABRA(obj, args, context, info) {
      // since we `@requires` the user ID, we have it available here
      // so we can make the call to ABRA with this ID later,
      // we'll rename for use with ABRA API:

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

      const abraUrl =
        `https://abra.api.nytimes.com/v12/allocations?` +
        Object.entries(obj.abraParams)
          .map(([k, v]) => `${k}=${v}`)
          .join("&");

      // We'd now make a request like:
      // const ABRA_DATA = await fetch(abraUrl);

      return ABRA_DATA;
    }
  },


};

const server = new ApolloServer({
  context: ({ req }) => {
    // can attach headers to context for use by resolvers
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
