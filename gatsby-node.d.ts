export declare const sourceNodes: ({ createNodeId, createContentDigest, actions: { createNode }, }: {
    createNodeId: (input: string) => string;
    createContentDigest: (input: string | Record<string, unknown>) => string;
    actions: {
        createNode: (node: any, plugin?: any, options?: any) => void;
    };
}, { packageJson }: Options) => Promise<void>;
declare type Options = {
    packageJson: {
        dependencies: string;
    };
};
export {};
