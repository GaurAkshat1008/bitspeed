import {DataSource} from "typeorm";
import { Contact } from "../entities/contact";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import dotenv from "dotenv";
import { __prod__ } from "../common";

dotenv.config();

const db_config: PostgresConnectionOptions = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Contact],
    logging: !__prod__,
    synchronize: true,
}

const AppDataSource = new DataSource(db_config);

export default AppDataSource;