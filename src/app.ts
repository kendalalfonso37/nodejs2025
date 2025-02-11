import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes";
import errorHandler from "./middlewares/errorHandler";

dotenv.config();

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.middlewares();
  }

  private config(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use("/api", routes);
  }

  private middlewares(): void {
    this.app.use(errorHandler);
  }
}

export default new App().app;
