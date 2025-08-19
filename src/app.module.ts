import { Module, MiddlewareConsumer } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AppController } from "./app.controller";
import { BasicsModule } from "./basics/basics.module";
import { RequestIdMiddleware } from "./middlewares/request-id.middleware";
import { HttpLoggerMiddleware } from "./middlewares/http-logger.middleware";
import { NamesModule } from "./names/names.module";
import { PrincipalsModule } from "./principals/principals.module";
import { CrewsModule } from "./crews/crews.module";
import { AkasModule } from "./akas/akas.module";
import { EpisodesModule } from "./episodes/episodes.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
    BasicsModule,
    NamesModule,
    PrincipalsModule,
    CrewsModule,
    AkasModule,
    EpisodesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes("*")
      .apply(HttpLoggerMiddleware)
      .forRoutes("*");
  }
}
