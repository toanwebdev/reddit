import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import path from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from './entities/Post';
import { Upvote } from './entities/Upvote';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { Context } from './types/Context';
import { buildDataLoaders } from './utils/dataLoaders';
require('dotenv').config();

async function main() {
  const connection = await createConnection({
    type: 'postgres',
    ...(__prod__ ? {url: process.env.DATABASE_URL} : {
      database: 'reddit',
      username: process.env.DB_USERNAME_DEV,
      password: process.env.DB_PASSWORD_DEV
    }),
    logging: true,
    ...(__prod__ ? {
      extra: {
        ssl: {
          rejectUnauthorized: false
        }
      },
      ssl : true
    } : {}),
    ...(__prod__ ? {} : {synchronize: true}),
    entities: [User, Post, Upvote],
    migrations: [path.join(__dirname, 'migrations/*')]
  });

  if(__prod__) await connection.runMigrations();

  const app = express();

  app.use(cors({
    origin: __prod__ ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV,
    credentials: true
  }));

  // Session/Cookie store
  const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@reddit-cookie.u6lhe.mongodb.net/reddit-cookie?retryWrites=true&w=majority`;

  await mongoose.connect(mongoUrl);
  console.log('MongoDB Connected');

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({mongoUrl}),
      cookie: {
        maxAge: 1000 * 60 * 60, // one hour
        httpOnly: true, // JS front end cannot access the cookie
        secure: __prod__, // cookie only works in https
        sameSite: 'lax', // protection against CSRF
        domain: __prod__ ? '.vercel.app' : undefined
      },
      secret: process.env.SESSION_SECRET_DEV_PROD as string,
      saveUninitialized: false, // don't save empty session, right from the start
      resave: false
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [HelloResolver, UserResolver, PostResolver], validate: false }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res }): Context => ({ req, res, connection, dataLoaders: buildDataLoaders() }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`));
}

main().catch(error => console.error(error));