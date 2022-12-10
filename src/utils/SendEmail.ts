import dotenv from "dotenv";
import logger from "./logger";
dotenv.config();

import Mailjet from "node-mailjet";
const fs = require("fs");

export const dueReminderEmail = async (
    to: any,
    from: any,
) => {
    const message = "Hi, <br> <br> This is a reminder that your review is due. <br> <br> Thanks, <br> <br> Neelkanth Tandel <br> <br>"

    if (await sendEmail([to], from, "User registered", message)) {
        logger.info(`[send account confirmation email]- successfull`);
        return true;
    }
    logger.warn(`[send order confirmation email]- failed`);
    return false;
};
const to = [
    {
        email: "adnanvahora114@gmail.com",
        name: "Adnan",
    },
    {
        email: "setllerhere@gmail.com",
        name: "Setller",
    }
];
const from = {
    email: "20CE155@charusat.edu.in",
    name: "Neelkanth Tandel",
};


const sendEmail = (to: any, from: any, subject: string, htmlMessage: any, attachments?: any) => {
    const mailjet = new Mailjet({
        apiKey: process.env.MAILJET_API,
        apiSecret: process.env.MAILJET_SECRET,
    });
    const formattedTo = to.map(({ email, name }: any) => ({ Email: email, Name: name }));

    const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
            {
                From: {

                    Email: from.email,
                    Name: from.name,
                },
                To: [
                    ...formattedTo
                ],
                Subject: subject,
                HTMLPart: htmlMessage,
                attachments: attachments?[...attachments]:null
            },
        ],
    });
    const result = request
        .then((result) => {
            logger.debug(`[send email] - ${JSON.stringify(result.body)}`);
            return true;
        })
        .catch((err) => {
            logger.warn(`[Send Email] - error`);
            // logger.error(`[Send email] - ${JSON.stringify(err)}`);
            console.log(err);
            return false;
        });

    return result;
};


export default {dueReminderEmail,sendEmail }
