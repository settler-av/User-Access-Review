import joi from 'joi';

const registerSchema = (req: any, res: any, next: any) => {
    const schema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
        department: joi.string()
    })
    validateRequest(req, res, schema);
};

const loginSchema = (req: any, res: any, next: any) => {
    const schema = joi.object({
        core_id: joi.string().required(),
        password: joi.string().min(6).max(30).required()
    })
    validateRequest(req, res, schema);
};

// helper functions

function validateRequest(req: any, next: any, schema: any) {
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
    loginSchema
};