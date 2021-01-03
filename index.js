/* eslint-disable no-console */
const core = require('@actions/core');
const GhostAdminApi = require('@tryghost/admin-api');

// Convert boolean strings to true booleans
const getValue = () => {
    let value = core.getInput('value');

    if (value === 'true') {
        value = true;
    } else if (value === 'false') {
        value = false;
    }

    return value;
};

const checkIfEventHasPassed = (date) => {
    const now = new Date();
    const then = new Date(date);
    return now > then;
}

(async function main() {
    try {
        const api = new GhostAdminApi({
            url: core.getInput('api-url'),
            key: core.getInput('api-key'),
            version: 'canary'
        });

        const field = core.getInput('field');
        const value = getValue();

        const posts = await api.posts.browse();

        await Promise.all(posts.map(async (post) => {

            const hasPassed = checkIfEventHasPassed(post.published_at);

            if (hasPassed) {
                post[field] = value;
                await api.posts.edit(post);
            } else {
                post[field] = !value;
                await api.posts.edit(post);
            }
        }));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}());