import { NextRequest, NextResponse } from 'next/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { ApolloServer } from '@apollo/server'
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default'
import { schema } from './schema'
import { resolvers } from './resolvers'
import { getUserFromToken } from '@/utils/auth'

let plugins = []
if (process.env.NODE_ENV === 'production') {
  plugins = [
    ApolloServerPluginLandingPageProductionDefault({
      embed: true,
      graphRef: 'myGraph@prod',
    }),
  ]
} else {
  plugins = [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
}
console.log('Server setup started ------>')
const server = new ApolloServer({
  resolvers,
  typeDefs: schema,
  plugins,
})
console.log('Server setup ended ------>')
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    try {
      const user = await getUserFromToken(
        req.headers.get('authorization') ?? ''
      )

      return {
        req,
        user,
      }
    } catch (error) {
      console.log('error ----->', error)
      return {}
    }
  },
})

export async function GET(request: NextRequest) {
  return handler(request)
}

export async function POST(request: NextRequest) {
  return handler(request)
}
