import dotenv from "dotenv";
dotenv.config();
import app from '../../app';
import request from "supertest";
// import { createUser } from "../../utils/utils";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import console from "console";

const prisma = new PrismaClient();
let url = "https://uar-api.onrender.com/api/v1";


describe("/api/v1/check", () => {
    it("It should be alive", (done) => {
        request(url)
            .get("/check")
            .expect(200)
            .end((err, response) => {
                if (err) {
                    return done(err)
                }
                console.log(response.body)
                // expect(response.body).toHaveProperty("isAlive", true)
                done();
            });
    }, 10000);
});