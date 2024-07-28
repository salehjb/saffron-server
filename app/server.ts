import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import mainRouter from "./routes/router";

class Application {
  #app = express();

  constructor(PORT: number) {
    this.configApplication();
    this.createServer(PORT);
    this.createRoutes();
    this.errorHandler();
  }

  configApplication() {
    this.#app.use(morgan("dev"));
    this.#app.use(cookieParser());
    this.#app.use(
      cors({
        origin: ["http://localhost:3000"],
        credentials: true,
      })
    );
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));
  }

  createServer(PORT: number) {
    this.#app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  errorHandler() {
    this.#app.use((req: Request, res: Response, next: NextFunction) => {
      return res.status(StatusCodes.NOT_FOUND).json({
        data: {
          message: "صفحه مورد نظر یافت نشد",
        },
        status: StatusCodes.NOT_FOUND,
      });
    });
  }

  createRoutes() {
    this.#app.use(mainRouter);
  }
}

export default Application;
