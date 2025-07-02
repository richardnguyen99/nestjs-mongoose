import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
