let traverse = require('traverse');
var adler32 = require('adler-32')
var yaml = require('js-yaml');

const hash = async(value) => {
    return adler32.str(value).toString(16);
}

const transform = async(fragment, params) => {
    let resources = fragment['Resources'];

    return fragment
}

exports.handler = async(event, context) => {
    try {
        fragment = event['fragment']
        params = event['templateParameterValues']
        status = "success"

        fragment = await transform(fragment, params)
    } catch (err) {
        if (process.env.VERBOSE_ERRORS !== 'true') {
            console.error(err);
        }

        status = "failure"
    }

    response = {
        'requestId': event['requestId'],
        'status': status,
        'fragment': fragment
    }

    return response
};
