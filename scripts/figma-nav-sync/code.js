/**
 * One-shot non-destructive plugin for tNpJxNOZLyt2s2wiXiWDD2 (raquezha.net).
 * Updates Color: Semantic navigation variables & all active navigation/TOC/Back-link
 * references to match https://benji.org/stageshow#cursors:
 *   - content/nav-default: rgba(18, 18, 18, 0.4)
 *   - content/nav-active:  rgba(18, 18, 18, 0.8)
 */
(async () => {
  const NAV_DEFAULT = { r: 18 / 255, g: 18 / 255, b: 18 / 255, a: 0.4 };
  const NAV_ACTIVE = { r: 18 / 255, g: 18 / 255, b: 18 / 255, a: 0.8 };
  const NAV_DEFAULT_LABEL = "rgba(18, 18, 18, 0.4)";
  const NAV_ACTIVE_LABEL = "rgba(18, 18, 18, 0.8)";

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const semanticCol = collections.find((c) => c.name === "Color: Semantic");
  if (!semanticCol) {
    figma.closePlugin("Error: 'Color: Semantic' variable collection not found.");
    return;
  }

  const lightMode =
    semanticCol.modes.find((m) => m.name === "Light") || semanticCol.modes[0];
  if (!lightMode) {
    figma.closePlugin("Error: no mode found on 'Color: Semantic'.");
    return;
  }

  const allColorVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const semanticVars = allColorVars.filter(
    (v) => v.variableCollectionId === semanticCol.id
  );

  function findOrCreateNavVar(name, idFallback, description, rgba) {
    let v =
      semanticVars.find((x) => x.name === name) ||
      allColorVars.find((x) => x.id === idFallback);
    let created = false;
    if (!v) {
      v = figma.variables.createVariable(name, semanticCol, "COLOR");
      created = true;
    }
    v.description = description;
    v.scopes = ["TEXT_FILL", "STROKE_COLOR", "SHAPE_FILL"];
    v.setVariableCodeSyntax(
      "WEB",
      "--" + name.replace(/\//g, "-")
    );
    v.setVariableCodeSyntax(
      "ANDROID",
      "AppColors." +
        name
          .split("/")
          .map((part, idx) =>
            part
              .split("-")
              .map((w, j) =>
                idx === 0 && j === 0
                  ? w
                  : w.charAt(0).toUpperCase() + w.slice(1)
              )
              .join("")
          )
          .join("")
    );
    v.setVariableCodeSyntax(
      "iOS",
      "AppColors." +
        name
          .split("/")
          .map((part, idx) =>
            part
              .split("-")
              .map((w, j) =>
                idx === 0 && j === 0
                  ? w
                  : w.charAt(0).toUpperCase() + w.slice(1)
              )
              .join("")
          )
          .join("")
    );
    v.setValueForMode(lightMode.modeId, rgba);
    return { variable: v, created };
  }

  const mutedVar = semanticVars.find((v) => v.name === "content/muted");
  const primaryVar = semanticVars.find((v) => v.name === "content/primary");

  const defRes = findOrCreateNavVar(
    "content/nav-default",
    "VariableID:39:157",
    "Navigation default/inactive link ink (benji.org rgba(18, 18, 18, 0.4))",
    NAV_DEFAULT
  );
  const actRes = findOrCreateNavVar(
    "content/nav-active",
    "VariableID:39:158",
    "Navigation active/hover link ink (benji.org rgba(18, 18, 18, 0.8))",
    NAV_ACTIVE
  );

  const navDefaultVar = defRes.variable;
  const navActiveVar = actRes.variable;

  function makeBoundSolidPaint(targetVar, rgba) {
    const base = {
      type: "SOLID",
      color: { r: rgba.r, g: rgba.g, b: rgba.b },
      opacity: rgba.a,
    };
    return figma.variables.setBoundVariableForPaint(base, "color", targetVar);
  }

  async function loadTextFonts(textNode) {
    const segments = textNode.getStyledTextSegments(["fontName"]);
    const seen = new Set();
    for (const seg of segments) {
      if (seg.fontName && typeof seg.fontName === "object") {
        const key = seg.fontName.family + "::" + seg.fontName.style;
        if (!seen.has(key)) {
          seen.add(key);
          await figma.loadFontAsync(seg.fontName);
        }
      }
    }
  }

  function isBackupOrArchive(node) {
    const lower = (node.name || "").toLowerCase();
    return lower.startsWith("archive") || lower.startsWith("backup");
  }

  function hasPaintBoundTo(paints, varId) {
    if (!Array.isArray(paints)) return false;
    return paints.some(
      (p) => p && p.boundVariables && p.boundVariables.color && p.boundVariables.color.id === varId
    );
  }

  function isSolidDark(paint) {
    if (!paint || paint.type !== "SOLID" || !paint.color) return false;
    const op = paint.opacity == null ? 1 : paint.opacity;
    return paint.color.r < 0.2 && paint.color.g < 0.2 && paint.color.b < 0.2 && op >= 0.7;
  }

  let reboundFills = 0;
  let reboundStrokes = 0;
  let updatedFoundationLabels = 0;

  function rebindPaintList(paints, targetVar, rgba) {
    if (!Array.isArray(paints) || paints.length === 0) return null;
    const visible = paints.some((p) => p.visible !== false);
    if (!visible) return null;
    const updated = paints.map((p) => {
      if (p.visible === false || p.type !== "SOLID") return p;
      return makeBoundSolidPaint(targetVar, rgba);
    });
    return updated;
  }

  function shouldTreatAsActive(node, ancestors, paints) {
    const chain = [...ancestors, node].map((n) => (n.name || "").toLowerCase()).join(" / ");
    if (/\b(active|hover|current|selected|focused)\b/.test(chain)) return true;
    if (/\b(default|inactive|rest)\b/.test(chain)) return false;
    if (primaryVar && hasPaintBoundTo(paints, primaryVar.id)) return true;
    if (Array.isArray(paints) && paints.some(isSolidDark)) return true;
    return false;
  }

  function isInsideNavContext(node, ancestors, pageName) {
    const pageLower = (pageName || "").toLowerCase();
    const chainNames = [...ancestors, node].map((n) => (n.name || "").toLowerCase()).join(" / ");
    if (pageLower === "navigation") {
      // Leave generic component/hyperlink/check/circle masters outside back-link & toc alone
      if (/\b(hyperlink|check|circle)\b/.test(chainNames) && !/\b(back|index|toc|nav)\b/.test(chainNames)) {
        return false;
      }
      return true;
    }
    if (/\b(toc|back-link|back link|icon \/ back|navigation|on this page)\b/.test(chainNames)) {
      return true;
    }
    if (node.type === "TEXT" && /^\s*(←\s*)?index\s*$/i.test(node.characters || "")) {
      return true;
    }
    return false;
  }

  async function walkNode(node, ancestors, pageName) {
    if (isBackupOrArchive(node)) return;

    // 1. Foundations -> Colors documentation board: update nav-default / nav-active text labels
    if (
      (pageName || "").toLowerCase() === "foundations" &&
      node.type === "FRAME" &&
      Array.isArray(node.children)
    ) {
      const texts = node.children.filter((c) => c.type === "TEXT");
      const hasNavDefault = texts.some((t) => /content\/nav-default|nav-default/i.test(t.characters || ""));
      const hasNavActive = texts.some((t) => /content\/nav-active|nav-active/i.test(t.characters || ""));
      if (hasNavDefault || hasNavActive) {
        const targetVar = hasNavDefault ? navDefaultVar : navActiveVar;
        const targetRgba = hasNavDefault ? NAV_DEFAULT : NAV_ACTIVE;
        const targetLabel = hasNavDefault ? NAV_DEFAULT_LABEL : NAV_ACTIVE_LABEL;
        for (const child of node.children) {
          if (
            (child.type === "RECTANGLE" || child.type === "ELLIPSE" || child.type === "FRAME") &&
            Array.isArray(child.fills) &&
            child.fills.some((f) => f.visible !== false && f.type === "SOLID")
          ) {
            if (!hasPaintBoundTo(child.fills, targetVar.id)) {
              child.fills = rebindPaintList(child.fills, targetVar, targetRgba);
              reboundFills++;
            }
          }
          if (child.type === "TEXT") {
            const cText = child.characters || "";
            if (
              /(rgba\(|#111111|#727271|#70706c|#999999|55%|40%|80%)/i.test(cText) &&
              !/nav-default|nav-active/i.test(cText)
            ) {
              await loadTextFonts(child);
              child.characters = targetLabel;
              updatedFoundationLabels++;
            }
          }
        }
      }
    }

    // 2. Navigation / TOC / Back-link nodes across all active pages
    if (
      isInsideNavContext(node, ancestors, pageName) &&
      (node.type === "TEXT" || node.type === "VECTOR" || node.type === "LINE")
    ) {
      if ("fills" in node && Array.isArray(node.fills) && node.fills.some((f) => f.visible !== false && f.type === "SOLID")) {
        const useActive = shouldTreatAsActive(node, ancestors, node.fills);
        const targetVar = useActive ? navActiveVar : navDefaultVar;
        const targetRgba = useActive ? NAV_ACTIVE : NAV_DEFAULT;
        const alreadyRight = hasPaintBoundTo(node.fills, targetVar.id);
        const boundToMuted = mutedVar && hasPaintBoundTo(node.fills, mutedVar.id);
        const boundToPrimary = primaryVar && hasPaintBoundTo(node.fills, primaryVar.id);
        if (!alreadyRight && (boundToMuted || boundToPrimary || !node.fills.some((f) => f.boundVariables && f.boundVariables.color))) {
          if (node.type === "TEXT") await loadTextFonts(node);
          node.fills = rebindPaintList(node.fills, targetVar, targetRgba);
          reboundFills++;
        }
      }
      if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.some((s) => s.visible !== false && s.type === "SOLID")) {
        const useActive = shouldTreatAsActive(node, ancestors, node.strokes);
        const targetVar = useActive ? navActiveVar : navDefaultVar;
        const targetRgba = useActive ? NAV_ACTIVE : NAV_DEFAULT;
        const alreadyRight = hasPaintBoundTo(node.strokes, targetVar.id);
        const boundToMuted = mutedVar && hasPaintBoundTo(node.strokes, mutedVar.id);
        if (!alreadyRight && (boundToMuted || !node.strokes.some((s) => s.boundVariables && s.boundVariables.color))) {
          node.strokes = rebindPaintList(node.strokes, targetVar, targetRgba);
          reboundStrokes++;
        }
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      const nextAncestors = [...ancestors, node];
      for (const child of node.children) {
        await walkNode(child, nextAncestors, pageName);
      }
    }
  }

  for (const page of figma.root.children) {
    await page.loadAsync();
    for (const child of page.children) {
      await walkNode(child, [], page.name);
    }
  }

  figma.closePlugin(
    `Nav synced to benji.org/stageshow#cursors — content/nav-default=${NAV_DEFAULT_LABEL}, content/nav-active=${NAV_ACTIVE_LABEL} (rebound ${reboundFills} fills, ${reboundStrokes} strokes, ${updatedFoundationLabels} Foundations labels)`
  );
})();
