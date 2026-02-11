import "winston";

declare module "winston" {
  interface Logger {
    fatal: LeveledLogMethod;
  }
}
