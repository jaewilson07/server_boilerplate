//https://www.robinwieruch.de/minimal-node-js-babel-setup#nodejs-with-babel
// https://www.robinwieruch.de/node-js-express-tutorial
//https://www.youtube.com/watch?v=sOaOPnHlbKA

import express from 'express';

import { ApolloServer } from 'apollo-server-express';

import neo4j from 'neo4j-driver';

import { makeAugmentedSchema } from 'neo4j-graphql-js';

import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

import { GRAPH_SERVER } from './constants';

dotenv.config();

//generate schema file first
//npm run-script inferschema:write
const typeDefs = fs
  .readFileSync(path.join(__dirname, 'schema.graphql'))
  .toString('utf-8');

const app = express();

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Optionally a config object can be included to specify which types to include
 * in generated queries and/or mutations. Read more in the docs:
 * https://grandstack.io/docs/neo4j-graphql-js-api.html#makeaugmentedschemaoptions-graphqlschema
 */
const schema = makeAugmentedSchema({
  typeDefs,
  config: {
    query: {},
    mutation: {},
  },
});

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  {
    encrypted: process.env.NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
  }
);

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  context: { driver, neo4jDatabase: process.env.NEO4J_DATABASE },
  schema: schema,
  introspection: true,
  playground: true,
});

// Specify host, port and path for GraphQL endpoint
const graph_port = process.env.GRAPHQL_SERVER_PORT || GRAPH_SERVER.PORT;
const graph_path = process.env.GRAPHQL_SERVER_PATH || GRAPH_SERVER.GRAPHQL;
const graph_host = process.env.GRAPHQL_SERVER_HOST || GRAPH_SERVER.HOST;

/*
 * Optionally, apply Express middleware for authentication, etc
 * This also also allows us to specify a path for the GraphQL endpoint
 */
server.applyMiddleware({ app, graph_path });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen({ host: graph_host, port: graph_port, path: graph_path }, () => {
  console.log(
    `GraphQL server ready at http://${graph_host}:${graph_port}${graph_path}`
  );
});
