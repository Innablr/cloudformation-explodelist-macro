'use strict';

const macro = require('../../macro.js');
const chai = require('chai');
const fs = require('fs');
const yaml = require('js-yaml');

const expect = chai.expect;

let templateFile = fs.readFileSync('tests/unit/fixtures/template-with-parameters.yaml');
let event = {'requestId': 'abcdef12-3456-7890-abcd-ef1234567890'};
let context = {};

event['fragment'] = yaml.safeLoad(templateFile);

describe('Tests ExplodeList Macro', function () {
    [{ desc: 'a csv string',
        value: {TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24'}},
      { desc: 'a string with only one item',
        value: {TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24'}},
      { desc: 'an empty string',
        value: {TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24'}},
      { desc: 'no parameter',
        value: ''}
    ].forEach(input => {
        it(`verifies appropriate response with ${input.desc}`, async () => {
            event['templateParameterValues'] = input.value;
            let result = await macro.handler(event, context);
            let route_keys = Object.keys(result.fragment.Resources).filter(x => x.startsWith('TestRoute'));
            let route_count = 0;

            if (event.templateParameterValues.TestRoutes) {
                route_count = event.templateParameterValues.TestRoutes.split(',').length;
            }

            expect(result).to.be.an('object');
            expect(result.status).to.be.equal('success');
            expect(Object.keys(result.fragment.Resources)).to.have.lengthOf(route_count + 1);
            expect(result.fragment.Resources.RouteTable).to.be.an('object');

            if (route_count > 0) {
                route_keys.forEach(k => {
                    let v = result.fragment.Resources[k];
                    expect(v).to.be.an('object');
                    expect(v.ExplodeList).to.be.an('undefined');
                    expect(v.Properties.DestinationCidrBlock).not.be.equal('!InsListItem');
                });
            }
        });
    });
});
