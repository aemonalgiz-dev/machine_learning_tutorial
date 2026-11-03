import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

export const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputFile = "lib/rewards/catalog.json";

/** @typedef {{ title: string, id: string, quizCount: number, practiceCount: number, hasPractice: boolean }} RewardSection */

// Match the existing bookmark helper. These are the persisted progress IDs,
// including old explicit IDs retained when a heading was rewritten.
export function rewardSectionId(title) {
  return title.toLowerCase().replace(/['’]/g, "").replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function literal(node, syntax, description) {
  if (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) return node.text;
  if (node && ts.isParenthesizedExpression(node)) return literal(node.expression, syntax, description);
  throw Error(`${syntax.fileName}: ${description} must be an authored string literal.`);
}

function arrayCount(node, syntax, description) {
  if (!node || !ts.isArrayLiteralExpression(node) || node.elements.some(ts.isSpreadElement)) {
    throw Error(`${syntax.fileName}: ${description} needs an explicit array; update the metadata extractor if authoring changes.`);
  }
  return node.elements.length;
}

function property(node, name) {
  return node.properties.find(item => ts.isPropertyAssignment(item) &&
    (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name)) && item.name.text === name)?.initializer;
}

function attribute(node, name) {
  if (node.attributes.properties.some(ts.isJsxSpreadAttribute)) {
    throw Error("Spread attributes could override authored reward metadata; declare the page attributes explicitly.");
  }
  const item = node.attributes.properties.find(entry => ts.isJsxAttribute(entry) && entry.name.text === name);
  if (!item?.initializer) return undefined;
  return ts.isJsxExpression(item.initializer) ? item.initializer.expression : item.initializer;
}

/**
 * Read only section metadata; question bodies and executable examples are never evaluated.
 * @returns {{id: string, kind: string, sections: RewardSection[]}}
 */
export function extractNativeSections(source, filename = "authored-page.tsx") {
  const syntax = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const shells = [];
  function visit(node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        ["ConceptPage", "PrimerPage"].includes(node.tagName.getText(syntax))) shells.push(node);
    ts.forEachChild(node, visit);
  }
  visit(syntax);
  if (shells.length !== 1) throw Error(`${filename}: expected one ConceptPage or PrimerPage, found ${shells.length}.`);
  const shell = shells[0], kind = shell.tagName.getText(syntax);
  const id = literal(attribute(shell, "lessonId"), syntax, "lessonId");
  let sections;
  if (kind === "ConceptPage") {
    const declarations = attribute(shell, "sections");
    arrayCount(declarations, syntax, "sections");
    sections = declarations.elements.map(section => {
      if (!ts.isObjectLiteralExpression(section) || section.properties.some(item => ts.isSpreadAssignment(item) || item.name && ts.isComputedPropertyName(item.name))) {
        throw Error(`${filename}: every section must declare its metadata explicitly.`);
      }
      if (section.properties.some(item => item.name && ["title", "id", "quiz", "practice"].includes(item.name.getText(syntax)) && !ts.isPropertyAssignment(item))) {
        throw Error(`${filename}: shorthand or computed graded metadata needs an explicit extraction rule.`);
      }
      const title = literal(property(section, "title"), syntax, "section title");
      const explicitId = property(section, "id");
      const quiz = property(section, "quiz"), practice = property(section, "practice");
      return { title, id: explicitId ? literal(explicitId, syntax, "section id") : rewardSectionId(title),
        quizCount: quiz ? arrayCount(quiz, syntax, "quiz") : 0,
        practiceCount: practice ? arrayCount(practice, syntax, "practice") : 0,
        hasPractice: Boolean(practice) };
    });
  } else {
    if (!ts.isJsxElement(shell.parent)) throw Error(`${filename}: PrimerPage needs direct section children.`);
    sections = shell.parent.children.flatMap(child => {
      const element = ts.isJsxElement(child) ? child.openingElement : ts.isJsxSelfClosingElement(child) ? child : null;
      if (!element) {
        if (ts.isJsxExpression(child) && child.expression) throw Error(`${filename}: dynamic PrimerPage children need an explicit extraction rule.`);
        return [];
      }
      const tag = element.tagName.getText(syntax);
      if (!["PrimerSection", "PrimerQuiz", "PrimerPractice"].includes(tag)) return [];
      const title = literal(attribute(element, "title"), syntax, "primer section title");
      // Spelling changes keep the bookmark and saved activity under an explicit ID.
      const explicitId = attribute(element, "id");
      return [{ title, id: explicitId ? literal(explicitId, syntax, "primer section id") : rewardSectionId(title),
        quizCount: tag === "PrimerQuiz" ? arrayCount(attribute(element, "questions"), syntax, "primer questions") : 0,
        practiceCount: tag === "PrimerPractice" ? arrayCount(attribute(element, "exercises"), syntax, "primer exercises") : 0,
        hasPractice: tag === "PrimerPractice" }];
    });
  }
  return { id, kind, sections };
}

/**
 * Mirror LessonSupplement's insertion and extension, without importing its React content.
 * @param {RewardSection[]} sections
 * @returns {RewardSection[]}
 */
export function applyRewardSupplement(sections, extra) {
  if (!extra) return sections;
  const result = sections.map(section => section.hasPractice
    ? { ...section, practiceCount: section.practiceCount + extra.practice.length } : { ...section });
  const finalQuiz = result.findLastIndex(section => section.quizCount > 0);
  const practice = result.findIndex(section => section.practiceCount > 0);
  const at = finalQuiz >= 0 ? finalQuiz : practice >= 0 ? practice : result.length;
  result.splice(at, 0, ...extra.parts.flatMap(part => [
    { title: part.title, id: part.id ?? rewardSectionId(part.title), quizCount: 0, practiceCount: 0, hasPractice: false },
    ...(extra.checkpoint?.after === part.title ? [{ title: extra.checkpoint.title,
      id: extra.checkpoint.id ?? rewardSectionId(extra.checkpoint.title), quizCount: extra.checkpoint.questions.length,
      practiceCount: 0, hasPractice: false }] : []),
  ]));
  if (extra.checkpoint && !extra.parts.some(part => part.title === extra.checkpoint.after)) {
    throw Error(`Supplement checkpoint does not follow a rendered part: ${extra.checkpoint.title}`);
  }
  return result;
}

/** @returns {RewardSection[]} */
export function expandedRewardSections(lesson) {
  const sections = lesson.parts.flatMap(part => [
    { title: part.title, id: part.id ?? rewardSectionId(part.title), quizCount: 0, practiceCount: 0, hasPractice: false },
    ...(lesson.checkpoints ?? []).filter(checkpoint => checkpoint.after === part.title).map(checkpoint => ({
      title: checkpoint.title, id: checkpoint.id ?? rewardSectionId(checkpoint.title),
      quizCount: checkpoint.questions.length, practiceCount: 0, hasPractice: false,
    })),
  ]);
  if ((lesson.checkpoints ?? []).some(checkpoint => !lesson.parts.some(part => part.title === checkpoint.after))) {
    throw Error(`${lesson.id}: checkpoint does not follow a rendered part.`);
  }
  const quizTitle = `Questions on Parts 1 to ${lesson.parts.length}`;
  sections.push({ title: quizTitle, id: lesson.quizId ?? rewardSectionId(quizTitle),
    quizCount: lesson.quiz.length, practiceCount: 0, hasPractice: false });
  const practiceId = lesson.section === "SQL" ? "practice-write-the-query"
    : ["NoSQL", "Graph Databases"].includes(lesson.section) ? "practice" : "practice-work-through-the-problem-with-numpy";
  sections.push({ title: lesson.reading.practiceTitle, id: practiceId,
    quizCount: 0, practiceCount: lesson.practice.length, hasPractice: true });
  return sections;
}

async function curriculumMetadata(root) {
  const names = ["curriculum", "learning-areas", "course-navigation"];
  const sources = Object.fromEntries(await Promise.all(names.map(async name =>
    [name, await readFile(path.join(root, `lib/${name}.ts`), "utf8")])));
  const navigation = JSON.parse(await readFile(path.join(root, "lib/lessons/navigation.json"), "utf8"));
  const loaded = new Map();
  // Execute only the three existing metadata modules, with their exact allowed
  // imports. Their normal merge/area rules determine the published course.
  function load(name) {
    if (loaded.has(name)) return loaded.get(name);
    if (!names.includes(name)) throw Error(`Unreviewed curriculum metadata module: ${name}`);
    const filename = path.join(root, `lib/${name}.ts`);
    const compiled = ts.transpileModule(sources[name], { compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
    } }).outputText;
    const sandboxModule = { exports: {} };
    loaded.set(name, sandboxModule.exports);
    vm.runInNewContext(compiled, { module: sandboxModule, exports: sandboxModule.exports, require: request => {
      if (request === "./lessons/navigation.json") return navigation;
      if (names.some(dependency => request === `./${dependency}`)) return load(request.slice(2));
      throw Error(`Unreviewed curriculum metadata dependency: ${request}`);
    } }, { filename, timeout: 1000 });
    return sandboxModule.exports;
  }
  const { lessonOrder, lessonLocations } = load("course-navigation");
  return lessonOrder.map(href => {
    const location = lessonLocations[href];
    if (!location) throw Error(`Canonical lesson has no learning-area home: ${href}`);
    return { href, title: location.title, sectionId: location.sectionHref.split("/").at(-1),
      sectionTitle: location.sectionTitle, areaId: location.areaHref.split("/").at(-1), areaTitle: location.areaTitle };
  });
}

export async function buildRewardsCatalog(root = websiteRoot) {
  const [course, expanded, supplements] = await Promise.all([
    curriculumMetadata(root),
    readFile(path.join(root, "lib/lessons/published.json"), "utf8").then(JSON.parse),
    readFile(path.join(root, "lib/lessons/supplements.json"), "utf8").then(JSON.parse),
  ]);
  const byId = new Map(expanded.map(lesson => [lesson.id, lesson]));
  if (byId.size !== expanded.length) throw Error("Expanded lesson IDs must be unique.");
  const seen = new Set(), usedExpanded = new Set();
  const lessons = [], facts = [];
  for (const { href, title, sectionId, sectionTitle, areaId, areaTitle } of course) {
    if (!/^\/(concepts|primers)\/[a-z0-9][a-z0-9-]*$/.test(href) || seen.has(href)) {
      throw Error(`Invalid or repeated canonical lesson route: ${href}`);
    }
    seen.add(href);
    const id = href.split("/").at(-1), filename = path.join(root, "app", href, "page.tsx");
    let sections, native;
    try {
      const authored = extractNativeSections(await readFile(filename, "utf8"), filename);
      if (authored.id !== id) throw Error(`${href}: native lessonId disagrees with its route.`);
      if (byId.has(id)) throw Error(`${href}: both native and expanded lesson definitions exist.`);
      native = true;
      sections = authored.kind === "ConceptPage" ? applyRewardSupplement(authored.sections, supplements[id]) : authored.sections;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const lesson = byId.get(id);
      if (!lesson || !href.startsWith("/concepts/")) throw Error(`No published lesson for ${href}`);
      usedExpanded.add(id);
      native = false;
      sections = applyRewardSupplement(expandedRewardSections(lesson), supplements[id]);
    }
    const quizzes = [], practice = [], graded = new Set();
    for (const section of sections) {
      // SectionNavigator gives a nonempty practice array priority over a quiz array.
      const kind = section.practiceCount > 0 ? "practice" : section.quizCount > 0 ? "quiz" : null;
      if (!kind) continue;
      if (!/^[a-z0-9][a-z0-9-]{0,159}$/.test(section.id) || graded.has(section.id)) {
        throw Error(`${href}: invalid or repeated graded section ID ${section.id}`);
      }
      graded.add(section.id);
      (kind === "quiz" ? quizzes : practice).push(section.id);
    }
    if (!quizzes.length || !practice.length) throw Error(`${href}: expected nonempty authored quiz and programming sections.`);
    lessons.push({ id, href, title, sectionId, sectionTitle, areaId, areaTitle, quizzes, practice });
    facts.push({ id, native, quizSections: quizzes.length, practiceSections: practice.length,
      questions: sections.filter(section => section.practiceCount === 0).reduce((sum, section) => sum + section.quizCount, 0),
      challenges: sections.reduce((sum, section) => sum + section.practiceCount, 0),
      supplement: Boolean(supplements[id]) });
  }
  if (usedExpanded.size !== byId.size) throw Error("Expanded metadata contains lessons absent from the canonical course.");
  if (new Set(lessons.map(lesson => lesson.id)).size !== lessons.length) throw Error("Lesson leaf IDs must be unique.");
  return { catalog: { version: 1, lessons }, facts };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(argument => argument !== "--check")) throw Error("Usage: node scripts/build-rewards-catalog.mjs [--check]");
  const { catalog, facts } = await buildRewardsCatalog();
  const content = JSON.stringify(catalog, null, 2) + "\n", filename = path.join(websiteRoot, outputFile);
  if (args.includes("--check")) {
    if ((await readFile(filename, "utf8")).replace(/\r\n/g, "\n") !== content) throw Error("Rewards catalog is stale. Run node scripts/build-rewards-catalog.mjs.");
  } else {
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, content);
  }
  console.log(JSON.stringify({ checked: args.includes("--check"), lessons: catalog.lessons.length,
    native: facts.filter(lesson => lesson.native).length, expanded: facts.filter(lesson => !lesson.native).length,
    quizSections: facts.reduce((sum, lesson) => sum + lesson.quizSections, 0),
    practiceSections: facts.reduce((sum, lesson) => sum + lesson.practiceSections, 0),
    questions: facts.reduce((sum, lesson) => sum + lesson.questions, 0),
    challenges: facts.reduce((sum, lesson) => sum + lesson.challenges, 0), bytes: Buffer.byteLength(content) }));
}
