import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.setGlobalPrefix('api')

  // Serve uploaded product images as static files at /uploads/...
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
})

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🌿 NutriNest backend → http://localhost:${port}/api`)
}
bootstrap()
