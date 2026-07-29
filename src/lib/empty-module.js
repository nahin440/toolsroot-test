// Intentionally empty. Used as a webpack replacement target for Node
// core modules (node:fs, node:https) that pptxgenjs dynamic-imports only
// inside an `if (ENVIRONMENT_IS_NODE)`-style branch that never executes
// in a browser — see next.config.mjs's NormalModuleReplacementPlugin.
const emptyModule = {};
export default emptyModule;
