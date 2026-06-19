export const TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome to StartGrid",
    subject: "Welcome to StartGrid — your profile is live",
    body: `Hi {{name}},

Welcome to StartGrid! Your profile is now live and visible to investors/startups.

Here's what to do next:
• Complete your profile to increase visibility
• Browse matches in your Discover feed
• Send connection requests to promising matches

We're excited to have you.

The StartGrid Team`,
    segment: "all",
  },
  {
    id: "profile_reminder",
    name: "Complete Your Profile",
    subject: "Your StartGrid profile is incomplete",
    body: `Hi {{name}},

We noticed your StartGrid profile isn't complete yet.

Profiles with all sections filled get 3x more connection requests.

Log in to complete your profile now: {{link}}

The StartGrid Team`,
    segment: "unpublished_startups",
  },
  {
    id: "connection_nudge",
    name: "Nudge: Haven't Connected Yet",
    subject: "Your first match is waiting on StartGrid",
    body: `Hi {{name}},

You've been on StartGrid for a while but haven't connected with any investors yet.

There are {{count}} investors that match your profile right now.

Log in and send your first connection request: {{link}}

The StartGrid Team`,
    segment: "unconnected_startups",
  },
  {
    id: "weekly_digest",
    name: "Weekly Platform Digest",
    subject: "This week on StartGrid",
    body: `Hi {{name}},

Here's your weekly StartGrid update:

• {{new_matches}} new matches found for you
• {{new_startups}} new startups joined this week
• {{platform_news}} from the StartGrid team

Log in to explore: {{link}}

The StartGrid Team`,
    segment: "all",
  },
];
