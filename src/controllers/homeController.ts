import dotenv from "dotenv";
import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import { PrismaClient, ReviewType } from "@prisma/client";
import { deprecate } from "util";
const prisma = new PrismaClient();
dotenv.config();

const getAllApplications = async (req: any, res: any) => {
    try {

        logger.info("[/getAllApplications]");
        var applications: any= await prisma.application.findMany({
            where: {
                rec_st: true
            },
            include: {
                owner_group:{
                    select:{
                        name:true
                    }
                },
                _count:{
                    select:{
                        application_access:true,
                        review:true,
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        })
        for(var i = 0; i < applications.length; i++){
            applications[i].access_count = applications[i]._count.application_access;
            applications[i].review_count = applications[i]._count.review;
            applications[i].owner_group_name = applications[i].owner_group.name;
            delete applications[i].sis_id;
            delete applications[i]._count;
            delete applications[i].rec_st;
            delete applications[i].updated_at;
            delete applications[i].created_at;
            delete applications[i].updated_by;
            delete applications[i].created_by;
            delete applications[i].owner_group;
            delete applications[i].owner_gid;
        }
        logger.info("[/getAllApplications]: applications fetched")
        if(req.isCompliance || req.isAdmin){
            res.status(200).json({
                message: "Applications fetched",
                is_error: false,
                data: applications
            })
        }
        else{

            /**
             * TODO: filter applications based on manager and employee.
             * 
             * manager: can see all applications of his group members possess.
             * manager is also and owner of the application of his group. He also can see
             * the list of user who have access to the application owned by him.
             * employee: can see all applications of that he has access to.
             */
            // manager response
            // applications = applications.filter((application:any)=>application.owner_gid == req.group_sis_id);

            applications.forEach((application:any)=>{
                delete application.access_count;
                delete application.review_count;
            })
            res.status(200).json({
                message: "Applications fetched",
                is_error: false,
                data: applications
            })
        }
        
    } catch (error) {
        logger.error(`[/getAllApplications] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
};

const getApplicationUsers = async (req: any, res: any) => {
    try{
        logger.info('[/:applicationName/users]');
        var applicationName = req.params.applicationName;
        console.log(applicationName);
        const applicationId = await prisma.application.findFirst({
            where:{ name: applicationName },
            select:{ sis_id:true }
        });
        console.log(applicationId);
        if(applicationId){
            const applicationUsers = await prisma.application_access.findMany({
                where:{
                    application_id: applicationId.sis_id,
                    rec_st: true
                },
                select:{
                    employee:{
                        select:{
                            sis_id: true,
                            name: true,
                            core_id: true,
                            email: true,
                            manager_id: true,
                            manager: {
                                select:{
                                    name: true,
                                    core_id: true,
                                    email: true
                                }
                            },
                            department: true,
                            group_sis_id: true,
                            group: {
                                select:{
                                    name: true
                                }
                            },
                        },
                    },
                    role: true,
                    version: true,
                    created_at: true,
                }
            });
            logger.info('[/:applicationName/users]: application users fetched');
            // Resoponse to Compliance user
            var complianceUsersResponse: any = [];
            if(req.isCompliance || req.isAdmin || req.isOwner){
            
                applicationUsers.forEach((applicationUser:any)=>{
                    var applicationUserResponse = {
                        emp_name: applicationUser.employee.name,
                        core_id: applicationUser.employee.core_id,
                        email: applicationUser.employee.email,
                        manager: applicationUser.employee.manager?.name || null,
                        manager_core_id: applicationUser.employee.manager?.core_id || null,
                        department: applicationUser.employee.department,
                        group_name: applicationUser.employee.group.name,
                        role: applicationUser.role,
                        version: applicationUser.version,
                        created_at: applicationUser.created_at
                    }
                    complianceUsersResponse.push(applicationUserResponse);
                });
                res.status(200).json({
                    message: "Response to Compliance User",
                    is_error: false,    
                    data: complianceUsersResponse
                })
            }
            // Responcse to Manager
            else if(req.isManager){
                var managerUsersResponse: any = [];
                applicationUsers.forEach((applicationUser:any)=>{
                    if(applicationUser.employee.manager_id == req.user_id){
                        var applicationUserResponse = {
                            emp_name: applicationUser.employee.name,
                            core_id: applicationUser.employee.core_id,
                            email: applicationUser.employee.email,
                            department: applicationUser.employee.department,
                            group_name: applicationUser.employee.group.name,
                            role: applicationUser.role,
                            version: applicationUser.version,
                            created_at: applicationUser.created_at
                        }
                        managerUsersResponse.push(applicationUserResponse);
                    }
                });
                var ownerUserResponse: any = complianceUsersResponse;
                res.status(200).json({
                    message: "Response to Manager/Owner User",
                    is_error: false,
                    data: {
                        managerUsersResponse: managerUsersResponse,
                        ownerUserResponse: ownerUserResponse
                    }
                })
            }
            // Response to Employee
            else{
                var employeeUsersResponse: any = [];
                applicationUsers.forEach((applicationUser:any)=>{
                    if(applicationUser.employee.sis_id === req.user_id){
                        var applicationUserResponse = {
                            emp_name: applicationUser.employee.name,
                            core_id: applicationUser.employee.core_id,
                            email: applicationUser.employee.email,
                            department: applicationUser.employee.department,
                            group_name: applicationUser.employee.group.name,
                            role: applicationUser.role,
                            version: applicationUser.version,
                            created_at: applicationUser.created_at
                        }
                        employeeUsersResponse.push(applicationUserResponse);
                    }
                });
                res.status(200).json({
                    message: "Response to Employee User",
                    is_error: false,
                    data: employeeUsersResponse
                })
            }
        }else{
            res.status(404).json({
                message: "Application not found",
                is_error: true,
                data: []
            })
        }
    }catch(error){
        logger.error(`[/getAllApplications] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
};

const makeReview = async (req: any, res: any) => {
    try{
        logger.info('[/home/make-review]');
        const {access_id, application_id, employee_id, quater, month, review_type, review_comments} = req.body;
        if(!req.isCompliance && !req.isAdmin){
            // unauthorized
            logger.error('[/home/make-review]: unauthorized');
            res.status(401).json({
                message: "Unauthorized",
                is_error: true,
                data: []
            })
        }

        const review = await prisma.review.create({
            data:{
                created_by: req.user_id,
                updated_by: req.user_id,
                access_id: access_id,
                application_id: application_id,
                employee_id: employee_id,
                quater: quater,
                month: month,
                review_type: review_type,
                review_comments: review_comments
            }
        });
        logger.info('[/home/make-review]: review created');
        res.status(200).json({
            message: "Review created",
            is_error: false,
            data: review
        })
    }catch(error){
        logger.error(`[/home/make-review] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}

const uploadExcel = async (req: any, res: any) => {
    try{
        logger.info('[/uploadExcel]');
        res.status(200).json({
            message: "Route Under Development",
            is_error: false,
            data: []
        })
    }catch(error){
        logger.error(`[/uploadExcel] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}
export default {getAllApplications, getApplicationUsers, makeReview, uploadExcel}