import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

const generateAnonymousUsername = (userId: string) => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const seed = `${userId}-${day}-${month}-${year}`;
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `anonymous user ${hash % 1000}`;
};

// Mutation to create a new user in the database
export const create = internalMutation({
  args: {
    username: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    password: v.string(),
    name: v.string(),
    githubUsername: v.optional(v.string()),
    role: v.string(),
    isOnline: v.optional(v.boolean()),
    description: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    anonymousUsername: v.optional(v.string()), // Add anonymousUsername field
  },
  handler: async (ctx, args) => {
    const user = {
      ...args,
      anonymousUsername: generateAnonymousUsername(args.clerkId)
    };
    // Insert the new user record into the "users" table
    await ctx.db.insert("users", user);
  },
});

// Query to retrieve a user by their Clerk ID
export const get = internalQuery({
  args: {
    clerkId: v.string() // The Clerk ID of the user to be retrieved
  },
  handler: async (ctx, args) => {
    // Query the "users" table using the "by_clerkId" index to find the user with the specified Clerk ID
    return ctx.db.query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique(); // Expect a unique result since Clerk IDs are unique
  },
});
