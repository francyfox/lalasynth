import { UserController } from '@/modules/user/user.controller'
import { Elysia } from 'elysia'
export const routes = new Elysia({ name: 'App.Routes' })
  .use(UserController)