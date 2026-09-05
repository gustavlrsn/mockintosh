# Macintosh Toolbox & QuickDraw API Reference

This directory contains a **structured, machine-readable API reference** for the original Mac OS Toolbox managers and QuickDraw, derived from Inside Macintosh and the mockintosh QuickDraw package.

## Primary file

- **`macintosh-toolbox-api.yaml`** — Single source of truth for:
  - **QuickDraw** (Basic): types, constants, and routines (port management, drawing primitives, regions, text, pictures).
  - **Toolbox managers**: Window Manager, Menu Manager, Control Manager, Dialog Manager, Event Manager, Resource Manager, File Manager, Memory Manager, and short stubs for other managers (Font, Process, Scrap, etc.).

## Format

The YAML uses a custom schema suited to procedural (Pascal/C-style) APIs:

- **Routines**: `name`, `description`, `signature`, `parameters`, `returnType`, optional `category`.
- **Types**: `name`, `kind` (record, handle, integer, etc.), `description`, and `fields` (for records) or `baseType` (for handles).
- **Constants**: `name`, `value`, `description`.

You can parse the YAML in JavaScript/TypeScript (e.g. `js-yaml`) to:

- Generate Markdown or HTML documentation.
- Validate that `packages/quickdraw` exports match the QuickDraw routine list.
- Drive codegen or consistency checks.

## Relationship to the codebase

- **QuickDraw**: The routine names and types in the spec align with [packages/quickdraw](../packages/quickdraw). The package is the authoritative implementation; the spec documents the original Mac API that the package re-implements.
- **Managers**: Mockintosh implements subsets of the Toolbox (e.g. in `lib/toolbox/`). The spec documents the full original API; not every routine is implemented in mockintosh.

## Extending the spec

To add or correct entries:

1. Edit `macintosh-toolbox-api.yaml` directly.
2. For new managers, add an entry under `managers` with `id`, `name`, `description`, and optionally `types` and `routines`.
3. For new routines, use the same shape as existing entries: `name`, `description`, `signature`, `parameters`, `returnType`, and optionally `category`.

A formal JSON Schema for the YAML structure can be added later if tooling requires it.
