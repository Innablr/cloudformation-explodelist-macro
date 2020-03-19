const traverse = require('traverse');
const adler32 = require('adler-32')

const hash = (value) => {
    return adler32.str(value).toString(16);
}

const deepcopy = (object) => {
    return JSON.parse(JSON.stringify(object));
}

const transform_resource = async(resource_name, resource, list) => {
    let new_resources = {};

    await list.forEach(item => {
        let item_hash = hash(item);
        let new_resource_name = resource_name + item_hash;
        let new_resource = deepcopy(resource);

        traverse(new_resource).forEach(function(node) {
            if (node == "!InsListItem") {
                this.update(item)
            }
        });

        new_resources[new_resource_name] = new_resource;
    })

    return new_resources;
}

const transform = (fragment, params) => {
    let new_fragment = deepcopy(fragment);
    new_fragment.Resources = {};

    let resources = fragment.Resources;

    Object.keys(resources).forEach(resource_name => {
        const resource = resources[resource_name];

        if (!resource.ExplodeList) {
            Object.assign(new_fragment.Resources, {[resource_name]: resource});
            return;
        }

        const RefList_re = /^(?:\!RefList)\s+(?<token>[A-Za-z0-9]+)/
        const RefList_match = resource.ExplodeList.match(RefList_re)

        let list = RefList_match ? params[RefList_match.groups.token] : resource.ExplodeList;

        if (!list || list.length <= 0) {
            throw new Error(`No list has been provided to resource: '${resource_name}'.`)
        }

        if (!Array.isArray(list)) {
            list = list.split(',')
        }

        new_resources = transform_resource(resource_name, resource, list);

        Object.assign(new_fragment.Resources, new_resources);
    });

    return new_fragment;
}

exports.handler = async(event, context) => {
    try {
        fragment = event.fragment;
        params = event.templateParameterValues;
        status = "success";

        fragment = transform(fragment, params);
    } catch (err) {
        if (process.env.VERBOSE_ERRORS === 'true') {
            console.error(err);
        }

        status = "failure"
    }

    response = {
        'requestId': event.requestId,
        'status': status,
        'fragment': fragment
    }

    console.debug(response.fragment)

    return response
};
