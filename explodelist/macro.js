const traverse = require('traverse');
const adler32 = require('adler-32');

const hash = (value) => adler32.str(value).toString(16);
const deepcopy = (object) => JSON.parse(JSON.stringify(object));

const transformResource = (resourceName, resource, list) => {
  const newResources = {};

  list.forEach((item) => {
    const newResourceName = resourceName + hash(item);
    const newResource = deepcopy(resource);
    delete newResource.ExplodeList;

    traverse(newResource).forEach(function (node) { // eslint-disable-line func-names
      if (node === '!InsListItem') {
        this.update(item);
      }
    });

    newResources[newResourceName] = newResource;
  });

  return newResources;
};

const transform = (fragment, params) => {
  const newFragment = deepcopy(fragment);
  newFragment.Resources = {};

  const resources = fragment.Resources;

  Object.keys(resources).forEach((resourceName) => {
    const resource = resources[resourceName];
    let newResources = {};

    if (!resource.ExplodeList) {
      Object.assign(newFragment.Resources, { [resourceName]: resource });
      return;
    }

    let RefListMatch;
    if (typeof resource.ExplodeList === 'string') {
      const RefListRe = /^(?:!RefList)\s+(?<token>[A-Za-z0-9]+)/;
      RefListMatch = resource.ExplodeList.match(RefListRe);
    }

    let list = RefListMatch ? params[RefListMatch.groups.token] : resource.ExplodeList;

    if (!list || list.length <= 0) {
      return;
    }

    if (!Array.isArray(list)) {
      list = list.split(',');
    }

    newResources = transformResource(resourceName, resource, list);

    Object.assign(newFragment.Resources, newResources);
  });

  return newFragment;
};

exports.handler = (event, context) => { // eslint-disable-line no-unused-vars
  let { fragment } = event;
  const { templateParameterValues: params } = event;
  let status = 'failure';

  try {
    fragment = transform(fragment, params);
    delete fragment.Transform;
    status = 'success';
  } catch (err) {
    if (process.env.VERBOSE_ERRORS === 'true') {
      console.error(err); // eslint-disable-line no-console
    }
  }

  const response = {
    requestId: event.requestId,
    status,
    fragment,
  };

  return response;
};
