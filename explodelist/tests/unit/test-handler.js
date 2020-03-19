'use strict';

const macro = require('../../macro.js');
const chai = require('chai');
const fs = require('fs');
const yaml = require('js-yaml');

const expect = chai.expect;

let templateFile = fs.readFileSync('tests/unit/fixtures/template.yaml');
let event = {'requestId': 'abcdef12-3456-7890-abcd-ef1234567890'};
let context = {};

event['fragment'] = yaml.safeLoad(templateFile);

describe('Tests ExplodeList Macro', function () {
    it('verifies successful response with csv string', async () => {
        let result;
        event['templateParameterValues'] = {"TestRoutes": "10.0.48.0/24,10.0.112.0/24,10.0.176.0/24"}
        result = await macro.handler(event, context)
        expect(result).to.be.an('object');
        expect(result.status).to.be.equal('success');
    });

    it('verifies successful response with array of strings', async () => {
        let result;
        event['templateParameterValues'] = {"TestRoutes": ["10.0.48.0/24", "10.0.112.0/24", "10.0.176.0/24"]}
        result = await macro.handler(event, context)
        expect(result).to.be.an('object');
        expect(result.status).to.be.equal('success');
    });

    it('verifies failure response if no list is provided', async () => {
        let result;
        event['templateParameterValues'] = {}
        result = await macro.handler(event, context)
        expect(result).to.be.an('object');
        expect(result.status).to.be.equal('failure');
    });

    it('verifies failure response if a list with no item is provided', async () => {
        let result;
        event['templateParameterValues'] = {"TestRoutes": ''}
        result = await macro.handler(event, context)
        expect(result).to.be.an('object');
        expect(result.status).to.be.equal('failure');

        event['templateParameterValues'] = {"TestRoutes": []}
        result = await macro.handler(event, context)
        expect(result).to.be.an('object');
        expect(result.status).to.be.equal('failure');
    });

    it('verifies successful response if a list with one item is provided', async () => {
        let result;
        event['templateParameterValues'] = {"TestRoutes": '10.0.48.0/24'}
        result = await macro.handler(event, context)
        expect(result).to.be.an('object');
        expect(result.status).to.be.equal('success');

        event['templateParameterValues'] = {"TestRoutes": ['10.0.48.0/24']}
        result = await macro.handler(event, context)
        expect(result).to.be.an('object');
        expect(result.status).to.be.equal('success');
    });
});
