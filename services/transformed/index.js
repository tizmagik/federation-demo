const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

console.log("transformed")

const typeDefs = gql`
  extend type User @key(fields: "id") {
    id: ID! @external
    name: String @external
    transformed: String @requires(fields: "name")
  }
`;

const resolvers = {
  User: {
    // __resolveReference(object) {
    //   console.log("resolveReference", object);
    //   return ;
    // },
    transformed(object) {
      console.log("transformed", object);
      return object.name + " <-- here";
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

server.listen({ port: 4005 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
