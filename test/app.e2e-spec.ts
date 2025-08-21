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

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let basicModel: Model<BasicsModel>;
  let principalModel: Model<PrincipalsModel>;
  let nameModel: Model<NamesModel>;
  let episodeModel: Model<EpisodesModel>;
  let crewModel: Model<CrewsModel>;

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
    principalModel = moduleFixture.get<Model<PrincipalsModel>>(
      getModelToken(PrincipalsModel.name),
    );
    nameModel = moduleFixture.get<Model<NamesModel>>(
      getModelToken(NamesModel.name),
    );
    episodeModel = moduleFixture.get<Model<EpisodesModel>>(
      getModelToken(EpisodesModel.name),
    );
    crewModel = moduleFixture.get<Model<CrewsModel>>(
      getModelToken(CrewsModel.name),
    );
  });

  afterAll(async () => {
    basicModel.deleteMany({});
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
      await basicModel.insertMany([
        {
          tconst: "tt0000022",
          titleType: "short",
          primaryTitle: "Blacksmith Scene",
          originalTitle: "Les forgerons",
          isAdult: false,
          startYear: 1895,
          endYear: null,
          runtimeMinutes: 1,
          genres: ["documentary", "short"],
        },
        {
          tconst: "tt0067098",
          titleType: "tvEpisode",
          primaryTitle: "Willi Forst",
          originalTitle: "Willi Forst",
          isAdult: false,
          startYear: null,
          endYear: null,
          runtimeMinutes: 55,
          genres: [],
        },
        {
          tconst: "tt0108778",
          titleType: "tvSeries",
          primaryTitle: "Friends",
          originalTitle: "Friends",
          isAdult: false,
          startYear: 1994,
          endYear: 2004,
          runtimeMinutes: 22,
          genres: ["comedy", "romance"],
        },
        {
          tconst: "tt34808440",
          titleType: "movie",
          primaryTitle: "Between Friends",
          originalTitle: "Between Friends",
          isAdult: false,
          startYear: 2024,
          endYear: null,
          runtimeMinutes: 90,
          genres: ["thriller"],
        },
        {
          tconst: "tt1349010",
          titleType: "video",
          primaryTitle: "Oil Overload 2",
          originalTitle: "Oil Overload 2",
          isAdult: true,
          startYear: 2008,
          endYear: null,
          runtimeMinutes: null,
          genres: ["adult"],
        },
        {
          tconst: "tt1481346",
          titleType: "video",
          primaryTitle: "Big Butt Oil Orgy",
          originalTitle: "Big Butt Oil Orgy",
          isAdult: true,
          startYear: 2009,
          endYear: null,
          runtimeMinutes: null,
          genres: ["adult"],
        },
        {
          tconst: "tt34740878",
          titleType: "movie",
          primaryTitle: "Taghiev: Oil",
          originalTitle: "Taghiev: Oil",
          isAdult: false,
          startYear: 2024,
          endYear: null,
          runtimeMinutes: 120,
          genres: ["biography", "history"],
        },
        {
          tconst: "tt19843414",
          titleType: "short",
          primaryTitle: "Oil Oil Oil",
          originalTitle: "Oil Oil Oil",
          isAdult: false,
          startYear: 2023,
          endYear: null,
          runtimeMinutes: 24,
          genres: ["short"],
        },
        {
          tconst: "tt5592584",
          titleType: "short",
          primaryTitle: "Avenge Myself",
          originalTitle: "Avenge Myself",
          isAdult: false,
          startYear: 2016,
          endYear: null,
          runtimeMinutes: 6,
          genres: ["short", "action"],
        },
        {
          tconst: "tt0083602",
          titleType: "movie",
          primaryTitle: "The Avenging",
          originalTitle: "The Avenging",
          isAdult: false,
          startYear: 1982,
          endYear: null,
          runtimeMinutes: 50,
          genres: ["western"],
        },
        {
          tconst: "tt4154796",
          titleType: "movie",
          primaryTitle: "Avengers: Endgame",
          originalTitle: "Avengers: Endgame",
          isAdult: false,
          startYear: 2019,
          endYear: null,
          runtimeMinutes: 181,
          genres: ["sci-fi", "adventure", "action"],
        },
        {
          tconst: "tt16103750",
          titleType: "movie",
          primaryTitle: "Rifftrax: Avengers: Endgame",
          originalTitle: "Avengers: Endgame",
          isAdult: false,
          startYear: 2020,
          endYear: null,
          runtimeMinutes: null,
          genres: ["sci-fi", "comedy", "action"],
        },
        {
          tconst: "tt4154756",
          titleType: "movie",
          primaryTitle: "Avengers: Infinity War",
          originalTitle: "Avengers: Infinity War",
          isAdult: false,
          startYear: 2018,
          endYear: null,
          runtimeMinutes: 149,
          genres: ["sci-fi", "adventure", "action"],
        },
      ]);
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

      expect(await basicModel.find().lean()).toHaveLength(14);
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

      expect(await basicModel.find().lean()).toHaveLength(13);
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

      expect(await basicModel.find().lean()).toHaveLength(13);
    });
  });

  describe("Names Routes (/names/*)", () => {});

  describe("Aka Routes (/basics/:id/akas/*)", () => {});

  describe("Episode Routes (/basics/:id/episodes/*)", () => {});

  describe("Crew Routes (/basics/:id/crew/*)", () => {});

  describe("Cast Routes (/basics/:id/casts/*)", () => {});
});
