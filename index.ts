import dotenv from "dotenv";
import Application from "./app/server";

dotenv.config();

const PORT = parseInt(process.env.PORT as string);

new Application(PORT);
