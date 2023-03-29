import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { dueReminderEmail } from "../utils/SendEmail";
import { PrismaClient, ReviewType, status } from "@prisma/client";
const prisma = new PrismaClient();
dotenv.config();

const getAllreports = async (req: any, res: any) => {
  try {
    logger.info(`[/report/]`);

    // fetch all the user access
    const reports: any = await prisma.review.findMany({
      where: {
        rec_st: true,
      },
      // select: {
      //   review_id: true,
      //   access_id: true,
      //   application_id: true,
      //   created_by: true,
      //   created: {
      //     select: {
      //       core_id: true,
      //       name: true,
      //     },
      //   },
      //   application: {
      //     select: {
      //       name: true,
      //       owner_group: {
      //         select: {
      //           name: true,
      //         },
      //       },
      //     },
      //   },
      //   employee_id: true,
      //   employee: {
      //     select: {
      //       name: true,
      //       email: true,
      //       group: {
      //         select: {
      //           sis_id: true,
      //           name: true,
      //         },
      //       },
      //     },
      //   },
      //   quater: true,
      //   month: true,
      //   review_type: true,
      //   status: true,
      //   review_accept_reject: true,
      //   review_comments: true,
      // },
    });

    // reports.forEach((report:any) => {
    //   report.created_by_name = report.created.name;
    //   report.created_by_core_id = report.created.core_id;
    //   report.application_name = report.application.name;
    //   report.application_owner_group_name = report.application.owner_group.name;
    //   report.employee_name = report.employee.name;
    //   report.employee_email = report.employee.email;
    //   report.employee_group_name = report.employee.group.name;
    //   report.employee_group_id = report.employee.group.sis_id;
    //   delete report.application.owner_group;
    //   delete report.employee.group;
    //   delete report.employee.email;
    //   delete report.created;
    // });

    if (req.isCompliance) {
      logger.info(`[/report/] - Compliance fetched reports - ${req.user_id}`);
      return res.status(200).json({
        message: "Fetched Reports of all users",
        is_error: false,
        data: reports,
      });
    } else if (req.isManager) {
      const ManagerReports = reports.filter((report: any) => {
        return report.employee_group_id === req.group_id;
      });
      logger.info(`[/report/] - Manager fetched reports - ${req.user_id}`);
      return res.status(200).json({
        message: "Fetched Reports of all the users under your group",
        is_error: false,
        data: ManagerReports,
      });
    } else if (req.isOwner) {
      const OwnerReports = reports.filter((report: any) => {
        return report.application_group_id === req.group_id;
      });
      logger.info(`[/report/] - Owner fetched reports - ${req.user_id}`);
      return res.status(200).json({
        message: "Fetched Reports of your application",
        is_error: false,
        data: OwnerReports,
      });
    }
    else if( req.isAdmin){
      logger.info(`[/report/] - Admin fetched reports - ${req.user_id}`);
      return res.status(200).json({
        message: "Fetched Reports of all users",
        is_error: false,
        data: reports,
      });
    } else {
      logger.warn(`[/report/] - unauthorized access`);
      return res.status(401).json({
        message: "You are not authorized to view this page",
        is_error: true,
      });
    }
  } catch (error) {
    logger.error(`[/report/] - ${error}`);
    return res.status(500).json({
      is_error: true,
      message: "Somthing went wrong",
    });
  }
};

// const getDashboardData = async (req: any, res: any) => {
//   try {
//     // Under Development
//     logger.warn(`[/report/dashboard] - under construction`);
//     return res.status(200).json({
//       message: "Under Development",
//       is_error: false,
//     });
//   } catch (error) {
//     logger.error(`[/report/dashboard] - ${error}`);
//     return res.status(500).json({
//       is_error: true,
//       message: "Somthing went wrong",
//     });
//   }
// };

const createReview = async (req: any, res: any) => {
  try {
    if (!req.isCompliance) {
      logger.warn(`[/report/create] - unauthorized access`);
      return res.status(401).json({
        message: "You are not authorized to view this page",
        is_error: true,
      });
    }
    logger.info(`[/report/create] - ${req.sis_id}`);

    const {
      application_id,
      access_id,
      employee_id,
      quater,
      month,
      review_type,
      status,
      review_accept_reject,
      review_comments,
      due_date,
    } = req.body;
    // We need to update the database to allow the reminder cron job
    // to send the reminder to the user.
    const review = await prisma.review.create({
      data: {
        created_by: req.user_id,
        updated_by: req.user_id,
        application_id: application_id,
        access_id: access_id,
        employee_id: employee_id,
        quater: quater,
        month: month,
        review_type: review_type,
        status: status,
        review_accept_reject: review_accept_reject,
        review_comments: review_comments,
        due_date: due_date? new Date(due_date): null,
      },
    });

    logger.info(
      `[/report/create] - ${req.sis_id} - created review - ${review.review_id}`
    );
    return res.status(200).json({
      message: "Review Created",
      is_error: false,
      data: review,
    });
  } catch (error) {
    logger.error(`[/report/create] - ${error}`);
    return res.status(500).json({
      is_error: true,
      message: "Somthing went wrong",
    });
  }
};

// cron job 
const sendReminder = async () => {
  try {
    const today = new Date();
    const dueReports = await prisma.review.findMany({
      where: {
        due_date: {
          lte: today,
        },
        NOT: {
          status: status.CLOSED,
        },
      },
      select:{
        review_id: true,
        employee: {
          select: {
            email: true,
            name: true,
          },
        },
      }
    });
    logger.info(`[/report/sendReminder] - ${dueReports.length} reports due today`);
    dueReports.forEach(async (report) => {
      const { email, name } = report.employee;
      dueReminderEmail(email, name);
    }); 
  }catch(error){
    logger.error(`[/report/sendReminder] - ${error}`);
  }
}  

export default {
  getAllreports,
  createReview,
  sendReminder
};