import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq, or } from "drizzle-orm";

// Environment variables for OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with Google ID or email
          const [existingUser] = await db
            .select()
            .from(users)
            .where(
              or(
                eq(users.googleId, profile.id),
                eq(users.email, profile.emails?.[0]?.value || "")
              )
            )
            .limit(1);

          if (existingUser) {
            // Update Google ID if not set
            if (!existingUser.googleId) {
              await db
                .update(users)
                .set({ googleId: profile.id })
                .where(eq(users.id, existingUser.id));
            }
            return done(null, existingUser);
          }

          // Create new user
          const [newUser] = await db
            .insert(users)
            .values({
              googleId: profile.id,
              email: profile.emails?.[0]?.value || `google_${profile.id}@oauth.local`,
              name: profile.displayName,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profileImageUrl: profile.photos?.[0]?.value,
              role: "client",
            })
            .returning();

          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
        profileFields: ["id", "emails", "name", "displayName", "photos"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with Facebook ID or email
          const [existingUser] = await db
            .select()
            .from(users)
            .where(
              or(
                eq(users.facebookId, profile.id),
                eq(users.email, profile.emails?.[0]?.value || "")
              )
            )
            .limit(1);

          if (existingUser) {
            // Update Facebook ID if not set
            if (!existingUser.facebookId) {
              await db
                .update(users)
                .set({ facebookId: profile.id })
                .where(eq(users.id, existingUser.id));
            }
            return done(null, existingUser);
          }

          // Create new user
          const [newUser] = await db
            .insert(users)
            .values({
              facebookId: profile.id,
              email: profile.emails?.[0]?.value || `facebook_${profile.id}@oauth.local`,
              name: profile.displayName,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profileImageUrl: profile.photos?.[0]?.value,
              role: "client",
            })
            .returning();

          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/github/callback`,
        scope: ["user:email"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user exists with GitHub ID or email
          const email = profile.emails?.[0]?.value || `github_${profile.id}@oauth.local`;
          const [existingUser] = await db
            .select()
            .from(users)
            .where(
              or(
                eq(users.githubId, profile.id),
                eq(users.email, email)
              )
            )
            .limit(1);

          if (existingUser) {
            // Update GitHub ID if not set
            if (!existingUser.githubId) {
              await db
                .update(users)
                .set({ githubId: profile.id })
                .where(eq(users.id, existingUser.id));
            }
            return done(null, existingUser);
          }

          // Create new user
          const [newUser] = await db
            .insert(users)
            .values({
              githubId: profile.id,
              email,
              name: profile.displayName || profile.username,
              profileImageUrl: profile.photos?.[0]?.value,
              role: "client",
            })
            .returning();

          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
