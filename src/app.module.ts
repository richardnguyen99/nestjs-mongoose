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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>("MONGODB_URI") || "mongodb://localhost:27018",
        dbName: config.get<string>("MONGODB_DB_NAME") || "tmdb",
        user: config.get<string>("MONGODB_USER") || "admin",
        pass: config.get<string>("MONGODB_PASSWORD") || "admin",
        ssl: config.get<string>("NODE_ENV") === "production",
        directConnection: true,
      }),

      inject: [ConfigService],
    }),

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
