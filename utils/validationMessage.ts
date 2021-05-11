import { body } from 'express-validator';

export const msg = {
    contains: '',
    equals: '',
    isAlpha: 'The :attribute may only contain letters.',
    isAlphanumeric: 'The :attribute may only contain letters and numbers.',
    isDecimal: 'The :attribute must be a decimal.',
    isEmail: 'The :attribute must be a valid email address.',
    isFloat: 'The :attribute must be a float.',
    isIn: ':attribute must in :inner',
    isInt: 'The :attribute must be an integer.',
    isIP: 'The :attribute must be a valid IP address.',
    isIPv4: 'The :attribute must be a valid IPv4 address.',
    isIPv6: 'The :attribute must be a valid IPv6 address.',
    isLowercase: 'The :attribute must be a lowercase.',
    isNull: 'The :attribute is empty.',
    isNumeric: 'The :attribute must be a number.',
    isUppercase: 'The :attribute must be a uppercase.',
    isUrl: 'The :attribute format is invalid.',
    isUUID: 'The :attribute must be a valid UUID.',
    len: '',
    notContains: '',
    notEmpty: 'The :attribute is required.',
    notIn: 'The selected :attribute is invalid.',
    notNull: 'The :attribute is required.',

    // custom validation translate
    exist: 'The :attribute :value already exist.',
    isBoolean: 'The :attribute must be a boolean.',
    isDate: 'The :attribute must be a date.',
    isLength: 'The :attribute must contain a minimum of :min and a maximum of :max',
    matches: ':attribute must contain a minimum of :matches',
    isString: ":attribute must be string",
    isArray: ":attribute must be array"
}

export const appendValidation = (attr, validation = []) => {
    let result = body(attr);
    validation.forEach(v => {
        if(result[v]) {
            result[v]()
            if(msg[v]) {
                let message = msg[v].replace(":attribute", attr);
                result.withMessage(message)
            }
        }
    })
    return result
}