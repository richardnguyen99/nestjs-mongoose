import type { LoggerOptions } from "winston";
import { format, transports as Transports, config } from "winston";
import type Transport from "winston-transport";
import { utilities as nestWinstonModuleUtilities } from "nest-winston";

const formattedTimestamp = format.timestamp({
  format: "YYYY-MM-DD HH:mm:ss.SSS",
});

const colorizer = format.colorize({
  colors: config.npm.colors,
});

const WINSTON_DEV_FORMAT = format.combine(
  format.errors({ stack: true }),
  colorizer,
  formattedTimestamp,
  format.simple(),
  nestWinstonModuleUtilities.format.nestLike("App", {
    colors: true,
    prettyPrint: true,
    processId: true,
    appName: true,
  }),
);
const WINSTON_PROD_FORMAT = format.combine(
  format.errors({ stack: true }),
  formattedTimestamp,
  format.json(),
);

export const logLevels = config.npm.levels;

export const loggerConfig = (): LoggerOptions => {
  const isProduction = process.env.NODE_ENV === "production";

  const transports: Transport[] = [];
  transports.push(new Transports.Console());

  return {
    levels: logLevels,
    level: process.env.LOG_LEVEL ?? "info",
    format: isProduction ? WINSTON_PROD_FORMAT : WINSTON_DEV_FORMAT,
    transports,
    exceptionHandlers: transports,
    rejectionHandlers: transports,
    defaultMeta: {
      service: "nestjs-mongoose",
    },
  };
};
