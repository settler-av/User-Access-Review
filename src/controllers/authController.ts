// prisma
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
dotenv.config();

const register = async (req: any, res: any) => {
    try {
        logger.info("[/register]");
        const { name, email, core_id, department, group_sis_id } = req.body;

        //find if exist
        const user = await prisma.employee.findUnique({
            where: {
                core_id: core_id,
            }
        })
        // Check if user already exists
        if (user) {
            logger.warn(`[/register] - user already exists`);
            logger.debug(`[/register] - body: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: 'User already exists'
            });
        }
        // generate 6 char random password alphanumeric
        const password = Math.random().toString(36).slice(2);
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // save password in file
        const fs = require('fs');
        fs.appendFile('password.txt', `${email} - ${password}\n`, function (err: any) {
            if (err) throw err;
            console.log('Password Saved! In password.txt');
        });

        // create user
        const newUser = await prisma.employee.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                core_id: core_id,
                department: department,
                group_sis_id: group_sis_id ? group_sis_id : null,
                created_by: req.user_id,
                updated_by: req.user_id,
            }
        })
        logger.info("[/register]: user created")

        // // send email
        // let myEmail = {
        //    "email": "tandelneelkanth@gmail.com",
        //    "name" : "Tandel Neelkanth"
        // }
        // await sendPasswordResetEmail({email: newUser.email, name: newUser.name},myEmail,password);
        // logger.info("[/register]: email sent")

        logger.info("[/register]: success")
        return res.status(200).json({
            message: 'User created successfully',
            isError: false,
            data: {
                name: newUser.name,
                email: newUser.email,
                core_id: newUser.core_id,
                department: newUser.department,
                group_sis_id: newUser.group_sis_id,
                password: password // send password in email
            }
        });
    } catch (err) {
        logger.error(err)
        return res.status(500).json({
            isError: true,
            message: 'Something went wrong'
        });
    }
};

// reference: https://www.freecodecamp.org/news/how-to-authenticate-users-and-implement-cors-in-nodejs-applications/
const login = async (req: Request, res: Response) => {
    logger.info("[/login]");
    try {
        const { email, core_id, password } = req.body;
        let core_id_new;
        if (core_id) {
            core_id_new = core_id.trim().toupperCase()
        };
        let employee;
        if (email) {
            employee = await prisma.employee.findUnique({
                where: {
                    email: email,
                }
            });
        } else {
            employee = await prisma.employee.findUnique({
                where: {
                    core_id: core_id_new,
                }
            });
        }


        let _employee: any = { ...employee };
        if (!employee) {
            logger.warn(`[/login] - user not found - ${email}`);
            logger.debug(`[/login] - body: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: "User not found",
            });
        }

        // check password
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            logger.warn(`[/login] - incorrect username or password`);
            logger.debug(`[/login] - body: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: "Incorrect username or password",
            });
        }
        // token of user inf time
        let secret: any = process.env.JWT_SECRET;
        const token = jwt.sign({ userId: employee.sis_id, group_id: employee.group_sis_id }, secret);
        console.log(secret);

        logger.info(`[/login] - success - sis_id - ${employee.sis_id}, email - ${employee.email}`);
        delete _employee.password;

        return res.status(200).json({
            message: "Login successful",
            isError: false,
            is_logged_in: true,
            isAdmin: employee.sis_id === 1,
            redirect: employee.updated_by === 1,
            data: {
                user: _employee,
                token: token,
            }
        });
    } catch (err) {
        logger.error(`[/login] - ${err}`);
        console.log(err);

        return res.status(400).send({
            message: "Server error",
        });
    }
};

const changePassword = async (req: any, res: any) => {
    logger.info("[/changePassword]");
    try {
        const { password, new_password } = req.body;

        const user = await prisma.employee.findUnique({
            where: {
                sis_id: req.user_id,
            }
        });
        if (!user) {
            logger.warn(`[/changePassword] - user not found`);
            logger.debug(`[/changePassword] - body: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                is_error: true,
                message: "User not found",
            });
        }
        // update password
        const hashedPassword = await bcrypt.hash(password, 10);
        // check password

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`[/changePassword] - incorrect password`);
            logger.debug(`[/changePassword] - body: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                is_error: true,
                message: "Incorrect password",
            });
        }

        const updatedUser = await prisma.employee.update({
            where: {
                sis_id: req.user_id,
            },
            data: {
                password: await bcrypt.hash(new_password, 10),
                updated_by: req.user_id,
            },
        });
        logger.info(`[/changePassword] - success - ${req.user_id}`);
        return res.status(200).json({
            is_error: false,
            message: "Password changed successfully",
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        logger.error(`[/changePassword] - ${err}`);
        return res.status(400).send({
            is_error: true,
            message: "Server error",
        });
    }
};

const getUser = async (req: any, res: any) => {
    try {
        const user_sis_id = req.user_id;

        const user = await prisma.employee.findFirst({
            where: {
                sis_id: user_sis_id,
                rec_st: true,
            }
        });

        if (user) {
            return res.status(200).send({
                is_error: false,
                user,
                isAdmin: req.isAdmin ? true : false,
                isCompliance: req.isCompliance ? true : false,
            });
        } else {
            return res.status(400).send({ is_error: true, error: "User not found" });
        }
    } catch (err) {
        logger.error(`[/getUser] - ${err}`);
        logger.debug(`[/getUser] - body: ${JSON.stringify(req.body)}`);
        return res.status(500).send({ is_error: true, error: "Something went wrong" });
    }
}

// const editProfile = async (req: any, res: any) => {
//    logger.info("[/userDetails]");
//    try {
//       const { post_id, department, committee } = req.body;
//       // sanity check
//       if (!post_id) {
//          logger.warn(`[/userDetails] - required post `);
//          logger.debug(`[/userDetails] - body: ${JSON.stringify(req.body)}`);
//          return res.status(400).json({
//             isError: true,
//             message: "Please provide all the required fields",
//          });
//       }

//       // update user details
//       let user = await prisma.employee.update({
//          where: {
//             sis_id: req.user_id,
//          },
//          data: {
//             position_id: 2,
//             department_id: 1,
//             committee_id: null,
//             modified_by: req.user_id //hardcoded to 4 for now
//          },
//       });
//       logger.info(`[/userDetails] - success - ${user.sis_id}`);
//       return res.status(200).json({
//          isError: false,
//          message: "User details updated successfully",
//       });
//    } catch (err) {
//       logger.error(`[/userDetails] - ${err}`);
//       return res.status(400).send({
//          isError: true,
//          message: "Server error",
//       });
//    }
// };


export default { register, login, changePassword, getUser };