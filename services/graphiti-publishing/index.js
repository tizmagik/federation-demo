const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const {
  FEED_DATA,
  FEEDEXPRESSIONS_DATA,
  USER_DATA,
} = require("../../data");

const typeDefs = gql`
  type Query {
    user(id: String!): User

    # new types
    feed(uri: String!): Feed
  }

  type User @key(fields: "id") {
    id: ID!
    email: String
    subscriptionStatus: String # not a real field, but just to get an idea
  }

  # curator schema approx.
  enum Layout {
    AGNOSTIC
    STACKED
    CAROUSEL
  }

  # these can vary by A/B testing parameters
  type FeedPackage {
    uri: String!
    layout: Layout
    articles: [Article]
  }

  # these can vary by user properties
  # (geoData + desktopOrMobile + regiData)
  type FeedExpression {
    uri: String!
    packages: [FeedPackage]
  }

  type Feed @key(fields: "uri") {
    uri: String!
    name: String # human-readable name for example
    expressions: [FeedExpression]
  }

  # simplifying publishingproperties as just uri for now
  type CreativeWorkHeadline {
    subHeadline: String!
    seo: String!
    default: String!
  }

  type Article @key(fields: "uri") {
    headline: CreativeWorkHeadline
    uri: String!
    # ...
  }
`;

const resolvers = {
  Query: {
    user(id) {
      return USER_DATA[0];
    },
    feed(obj, arg) {
      return FEED_DATA.find(f => f.uri === arg.uri)
    }
  },
  Feed: {
    expressions(object, args) {
      return FEEDEXPRESSIONS_DATA;
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

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 graphiti-publishing (samizdat) ready at ${url}`);
});
