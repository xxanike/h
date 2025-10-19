import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db, users } from "../db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { config } from "./config";

const MemoryStore = createMemoryStore(session);

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleOAuth.clientId,
      clientSecret: config.googleOAuth.clientSecret,
      callbackURL: config.googleOAuth.callbackURL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
          const newUser = {
            id: nanoid(),
            email,
            displayName: profile.displayName || "User",
            photoURL: profile.photos?.[0]?.value,
            role: "buyer",
          };

          await db.insert(users).values(newUser);
          [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export function setupAuth(app: Express) {
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
}
