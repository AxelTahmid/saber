const S = require('fluent-json-schema')

const { responseObject } = require('../../config/schema')

/**
 * * Schema GET /
 */
const base = {
    response: {
        200: S.object()
            .prop('label', S.string())
            .prop('uptime', S.number())
            .prop('version', S.string())
            .prop(
                'status',
                S.object()
                    .prop('rssBytes', S.number())
                    .prop('heapUsed', S.number())
                    .prop('eventLoopDelay', S.number())
                    .prop('eventLoopUtilized', S.number())
            )
    }
}

/**
 * * Schema GET /otp
 */
const arrayofString = {
    response: {
        200: responseObject(S.array().items(S.string()))
    }
}
/**
 * * Schema POST /queue
 */
const queueAction = {
    body: S.object().prop(
        'action',
        S.enum(['drain', 'clean', 'obliterate']).required()
    ),
    response: {
        200: responseObject()
    }
}

module.exports = { base, arrayofString, queueAction }
