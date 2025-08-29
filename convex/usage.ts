import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Plan limits configuration
const PLAN_LIMITS = {
  starter: { posts: 15, hashtags: 15, imageIdeas: 15, images: 5, videos: 2 },
  business: { posts: 50, hashtags: 50, imageIdeas: 50, images: 20, videos: 10 },
  pro: { posts: 150, hashtags: 150, imageIdeas: 150, images: 75, videos: 30 },
};

// Get current month string (YYYY-MM format)
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get user's current plan from subscription
const getUserPlan = async (ctx: any, userId: string) => {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .first();
  
  if (!subscription || subscription.status !== "active") {
    return null; // No active subscription
  }
  
  // Map price IDs to plan names (you'll need to update these with actual Polar price IDs)
  const priceIdToPlan: Record<string, keyof typeof PLAN_LIMITS> = {
    "starter_price_id": "starter",
    "business_price_id": "business", 
    "pro_price_id": "pro",
  };
  
  return priceIdToPlan[subscription.polarPriceId || ""] || "starter";
};

// Check if user can generate content
export const checkUsageLimit = query({
  args: { 
    userId: v.string(),
    type: v.union(v.literal("posts"), v.literal("hashtags"), v.literal("imageIdeas"), v.literal("images"), v.literal("videos"))
  },
  handler: async (ctx, args) => {
    const currentMonth = getCurrentMonth();
    const plan = await getUserPlan(ctx, args.userId);
    
    if (!plan) {
      return { 
        canGenerate: false, 
        reason: "Kein aktives Abonnement gefunden. Bitte wählen Sie einen Plan.",
        remainingTokens: 0,
        totalTokens: 0
      };
    }
    
    // Get current usage
    const usage = await ctx.db
      .query("usage")
      .withIndex("userMonth", (q: any) => q.eq("userId", args.userId).eq("month", currentMonth))
      .first();
    
    const currentUsage = usage ? usage[`${args.type}Generated`] : 0;
    const planLimit = PLAN_LIMITS[plan][args.type];
    const extraTokens = usage?.extraTokensPurchased || 0;
    const totalLimit = planLimit + extraTokens;
    const remainingTokens = Math.max(0, totalLimit - currentUsage);
    
    const getTypeDisplayName = (type: string) => {
      switch(type) {
        case 'posts': return 'Post';
        case 'hashtags': return 'Hashtag';
        case 'imageIdeas': return 'Bildideen';
        case 'images': return 'Bild';
        case 'videos': return 'Video';
        default: return type;
      }
    };

    return {
      canGenerate: currentUsage < totalLimit,
      reason: currentUsage >= totalLimit 
        ? `Ihr ${getTypeDisplayName(args.type)}-Kontingent für diesen Monat ist aufgebraucht. Sie können zusätzliche Tokens kaufen oder auf den nächsten Monat warten.`
        : "",
      remainingTokens,
      totalTokens: totalLimit,
      planName: plan
    };
  },
});

// Increment usage counter
export const incrementUsage = mutation({
  args: { 
    userId: v.string(),
    type: v.union(v.literal("posts"), v.literal("hashtags"), v.literal("imageIdeas"), v.literal("images"), v.literal("videos"))
  },
  handler: async (ctx, args) => {
    const currentMonth = getCurrentMonth();
    
    // Check if usage record exists
    const existingUsage = await ctx.db
      .query("usage")
      .withIndex("userMonth", (q: any) => q.eq("userId", args.userId).eq("month", currentMonth))
      .first();
    
    if (existingUsage) {
      // Update existing record
      const fieldName = `${args.type}Generated` as keyof typeof existingUsage;
      await ctx.db.patch(existingUsage._id, {
        [fieldName]: (existingUsage[fieldName] as number) + 1,
        lastUpdated: Date.now(),
      });
    } else {
      // Create new usage record
      await ctx.db.insert("usage", {
        userId: args.userId,
        month: currentMonth,
        postsGenerated: args.type === "posts" ? 1 : 0,
        hashtagsGenerated: args.type === "hashtags" ? 1 : 0,
        imageIdeasGenerated: args.type === "imageIdeas" ? 1 : 0,
        imagesGenerated: args.type === "images" ? 1 : 0,
        videosGenerated: args.type === "videos" ? 1 : 0,
        extraTokensPurchased: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Get usage statistics
export const getUserUsage = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const currentMonth = getCurrentMonth();
    const plan = await getUserPlan(ctx, args.userId);
    
    if (!plan) {
      return null;
    }
    
    const usage = await ctx.db
      .query("usage")
      .withIndex("userMonth", (q: any) => q.eq("userId", args.userId).eq("month", currentMonth))
      .first();
    
    const currentUsage = {
      posts: usage?.postsGenerated || 0,
      hashtags: usage?.hashtagsGenerated || 0,
      imageIdeas: usage?.imageIdeasGenerated || 0,
      images: usage?.imagesGenerated || 0,
      videos: usage?.videosGenerated || 0,
      extraTokens: usage?.extraTokensPurchased || 0,
    };
    
    const limits = PLAN_LIMITS[plan];
    
    return {
      plan,
      currentUsage,
      limits,
      totalLimits: {
        posts: limits.posts + currentUsage.extraTokens,
        hashtags: limits.hashtags + currentUsage.extraTokens,
        imageIdeas: limits.imageIdeas + currentUsage.extraTokens,
        images: limits.images + currentUsage.extraTokens,
        videos: limits.videos + currentUsage.extraTokens,
      },
      remaining: {
        posts: Math.max(0, limits.posts + currentUsage.extraTokens - currentUsage.posts),
        hashtags: Math.max(0, limits.hashtags + currentUsage.extraTokens - currentUsage.hashtags),
        imageIdeas: Math.max(0, limits.imageIdeas + currentUsage.extraTokens - currentUsage.imageIdeas),
        images: Math.max(0, limits.images + currentUsage.extraTokens - currentUsage.images),
        videos: Math.max(0, limits.videos + currentUsage.extraTokens - currentUsage.videos),
      }
    };
  },
});

// Purchase extra tokens
export const purchaseExtraTokens = mutation({
  args: { 
    userId: v.string(),
    tokenCount: v.number() // Number of extra tokens to add
  },
  handler: async (ctx, args) => {
    const currentMonth = getCurrentMonth();
    
    // Get or create usage record
    const existingUsage = await ctx.db
      .query("usage")
      .withIndex("userMonth", (q: any) => q.eq("userId", args.userId).eq("month", currentMonth))
      .first();
    
    if (existingUsage) {
      await ctx.db.patch(existingUsage._id, {
        extraTokensPurchased: existingUsage.extraTokensPurchased + args.tokenCount,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("usage", {
        userId: args.userId,
        month: currentMonth,
        postsGenerated: 0,
        hashtagsGenerated: 0,
        imageIdeasGenerated: 0,
        imagesGenerated: 0,
        videosGenerated: 0,
        extraTokensPurchased: args.tokenCount,
        lastUpdated: Date.now(),
      });
    }
    
    return { success: true, tokensAdded: args.tokenCount };
  },
});
