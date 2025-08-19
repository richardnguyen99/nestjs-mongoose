import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseOptionsFactory } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy, MongooseOptionsFactory
{
  private _mongod: MongoMemoryServer;

  constructor(private configService: ConfigService) {}

  async onModuleDestroy() {
    if (this._mongod) {
      await this._mongod.stop();
    }
  }

  async onModuleInit() {}

  async createMongooseOptions() {
    if (this.configService.get<string>("NODE_ENV") === "test:e2e") {
      this._mongod = await MongoMemoryServer.create();
    }

    if (this._mongod) {
      return {
        uri: this._mongod.getUri(),
      };
    }

    return {
      uri:
        this.configService.get<string>("MONGODB_URI") ||
        "mongodb://localhost:27018",
      dbName: this.configService.get<string>("MONGODB_DB_NAME") || "tmdb",
      user: this.configService.get<string>("MONGODB_USER") || "admin",
      pass: this.configService.get<string>("MONGODB_PASSWORD") || "admin",
      ssl: this.configService.get<string>("NODE_ENV") === "production",
      directConnection: true,
    };
  }
}
