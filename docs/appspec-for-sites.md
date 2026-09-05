# AppSpec JSON IR for AI-Generated Safari Sites

## Motivation

The App Builder currently generates freeform JavaScript for sandboxed apps. This
works well for interactive apps (games, tools, simulations) that require
algorithmic logic, state machines, and drawing calculations.

However, Safari **sites** are a fundamentally different beast. They are purely
declarative — headings, paragraphs, lists, images, links, and spacers arranged
in a static layout. The existing `SiteMarkup` system already parses an HTML-like
markup string into a small, fixed set of typed `LayoutNode` values and renders
them deterministically. There is no state management, no event loop, and no
custom drawing — just content flowing down a page.

This makes sites an ideal candidate for the **structured output / JSON IR**
pattern recommended for AI code generation in constrained frameworks. Instead of
asking an LLM to produce markup strings (which can contain malformed HTML,
injected script tags, or unsupported elements), we could ask it to fill in a
**SiteSpec JSON schema** that maps 1:1 to the existing `LayoutNode` types. The
compiler (our existing renderer) handles all layout decisions; the LLM just
decides _what_ content appears.

## Existing Architecture

Today, sites are defined as `SiteEntry` objects in the Safari app:

```typescript
interface SiteEntry {
  name: string;
  url: string;
  body: string; // HTML-like markup string
  keywords?: string[];
}
```

The `body` string is parsed by `parseSiteMarkup()` in `SiteMarkup.ts` into a
`Map<string, LayoutNode[]>` (cards keyed by ID). Each `LayoutNode` is one of:

| Type        | Fields                               |
| ----------- | ------------------------------------ |
| `heading`   | level (1 or 2), text, align          |
| `paragraph` | segments (text / bold / link), align |
| `listItem`  | segments (text / bold / link)        |
| `hr`        | (none)                               |
| `image`     | src (sprite registry key), align     |
| `spacer`    | height (px)                          |
| `br`        | (none)                               |

Inline segments within paragraphs and list items support:

| Kind   | Fields     |
| ------ | ---------- |
| `text` | text       |
| `bold` | text       |
| `link` | text, href |

This is already essentially a JSON IR hiding behind an HTML parser.

## Proposed SiteSpec Schema

A `SiteSpec` would be the JSON equivalent of the current markup, using enums and
typed objects instead of raw HTML strings.

```typescript
interface SiteSpec {
  name: string;
  url: string;
  keywords?: string[];
  cards: SiteCard[];
}

interface SiteCard {
  id: string;
  nodes: SiteNode[];
}

type SiteNode =
  | { type: "heading"; level: 1 | 2; text: string; align?: Align }
  | { type: "paragraph"; segments: InlineSegment[]; align?: Align }
  | { type: "list"; items: InlineSegment[][] }
  | { type: "hr" }
  | { type: "image"; src: string; align?: Align }
  | { type: "spacer"; height: number }
  | { type: "br" };

type InlineSegment =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string };

type Align = "left" | "center" | "right";
```

### Key design decisions

- **Enums over strings**: `type` is one of a fixed set of values. `align` is
  constrained to three values. `kind` for inline segments is `text | bold |
link`. There are no escape hatches like `rawHtml` or `customMarkup`.

- **`list` wraps multiple items**: Rather than individual `listItem` nodes, a
  `list` node contains an array of items. This is both more natural as a schema
  and makes it impossible for the LLM to produce orphaned list items.

- **`cards` is always an array**: The current markup has an implicit "no cards =
  single home card" fallback. In the JSON schema, cards are always explicit,
  which removes ambiguity.

- **Optional `align` defaults to `"left"`**: Keeps the common case minimal.

### Example

Current markup:

```html
<card id="home">
<h1 align="center">Mockintosh</h1>
<img src="microdesktop-disk" align="center">
<spacer height="8">
<p align="center">A mock operating system.</p>
<hr>
<h2>Features</h2>
<ul>
<li>1-bit graphics</li>
<li>Window management</li>
</ul>
<p><a href="#about">About this project</a></p>
</card>
```

Equivalent SiteSpec JSON:

```json
{
  "name": "Mockintosh",
  "url": "mockintosh.com",
  "cards": [
    {
      "id": "home",
      "nodes": [
        {
          "type": "heading",
          "level": 1,
          "text": "Mockintosh",
          "align": "center"
        },
        { "type": "image", "src": "microdesktop-disk", "align": "center" },
        { "type": "spacer", "height": 8 },
        {
          "type": "paragraph",
          "align": "center",
          "segments": [{ "kind": "text", "text": "A mock operating system." }]
        },
        { "type": "hr" },
        { "type": "heading", "level": 2, "text": "Features" },
        {
          "type": "list",
          "items": [
            [{ "kind": "text", "text": "1-bit graphics" }],
            [{ "kind": "text", "text": "Window management" }]
          ]
        },
        {
          "type": "paragraph",
          "segments": [
            { "kind": "link", "text": "About this project", "href": "#about" }
          ]
        }
      ]
    }
  ]
}
```

## Compilation Pipeline

The compiler from `SiteSpec` to rendered content is trivial because `SiteSpec`
maps directly to the existing `LayoutNode[]` type:

```
SiteSpec JSON  →  compile()  →  Map<string, LayoutNode[]>  →  renderSiteNodes()
     ↑                                                              ↓
  LLM output                                              Pixels on screen
  (strict schema)                                         (deterministic)
```

`compile()` would be a straightforward mapping function — convert each
`SiteCard` to a map entry, convert `SiteNode` to `LayoutNode`, expand `list`
items into individual `listItem` nodes. No parsing, no ambiguity. If the JSON
is valid against the schema, the output is guaranteed to render correctly.

## Integration with App Builder

The App Builder could gain a "Build a Website" mode alongside the existing app
code generation:

1. User types "build me a website about X" or selects a "Website" mode toggle
2. The system prompt switches to the SiteSpec schema + examples (much smaller
   than the full app API reference)
3. The LLM response uses **structured outputs** (`response_format: { type:
"json_schema", ... strict: true }`) to guarantee valid JSON
4. The response is compiled to `LayoutNode[]` and previewed in a Safari window
5. If the user iterates ("add a contact page", "make the heading bigger"), the
   LLM receives the current SiteSpec and returns a patched version
6. "Publish" registers the site in the Safari site registry (or saves it to
   MockFS as a site file)

### Advantages over generating markup strings

| Aspect              | Markup string                 | SiteSpec JSON                |
| ------------------- | ----------------------------- | ---------------------------- |
| Parse errors        | Common (unclosed tags, typos) | Impossible (schema-enforced) |
| Injection risk      | Script tags, event attrs      | No escape hatches            |
| Model hallucination | Can invent unsupported tags   | Constrained to enum values   |
| Error feedback      | "Tag X not recognized"        | Schema violation with path   |
| Iteration           | Full string replacement       | JSON patch / merge           |
| Validation          | Requires HTML parser          | JSON Schema validation       |

## Trade-offs

- **Verbosity**: JSON is more verbose than the HTML-like markup. A simple site
  that's 10 lines of markup might be 30 lines of JSON. However, this only
  matters for human authoring — the LLM doesn't care about token count in the
  output, and the structured output constraint actually makes generation more
  reliable.

- **Migration**: Existing hardcoded sites in `Safari.ts` use the markup format.
  These could be converted to SiteSpec, or the existing `parseSiteMarkup` could
  remain as a separate path for human-authored content. No need to migrate
  everything at once.

- **Expressiveness ceiling**: The SiteSpec schema is intentionally limited. If
  sites later need interactivity (forms, counters, dynamic content), that would
  require either extending the schema or falling back to the sandboxed app
  approach. The line between "site" and "app" should stay clear.

## Open Questions

- **Storage format**: Should user-created sites be stored as SiteSpec JSON in
  MockFS (a new `fileType: "site"`), or compiled to markup and stored as text?
  JSON is more structured and easier to edit programmatically; markup is more
  compact and human-readable.

- **Multi-page navigation**: The current card system handles intra-site links
  (`#cardId`). Cross-site links (`google.com`) navigate via the Safari URL bar.
  Should the SiteSpec support external links explicitly, or is that already
  covered by links with non-`#` hrefs?

- **Sprite/image availability**: Sites can reference sprites from the registry.
  Should the LLM be given a list of available sprite names, or should it be
  restricted to text-only sites initially?

## Next Steps

This document is exploratory. If we decide to proceed, the implementation would
be:

1. Define the `SiteSpec` TypeScript types (small, based on schema above)
2. Write `compileSiteSpec(spec: SiteSpec): Map<string, LayoutNode[]>`
3. Add a "Website" mode to the App Builder with a SiteSpec-focused system prompt
4. Use structured outputs for the LLM call in website mode
5. Add site preview in a Safari window (instead of a sandboxed app Worker)
6. Add "Publish" support to register generated sites
