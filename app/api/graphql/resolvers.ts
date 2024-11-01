// @ts-nocheck
import { db } from '@/db/db'
import { InsertIssues, SelectIssues, issues, users } from '@/db/schema'
import { GQLContext } from '@/types'
import { getUserFromToken, signin, signup } from '@/utils/auth'
import { and, asc, desc, eq, or, sql } from 'drizzle-orm'
import { GraphQLError } from 'graphql'
import { Mutation } from 'urql'

export const resolvers = {
  IssueStatus: {
    BACKLOG: 'backlog',
    TODO: 'todo',
    INPROGRESS: 'inprogress',
    DONE: 'done',
  },
  Query: {
    me: (_, __, ctx: GQLContext) => {
      return ctx.user
    },
    issues: async (_, { input }, ctx: GQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError('UNAUTHORISED', {
          extensions: { code: 401 },
        })
      }

      const andFilters = [eq(issues.userId, ctx.user.id)]

      if (input && input.statuses) {
        const statusFilters = input.statuses.map((status) =>
          eq(issues.status, status)
        )
        andFilters.push(or(...statusFilters))
      }

      const data = await db.query.issues.findMany({
        where: and(...andFilters),
        orderBy: [
          asc(sql`case ${issues.status}
        when "backlog" then 1
        when "inprogress" then 2
        when "done" then 3
      end`),
          desc(issues.createdAt),
        ],
      })

      return data
    },
  },
  Mutation: {
    signin: async (_, { input }, ctx) => {
      const data = await signin(input)

      if (!data || !data.token || !data.user) {
        throw new GraphQLError('UNAUTHORISED', {
          extensions: { code: 401 },
        })
      }
      return { ...data.user, token: data.token }
    },
    createUser: async (_, { input }) => {
      const data = await signup(input)

      if (!data || !data.token || !data.user) {
        throw new GraphQLError('UNAUTHORISED', {
          extensions: { code: 401 },
        })
      }
      return { ...data.user, token: data.token }
    },
    createIssue: async (_, { input }, ctx: GQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError('UNAUTHORISED', {
          extensions: { code: 401 },
        })
      }
      const issue = await db
        .insert(issues)
        .values({ userId: ctx.user.id, ...input })
        .returning()

      return issue[0]
    },
    editIssue: async (_, { input }, ctx: GQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError('UNAUTHORISED', {
          extensions: { code: 401 },
        })
      }
      const { id, ...update } = input

      const result = await db
        .update(issues)
        .set(update ?? {})
        .where(and(eq(issues.userId, ctx.user?.id), eq(issues.id, id)))
        .returning()

      return result[0]
    },
    deleteIssue: async (_, { id }, ctx: GQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError('UNAUTHORISED', {
          extensions: { code: 401 },
        })
      }
      const result = await db
        .delete(issues)
        .where(and(eq(issues.userId, ctx.user.id), eq(issues.id, id)))
        .returning()

      return true
    },
  },
  // Issue: {
  //   user: (issue, _, ctx: GQLContext) => {
  //     if (!ctx.user) {
  //       throw new GraphQLError('UNAUTHORISED', {
  //         extensions: { code: 401 },
  //       })
  //     }
  //     return db.query.users.findFirst({
  //       where: eq(users.id, issue.userId),
  //     })
  //   },
  // },
  // User: {
  //   issues: (user, _, ctx: GQLContext) => {
  //     if (!ctx.user) {
  //       throw new GraphQLError('UNAUTHORISED', {
  //         extensions: { code: 401 },
  //       })
  //     }
  //     return db.query.issues.findMany({
  //       where: eq(issues.userId, ctx.user.id),
  //     })
  //   },
  // },
}
