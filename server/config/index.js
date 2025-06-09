export const AppConfig = {
  DB: {
    DIALECT: "sqlite",
    DB_PATH: "database.sqlite",
  },
  PORT: 3000,
  API_PREFIX: "/api",
  ADMIN: {
    EMAIL: "admin@admin.com",
    PASSWORD: "$2a$12$.KmAG8x01Z/Jj6KW./JeluV9R4scg/.kksR7rO93jmTK8d1LsrePC", // bcrypt hash
  },
};
