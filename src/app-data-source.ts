import { join } from "path";
import { DataSource } from "typeorm";

export const myDataSource: DataSource = new DataSource({
  type: "mariadb",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "nodejs2025",
  password: process.env.DB_PASSWORD || "test",
  database: process.env.DB_NAME || "nodejs2025",
  synchronize: false,
  logging: false,
  entities: [join(__dirname, "entity", "**/*.{ts,js}")],
  migrations: [join(__dirname, "migration", "**/*.{ts,js}")],
  subscribers: [join(__dirname, "subscriber", "**/*.{ts,js}")],
  extra: {
    connectionLimit: 10, // Número máximo de conexiones en el pool.
    connectionTimeoutMillis: 5000, // Tiempo de espera (en milisegundos) para obtener una conexión del pool antes de lanzar un error.
    acquireTimeout: 10000, // Esperar hasta 10s antes de fallar al obtener una conexión
    idleTimeout: 30000, // Cerrar conexiones inactivas después de 30s
    charset: "utf8_general_ci"
  }
});
