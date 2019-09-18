const { gql } = require("apollo-server");
const { ApolloServer } = require("apollo-server-express");
const { buildFederatedSchema } = require("@apollo/federation");
const express = require("express");

const typeDefs = gql`
  extend type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
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

const serviceName = __dirname.split("/").pop();
const app = express();
app.use(express.json());
let ctr = 0;
app.use((req, res, next) => {
  console.log(`${serviceName} request count: ${++ctr}`);
  next();
});

server.applyMiddleware({ app });
app.listen({ port: 4001, path: "/" }, function() {
  console.log(`🚀  [${serviceName}] Server ready at ::${this.address().port}`);
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
