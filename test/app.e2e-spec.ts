import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

import { AppModule } from "src/app.module";
import { HttpExceptionFilter } from "src/filters/http-exception.filter";
import { ZodExceptionFilter } from "src/filters/zod-exception.filter";
import { ResponseInterceptor } from "src//interceptors/response.interceptor";
import { RequestIdInterceptor } from "src/interceptors/request-id.interceptor";
import { MongooseExceptionFilter } from "src/filters/mongoose-exception.filter";
import { MongodbExceptionFilter } from "src/filters/mongodb-exception.filter";
import { NestExpressApplication } from "@nestjs/platform-express";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {});

  afterAll(async () => {});

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    app.enableShutdownHooks();

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalFilters(new ZodExceptionFilter());
    app.useGlobalFilters(new MongooseExceptionFilter());
    app.useGlobalFilters(new MongodbExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalInterceptors(new RequestIdInterceptor());

    // TODO: investigate why createNestApplication<NestExpressApplication>()
    // does not infer the correct types INestApplication<NestExpressApplication>
    // instead of INestApplication<any>
    (app as NestExpressApplication).set("query parser", "extended");

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /", () => {
    expect(true).toBe(true);
  });

  it("GET /health", async () => {
    const response = await request(app.getHttpServer()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: "OK",
      message: "Request successful",
      statusCode: 200,
      timestamp: expect.any(String),
    });
  });

  describe("Basic Routes (/basics/*)", () => {});

  describe("Names Routes (/names/*)", () => {});

  describe("Aka Routes (/basics/:id/akas/*)", () => {});

  describe("Episode Routes (/basics/:id/episodes/*)", () => {});

  describe("Crew Routes (/basics/:id/crew/*)", () => {});

  describe("Cast Routes (/basics/:id/casts/*)", () => {});
});
