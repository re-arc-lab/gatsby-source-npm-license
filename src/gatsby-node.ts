import * as fs from 'fs';
import * as checker from 'license-checker';

const Type = 'NpmLicense';

type License = {
  name: string;
  licenseTypes: string | string[];
  licenseText?: string;
  repository?: string;
};

const getLicenses = (
  packageJson: { dependencies: string },
): Promise<License[]> => new Promise((resolve, reject) => {
  checker.init({
    start: '.',
    direct: true,
  }, (error, packages) => {
    if (error) {
      reject(error);
    } else {
      const directPackages = Object.keys(packageJson.dependencies);
      const targetNames = Object.keys(packages).filter((packageName) => (
        directPackages.filter((directPackage) => packageName.match(new RegExp(`^${directPackage}@`))).length > 0
      ));
      const licenses: License[] = [];
      targetNames.forEach((bameWithVersion) => {
        const targetPackage = packages[bameWithVersion];
        const name = bameWithVersion.replace(/@[^@]+$/, '');
        let licenseText: string | undefined;
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
export const sourceNodes = async ({
  createNodeId,
  createContentDigest,
  actions: { createNode },
}: {
  createNodeId: (input: string) => string;
  createContentDigest: (input: string | Record<string, unknown>) => string;
  actions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createNode: (node: any, plugin?: any, options?: any) => void;
  };
}, { packageJson }: Options): Promise<void> => {
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

type Options = {
  packageJson: { dependencies: string };
};
