import joi from 'joi';

const registerSchema = (req: any, res: any, next: any) => {
    const schema = joi.object({
        name: joi.string().required(),
        core_id: joi.string().length(6).required().alphanum(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.string().valid(joi.ref('password')),
        manager_id: joi.number(),
        department: joi.string(),
        group_sis_id: joi.number()
    })
    validateRequest(req, res, schema, next);
};

const loginSchema = (req: any, res: any, next: any) => {
    const schema = joi.object({
        core_id: joi.string(),
        email: joi.string().email(),
        password: joi.string().required()
    }).xor('core_id', 'email');
    console.log(req.body);
    validateRequest(req, res, schema, next);
};

const changePasswordSchema = (req: any, res: any, next: any) => {
    const schema = joi.object({
        password: joi.string().required(),
        new_password: joi.string().required(),
    }).unknown(false);
    validateRequest(req, res, schema, next);
};
// helper functions

function validateRequest(req: any, res: any, schema: any, next: any) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        // stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        next(`Validation error: ${error.details.map((x: { message: any; }) => x.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}

export default {
    registerSchema,
    loginSchema,
    changePasswordSchema
};