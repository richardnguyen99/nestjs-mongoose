import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongoMemoryServer } from "mongodb-memory-server";

import { DatabaseService } from "./database.service";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: DatabaseService,
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
