
const chai = require('chai');
const fs = require('fs');
const yaml = require('js-yaml');
const macro = require('../../macro.js');

const { expect } = chai;

const templateFile = fs.readFileSync('tests/unit/fixtures/template-with-parameters.yaml');
const event = { requestId: 'abcdef12-3456-7890-abcd-ef1234567890' };
const context = {};

event.fragment = yaml.safeLoad(templateFile);

describe('Tests ExplodeList Macro', () => {
  [{
    desc: 'a csv string',
    value: { TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24' },
  },
  {
    desc: 'a string with only one item',
    value: { TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24' },
  },
  {
    desc: 'an empty string',
    value: { TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24' },
  },
  {
    desc: 'no parameter',
    value: '',
  },
  ].forEach((input) => {
    it(`verifies appropriate response with ${input.desc}`, async () => {
      event.templateParameterValues = input.value;
      const result = await macro.handler(event, context);
      const routeKeys = Object.keys(result.fragment.Resources).filter((x) => x.startsWith('TestRoute'));
      let routeCount = 0;

      const { TestRoutes } = event.templateParameterValues;

      if (TestRoutes) {
        routeCount = TestRoutes.split(',').length;
      }

      expect(result).to.be.an('object');
      expect(result.status).to.be.equal('success');
      expect(result.fragment.Transform).to.be.an('undefined');
      expect(Object.keys(result.fragment.Resources)).to.have.lengthOf(routeCount + 1);
      expect(result.fragment.Resources.RouteTable).to.be.an('object');

      if (routeCount > 0) {
        routeKeys.forEach((k) => {
          const v = result.fragment.Resources[k];
          expect(v).to.be.an('object');
          expect(v.ExplodeList).to.be.an('undefined');
          expect(v.Properties.DestinationCidrBlock).not.be.equal('!InsListItem');
        });
      }
    });
  });
});
