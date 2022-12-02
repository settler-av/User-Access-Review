import logger from "./logger";
import dotenv from "dotenv";

export const isProduction = () => {
   return process.env.NODE_ENV === "production";
};

export const catchHandler = (identity: string, err: any, res: any) => {
   logger.warn(`[${identity}] Error`);
   logger.error(`[${identity}] ${err}}`);
   res.status(400).json({ isError: true, message: "Something went wrong!" });
   return true;
};
