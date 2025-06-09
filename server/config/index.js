export const AppConfig = {
  DB: {
    DIALECT: "sqlite",
    DB_PATH: "database.sqlite",
  },
  PORT: 3000,
  API_PREFIX: "/api",
  ADMIN: {
    EMAIL: "demo@elbilling.com",
    PASSWORD: "$2a$12$cgZoE2i3K2EXCs1qauvoX.qSvpUcIoDztDuRl6KGjH80LMEYVI8qy", // bcrypt hash
  },
};
