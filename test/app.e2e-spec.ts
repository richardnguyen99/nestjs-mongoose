import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";

import { AppModule } from "src/app.module";
import { HttpExceptionFilter } from "src/filters/http-exception.filter";
import { ZodExceptionFilter } from "src/filters/zod-exception.filter";
import { ResponseInterceptor } from "src//interceptors/response.interceptor";
import { RequestIdInterceptor } from "src/interceptors/request-id.interceptor";
import { MongooseExceptionFilter } from "src/filters/mongoose-exception.filter";
import { MongodbExceptionFilter } from "src/filters/mongodb-exception.filter";
import { BasicsModel } from "src/basics/schema/basics.schema";
import { PrincipalsModel } from "src/principals/schema/principals.schema";
import { NamesModel } from "src/names/schema/names.schema";
import { EpisodesModel } from "src/episodes/schema/episodes.schema";
import { CrewsModel } from "src/crews/schema/crews.schema";
import { BasicCreateDto } from "src/basics/dto/basic-create.dto";
import { BasicUpdateDto } from "src/basics/dto/basic-update.dto";
import { NameCreateDto } from "src/names/dto/name-create.dto";
import { NameUpdateDto } from "src/names/dto/name-update.dto";
import { AkasModel } from "src/akas/schema/akas.schema";
import { basicStub } from "./stubs/basic";
import { nameStub } from "./stubs/name";
import { akaStub } from "./stubs/aka";
import { AkaCreateDto } from "src/akas/dto/aka-create.dto";
import { episodeStub } from "./stubs/episode";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let basicModel: Model<BasicsModel>;
  let principalModel: Model<PrincipalsModel>;
  let nameModel: Model<NamesModel>;
  let episodeModel: Model<EpisodesModel>;
  let crewModel: Model<CrewsModel>;
  let akaModel: Model<AkasModel>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      logger: false,
    });

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

    basicModel = await moduleFixture.resolve<Model<BasicsModel>>(
      getModelToken(BasicsModel.name),
    );

    principalModel = await moduleFixture.resolve<Model<PrincipalsModel>>(
      getModelToken(PrincipalsModel.name),
    );

    nameModel = await moduleFixture.resolve<Model<NamesModel>>(
      getModelToken(NamesModel.name),
    );

    episodeModel = await moduleFixture.resolve<Model<EpisodesModel>>(
      getModelToken(EpisodesModel.name),
    );

    crewModel = await moduleFixture.resolve<Model<CrewsModel>>(
      getModelToken(CrewsModel.name),
    );

    akaModel = await moduleFixture.resolve<Model<AkasModel>>(
      getModelToken(AkasModel.name),
    );
  });

  afterAll(async () => {
    basicModel.deleteMany({});
    nameModel.deleteMany({});
    akaModel.deleteMany({});
    episodeModel.deleteMany({});

    await app.close();
  });

  it("should define all injectables", () => {
    expect(basicModel).toBeDefined();
    expect(principalModel).toBeDefined();
    expect(nameModel).toBeDefined();
    expect(episodeModel).toBeDefined();
    expect(crewModel).toBeDefined();
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

  describe("Basic Routes (/basics/*)", () => {
    beforeAll(async () => {
      await basicModel.insertMany(basicStub());
    });

    it("GET /basics/:id -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt0108778",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        data: {
          _id: expect.any(String),
          tconst: "tt0108778",
          titleType: "tvSeries",
          primaryTitle: "Friends",
          originalTitle: "Friends",
          isAdult: false,
          startYear: 1994,
          endYear: 2004,
          runtimeMinutes: 22,
          genres: ["comedy", "romance"],
          imdbUrl: `https://www.imdb.com/title/tt0108778/`,
        },
        timestamp: expect.any(String),
      });
    });

    it("GET /basics/:id -> 404", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/invalid-id",
      );

      expect(response.status).toBe(404);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message: "Title with tconst=invalid-id not found",
        statusCode: 404,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {},
          params: {
            tconst: "invalid-id",
          },
          url: "/basics/invalid-id",
        },
      });
    });

    it("POST /basics/ -> 201", async () => {
      const createBasicDto: BasicCreateDto = {
        tconst: "tt1979376",
        titleType: "movie",
        primaryTitle: "Toy Story 4",
        originalTitle: "Toy Story 4",
        isAdult: false,
        startYear: 2019,
        endYear: null,
        runtimeMinutes: 100,
        genres: ["comedy", "adventure", "animation"],
      };

      const response = await request(app.getHttpServer())
        .post("/basics/")
        .send(createBasicDto)
        .set("Accept", "application/json");

      expect(response.status).toBe(201);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.headers["cache-control"]).toBe("no-store");
      expect(response.body).toEqual({
        message: "Resource created successfully",
        statusCode: 201,
        data: {
          _id: expect.any(String),
          tconst: "tt1979376",
          titleType: "movie",
          primaryTitle: "Toy Story 4",
          originalTitle: "Toy Story 4",
          isAdult: false,
          startYear: 2019,
          endYear: null,
          runtimeMinutes: 100,
          genres: ["comedy", "adventure", "animation"],
          imdbUrl: `https://www.imdb.com/title/tt1979376/`,
        },
        timestamp: expect.any(String),
      });

      expect(await basicModel.find().lean()).toHaveLength(22);
    });

    it("POST /basics/ -> 400", async () => {
      const createBasicDto: BasicCreateDto = {
        tconst: "tt1979376",
        titleType: "movie",
        primaryTitle: "Toy Story 4",
        originalTitle: "Toy Story 4",
        isAdult: false,
        startYear: 2019,
        endYear: null,
        runtimeMinutes: 100,
        genres: ["comedy", "adventure", "animation"],
      };

      const response = await request(app.getHttpServer())
        .post("/basics/")
        .send(createBasicDto)
        .set("Accept", "application/json");

      expect(response.status).toBe(409);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message: "Duplicate key error: tconst=tt1979376",
        statusCode: 409,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          params: {},
          query: {},
          url: "/basics/",
        },
      });
    });

    it("GET /basics/search?q=toy story -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=toy story",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt1979376",
            titleType: "movie",
            primaryTitle: "Toy Story 4",
            originalTitle: "Toy Story 4",
            isAdult: false,
            startYear: 2019,
            endYear: null,
            runtimeMinutes: 100,
            genres: ["comedy", "adventure", "animation"],
            imdbUrl: `https://www.imdb.com/title/tt1979376/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=oil&filter[isAdult]=true -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=oil&filter[isAdult]=true",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt1349010",
            titleType: "video",
            primaryTitle: "Oil Overload 2",
            originalTitle: "Oil Overload 2",
            isAdult: true,
            startYear: 2008,
            endYear: null,
            runtimeMinutes: null,
            genres: ["adult"],
            imdbUrl: `https://www.imdb.com/title/tt1349010/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt1481346",
            titleType: "video",
            primaryTitle: "Big Butt Oil Orgy",
            originalTitle: "Big Butt Oil Orgy",
            isAdult: true,
            startYear: 2009,
            endYear: null,
            runtimeMinutes: null,
            genres: ["adult"],
            imdbUrl: `https://www.imdb.com/title/tt1481346/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?=oil&filter[isAdult]=false -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=oil&filter[isAdult]=false",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt19843414",
            titleType: "short",
            primaryTitle: "Oil Oil Oil",
            originalTitle: "Oil Oil Oil",
            isAdult: false,
            startYear: 2023,
            endYear: null,
            runtimeMinutes: 24,
            genres: ["short"],
            imdbUrl: `https://www.imdb.com/title/tt19843414/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt34740878",
            titleType: "movie",
            primaryTitle: "Taghiev: Oil",
            originalTitle: "Taghiev: Oil",
            isAdult: false,
            startYear: 2024,
            endYear: null,
            runtimeMinutes: 120,
            genres: ["biography", "history"],
            imdbUrl: `https://www.imdb.com/title/tt34740878/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=Nord&filter[isAdult]=invalid -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=Nord&filter[isAdult]=invalid",
      );

      expect(response.status).toBe(400);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        statusCode: 400,
        requestCtx: {
          method: "GET",
          url: "/basics/search?q=Nord&filter[isAdult]=invalid",
          query: {
            q: "Nord",
            filter: {
              isAdult: "invalid",
            },
          },
          params: {},
        },
        message:
          "filter.isAdult: Invalid enum value. Expected 'true' | 'false' | '0' | '1', received 'invalid'\n",
      });
    });

    it("GET /basics/search?q=friend&filter[titleType]=movie -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=friend&filter[titleType]=movie",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt34808440",
            titleType: "movie",
            primaryTitle: "Between Friends",
            originalTitle: "Between Friends",
            isAdult: false,
            startYear: 2024,
            endYear: null,
            runtimeMinutes: 90,
            genres: ["thriller"],
            imdbUrl: `https://www.imdb.com/title/tt34808440/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=oil&filter[titleType]=movie&filter[titleType]=short -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=oil&filter[titleType]=movie&filter[titleType]=short",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt19843414",
            titleType: "short",
            primaryTitle: "Oil Oil Oil",
            originalTitle: "Oil Oil Oil",
            isAdult: false,
            startYear: 2023,
            endYear: null,
            runtimeMinutes: 24,
            genres: ["short"],
            imdbUrl: `https://www.imdb.com/title/tt19843414/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt34740878",
            titleType: "movie",
            primaryTitle: "Taghiev: Oil",
            originalTitle: "Taghiev: Oil",
            isAdult: false,
            startYear: 2024,
            endYear: null,
            runtimeMinutes: 120,
            genres: ["biography", "history"],
            imdbUrl: `https://www.imdb.com/title/tt34740878/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=endgame&filter[genre]=adventure -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=endgame&filter[genre]=adventure",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt4154796",
            titleType: "movie",
            primaryTitle: "Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2019,
            endYear: null,
            runtimeMinutes: 181,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154796/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=endgame&filter[genre]=adventure&filter[genre]=comedy -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=endgame&filter[genre]=adventure&filter[genre]=comedy",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt4154796",
            titleType: "movie",
            primaryTitle: "Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2019,
            endYear: null,
            runtimeMinutes: 181,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154796/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt16103750",
            titleType: "movie",
            primaryTitle: "Rifftrax: Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2020,
            endYear: null,
            runtimeMinutes: null,
            genres: ["sci-fi", "comedy", "action"],
            imdbUrl: `https://www.imdb.com/title/tt16103750/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=avenger&filter[since]=2019 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=avenger&filter[since]=2019",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt4154796",
            titleType: "movie",
            primaryTitle: "Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2019,
            endYear: null,
            runtimeMinutes: 181,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154796/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt16103750",
            titleType: "movie",
            primaryTitle: "Rifftrax: Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2020,
            endYear: null,
            runtimeMinutes: null,
            genres: ["sci-fi", "comedy", "action"],
            imdbUrl: `https://www.imdb.com/title/tt16103750/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=avenger&filter[since]=2018&filter[until]=2019 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=avenger&filter[since]=2018&filter[until]=2019",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt4154796",
            titleType: "movie",
            primaryTitle: "Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2019,
            endYear: null,
            runtimeMinutes: 181,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154796/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt4154756",
            titleType: "movie",
            primaryTitle: "Avengers: Infinity War",
            originalTitle: "Avengers: Infinity War",
            isAdult: false,
            startYear: 2018,
            endYear: null,
            runtimeMinutes: 149,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154756/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=Nord&filter[since]=2018&filter[until]=2017 -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=Nord&filter[since]=2018&filter[until]=2017",
      );

      expect(response.status).toBe(400);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        statusCode: 400,
        message:
          "filter.until: Filter 'until' must be greater than or equal to 'since'\n",
        requestCtx: {
          method: "GET",

          url: "/basics/search?q=Nord&filter[since]=2018&filter[until]=2017",
          params: {},
          query: {
            q: "Nord",
            filter: {
              since: "2018",
              until: "2017",
            },
          },
        },
      });
    });

    it("GET /basics/search?q=avenger&filter[duration]=short -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=avenger&filter[duration]=short",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt5592584",
            titleType: "short",
            primaryTitle: "Avenge Myself",
            originalTitle: "Avenge Myself",
            isAdult: false,
            startYear: 2016,
            endYear: null,
            runtimeMinutes: 6,
            genres: ["short", "action"],
            imdbUrl: `https://www.imdb.com/title/tt5592584/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=avenger&filter[duration]=medium -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=avenger&filter[duration]=medium",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt0083602",
            titleType: "movie",
            primaryTitle: "The Avenging",
            originalTitle: "The Avenging",
            isAdult: false,
            startYear: 1982,
            endYear: null,
            runtimeMinutes: 50,
            genres: ["western"],
            imdbUrl: `https://www.imdb.com/title/tt0083602/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=avenger&filter[duration]=long -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=avenger&filter[duration]=long",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            tconst: "tt4154796",
            titleType: "movie",
            primaryTitle: "Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2019,
            endYear: null,
            runtimeMinutes: 181,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154796/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt4154756",
            titleType: "movie",
            primaryTitle: "Avengers: Infinity War",
            originalTitle: "Avengers: Infinity War",
            isAdult: false,
            startYear: 2018,
            endYear: null,
            runtimeMinutes: 149,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154756/`,
          },
        ],
        statusCode: 200,
        message: "Request successful",
      });
    });

    it("GET /basics/search?q=avenger&filter[duration]=invalid -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=avenger&filter[duration]=invalid",
      );

      expect(response.status).toBe(400);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        statusCode: 400,
        message:
          "filter.duration: Invalid enum value. Expected 'short' | 'medium' | 'long', received 'invalid'\n",
        requestCtx: {
          method: "GET",
          url: "/basics/search?q=avenger&filter[duration]=invalid",
          params: {},
          query: {
            q: "avenger",
            filter: {
              duration: "invalid",
            },
          },
        },
      });
    });

    it("GET /basics/search?q=avenger&sort[startYear]=desc&filter[titleType]=movie&filter[startYear]=2010", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/search?q=avenger&sort[startYear]=desc&filter[titleType]=movie&filter[startYear]=2010",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        statusCode: 200,
        data: [
          {
            _id: expect.any(String),
            tconst: "tt0083602",
            titleType: "movie",
            primaryTitle: "The Avenging",
            originalTitle: "The Avenging",
            isAdult: false,
            startYear: 1982,
            endYear: null,
            runtimeMinutes: 50,
            genres: ["western"],
            imdbUrl: `https://www.imdb.com/title/tt0083602/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt4154796",
            titleType: "movie",
            primaryTitle: "Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2019,
            endYear: null,
            runtimeMinutes: 181,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154796/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt16103750",
            titleType: "movie",
            primaryTitle: "Rifftrax: Avengers: Endgame",
            originalTitle: "Avengers: Endgame",
            isAdult: false,
            startYear: 2020,
            endYear: null,
            runtimeMinutes: null,
            genres: ["sci-fi", "comedy", "action"],
            imdbUrl: `https://www.imdb.com/title/tt16103750/`,
          },
          {
            _id: expect.any(String),
            tconst: "tt4154756",
            titleType: "movie",
            primaryTitle: "Avengers: Infinity War",
            originalTitle: "Avengers: Infinity War",
            isAdult: false,
            startYear: 2018,
            endYear: null,
            runtimeMinutes: 149,
            genres: ["sci-fi", "adventure", "action"],
            imdbUrl: `https://www.imdb.com/title/tt4154756/`,
          },
        ],
        message: "Request successful",
      });
    });

    it("PUT /basics/:id -> 200", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt0067098")
        .send({
          titleType: "tvSeries",
          startYear: 1978,
        } as BasicUpdateDto);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        message: "Resource updated successfully",
        statusCode: 200,
        data: {
          _id: expect.any(String),
          tconst: "tt0067098",
          titleType: "tvSeries",
          primaryTitle: "Willi Forst",
          originalTitle: "Willi Forst",
          isAdult: false,
          startYear: 1978,
          endYear: null,
          runtimeMinutes: 55,
          genres: [],
        },
      });
    });

    it("PUT /basics/:id -> 404", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/invalid-id")
        .send({
          startYear: 1978,
        } as BasicUpdateDto);

      expect(response.status).toBe(404);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message: "Document not found",
        statusCode: 404,
        timestamp: expect.any(String),
        requestCtx: {
          method: "PUT",
          query: {},
          params: {
            tconst: "invalid-id",
          },
          url: "/basics/invalid-id",
        },
      });
    });

    it("PUT /basics/:id (with too many genres) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt0067098")
        .send({
          genres: ["something-1", "something-2", "something-3", "something-4"],
        } as BasicUpdateDto);

      expect(response.status).toBe(400);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message: "genres: Genres can only store up to 3 items\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "PUT",
          query: {},
          params: {
            tconst: "tt0067098",
          },
          url: "/basics/tt0067098",
        },
      });
    });

    it("PUT /basics/:id (with invalid start-end year range) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt0067098")
        .send({
          startYear: 2025,
          endYear: 2020,
        });

      expect(response.status).toBe(400);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message:
          "(Validation Error) startYear-endYear: endYear cannot be before startYear. Received startYear=2025 and endYear=2020",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "PUT",
          query: {},
          params: {
            tconst: "tt0067098",
          },
          url: "/basics/tt0067098",
        },
      });
    });

    it("PUT /basics/:id (with invalid title type and end year) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt0067098")
        .send({
          titleType: "movie",
          endYear: 2020,
        });

      expect(response.status).toBe(400);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message:
          "(Validation Error) titleType-endYear: Specific endYear must be specified for TV Series or Mini Series. Received endYear=2020 and titleType=movie",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "PUT",
          query: {},
          params: {
            tconst: "tt0067098",
          },
          url: "/basics/tt0067098",
        },
      });
    });

    it("DELETE /basics/:id -> 204", async () => {
      const response = await request(app.getHttpServer()).delete(
        "/basics/tt0067098",
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      expect(await basicModel.find().lean()).toHaveLength(21);
    });

    it("DELETE /basics/:id -> 404", async () => {
      const response = await request(app.getHttpServer()).delete(
        "/basics/tt0067098",
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Title with tconst=tt0067098 not found",
        statusCode: 404,
        timestamp: expect.any(String),
        requestCtx: {
          method: "DELETE",
          query: {},
          params: {
            tconst: "tt0067098",
          },
          url: "/basics/tt0067098",
        },
      });

      expect(await basicModel.find().lean()).toHaveLength(21);
    });
  });

  describe("Names Routes (/names/*)", () => {
    beforeAll(() => {
      nameModel.insertMany(nameStub());
    });

    it("GET /names/ -> 200", async () => {
      const response = await request(app.getHttpServer()).get("/names/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "Request successful",
        timestamp: expect.any(String),
        data: expect.any(Array),
      });
    });

    it("GET /names/:id -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/nm0001435",
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        data: {
          _id: expect.any(String),
          nconst: "nm0001435",
          primaryName: "Lisa Kudrow",
          birthYear: 1963,
          deathYear: null,
          primaryProfession: ["actress", "producer", "writer"],
          knownForTitles: ["tt0108778", "tt0434672", "tt0120777", "tt1282140"],
        },
        timestamp: expect.any(String),
      });
    });

    it("GET /names/:id -> 404", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/nm0009999",
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Name with nconst=nm0009999 not found",
        statusCode: 404,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {},
          params: {
            nconst: "nm0009999",
          },
          url: "/names/nm0009999",
        },
      });
    });

    it("POST /names/ -> 201", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: null,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        } as NameCreateDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Resource created successfully",
        statusCode: 201,
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: null,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        },
      });
    });

    it("POST /names/ -> 409", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: null,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        } as NameCreateDto);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        message: "Duplicate key error: nconst=nm1234567",
        statusCode: 409,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with missing nconst) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          primaryName: "Test Name",
          birthYear: null,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "nconst: Required\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with empty string nconst) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "",
          primaryName: "Test Name",
          birthYear: null,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "nconst: must contain at least 1 non-whitespace character\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with missing primary name) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          birthYear: null,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "primaryName: Required\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with empty primary name) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "",
          birthYear: null,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          "primaryName: must contain at least 1 non-whitespace character\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with invalid birthYear) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: "invalid",
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "birthYear: must be a valid year\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with non-int birthYear) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1999.09,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "birthYear: must be an integer\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with invalid deathYear) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1990,
          deathYear: "invalid",
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "deathYear: must be a valid year\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with non-int deathYear) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1990,
          deathYear: 2020.5,
          primaryProfession: ["actor"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "deathYear: must be an integer\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with non-array primaryProfession) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1990,
          deathYear: null,
          primaryProfession: "actor",
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "primaryProfession: must be an array of strings\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with empty primaryProfession) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1990,
          deathYear: null,
          primaryProfession: ["   "],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "primaryProfession.0: must be a non-empty string\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with more than 3 items in primaryProfession) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1990,
          deathYear: null,
          primaryProfession: ["actor", "producer", "director", "writer"],
          knownForTitles: ["tt1234567"],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "primaryProfession: can only store up to 3 items\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with non-array titles) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1990,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: "tt1234567",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "knownForTitles: must be an array of strings\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("POST /names (with empty string in knownForTitles) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/names")
        .send({
          nconst: "nm1234567",
          primaryName: "Test Name",
          birthYear: 1990,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["   "],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "knownForTitles.0: must be a non-empty string\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "POST",
          query: {},
          params: {},
          url: "/names",
        },
      });
    });

    it("PUT /names/:nconst -> 200", async () => {
      const response = await request(app.getHttpServer())
        .put("/names/nm1234567")
        .send({
          nconst: "nm1234567",
          primaryName: "Gianna Michaels",
          birthYear: 1983,
          deathYear: null,
          primaryProfession: ["actress"],
          knownForTitles: ["tt1468012"],
        } as NameUpdateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Resource updated successfully",
        statusCode: 200,
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          nconst: "nm1234567",
          primaryName: "Gianna Michaels",
          birthYear: 1983,
          deathYear: null,
          primaryProfession: ["actress"],
          knownForTitles: ["tt1468012"],
        },
      });
    });

    it("PUT /names/:nconst -> 404", async () => {
      const response = await request(app.getHttpServer())
        .put("/names/nm9999999")
        .send({
          primaryName: "Non Existent Name",
          birthYear: 1990,
          deathYear: null,
          primaryProfession: ["actor"],
          knownForTitles: ["tt9999999"],
        } as NameUpdateDto);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Name with nconst=nm9999999 not found",
        statusCode: 404,
        timestamp: expect.any(String),
        requestCtx: {
          method: "PUT",
          query: {},
          params: {
            nconst: "nm9999999",
          },
          url: "/names/nm9999999",
        },
      });
    });

    it("DELETE /names/:nconst -> 204", async () => {
      const response = await request(app.getHttpServer()).delete(
        "/names/nm1234567",
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      expect(await nameModel.find().lean()).toHaveLength(11);
    });

    it("DELETE /names/:nconst -> 404", async () => {
      const response = await request(app.getHttpServer()).delete(
        "/names/nm1234567",
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Name with nconst=nm1234567 not found",
        statusCode: 404,
        timestamp: expect.any(String),
        requestCtx: {
          method: "DELETE",
          query: {},
          params: {
            nconst: "nm1234567",
          },
          url: "/names/nm1234567",
        },
      });
    });

    it("GET /names/search?q=jennifer -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=jennifer",
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Request successful");
      expect(response.body.statusCode).toBe(200);
      expect(response.body.timestamp).toEqual(expect.any(String));
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);

      const expected = [
        {
          _id: expect.any(String),
          nconst: "nm0000098",
          primaryName: "Jennifer Aniston",
          birthYear: 1969,
          deathYear: null,
          primaryProfession: ["actress", "producer", "director"],
          knownForTitles: ["tt0108778", "tt3442006", "tt1723121", "tt0279113"],
        },
        {
          _id: expect.any(String),
          nconst: "nm0000124",
          primaryName: "Jennifer Connelly",
          birthYear: 1970,
          deathYear: null,
          primaryProfession: ["actress", "producer", "visual_effects"],
          knownForTitles: ["tt0268978", "tt0315983", "tt0286716", "tt0180093"],
        },
        {
          _id: expect.any(String),
          nconst: "nm2225369",
          primaryName: "Jennifer Lawrence",
          birthYear: 1990,
          deathYear: null,
          primaryProfession: ["actress", "producer", "writer"],
          knownForTitles: ["tt1392170", "tt1045658", "tt1800241", "tt1270798"],
        },
      ];

      const sortByNconst = (a: any, b: any) => a.nconst.localeCompare(b.nconst);
      const actualSorted = response.body.data.slice().sort(sortByNconst);
      const expectedSorted = expected.slice().sort(sortByNconst);

      expect(actualSorted).toEqual(expectedSorted);
    });

    it("GET /names/search?q=robert&limit=1 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&limit=1",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm9586104",
            primaryName: "Robert Turner",
            birthYear: 1920,
            deathYear: 2012,
            primaryProfession: ["composer"],
            knownForTitles: ["tt0219242", "tt5656204", "tt28312418"],
          },
        ],
      });
    });

    it("GET /names/search?q=robert&limit=something -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&limit=something",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "limit: must be a valid integer\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "robert",
            limit: "something",
          },
          params: {},
          url: "/names/search?q=robert&limit=something",
        },
      });
    });

    it("GET /names/search?q=robert&limit=0 -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&limit=0",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "limit: must be at least 1\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "robert",
            limit: "0",
          },
          params: {},
          url: "/names/search?q=robert&limit=0",
        },
      });
    });

    it("GET /names/search?q=robert&page=2&limit=1 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&page=2&limit=1",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0000134",
            primaryName: "Robert De Niro",
            birthYear: 1943,
            deathYear: null,
            primaryProfession: ["actor", "producer", "director"],
            knownForTitles: [
              "tt0101540",
              "tt0081398",
              "tt1302006",
              "tt0077416",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=robert&page=something&limit=1 -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&page=something&limit=1",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "page: must be a valid integer\n",
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "robert",
            page: "something",
            limit: "1",
          },
          params: {},
          url: "/names/search?q=robert&page=something&limit=1",
        },
      });
    });

    it("GET /names/search?q=robert&page=0&limit=1 -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&page=0&limit=1",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "page: must be at least 1\n",
        requestCtx: {
          method: "GET",
          query: {
            q: "robert",
            page: "0",
            limit: "1",
          },
          params: {},
          url: "/names/search?q=robert&page=0&limit=1",
        },
      });
    });

    it("GET /names/search?q=lisa&filter[profession]=writer -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[profession]=writer",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0001435",
            primaryName: "Lisa Kudrow",
            birthYear: 1963,
            deathYear: null,
            primaryProfession: ["actress", "producer", "writer"],
            knownForTitles: [
              "tt0108778",
              "tt0434672",
              "tt0120777",
              "tt1282140",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=lisa&filter[profession]=director&filter[profession]=writer -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[profession]=director&filter[profession]=writer",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0030217",
            primaryName: "Lisa Ann",
            birthYear: 1972,
            deathYear: null,
            primaryProfession: ["actress", "producer", "director"],
            knownForTitles: [
              "tt1310622",
              "tt3356664",
              "tt3599774",
              "tt1349010",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0001435",
            primaryName: "Lisa Kudrow",
            birthYear: 1963,
            deathYear: null,
            primaryProfession: ["actress", "producer", "writer"],
            knownForTitles: [
              "tt0108778",
              "tt0434672",
              "tt0120777",
              "tt1282140",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=lisa&filter[profession]= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[profession]=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "filter.profession: Profession must be a non-empty string\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "lisa",
            filter: {
              profession: "",
            },
          },
          params: {},
          url: "/names/search?q=lisa&filter[profession]=",
        },
      });
    });

    it("GET /names/search?q=lisa&filter[profession]=director&filter[profession]= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[profession]=director&filter[profession]=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "filter.profession.1: Profession must be a non-empty string\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "lisa",
            filter: {
              profession: ["director", ""],
            },
          },
          params: {},
          url: "/names/search?q=lisa&filter[profession]=director&filter[profession]=",
        },
      });
    });

    it("GET /names/search?q=lisa&filter[profession]=director&filter[profession]=writer&filter[profession]=actress&filter[profession]=actor -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[profession]=director&filter[profession]=writer&filter[profession]=actress&filter[profession]=actor",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "filter.profession: Profession array contains up to 3 items\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "lisa",
            filter: {
              profession: ["director", "writer", "actress", "actor"],
            },
          },
          params: {},
          url: "/names/search?q=lisa&filter[profession]=director&filter[profession]=writer&filter[profession]=actress&filter[profession]=actor",
        },
      });
    });

    it("GET /names/search?q=lisa&filter[appearInTitles]=tt1310622 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[appearInTitles]=tt1310622",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0030217",
            primaryName: "Lisa Ann",
            birthYear: 1972,
            deathYear: null,
            primaryProfession: ["actress", "producer", "director"],
            knownForTitles: [
              "tt1310622",
              "tt3356664",
              "tt3599774",
              "tt1349010",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=ann&filter[appearInTitles]=tt1310622&filter[appearInTitles]=tt1349010 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=ann&filter[appearInTitles]=tt1310622&filter[appearInTitles]=tt1349010",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0030217",
            primaryName: "Lisa Ann",
            birthYear: 1972,
            deathYear: null,
            primaryProfession: ["actress", "producer", "director"],
            knownForTitles: [
              "tt1310622",
              "tt3356664",
              "tt3599774",
              "tt1349010",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0030214",
            primaryName: "Julia Ann Tavella",
            birthYear: 1969,
            deathYear: null,
            primaryProfession: [
              "actress",
              "make_up_department",
              "miscellaneous",
            ],
            knownForTitles: [
              "tt0104415",
              "tt0408558",
              "tt0189184",
              "tt1349010",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=ann&filter[appearInTitles]= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=ann&filter[appearInTitles]=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "filter.appearInTitles: Title must be a non-empty string\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "ann",
            filter: {
              appearInTitles: "",
            },
          },
          params: {},
          url: "/names/search?q=ann&filter[appearInTitles]=",
        },
      });
    });

    it("GET /names/search?q=ann&filter[appearInTitles]=tt1349010&filter[appearInTitles]= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=ann&filter[appearInTitles]=tt1349010&filter[appearInTitles]=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "filter.appearInTitles.1: Title must be a non-empty string\n",
        statusCode: 400,
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          query: {
            q: "ann",
            filter: {
              appearInTitles: ["tt1349010", ""],
            },
          },
          params: {},
          url: "/names/search?q=ann&filter[appearInTitles]=tt1349010&filter[appearInTitles]=",
        },
      });
    });

    it("GET /names/search?q=robert&filter[alive]=true -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&filter[alive]=true",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0000134",
            primaryName: "Robert De Niro",
            birthYear: 1943,
            deathYear: null,
            primaryProfession: ["actor", "producer", "director"],
            knownForTitles: [
              "tt0101540",
              "tt0081398",
              "tt1302006",
              "tt0077416",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0000375",
            primaryName: "Robert Downey Jr.",
            birthYear: 1965,
            deathYear: null,
            primaryProfession: ["actor", "producer", "writer"],
            knownForTitles: [
              "tt0371746",
              "tt1300854",
              "tt0988045",
              "tt4154796",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=robert&filter[alive]=1 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&filter[alive]=1",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0000134",
            primaryName: "Robert De Niro",
            birthYear: 1943,
            deathYear: null,
            primaryProfession: ["actor", "producer", "director"],
            knownForTitles: [
              "tt0101540",
              "tt0081398",
              "tt1302006",
              "tt0077416",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0000375",
            primaryName: "Robert Downey Jr.",
            birthYear: 1965,
            deathYear: null,
            primaryProfession: ["actor", "producer", "writer"],
            knownForTitles: [
              "tt0371746",
              "tt1300854",
              "tt0988045",
              "tt4154796",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=robert&filter[alive]=false -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&filter[alive]=false",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm9586104",
            primaryName: "Robert Turner",
            birthYear: 1920,
            deathYear: 2012,
            primaryProfession: ["composer"],
            knownForTitles: ["tt0219242", "tt5656204", "tt28312418"],
          },
        ],
      });
    });

    it("GET /names/search?q=robert&filter[alive]=0 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&filter[alive]=0",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm9586104",
            primaryName: "Robert Turner",
            birthYear: 1920,
            deathYear: 2012,
            primaryProfession: ["composer"],
            knownForTitles: ["tt0219242", "tt5656204", "tt28312418"],
          },
        ],
      });
    });

    it("GET /names/search?q=robert&filter[alive]=something -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=robert&filter[alive]=something",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message:
          "filter.alive: must be a boolean-ish value ([true, false, 0, 1])\n",
        requestCtx: {
          params: {},
          query: {
            q: "robert",
            filter: {
              alive: "something",
            },
          },
          method: "GET",
          url: "/names/search?q=robert&filter[alive]=something",
        },
      });
    });

    it("GET /names/search?q=lisa&filter[from]=1960 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[from]=1960",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Request successful",
        statusCode: 200,
        timestamp: expect.any(String),
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0030217",
            primaryName: "Lisa Ann",
            birthYear: 1972,
            deathYear: null,
            primaryProfession: ["actress", "producer", "director"],
            knownForTitles: [
              "tt1310622",
              "tt3356664",
              "tt3599774",
              "tt1349010",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0001435",
            primaryName: "Lisa Kudrow",
            birthYear: 1963,
            deathYear: null,
            primaryProfession: ["actress", "producer", "writer"],
            knownForTitles: [
              "tt0108778",
              "tt0434672",
              "tt0120777",
              "tt1282140",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=lisa&filter[from]=something -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&filter[from]=something",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "filter.from: must be a valid integer\n",
        requestCtx: {
          params: {},
          query: {
            q: "lisa",
            filter: {
              from: "something",
            },
          },
          method: "GET",
          url: "/names/search?q=lisa&filter[from]=something",
        },
      });
    });

    it("GET /names/search?q=lisa&sort[birthYear]=asc -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&sort[birthYear]=asc",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0672668",
            primaryName: "Lisa Pera",
            birthYear: 1940,
            deathYear: 2013,
            primaryProfession: ["actress", "miscellaneous", "sound_department"],
            knownForTitles: [
              "tt0372183",
              "tt0108757",
              "tt0120794",
              "tt0116704",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0001435",
            primaryName: "Lisa Kudrow",
            birthYear: 1963,
            deathYear: null,
            primaryProfession: ["actress", "producer", "writer"],
            knownForTitles: [
              "tt0108778",
              "tt0434672",
              "tt0120777",
              "tt1282140",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0030217",
            primaryName: "Lisa Ann",
            birthYear: 1972,
            deathYear: null,
            primaryProfession: ["actress", "producer", "director"],
            knownForTitles: [
              "tt1310622",
              "tt3356664",
              "tt3599774",
              "tt1349010",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=lisa&sort[birthYear]=desc -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&sort[birthYear]=desc",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: [
          {
            _id: expect.any(String),
            nconst: "nm0030217",
            primaryName: "Lisa Ann",
            birthYear: 1972,
            deathYear: null,
            primaryProfession: ["actress", "producer", "director"],
            knownForTitles: [
              "tt1310622",
              "tt3356664",
              "tt3599774",
              "tt1349010",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0001435",
            primaryName: "Lisa Kudrow",
            birthYear: 1963,
            deathYear: null,
            primaryProfession: ["actress", "producer", "writer"],
            knownForTitles: [
              "tt0108778",
              "tt0434672",
              "tt0120777",
              "tt1282140",
            ],
          },
          {
            _id: expect.any(String),
            nconst: "nm0672668",
            primaryName: "Lisa Pera",
            birthYear: 1940,
            deathYear: 2013,
            primaryProfession: ["actress", "miscellaneous", "sound_department"],
            knownForTitles: [
              "tt0372183",
              "tt0108757",
              "tt0120794",
              "tt0116704",
            ],
          },
        ],
      });
    });

    it("GET /names/search?q=lisa&sort[birthYear]=something -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&sort[birthYear]=something",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message:
          "sort.birthYear: Invalid enum value. Expected 'asc' | 'desc', received 'something'\n",
        requestCtx: {
          method: "GET",
          url: "/names/search?q=lisa&sort[birthYear]=something",
          params: {},
          query: {
            q: "lisa",
            sort: {
              birthYear: "something",
            },
          },
        },
      });
    });

    it("GET /names/search&q=lisa&sort[birthYear]=something&limit=5&filter[alive]=something -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/names/search?q=lisa&sort[birthYear]=something&limit=5&filter[alive]=something",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message:
          "filter.alive: must be a boolean-ish value ([true, false, 0, 1])\n\
sort.birthYear: Invalid enum value. Expected 'asc' | 'desc', received 'something'\n",
        requestCtx: {
          method: "GET",
          url: "/names/search?q=lisa&sort[birthYear]=something&limit=5&filter[alive]=something",
          params: {},
          query: {
            q: "lisa",
            sort: {
              birthYear: "something",
            },
            limit: "5",
            filter: {
              alive: "something",
            },
          },
        },
      });
    });
  });

  describe("Aka Routes (/basics/:id/akas/*)", () => {
    beforeAll(async () => {
      await akaModel.insertMany(akaStub());
    });

    it("GET /basics/:id/akas -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 5,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 1,
              title: "Avengers: Endgame",
              region: null,
              language: null,
              types: "original",
              attributes: null,
              isOriginalTitle: true,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 2,
              title: "Avengers: Endgame",
              region: "AE",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 3,
              title: "Avengers: Endgame",
              region: "AR",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 4,
              title: "Avengers: Phase finale",
              region: "CA",
              language: "fr",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 5,
              title: "Мстители: Финал",
              region: "KZ",
              language: "ru",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas -> 404", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt9999999/akas",
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        timestamp: expect.any(String),
        message: "No akas found for tconst=tt9999999",
        requestCtx: {
          method: "GET",
          url: "/basics/tt9999999/akas",
          params: {
            tconst: "tt9999999",
          },
          query: {},
        },
      });
    });

    it("GET /basics/:id/akas?limit=2 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?limit=2",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 2,
          totalCount: 5,
          totalPages: 3,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 1,
              title: "Avengers: Endgame",
              region: null,
              language: null,
              types: "original",
              attributes: null,
              isOriginalTitle: true,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 2,
              title: "Avengers: Endgame",
              region: "AE",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?limit=10 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?limit=10",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 5,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 1,
              title: "Avengers: Endgame",
              region: null,
              language: null,
              types: "original",
              attributes: null,
              isOriginalTitle: true,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 2,
              title: "Avengers: Endgame",
              region: "AE",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 3,
              title: "Avengers: Endgame",
              region: "AR",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 4,
              title: "Avengers: Phase finale",
              region: "CA",
              language: "fr",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 5,
              title: "Мстители: Финал",
              region: "KZ",
              language: "ru",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?limit=0 -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?limit=0",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "limit: must be at least 1\n",
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?limit=0",
          query: {
            limit: "0",
          },
          params: {
            tconst: "tt4154796",
          },
        },
      });
    });

    it("GET /basics/:id/akas?limit=invalid -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?limit=invalid",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "limit: must be a valid integer\n",
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?limit=invalid",
          query: {
            limit: "invalid",
          },
          params: {
            tconst: "tt4154796",
          },
        },
      });
    });

    it("GET /basics/:id/akas?limit=3&page=2 -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?limit=3&page=2",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 2,
          perPage: 3,
          totalCount: 5,
          totalPages: 2,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 4,
              title: "Avengers: Phase finale",
              region: "CA",
              language: "fr",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 5,
              title: "Мстители: Финал",
              region: "KZ",
              language: "ru",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?limit=10&page=1 -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?limit=10&page=2",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "Current page 2 exceeds total pages 1",
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?limit=10&page=2",
          params: {
            tconst: "tt4154796",
          },
          query: {
            limit: "10",
            page: "2",
          },
        },
      });
    });

    it("GET /basics/:id/akas?page=0 -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?page=0",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "page: must be at least 1\n",
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?page=0",
          params: {
            tconst: "tt4154796",
          },
          query: {
            page: "0",
          },
        },
      });
    });

    it("GET /basics/:id/akas?page=invalid -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?page=invalid",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "page: must be a valid integer\n",
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?page=invalid",
          params: {
            tconst: "tt4154796",
          },
          query: {
            page: "invalid",
          },
        },
      });
    });

    it("GET /basics/:id/akas?region=CA -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?region=CA",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 1,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 4,
              title: "Avengers: Phase finale",
              region: "CA",
              language: "fr",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?region= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?region=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "region: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?region=",
          params: {
            tconst: "tt4154796",
          },
          query: {
            region: "",
          },
        },
      });
    });

    it("GET /basics/:id/akas?language=ru -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?language=ru",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 1,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 5,
              title: "Мстители: Финал",
              region: "KZ",
              language: "ru",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?language= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?language=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "language: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?language=",
          params: {
            tconst: "tt4154796",
          },
          query: {
            language: "",
          },
        },
      });
    });

    it("GET /basics/:id/akas?types=imdbDisplay -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?types=imdbDisplay",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 4,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 2,
              title: "Avengers: Endgame",
              region: "AE",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 3,
              title: "Avengers: Endgame",
              region: "AR",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 4,
              title: "Avengers: Phase finale",
              region: "CA",
              language: "fr",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 5,
              title: "Мстители: Финал",
              region: "KZ",
              language: "ru",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?types=original&types=imdbDisplay -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?types=original&types=imdbDisplay",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 5,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 1,
              title: "Avengers: Endgame",
              region: null,
              language: null,
              types: "original",
              attributes: null,
              isOriginalTitle: true,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 2,
              title: "Avengers: Endgame",
              region: "AE",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 3,
              title: "Avengers: Endgame",
              region: "AR",
              language: null,
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 4,
              title: "Avengers: Phase finale",
              region: "CA",
              language: "fr",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154796",
              ordering: 5,
              title: "Мстители: Финал",
              region: "KZ",
              language: "ru",
              types: "imdbDisplay",
              attributes: null,
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?types= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?types=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "types: must be a non-empty string\n",
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?types=",
          params: {
            tconst: "tt4154796",
          },
          query: {
            types: "",
          },
        },
      });
    });

    it("GET /basics/:id/akas?types=original&types= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154796/akas?types=original&types=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "types.1: must be a non-empty string\n",
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154796/akas?types=original&types=",
          params: {
            tconst: "tt4154796",
          },
          query: {
            types: ["original", ""],
          },
        },
      });
    });

    it("GET /basics/:id/akas?attributes=short title -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154756/akas?attributes=short title",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 1,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154756",
              ordering: 4,
              title: "Avengers: Infinity War",
              region: "UY",
              language: null,
              types: null,
              attributes: "short title",
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?attributes=translated title&attributes=original -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154756/akas?attributes=translated title&attributes=short title",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Request successful",
        data: {
          currentPage: 1,
          perPage: 10,
          totalCount: 2,
          totalPages: 1,
          results: [
            {
              _id: expect.any(String),
              titleId: "tt4154756",
              ordering: 4,
              title: "Avengers: Infinity War",
              region: "UY",
              language: null,
              types: null,
              attributes: "short title",
              isOriginalTitle: false,
            },
            {
              _id: expect.any(String),
              titleId: "tt4154756",
              ordering: 5,
              title: "Avengers: Cuộc Chiến Vô Cực",
              region: "VN",
              language: null,
              types: "imdbDisplay",
              attributes: "translated title",
              isOriginalTitle: false,
            },
          ],
        },
      });
    });

    it("GET /basics/:id/akas?attributes= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154756/akas?attributes=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "attributes: must be a non-empty string\n",
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154756/akas?attributes=",
          params: {
            tconst: "tt4154756",
          },
          query: {
            attributes: "",
          },
        },
      });
    });

    it("GET /basics/:id/akas?attributes=short title&attributes= -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt4154756/akas?attributes=short title&attributes=",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        timestamp: expect.any(String),
        message: "attributes.1: must be a non-empty string\n",
        requestCtx: {
          method: "GET",
          url: "/basics/tt4154756/akas?attributes=short%20title&attributes=",
          params: {
            tconst: "tt4154756",
          },
          query: {
            attributes: ["short title", ""],
          },
        },
      });
    });

    it("POST /basics/:id/akas -> 201", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          ordering: 14,
          title: "Avengers: Infinity War",
          region: "ID",
          language: "en",
          types: null,
          attributes: null,
          isOriginalTitle: false,
        } as AkaCreateDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        message: "Resource created successfully",
        statusCode: 201,
        data: {
          _id: expect.any(String),
          titleId: "tt4154756",
          ordering: 6,
          title: "Avengers: Infinity War",
          region: "ID",
          language: "en",
          types: null,
          attributes: null,
          isOriginalTitle: false,
        },
      });
    });

    it("POST /basics/:id/akas (with multiple types and attributes) -> 201", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          ordering: 7,
          title: "Avengers: Infinity War",
          region: "ID",
          language: "en",
          types: ["imdbDisplay", "alternative"],
          attributes: ["short title", "informal"],
          isOriginalTitle: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        message: "Resource created successfully",
        statusCode: 201,
        data: {
          _id: expect.any(String),
          titleId: "tt4154756",
          ordering: 7,
          title: "Avengers: Infinity War",
          region: "ID",
          language: "en",
          types: "imdbDisplay,alternative",
          attributes: "short title,informal",
          isOriginalTitle: false,
        },
      });
    });

    it("POST /basics/:id/akas (with null fields) -> 201", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          title: "Avengers: Infinity War - Part I",
          region: null,
          language: null,
          types: null,
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        message: "Resource created successfully",
        statusCode: 201,
        data: {
          _id: expect.any(String),
          titleId: "tt4154756",
          title: "Avengers: Infinity War - Part I",
          region: null,
          language: null,
          types: null,
          attributes: null,
          isOriginalTitle: false,
          ordering: 8,
        },
      });
    });

    it("POST /basics/:id/akas (with missing title field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          region: null,
          language: null,
          types: null,
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "title: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid title field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          title: 999,
          region: "AT",
          language: null,
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "title: must be a string type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with blank string title field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          ordering: 35,
          title: "   ",
          region: "AT",
          language: null,
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "title: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with missing region field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          title: "Avengers: Infinity War - Part I",
          language: null,
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "region: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid region field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: 3333,
          title: "Avengers: Infinity War - Part I",
          language: null,
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "region: must be a string or null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with blank region field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "        ",
          title: "Avengers: Infinity War - Part I",
          language: null,
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "region: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with missing language field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: null,
          title: "Avengers: Infinity War - Part I",
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "language: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid language field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: null,
          language: 9999,
          title: "Avengers: Infinity War - Part I",
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "language: must be a string or null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with blank language field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: null,
          language: "      ",
          title: "Avengers: Infinity War - Part I",
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "language: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with blank language field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: null,
          language: "      ",
          title: "Avengers: Infinity War - Part I",
          types: ["imdbDisplay"],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "language: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with missing types field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "types: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid types field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: "something",
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "types: must be an array of strings or null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid items in types field) -> 400", async () => {
      const response1 = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something", 1],
          attributes: null,
          isOriginalTitle: false,
        });

      const response2 = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something", null],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response1.status).toBe(400);
      expect(response1.body).toEqual({
        statusCode: 400,
        message: "types.1: must be a string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
      expect(response2.status).toBe(400);
      expect(response2.body).toEqual({
        statusCode: 400,
        message: "types.1: must be a string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with blank items in types field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something", "    "],
          attributes: null,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "types.1: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with missing attributes field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something"],
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "attributes: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid attributes field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something"],
          attributes: 39999,
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "attributes: must be an array of strings or null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid items in attributes field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something"],
          attributes: ["short title", 1],
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "attributes.1: must be a string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with blank items in attributes field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something"],
          attributes: ["short title", "     "],
          isOriginalTitle: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "attributes.1: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with missing isOriginalTitle field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something"],
          attributes: null,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "isOriginalTitle: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("POST /basics/:id/akas (with invalid type isOriginalTitle field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt4154756/akas")
        .send({
          titleId: "tt4154756",
          region: "US",
          language: "en",
          title: "Avengers: Infinity War - Part I",
          types: ["something"],
          attributes: null,
          isOriginalTitle: "not a boolean",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "isOriginalTitle: must be a boolean\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "POST",
          url: "/basics/tt4154756/akas",
        },
      });
    });

    it("PUT /basics/:id/akas/:ordering -> 200", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt4154756/akas/8")
        .send({
          region: "UK",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Resource updated successfully",
        data: {
          _id: expect.any(String),
          titleId: "tt4154756",
          ordering: 8,
          title: "Avengers: Infinity War - Part I",
          region: "UK",
          language: null,
          types: null,
          attributes: null,
          isOriginalTitle: false,
        },
      });
    });

    it("PUT /basics/:id/akas/:ordering (with multiple fields) -> 200", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt4154756/akas/8")
        .send({
          region: null,
          language: "en",
          attributes: ["short title", "alternative"],
          types: ["imdbDisplay"],
          isOriginalTitle: false,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        timestamp: expect.any(String),
        message: "Resource updated successfully",
        data: {
          _id: expect.any(String),
          titleId: "tt4154756",
          ordering: 8,
          title: "Avengers: Infinity War - Part I",
          region: null,
          language: "en",
          types: "imdbDisplay",
          attributes: "short title,alternative",
          isOriginalTitle: false,
        },
      });
    });

    it("PUT /basics/:id/akas/:ordering -> 404", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt4154756/akas/999")
        .send({
          region: null,
          language: "en",
          attributes: ["short title", "alternative"],
          types: ["imdbDisplay"],
          isOriginalTitle: false,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        timestamp: expect.any(String),
        message: "No aka found for tconst=tt4154756 and ordering=999",
        requestCtx: {
          params: {
            tconst: "tt4154756",
            ordering: "999",
          },
          query: {},
          method: "PUT",
          url: "/basics/tt4154756/akas/999",
        },
      });
    });

    it("DELETE /basics/:id/akas/:ordering -> 204", async () => {
      const response = await request(app.getHttpServer()).delete(
        "/basics/tt4154756/akas/8",
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const totalAkas = await akaModel.countDocuments({ titleId: "tt4154756" });
      expect(totalAkas).toBe(7);
    });

    it("DELETE /basics/:id/akas/:ordering -> 404", async () => {
      const response = await request(app.getHttpServer()).delete(
        "/basics/tt4154756/akas/8",
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        timestamp: expect.any(String),
        message: "No aka found for tconst=tt4154756 and ordering=8",
        requestCtx: {
          params: {
            tconst: "tt4154756",
            ordering: "8",
          },
          query: {},
          method: "DELETE",
          url: "/basics/tt4154756/akas/8",
        },
      });
    });
  });

  describe("Episode Routes (/basics/:id/episodes/*)", () => {
    beforeAll(async () => {
      await episodeModel.insertMany(episodeStub());
    });

    it("GET /basics/:id/episodes -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        "/basics/tt0108778/episodes",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "Request successful",
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          tconst: "tt0108778",
          title: "Friends",
          titleType: "tvSeries",
          totalEpisodes: 5,
          totalSeasons: 2,
          seasons: [
            {
              season: 1,
              episodes: [
                {
                  tconst: "tt0583459",
                  titleType: "tvEpisode",
                  primaryTitle: "The One Where Monica Gets a Roommate",
                  originalTitle: "The One Where Monica Gets a Roommate",
                  isAdult: false,
                  startYear: 1994,
                  endYear: null,
                  runtimeMinutes: 22,
                  genres: ["comedy", "romance"],
                  imdbUrl:
                    "https://www.imdb.com/title/tt0583459/?ref_=fn_al_tt_1",
                  episodeNumber: 1,
                },
                {
                  tconst: "tt0583647",
                  titleType: "tvEpisode",
                  primaryTitle: "The One with the Sonogram at the End",
                  originalTitle: "The One with the Sonogram at the End",
                  isAdult: false,
                  startYear: 1994,
                  endYear: null,
                  runtimeMinutes: 22,
                  genres: ["comedy", "romance"],
                  imdbUrl:
                    "https://www.imdb.com/title/tt0583647/?ref_=fn_al_tt_1",
                  episodeNumber: 2,
                },
                {
                  tconst: "tt0583653",
                  titleType: "tvEpisode",
                  primaryTitle: "The One with the Thumb",
                  originalTitle: "The One with the Thumb",
                  isAdult: false,
                  startYear: 1994,
                  endYear: null,
                  runtimeMinutes: 22,
                  genres: ["comedy", "romance"],
                  imdbUrl:
                    "https://www.imdb.com/title/tt0583653/?ref_=fn_al_tt_1",
                  episodeNumber: 3,
                },
                {
                  tconst: "tt0583521",
                  titleType: "tvEpisode",
                  primaryTitle: "The One with George Stephanopoulos",
                  originalTitle: "The One with George Stephanopoulos",
                  isAdult: false,
                  startYear: 1994,
                  endYear: null,
                  runtimeMinutes: 22,
                  genres: ["comedy", "romance"],
                  imdbUrl:
                    "https://www.imdb.com/title/tt0583521/?ref_=fn_al_tt_1",
                  episodeNumber: 4,
                },
              ],
            },
            {
              season: 2,
              episodes: [
                {
                  tconst: "tt0583562",
                  titleType: "tvEpisode",
                  primaryTitle: "The One with Ross's New Girlfriend",
                  originalTitle: "The One with Ross's New Girlfriend",
                  isAdult: false,
                  startYear: 1995,
                  endYear: null,
                  runtimeMinutes: 22,
                  genres: ["comedy", "romance"],
                  episodeNumber: 1,
                  imdbUrl:
                    "https://www.imdb.com/title/tt0583562/?ref_=fn_al_tt_1",
                },
              ],
            },
          ],
        },
      });
    });

    it("GET /basics/:id/episodes (with no episodes) -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/tt7418356/episodes`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "Request successful",
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          title: "Ass Parade",
          titleType: "tvSeries",
          seasons: [],
          tconst: "tt7418356",
          totalEpisodes: 0,
          totalSeasons: 0,
        },
      });
    });

    it("GET /basics/:id/episodes (with invalid title id) -> 404", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/invalid_id/episodes`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: "No title found for tconst=invalid_id",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "invalid_id",
          },
          query: {},
          method: "GET",
          url: "/basics/invalid_id/episodes",
        },
      });
    });

    it("GET /basics/:id/episodes (with invalid title type) -> 400", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/tt4154756/episodes`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "Only 'tvSeries' or 'tvMiniseries' has episodes. Got 'movie'",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt4154756",
          },
          query: {},
          method: "GET",
          url: "/basics/tt4154756/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes -> 201", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468086",
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        statusCode: 201,
        message: "Resource created successfully",
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          parentTconst: "tt7418356",
          tconst: "tt7468086",
          seasonNumber: 1,
          episodeNumber: 1,
        },
      });
    });

    it("POST /basics/:id/episodes (with non-existing parentTconst) -> 404", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/invalid_id/episodes")
        .send({
          tconst: "tt7468086",
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: "No title found for parentTconst=invalid_id",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "invalid_id",
          },
          query: {},
          method: "POST",
          url: "/basics/invalid_id/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with non-existing episode title) -> 404", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "invalid_id",
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: "No episode title found for tconst=invalid_id",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with duplicate episode) -> 409", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468086",
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        statusCode: 409,
        message:
          "Episode already exists for tconst=tt7468086 and parentTconst=tt7418356",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with missing tconst field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "tconst: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with invalid type tconst field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: null,
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "tconst: must be a string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with blank tconst field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "    ",
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "tconst: must be a non-empty string\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with missing seasonNumber field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468088",
          episodeNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "seasonNumber: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with invalid type seasonNumber field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468088",
          seasonNumber: "invalid",
          episodeNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "seasonNumber: must be an integer or a null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with non-int seasonNumber field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468088",
          seasonNumber: 1.0555,
          episodeNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "seasonNumber: must be an integer or a null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with missing episodeNumber field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468088",
          seasonNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "episodeNumber: must be provided\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with invalid type episodeNumber field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468088",
          seasonNumber: 1,
          episodeNumber: "invalid",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "episodeNumber: must be an integer or a null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with non-int episodeNumber field) -> 400", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468088",
          seasonNumber: 1,
          episodeNumber: 1.0555,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: "episodeNumber: must be an integer or a null type\n",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            tconst: "tt7418356",
          },
          query: {},
          method: "POST",
          url: "/basics/tt7418356/episodes",
        },
      });
    });

    it("POST /basics/:id/episodes (with null episode and season number) -> 201", async () => {
      const response = await request(app.getHttpServer())
        .post("/basics/tt7418356/episodes")
        .send({
          tconst: "tt7468088",
          seasonNumber: null,
          episodeNumber: null,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        statusCode: 201,
        message: "Resource created successfully",
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          tconst: "tt7468088",
          seasonNumber: null,
          episodeNumber: null,
          parentTconst: "tt7418356",
        },
      });
    });

    it("PUT /basics/:parentTconst/episodes/:tconst -> 200", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt7418356/episodes/tt7468088")
        .send({
          seasonNumber: 1,
          episodeNumber: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "Resource updated successfully",
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          tconst: "tt7468088",
          seasonNumber: 1,
          episodeNumber: 2,
          parentTconst: "tt7418356",
        },
      });
    });

    it("PUT /basics/:parentTconst/episodes/:tconst (with null episode and season number) -> 200", async () => {
      const response1 = await request(app.getHttpServer())
        .put("/basics/tt7418356/episodes/tt7468088")
        .send({
          seasonNumber: null,
          episodeNumber: null,
        });

      expect(response1.status).toBe(200);
      expect(response1.body).toEqual({
        statusCode: 200,
        message: "Resource updated successfully",
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          tconst: "tt7468088",
          seasonNumber: null,
          episodeNumber: null,
          parentTconst: "tt7418356",
        },
      });

      const response2 = await request(app.getHttpServer())
        .put("/basics/tt7418356/episodes/tt7468088")
        .send({
          seasonNumber: 1,
          episodeNumber: 2,
        });

      expect(response2.status).toBe(200);
      expect(response2.body).toEqual({
        statusCode: 200,
        message: "Resource updated successfully",
        timestamp: expect.any(String),
        data: {
          _id: expect.any(String),
          tconst: "tt7468088",
          seasonNumber: 1,
          episodeNumber: 2,
          parentTconst: "tt7418356",
        },
      });
    });

    it("PUT /basics/:parentTconst/episodes/:tconst (with non-existing parentTconst) -> 404", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/invalid/episodes/tt7468088")
        .send({
          seasonNumber: null,
          episodeNumber: null,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=invalid and tconst=tt7468088",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "invalid",
            tconst: "tt7468088",
          },
          query: {},
          method: "PUT",
          url: "/basics/invalid/episodes/tt7468088",
        },
      });
    });

    it("PUT /basics/:parentTconst/episodes/:tconst (with non-existing tconst) -> 404", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt7418356/episodes/invalid")
        .send({
          seasonNumber: null,
          episodeNumber: null,
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=tt7418356 and tconst=invalid",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "tt7418356",
            tconst: "invalid",
          },
          query: {},
          method: "PUT",
          url: "/basics/tt7418356/episodes/invalid",
        },
      });
    });

    it("PUT /basics/:parentTconst/episodes/:tconst (with duplicate episode) -> 409", async () => {
      const response = await request(app.getHttpServer())
        .put("/basics/tt7418356/episodes/tt7468088")
        .send({
          seasonNumber: 1,
          episodeNumber: 1,
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        statusCode: 409,
        message:
          "Episode with seasonNumber=1 and episodeNumber=1 already exists in title tt7418356",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "tt7418356",
            tconst: "tt7468088",
          },
          query: {},
          method: "PUT",
          url: "/basics/tt7418356/episodes/tt7468088",
        },
      });
    });

    it("GET /basics/:parentTconst/episodes/:tconst -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/tt7418356/episodes/tt7468088`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "Request successful",
        timestamp: expect.any(String),
        data: {
          tconst: "tt7468088",
          seasonNumber: 1,
          episodeNumber: 2,
          parentTconst: "tt7418356",
          titleType: "tvEpisode",
          primaryTitle: "Demi",
          originalTitle: "Demi",
          isAdult: false,
          startYear: 2004,
          endYear: null,
          runtimeMinutes: 50,
          genres: ["adult"],
          imdbUrl: "https://www.imdb.com/title/tt7468088/?ref_=fn_al_tt_1",
        },
      });
    });

    it("GET /basics/:parentTconst/episodes/:tconst -> 200", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/tt7418356/episodes/tt7468088`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        message: "Request successful",
        timestamp: expect.any(String),
        data: {
          tconst: "tt7468088",
          seasonNumber: 1,
          episodeNumber: 2,
          parentTconst: "tt7418356",
          titleType: "tvEpisode",
          primaryTitle: "Demi",
          originalTitle: "Demi",
          isAdult: false,
          startYear: 2004,
          endYear: null,
          runtimeMinutes: 50,
          genres: ["adult"],
          imdbUrl: "https://www.imdb.com/title/tt7468088/?ref_=fn_al_tt_1",
        },
      });
    });

    it("GET /basics/:parentTconst/episodes/:tconst (with non-existing parentTconst) -> 404", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/invalid/episodes/tt7468088`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=invalid and tconst=tt7468088",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "invalid",
            tconst: "tt7468088",
          },
          query: {},
          method: "GET",
          url: `/basics/invalid/episodes/tt7468088`,
        },
      });
    });

    it("GET /basics/:parentTconst/episodes/:tconst (with non-existing tconst) -> 404", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/tt7418356/episodes/invalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=tt7418356 and tconst=invalid",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "tt7418356",
            tconst: "invalid",
          },
          query: {},
          method: "GET",
          url: `/basics/tt7418356/episodes/invalid`,
        },
      });
    });

    it("GET /basics/:parentTconst/episodes/:tconst (with non-series parentTconst) -> 404", async () => {
      const response = await request(app.getHttpServer()).get(
        `/basics/tt34808440/episodes/no-matter`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=tt34808440 and tconst=no-matter",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "tt34808440",
            tconst: "no-matter",
          },
          query: {},
          method: "GET",
          url: `/basics/tt34808440/episodes/no-matter`,
        },
      });
    });

    it("DELETE /basics/:parentTconst/episodes/:tconst -> 204", async () => {
      const response = await request(app.getHttpServer()).delete(
        `/basics/tt7418356/episodes/tt7468088`,
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const totalEpisodes = await episodeModel.countDocuments({
        parentTconst: "tt7418356",
      });
      expect(totalEpisodes).toBe(1);
    });

    it("DELETE /basics/:parentTconst/episodes/:tconst (with non-existing episode) -> 404", async () => {
      const response = await request(app.getHttpServer()).delete(
        `/basics/tt7418356/episodes/tt7468088`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=tt7418356 and tconst=tt7468088",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "tt7418356",
            tconst: "tt7468088",
          },
          query: {},
          method: "DELETE",
          url: `/basics/tt7418356/episodes/tt7468088`,
        },
      });

      const totalEpisodes = await episodeModel.countDocuments({
        parentTconst: "tt7418356",
      });
      expect(totalEpisodes).toBe(1);
    });

    it("DELETE /basics/:parentTconst/episodes/:tconst (with non-existing parentTconst) -> 404", async () => {
      const response = await request(app.getHttpServer()).delete(
        `/basics/invalid/episodes/tt7468088`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=invalid and tconst=tt7468088",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "invalid",
            tconst: "tt7468088",
          },
          query: {},
          method: "DELETE",
          url: `/basics/invalid/episodes/tt7468088`,
        },
      });
    });

    it("DELETE /basics/:parentTconst/episodes/:tconst (with non-existing parentTconst) -> 404", async () => {
      const response = await request(app.getHttpServer()).delete(
        `/basics/invalid/episodes/tt7468088`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=invalid and tconst=tt7468088",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "invalid",
            tconst: "tt7468088",
          },
          query: {},
          method: "DELETE",
          url: `/basics/invalid/episodes/tt7468088`,
        },
      });
    });

    it("DELETE /basics/:parentTconst/episodes/:tconst (with non-existing parentTconst) -> 404", async () => {
      const response = await request(app.getHttpServer()).delete(
        `/basics/invalid/episodes/tt7468088`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message:
          "No episode found for parentTconst=invalid and tconst=tt7468088",
        timestamp: expect.any(String),
        requestCtx: {
          params: {
            parentTconst: "invalid",
            tconst: "tt7468088",
          },
          query: {},
          method: "DELETE",
          url: `/basics/invalid/episodes/tt7468088`,
        },
      });
    });
  });

  describe("Crew Routes (/basics/:id/crew/*)", () => {});

  describe("Cast Routes (/basics/:id/casts/*)", () => {});
});
