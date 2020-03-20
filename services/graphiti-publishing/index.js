const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    me: User
    feed(id: String!): Feed
  }

  type User @key(fields: "id") {
    id: ID!
    email: String
  }

  # curator schema approx.
  enum Layout {
    AGNOSTIC
    STACKED
    CAROUSEL
  }

  type FeedPackages {
    uri: String!
    layout: Layout
  }

  type FeedExpression {
    uri: String!
    packages: [FeedPackages]
  }

  type Feed {
    uri: String!
    name: String # human-readable name for example
    Expressions: [FeedExpression]
  }

  # simplifying publishingproperties as just uri for now
  type CreativeWorkHeadline {
    subHeadline: String!
    seo: String!
    default: String!
  }

  type Article {
    headline: CreativeWorkHeadline
    uri: String!
  }
`;

const resolvers = {
  Query: {
    me() {
      return users[0];
    }
  },
  User: {
    __resolveReference(object) {
      return users.find(user => user.id === object.id);
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

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada"
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete"
  }
];
