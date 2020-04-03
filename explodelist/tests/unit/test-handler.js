
const chai = require('chai');
const fs = require('fs');
const yaml = require('js-yaml');
const macro = require('../../macro.js');

const { expect } = chai;

const event = { requestId: 'abcdef12-3456-7890-abcd-ef1234567890' };
const context = {};

describe('Tests ExplodeList Macro', () => {
  [{
    desc: 'a csv string',
    value: { TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24' },
    templateFile: 'template-with-parameters.yaml',
  },
  {
    desc: 'a string with only one item',
    value: { TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24' },
    templateFile: 'template-with-parameters.yaml',
  },
  {
    desc: 'an empty string',
    value: { TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24' },
    templateFile: 'template-with-parameters.yaml',
  },
  {
    desc: 'no parameter',
    value: '',
    templateFile: 'template-with-parameters.yaml',
  },
  {
    desc: 'a hard coded array',
    value: '',
    routesCount: 6,
    templateFile: 'template-with-arrays.yaml',
  },
  {
    desc: 'a hard coded string',
    value: '',
    routesCount: 6,
    templateFile: 'template-with-strings.yaml',
  },
  {
    desc: 'all kinds mixed up',
    value: { TestRoutes: '10.0.48.0/24,10.0.112.0/24,10.0.176.0/24' },
    routesCount: 15,
    templateFile: 'template-with-all.yaml',
  },
  ].forEach((input) => {
    it(`verifies appropriate response with ${input.desc}`, async () => {
      const templateFile = fs.readFileSync(`tests/unit/fixtures/${input.templateFile}`);
      event.fragment = yaml.safeLoad(templateFile);
      event.templateParameterValues = input.value;

      const { TestRoutes } = event.templateParameterValues;
      let routesCount = input.routesCount || 0;
      if (!routesCount && TestRoutes) {
        routesCount = TestRoutes.split(',').length;
      }

      const result = await macro.handler(event, context);
      const newResourceNames = Object.keys(result.fragment.Resources);
      const routeKeys = newResourceNames.filter((x) => x.startsWith('TestRoute'));

      expect(result).to.be.an('object');
      expect(result.status).to.be.equal('success');
      expect(newResourceNames).to.have.lengthOf(routesCount + 1);
      expect(result.fragment.Resources.RouteTable).to.be.an('object');

      if (routesCount > 0) {
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
