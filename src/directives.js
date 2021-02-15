const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const { formatDate } = require("./utils");

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { format: defaultFormat } = this.args;

    field.args.push({
      type: GraphQLString,
      name: "format",
    });

    field.resolve = async (root, { format, ...rest }, ctx, info) => {
      const result = await resolver.call(this, root, rest, ctx, info);
      return formatDate(result, format || defaultFormat);
    };

    field.type = GraphQLString;
  }
}

class AuthenticatedDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.resolve = async (root, { ...rest }, ctx, info) => {
      if (!ctx.user) throw new AuthenticationError("not authenticated");

      const result = await resolver.call(this, root, rest, ctx, info);

      return result;
    };
  }
}

class AuthorizedDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { role } = this.args;
    const resolver = field.resolve || defaultFieldResolver;

    field.resolve = async (root, { ...rest }, ctx, info) => {
      if (ctx.user.role !== role) throw new AuthenticationError("no role bruh");

      const result = await resolver.call(this, root, rest, ctx, info);

      return result;
    };
  }
}

module.exports = {
  FormatDateDirective,
  AuthenticatedDirective,
  AuthorizedDirective,
};
