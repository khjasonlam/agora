export const badRequest = (message: string) => createError({ statusCode: 400, statusMessage: message })

export const unauthorized = (message = 'Unauthorized') => createError({ statusCode: 401, statusMessage: message })

export const forbidden = (message = 'Forbidden') => createError({ statusCode: 403, statusMessage: message })

export const notFound = (message: string) => createError({ statusCode: 404, statusMessage: message })

export const internalError = (message: string) => createError({ statusCode: 500, statusMessage: message })
