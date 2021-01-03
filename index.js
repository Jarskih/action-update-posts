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
            version: "canary"
        });

        const field = core.getInput('field');
        const value = getValue();

        const pastPosts = await api.posts.browse({
            filter: `published_at:<" + ${Date.now()}`
        });

        await Promise.all(pastPosts.map(async (post) => {
            post[field] = value;
            console.log(`Updating post "${post.title}": "${value}"`);
        }));

        const upcomingPosts = await api.posts.browse({
            filter: `published_at:>" + ${Date.now()}`
        });

        await Promise.all(upcomingPosts.map(async (post) => {
            post[field] = !value;
            console.log(`Updating post "${post.title}": "${!value}"`);
        }));

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}());
