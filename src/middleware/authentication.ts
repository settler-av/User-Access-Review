import logger from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction, Errback, query } from "express";
import { builtinModules } from "module";
import { lookup } from "dns";
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const auth = async (req: any, res: any, next: any) => {
  // check header
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.send("Authentication Invalid").status(401);
    }
    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await prisma.employee.findUnique({
      where: {
        sis_id: payload.userId,
      },
    });
    const master_user = await prisma.employee.findUnique({
      where: {
        core_id: "VWNB84",
      },
    });

    // attach the user to the job routes
    if (employee) {
      if (master_user) {
        req.user_id = payload.userId;
        if (employee.sis_id === master_user.sis_id) {
          req.isAdmin = true;
        }
        // get all manager ids
        const managers = await prisma.employee.findMany({
          where: {},
          distinct: ["manager_id"],
          select:{
            manager_id:true
          }
        });
        
        managers.forEach((manager:any)=>{
          if(manager.manager_id === employee.sis_id && manager.manager_id !== null){
            req.isManager = true;
          }
        })

        // if employee is compliance team member then attach the compliance team member to the request
        const compliance = await prisma.employee.findUnique({
          where: {
            sis_id: employee.sis_id,
          },
          include:{
            group:{
              select:{
                name:true
              }
            }
          }
        })
        
        if(compliance?.group?.name === "Compliance"){
          req.isCompliance = true;
          req.isManager = false;
        }
      } else {
        logger.warn(`[/auth] - master user not found`);
      }
    } else {
      logger.warn(`[auth] User not found - ${payload.userId}`);
      return res
        .status(401)
        .send({ isError: true, message: "User does not exist." });
    }
    next();
  } catch (error) {
    logger.warn("[auth] error");
    logger.error(error);
    res
      .status(400)
      .send({ isError: true, message: "Something went wrong!" })
      .status(401);
  }
};

export const isAdmin = async (req: any, res: any, next: any) => {
  try {
    auth(req, res, () => {
      if (req.isAdmin) {
        next();
      } else {
        return res
          .status(401)
          .send({ isError: true, message: "You are not authorized." });
      }
    });
  } catch (err) {
    logger.warn("[auth] error");
    logger.error(err);
    res
      .status(400)
      .send({ isError: true, message: "Something went wrong!" })
      .status(401);
  }
};

export default auth;
