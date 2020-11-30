"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceNodes = void 0;
const fs = require("fs");
const checker = require("license-checker");
const Type = 'NpmLicense';
const getLicenses = (packageJson) => new Promise((resolve, reject) => {
    checker.init({
        start: '.',
        direct: true,
    }, (error, packages) => {
        if (error) {
            reject(error);
        }
        else {
            const directPackages = Object.keys(packageJson.dependencies);
            const targetNames = Object.keys(packages).filter((packageName) => (directPackages.filter((directPackage) => packageName.match(new RegExp(`^${directPackage}@`))).length > 0));
            const licenses = [];
            targetNames.forEach((bameWithVersion) => {
                const targetPackage = packages[bameWithVersion];
                const name = bameWithVersion.replace(/@[^@]+$/, '');
                let licenseText;
                if (targetPackage.licenseFile !== undefined) {
                    licenseText = fs.readFileSync(targetPackage.licenseFile, {
                        encoding: 'utf-8',
                    });
                }
                licenses.push({
                    name,
                    licenseTypes: targetPackage.licenses ?? [],
                    licenseText,
                    repository: targetPackage.repository,
                });
                resolve(licenses);
            });
        }
    });
});
// eslint-disable-next-line import/prefer-default-export
const sourceNodes = async ({ createNodeId, createContentDigest, actions: { createNode }, }, { packageJson }) => {
    const licenses = await getLicenses(packageJson);
    licenses.forEach((license) => {
        createNode({
            ...license,
            id: createNodeId(`${Type}${license.name}`),
            name: license.name,
            internal: {
                type: Type,
                contentDigest: createContentDigest(license),
            },
        });
    });
};
exports.sourceNodes = sourceNodes;
//# sourceMappingURL=gatsby-node.js.map