const { ApolloServer, SchemaDirectiveVisitor } = require("apollo-server");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const { createToken, getUserFromToken } = require("./auth");
const db = require("./db");
const { AuthorizedDirective } = require("./directives");
const { AuthenticatedDirective } = require("./directives");
const { FormatDateDirective } = require("./directives");

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.args.push({
      type: GraphQLString,
      name: "message",
    });

    field.resolve = (root, { message: userMessage, ...rest }, ctx, info) => {
      const { message: schemaMessage } = this.args;
      const message = userMessage || schemaMessage;
      console.log("hello...", message);
      return resolver.call(this, root, rest, ctx, info);
    };
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective,
    formatDate: FormatDateDirective,
    authenticated: AuthenticatedDirective,
    authorized: AuthorizedDirective,
  },
  context({ req, connection }) {
    if (connection) {
      return { ...db, ...connection.context };
    }

    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...db, user, createToken };
  },
  subscriptions: {
    onConnect: async (params) => {
      const token = params.authorization;
      const user = getUserFromToken(token);
      return { user };
    },
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
