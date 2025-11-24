import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        const user = await storage.getUserByEmailOrUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      }
    )
  );

  // OpenID Connect Strategy
  if (process.env.OPENID_ISSUER_URL && process.env.OPENID_CLIENT_ID && process.env.OPENID_CLIENT_SECRET) {
    passport.use(
      "openidconnect",
      new OpenIDConnectStrategy(
        {
          issuer: process.env.OPENID_ISSUER_URL,
          clientID: process.env.OPENID_CLIENT_ID,
          clientSecret: process.env.OPENID_CLIENT_SECRET,
          authorizationURL: `${process.env.OPENID_ISSUER_URL}/oauth2/auth`,
          tokenURL: `${process.env.OPENID_ISSUER_URL}/oauth2/token`,
          userInfoURL: `${process.env.OPENID_ISSUER_URL}/oauth2/userinfo`,
          callbackURL: process.env.OPENID_CALLBACK_URL || "http://localhost:5000/api/auth/openid/callback",
          passReqToCallback: true,
        },
        async (req: any, issuer: string, sub: string, profile: any, done: any) => {
          try {
            const email = profile.email || profile.preferred_username || sub;
            let user = await storage.getUserByEmail(email);

            if (!user) {
              // Create new user from OpenID profile
              user = await storage.createUser({
                name: profile.name || profile.preferred_username || "OpenID User",
                email: email,
                password: await hashPassword(randomBytes(32).toString("hex")),
                role: "client",
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).send("Email already exists");
      }

      if (req.body.username) {
        const existingUsername = await storage.getUserByUsername(req.body.username);
        if (existingUsername) {
          return res.status(400).send("Username already exists");
        }
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // OpenID Connect Routes
  if (process.env.OPENID_ISSUER_URL) {
    app.get(
      "/api/auth/openid",
      passport.authenticate("openidconnect", { failureRedirect: "/auth" })
    );

    app.get(
      "/api/auth/openid/callback",
      passport.authenticate("openidconnect", { failureRedirect: "/auth" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }
}

export { hashPassword };
