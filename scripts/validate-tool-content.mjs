// Validation script (not part of the app itself) — parses tool-content.js
// with acorn to build a real AST, then walks the OVERRIDES object literal
// to check every tool entry has sane faq/longDescription shape. This is
// stronger than `node --check`, which only confirms the file is *some*
// valid JS — it doesn't catch a string that silently terminated early
// from a missing backslash escape and left the rest of the object
// parsing "successfully" as a differently-shaped (wrong) structure.
import { readFileSync } from "fs";
import * as acorn from "acorn";

const path = process.argv[2] || "src/lib/registry/tool-content.js";
const source = readFileSync(path, "utf8");

let ast;
try {
  ast = acorn.parse(source, { ecmaVersion: 2022, sourceType: "module" });
} catch (e) {
  console.error("PARSE ERROR:", e.message);
  process.exit(1);
}

// Find `const OVERRIDES = { ... }`
let overridesNode = null;
for (const node of ast.body) {
  if (node.type === "VariableDeclaration") {
    for (const decl of node.declarations) {
      if (decl.id.name === "OVERRIDES" && decl.init.type === "ObjectExpression") {
        overridesNode = decl.init;
      }
    }
  }
}

if (!overridesNode) {
  console.error("Could not find OVERRIDES object in AST");
  process.exit(1);
}

function literalValue(node) {
  if (node.type === "Literal") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis.map((q) => q.value.cooked).join("");
  }
  return undefined;
}

const results = [];
let totalProblems = 0;

for (const prop of overridesNode.properties) {
  const slug = literalValue(prop.key) ?? (prop.key.name || "<computed>");
  const toolObj = prop.value;
  if (toolObj.type !== "ObjectExpression") {
    console.error(`${slug}: value is not an object literal (${toolObj.type})`);
    totalProblems++;
    continue;
  }

  let faqCount = null;
  let longDescLen = null;
  let h2Count = null;
  let howItWorksSteps = null;
  const problems = [];

  for (const p of toolObj.properties) {
    const key = p.key.name || p.key.value;
    if (key === "faq" && p.value.type === "ArrayExpression") {
      faqCount = p.value.elements.length;
      // validate each element has question+answer strings
      p.value.elements.forEach((el, i) => {
        if (!el || el.type !== "ObjectExpression") {
          problems.push(`faq[${i}] is not an object`);
          return;
        }
        const qProp = el.properties.find((pp) => (pp.key.name || pp.key.value) === "question");
        const aProp = el.properties.find((pp) => (pp.key.name || pp.key.value) === "answer");
        const qVal = qProp ? literalValue(qProp.value) : undefined;
        const aVal = aProp ? literalValue(aProp.value) : undefined;
        if (typeof qVal !== "string" || qVal.length < 5) {
          problems.push(`faq[${i}].question missing or too short`);
        }
        if (typeof aVal !== "string" || aVal.length < 10) {
          problems.push(`faq[${i}].answer missing or too short`);
        }
      });
    }
    if (key === "longDescription") {
      const val = literalValue(p.value);
      if (typeof val !== "string") {
        problems.push("longDescription is not a plain string literal");
      } else {
        longDescLen = val.length;
        h2Count = (val.match(/<h2>/g) || []).length;
        const h2CloseCount = (val.match(/<\/h2>/g) || []).length;
        const pOpenCount = (val.match(/<p>/g) || []).length;
        const pCloseCount = (val.match(/<\/p>/g) || []).length;
        if (h2Count !== h2CloseCount) problems.push(`h2 open/close mismatch (${h2Count}/${h2CloseCount})`);
        if (pOpenCount !== pCloseCount) problems.push(`p open/close mismatch (${pOpenCount}/${pCloseCount})`);
        // unescaped raw " inside content would have been impossible to keep
        // as a Literal if truly broken (parse would fail or split into
        // multiple statements) — but check for suspiciously short strings
        // that suggest premature termination followed by silently-parsed
        // leftover tokens elsewhere in the file.
        if (val.length < 200) problems.push(`longDescription suspiciously short (${val.length} chars)`);
      }
    }
    if (key === "howItWorks" && p.value.type === "ObjectExpression") {
      const stepsProp = p.value.properties.find((pp) => (pp.key.name || pp.key.value) === "steps");
      if (stepsProp && stepsProp.value.type === "ArrayExpression") {
        howItWorksSteps = stepsProp.value.elements.length;
      }
    }
  }

  if (faqCount === null) problems.push("no faq array found");
  if (longDescLen === null) problems.push("no longDescription found");

  results.push({ slug, faqCount, longDescLen, h2Count, howItWorksSteps, problems });
  if (problems.length) totalProblems += problems.length;
}

console.log(`Parsed ${results.length} tool entries from OVERRIDES.\n`);
console.log(
  `${"slug".padEnd(28)} ${"faq".padEnd(5)} ${"steps".padEnd(6)} ${"ldChars".padEnd(8)} ${"h2".padEnd(4)} problems`
);
for (const r of results) {
  const flag = r.problems.length ? "  <-- " + r.problems.join("; ") : "";
  console.log(
    `${r.slug.padEnd(28)} ${String(r.faqCount).padEnd(5)} ${String(r.howItWorksSteps).padEnd(6)} ${String(
      r.longDescLen
    ).padEnd(8)} ${String(r.h2Count).padEnd(4)}${flag}`
  );
}

console.log(`\nTotal entries: ${results.length}`);
console.log(`Total problems: ${totalProblems}`);
process.exit(totalProblems > 0 ? 1 : 0);
