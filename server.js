const { ApolloServer, PubSub } = require("apollo-server");
const gql = require("graphql-tag");

const pubSub = new PubSub();
const NEW_ITEM = "NEW_ITEM";

const typeDefs = gql`
  type Item {
    task: String!
  }

  type Query {
    hi: String!
  }

  type Mutation {
    createItem(task: String!): Item!
  }

  #  type Subscription {
  #    newItem: Item
  #  }
`;

const resolvers = {
  Query: {
    hi() {
      return "Hello hello hello.";
    },
  },
  Mutation: {
    createItem(_, { task }) {
      pubSub.publish(NEW_ITEM, { newItem: { task } });
      return { task };
    },
  },
  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator([NEW_ITEM]),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`Server running on ${url}`));
