import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type ScheduledPost {
    id: ID!
    title: String!
    content: String!
    scheduledFor: String!
    publishedAt: String
    status: PostStatus!
    mediumPostId: String
    mediumApiToken: String!
    createdAt: String!
    updatedAt: String!
  }

  enum PostStatus {
    pending
    published
    failed
  }

  input CreateScheduledPostInput {
    title: String!
    content: String!
    scheduledFor: String!
    mediumApiToken: String!
  }

  input UpdateScheduledPostInput {
    title: String
    content: String
    scheduledFor: String
    status: PostStatus
  }

  type Query {
    scheduledPosts: [ScheduledPost!]!
    scheduledPost(id: ID!): ScheduledPost
    pendingPosts: [ScheduledPost!]!
  }

  type Mutation {
    createScheduledPost(input: CreateScheduledPostInput!): ScheduledPost!
    updateScheduledPost(id: ID!, input: UpdateScheduledPostInput!): ScheduledPost!
    deleteScheduledPost(id: ID!): Boolean!
    publishPost(id: ID!): ScheduledPost!
    publishPostNow(id: ID!): ScheduledPost!
    updatePostStatus(id: ID!, status: PostStatus!, mediumPostId: String, publishedAt: String): ScheduledPost!
  }

  type Subscription {
    postStatusChanged: ScheduledPost!
    postPublished: ScheduledPost!
  }
`; 