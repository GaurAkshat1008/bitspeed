import express from "express";
import AppDataSource from "./db/db";
import router from "./routes/identify.routes";

class App {
  private app_: express.Application;

  constructor() {
    this.app_ = express();
    AppDataSource.initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });
    this.app_.use(express.json());
    this.app_.use(express.urlencoded({ extended: true }));
    this.app_.use(router)
  }

  public start() {
    this.app_.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  }
}

export default App;
