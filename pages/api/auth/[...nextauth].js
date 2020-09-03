import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import jwt from "jsonwebtoken";

const jwtSecret = JSON.parse(process.env.AUTH_PRIVATE_KEY);

const options = {
  providers: [
    Providers.Twitter({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
  ],
  database: process.env.DATABASE_URL,
  session: {
    jwt: true,
  },
  jwt: {
    encode: async ({ token, secret }) => {
      const tokenContents = {
        id: token.id,
        name: token.name,
        email: token.email,
        picture: token.picture,
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["admin", "user"],
          "x-hasura-default-role": "user",
          "x-hasura-role": "user",
          "x-hasura-user-id": token.id.toString(),
        },
        iat: Date.now() / 1000,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        sub: token.id.toString(),
      };

      const encodedToken = jwt.sign(tokenContents, jwtSecret.key, {
        algorithm: jwtSecret.type,
      });

      return encodedToken;
    },
    decode: async ({ token, secret }) => {
      const decodedToken = jwt.verify(token, jwtSecret.key, {
        algorithms: jwtSecret.type,
      });

      return decodedToken;
    },
  },
  debug: true,
  callbacks: {
    session: async (session, user) => {
      const encodedToken = jwt.sign(user, jwtSecret.key, {
        algorithm: jwtSecret.type,
      });

      session.id = user.id;
      session.token = encodedToken;
      session.user.id = user.id;

      return Promise.resolve(session);
    },
    jwt: async (token, user, account, profile, isNewUser) => {
      const isSignIn = user ? true : false;

      if (isSignIn) {
        token.id = user.id;
      }

      return Promise.resolve(token);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
