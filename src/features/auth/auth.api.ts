import { type SolidAuthConfig } from "@solid-mediakit/auth";
import Discord from "@auth/core/providers/discord";
import { serverEnv } from "~/env/server";
import { Routes, type APIGuildMember } from 'discord-api-types/v10'
import { REST } from '@discordjs/rest'
import { authRoles } from "./auth.roles";
import type { SessionUser } from "./auth.types";


declare module "@auth/core/types" {
  export interface Session {
    user?: SessionUser
  }
}

export const authOptions: SolidAuthConfig = {
  providers: [
    Discord({
      clientId: serverEnv.DISCORD_ID,
      clientSecret: serverEnv.DISCORD_SECRET,
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  basePath: "/api/auth",
  secret: serverEnv.AUTH_SECRET,
  trustHost: serverEnv.AUTH_TRUST_HOST === 'true',
  callbacks: {
    async session({ session, token }) {


      const picture = token?.picture
      if (!picture) throw new Error('No picture')
      const providerId = picture.split('/')[picture.split('/').length - 2]

      if (!providerId.match(/^[0-9]+$/)) throw new Error('No providerId')

      const rest = new REST({ version: '10' }).setToken(serverEnv.DISCORD_TOKEN)
      const member = (await rest.get(Routes.guildMember(serverEnv.DISCORD_GUILD_ID, providerId))) as APIGuildMember
      const guildRoles = (await rest.get(Routes.guildRoles(serverEnv.DISCORD_GUILD_ID))) as unknown as { id: string, name: string }[]

      const authRolesArray: { name: string, reg: RegExp }[] = Object.keys(authRoles).map((role) => ({
        name: role,
        reg: authRoles[role as keyof typeof authRoles],
      }))


      const rolesDiscord = guildRoles.filter((role) => member.roles.includes(role.id))
      const roles = authRolesArray.reduce((acc, role) => {

        const authRole = !!rolesDiscord.find((r) => r.name.match(role.reg))
        return {
          ...acc,
          [role.name]: authRole,
        }
      }, {})

      const user = {
        ...session.user,
        name: member.nick || member.user.username,
        providerId,
        roles,
      }

      return {
        ...session,
        user
      }
    }
  },
};
