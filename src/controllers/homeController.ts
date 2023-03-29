import dotenv from "dotenv";
import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import { PrismaClient, ReviewType } from "@prisma/client";
import XLSX from "xlsx";
const prisma = new PrismaClient();
dotenv.config();

const getAllApplications = async (req: any, res: any) => {
    try {

        logger.info("[/getAllApplications]");
        var applications: any = await prisma.application.findMany({
            where: {
                rec_st: true
            },
            include: {
                owner_group: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        application_access: true,
                        review: true,
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        })
        for (var i = 0; i < applications.length; i++) {
            applications[i].access_count = applications[i]._count.application_access;
            applications[i].review_count = applications[i]._count.review;
            applications[i].owner_group_name = applications[i].owner_group.name;
            // delete applications[i].sis_id;
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
        if (req.isCompliance || req.isAdmin) {
            res.status(200).json({
                message: "Applications fetched",
                is_error: false,
                data: applications
            })
        }
        else {

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

            applications.forEach((application: any) => {
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
const getAllUsers = async (req: any, res: any) => {
    try {
        logger.info("[/getAllUsers]");
        if (!(req.isCompliance || req.isAdmin || req.isOwner)) {
            logger.error("[/getAllUsers] - Unauthorized access");
            res.status(401).json({
                is_error: true,
                message: "Unauthorized access"
            })
            return;
        }

        var users: any = await prisma.employee.findMany({
            where: {
                rec_st: true
            },
            select: {
                sis_id: true,
                core_id: true,
                name: true,
                email: true,
                manager_id: true,
                manager: {
                    select: {
                        core_id: true,
                    }
                },
                _count: {
                    select: {
                        application_access: true,
                        review: true,
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        })
        for (var i = 0; i < users.length; i++) {
            users[i].access_count = users[i]._count.application_access;
            users[i].review_count = users[i]._count.review;
            users[i].managerCoreId = users[i].manager?.core_id;
            delete users[i]._count;
            delete users[i].rec_st;
            delete users[i].updated_at;
            delete users[i].created_at;
            delete users[i].updated_by;
            delete users[i].created_by;
            delete users[i].manager;
        }
        logger.info("[/getAllUsers]: users fetched")
        res.status(200).json({
            message: "Users fetched",
            is_error: false,
            data: users
        })

    } catch (error) {
        logger.error(`[/getAllUsers] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}


const getAllApplicationAccess = async (req: any, res: any) => {
    try {
        logger.info("[/getAllApplicationAccess]");

        if (!(req.isCompliance || req.isAdmin || req.isOwner)) {
            logger.error("[/getAllApplicationAccess] - Unauthorized access");
            res.status(401).json({
                is_error: true,
                message: "Unauthorized access"
            })
            return;
        }

        var applicationAccess: any = await prisma.application_access.findMany({
            where: {
                rec_st: true
            },
            select: {
                sis_id: true,
                access_id: true,
                application: {
                    select: {
                        name: true
                    }
                },
                employee: {
                    select: {
                        name: true,
                        core_id: true,
                        email: true,
                        manager_id: true,
                        manager: {
                            select: {
                                core_id: true,
                            }
                        },

                    }
                },
                permission: true,
                created_at: true,
                updated_at: true,
                created_by: true,
                updated_by: true,
            },
            orderBy: {
                created_at: "desc"
            }
        })
        let sendJSON: any = [];
        // logger.debug(`[/getAllApplicationAccess]: ${JSON.stringify(applicationAccess)}`)
        // console.log(applicationAccess)
        for (var i = 0; i < applicationAccess.length; i++) {
            sendJSON.push({
                id: applicationAccess[i].sis_id,
                applicationName: applicationAccess[i].application.name,
                name: applicationAccess[i].employee.name,
                coreId: applicationAccess[i].employee.core_id,
                email: applicationAccess[i].employee.email,
                managerCoreId: applicationAccess[i].employee?.manager?.core_id,
                userType: "User",
                permission: applicationAccess[i].permission,
                // created_at: applicationAccess[i].created_at,
                // updated_at: applicationAccess[i].updated_at,
                // created_by: applicationAccess[i].created_by,
                // updated_by: applicationAccess[i].updated_by,
            })
        }

        logger.info("[/getAllApplicationAccess]: application access fetched")
        logger.debug(`[/getAllApplicationAccess]: ${JSON.stringify(sendJSON)}`)
        res.status(200).json({
            message: "Application access fetched",
            is_error: false,
            data: sendJSON
        })

    } catch (error) {
        logger.error(`[/getAllApplicationAccess] - ${error}`);
        console.log(error);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}

const getApplicationUsers = async (req: any, res: any) => {
    try {
        logger.info('[/:applicationName/users]');
        var applicationName = req.params.applicationName;
        console.log(applicationName);
        const applicationId = await prisma.application.findFirst({
            where: { name: applicationName },
            select: { sis_id: true }
        });
        console.log(applicationId);
        if (applicationId) {
            const applicationUsers = await prisma.application_access.findMany({
                where: {
                    application_id: applicationId.sis_id,
                    rec_st: true
                },
                select: {
                    employee: {
                        select: {
                            sis_id: true,
                            name: true,
                            core_id: true,
                            email: true,
                            manager_id: true,
                            manager: {
                                select: {
                                    name: true,
                                    core_id: true,
                                    email: true
                                }
                            },
                            department: true,
                            group_sis_id: true,
                            group: {
                                select: {
                                    name: true
                                }
                            },
                        },
                    },
                    permission: true,
                    version: true,
                    created_at: true,
                }
            });
            logger.info('[/:applicationName/users]: application users fetched');
            // Resoponse to Compliance user
            var complianceUsersResponse: any = [];
            if (req.isCompliance || req.isAdmin || req.isOwner) {

                applicationUsers.forEach((applicationUser: any) => {
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
            else if (req.isManager) {
                var managerUsersResponse: any = [];
                applicationUsers.forEach((applicationUser: any) => {
                    if (applicationUser.employee.manager_id == req.user_id) {
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
            else {
                var employeeUsersResponse: any = [];
                applicationUsers.forEach((applicationUser: any) => {
                    if (applicationUser.employee.sis_id === req.user_id) {
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
        } else {
            res.status(404).json({
                message: "Application not found",
                is_error: true,
                data: []
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

const makeReview = async (req: any, res: any) => {
    try {
        logger.info('[/home/make-review]');
        const { access_id, application_id, employee_id, quater, month, review_type, review_comments } = req.body;
        if (!req.isCompliance && !req.isAdmin) {
            // unauthorized
            logger.error('[/home/make-review]: unauthorized');
            res.status(401).json({
                message: "Unauthorized",
                is_error: true,
                data: []
            })
        }

        const review = await prisma.review.create({
            data: {
                created_by: req.user_id,
                updated_by: req.user_id,
                access_id: access_id,
                application_id: parseInt(application_id),
                employee_id: parseInt(employee_id),
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
    } catch (error) {
        logger.error(`[/home/make-review] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}

const validateExcelData = async (jsonData: any) => {
    logger.info('[/validateExcelData]');
    let filteredData: any = [];
    for (let ele of jsonData) {
        let { ApplicationName, CoreId, Email, Name, UserType, ManagerCoreId, Permission } = ele;
        if (ApplicationName && CoreId && Email && Name && UserType && ManagerCoreId && Permission) {
            // validating application name
            console.log('entered', ele);
            let application = await prisma.application.findFirst({
                where: {
                    name: ApplicationName,
                    rec_st: true
                }
            });
            if (!application) {
                console.log('application not found')
                return {
                    success: false,
                    message: "Application not found",
                    data: {
                        conflictingData: ele
                    }
                }
            }
            // validating coreId
            let employee = await prisma.employee.findUnique({
                where: {
                    core_id: CoreId,
                }
            })
            if (!employee) {
                console.log('employee not found')
                return {
                    success: false,
                    message: "Employee not found",
                    data: {
                        conflictingData: ele
                    }
                }
            }
            if (employee.rec_st === false) {
                logger.info('[/validateExcelData]: employee is deleted');
                return {
                    success: false,
                    message: "Employee is deleted",
                    data: {
                        conflictingData: ele
                    }
                }
            }
            // validating email
            if (employee.email !== Email) {

                return {
                    success: false,
                    message: "Email not matched",
                    data: {
                        conflictingData: ele
                    }
                }
            }
            // validating name
            if (employee.name !== Name) {
                return {
                    success: false,
                    message: "Name not matched",
                    data: {
                        conflictingData: ele
                    }
                }
            }
            // validating ManagerCoreId
            if (!employee.manager_id && employee.manager_id !== ManagerCoreId) {
                console.log('employee', employee.name)
                console.log('manager core id not matched', employee.manager_id, ManagerCoreId)
                return {
                    success: false,
                    message: "ManagerCoreId not matched",
                    data: {
                        conflictingData: ele
                    }
                }
            }
            // validating Permission
            if (typeof (ele.Permission) !== "string") {
                return {
                    success: false,
                    message: "Permission should be string",
                    data: {
                        conflictingData: ele
                    }
                }
            }

            // if data is repeated then just skip it
            let isDataRepeated = await filteredData.find((data: any) => data.ApplicationName === ApplicationName && data.CoreId === CoreId);

            // if data is already in database
            let isDataAlreadyInDatabase = await prisma.application_access.findFirst({
                where: {
                    application_id: application.sis_id,
                    employee_id: employee.sis_id,
                    permission: Permission,
                    rec_st: true
                }
            })

            if (!(isDataRepeated || isDataAlreadyInDatabase)) {
                // console.log('data is not repeated or already in database', ele)
                console.log(`-----------------------------------------------------------------------`)
                await filteredData.push({ ...ele, application_sis_id: application.sis_id, employee_sis_id: employee.sis_id });
                // console.log('filtered data --', filteredData)
            } else {
                console.log('data is repeated or already in database', ele)
            }
        }
        else {
            console.log('encountered empty data', ele)
        }
        console.log(`-----------------------------------------------------------------------`)
        // console.log(`filtered data`, filteredData)
    }
    console.log('filtered data', [...filteredData])
    return {
        success: true,
        message: "Data validated",
        data: {
            filteredData: filteredData
        }
    }
};

const uploadExcel = async (req: any, res: any) => {
    try {
        logger.info('[/uploadExcel]');
        if (!req.isCompliance && !req.isAdmin) {
            // unauthorized
            logger.error('[/uploadExcel]: unauthorized');
            res.status(401).json({
                message: "Unauthorized",
                is_error: true,
                data: []
            })
        }
        let path = req.file.path;
        var workbook = XLSX.readFile(path);
        var sheet_name_list = workbook.SheetNames;
        let jsonData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]]
        );


        if (jsonData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "xml sheet has no data",
            });
        }

        // validating jsondata
        const validatedData = await validateExcelData(jsonData);
        console.log(validatedData);
        if (!validatedData.success) {
            return res.status(400).json({
                is_error: true,
                message: validatedData.message,
                data: validatedData.data
            })
        }
        console.log('validated data', validatedData.data.filteredData)
        // creating application access
        for (let ele of validatedData.data.filteredData) {
            let { ApplicationName, CoreId, Email, Name, UserType, ManagerCoreId, Permission, application_sis_id, employee_sis_id } = ele;
            // console.log('ele', ele)
            let applicationAccess = await prisma.application_access.create({
                data: {
                    created_by: (req.user_id),
                    updated_by: (req.user_id),
                    application_id: parseInt(application_sis_id),
                    employee_id: parseInt(employee_sis_id),
                    permission: Permission,
                    version: 1
                }
            });
            logger.debug(`[uploadExcel] - application access created - ${applicationAccess}`);
        };
        logger.info(`[uploadExcel] - application access created - success`)

        res.status(200).json({
            message: "Route Under Development",
            is_error: false,
            data: [...validatedData.data.filteredData]
        })
    } catch (error) {
        logger.error(`[/uploadExcel] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}

const addApplicationAccess = async (req: any, res: any) => {
    try {
        logger.info('[/addApplicationAccess]');
        if (!req.isCompliance && !req.isAdmin) {
            // unauthorized
            logger.error('[/addApplicationAccess]: unauthorized');
            res.status(401).json({
                message: "Unauthorized",
                is_error: true,
                data: []
            })
        }
        let { application_sis_id, employee_id, permission } = req.body;
        if (!application_sis_id || !employee_id || !permission) {
            return res.status(400).json({
                is_error: true,
                message: "application_id, employee_id, permission are required"
            })
        }
        let application_access = await prisma.application_access.findFirst({
            where: {
                application_id: parseInt(application_sis_id),
                employee_id: parseInt(employee_id),
                permission: permission
            }
        })
        let new_access;
        if (application_access) {
            logger.warn(`[addApplicationAccess] - application access already exists - ${JSON.stringify(application_access)}`);
            let updated_application_access = await prisma.application_access.update({
                where: {
                    access_id: application_access.access_id
                },
                data: {
                    updated_by: (req.user_id),
                    version: application_access.version + 1
                }
            })
            new_access = updated_application_access;
            logger.debug(`[addApplicationAccess] - application access updated - ${JSON.stringify(updated_application_access)}`);
        } else {
            let applicationAccess = await prisma.application_access.create({
                data: {
                    created_by: (req.user_id),
                    updated_by: (req.user_id),
                    application_id: parseInt(application_sis_id),
                    employee_id: parseInt(employee_id),
                    permission: permission,
                    version: 1
                }
            });
            new_access = applicationAccess;
            logger.debug(`[addApplicationAccess] - application access created - ${JSON.stringify(applicationAccess)}`);
        }
        logger.info(`[addApplicationAccess] - application access created - success`)
        res.status(200).json({
            message: "created application access",
            is_error: false,
            data: new_access
        })
    } catch (error) {
        logger.error(`[/addApplicationAccess] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}

const editApplicationAccess = async (req: any, res: any) => {
    try {
        logger.info('[/editApplicationAccess]');
        if (!req.isCompliance && !req.isAdmin) {
            // unauthorized
            logger.error('[/editApplicationAccess]: unauthorized');
            res.status(401).json({
                message: "Unauthorized",
                is_error: true,
                data: []
            })
        }
        let { application_sis_id, employee_id, permission } = req.body;
        if (!application_sis_id || !employee_id || !permission) {
            return res.status(400).json({
                is_error: true,
                message: "application_id, employee_id, permission are required"
            })
        }
        const id = parseInt(req.params.id);

        let applicationAccess = await prisma.application_access.update({
            where: {
                sis_id: id,
            },
            data: {
                updated_by: (req.user_id),
                application_id: parseInt(application_sis_id),
                employee_id: parseInt(employee_id),
                permission: permission,
                version: 1
            }
        });
        logger.debug(`[editApplicationAccess] - application access updated - ${applicationAccess}`);
        logger.info(`[editApplicationAccess] - application access updated - success`)
        res.status(200).json({
            message: "Application Access Updated",
            is_error: false,
            data: applicationAccess
        })
    } catch (error) {
        logger.error(`[/editApplicationAccess] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}

const deleteApplicationAccess = async (req: any, res: any) => {
    try {
        logger.info('[/deleteApplicationAccess]');
        if (!req.isCompliance && !req.isAdmin) {
            // unauthorized
            logger.error('[/deleteApplicationAccess]: unauthorized');
            res.status(401).json({
                message: "Unauthorized",
                is_error: true,
                data: []
            })
        }
        const id = parseInt(req.params.id);
        let applicationAccess = await prisma.application_access.update({
            where: {
                sis_id: id
            },
            data: {
                updated_by: (req.user_id),
                rec_st: false
            }
        });
        logger.debug(`[deleteApplicationAccess] - application access deleted - ${applicationAccess}`);
        logger.info(`[deleteApplicationAccess] - application access deleted - success`)
        res.status(200).json({
            message: "Application Access Deleted",
            is_error: false,
            data: applicationAccess
        })
    } catch (error) {
        logger.error(`[/deleteApplicationAccess] - ${error}`);
        res.status(500).json({
            is_error: true,
            message: "Something went wrong"
        })
    }
}


export default {
    getAllApplications,
    getApplicationUsers,
    makeReview,
    uploadExcel,
    getAllApplicationAccess,
    addApplicationAccess,
    editApplicationAccess,
    deleteApplicationAccess,
    getAllUsers
}