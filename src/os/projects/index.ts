import {diskPath} from "./paths";
import {MIME} from "@mockintosh/fs";
import {Kernel, ServiceError, defineOperation, type Disk, type Execution, type KernelSession} from "../kernel";
import {Cancellation} from "../kernel/cancellation";
import {getApp, registerApp, unregisterApp} from "../apps";
import {validateModule} from "../installedApps";
import {missingCapabilities} from "../capabilities";
import type {OSServices} from "../context";
import type {Platform} from "../../platform/types";
import {buildResult, diagnostic, projectPath, type BuildProvider, type BuildResult} from "../../shared/buildContract";
import * as s from "../kernel/schema";

const manifestSchema = s.object({id: s.string, title: s.string, entry: s.string, sdkVersion: {enum: ["2"]}});
const selectionSchema = s.object({projectId: s.string, app: s.string, build: s.string, previous: s.string}, ["projectId", "app", "build"]);
const selectionsSchema = s.array(selectionSchema);
const artifactSchema = s.object({id: s.string, sourceRevision: s.string, codeRevision: s.integer, toolchain: s.string});
export const jobSchema = s.object({id: s.string, project: s.string, sourceRevision: s.string,
  state: {enum: ["building", "succeeded", "failed", "cancelled"]}, diagnostics: s.array(diagnostic)});
type Job = s.Value<typeof jobSchema>;
type Selection = s.Value<typeof selectionSchema>;
const encoder = new TextEncoder(), decoder = new TextDecoder();
const errorText = (error: unknown) => error instanceof Error ? error.message : String(error);

export const counterSource = (id: string, title: string) => `import { createSignal } from "solid-js";
import { defineApp } from "@mockintosh/sdk";
import { Button } from "@mockintosh/ui";
function Counter() {
  const [count, setCount] = createSignal(0);
  return <box padding={12} gap={8}>
    <text semantic={{name: "counter-value"}}>{String(count())}</text>
    <Button name="counter-increment" label="Add one" onClick={() => setCount(count() + 1)} />
  </box>;
}
export default defineApp({ id: ${JSON.stringify(id)}, title: ${JSON.stringify(title)}, icon: "icon/computer",
  defaultSize: {width: 220, height: 100}, Component: Counter });
`;

/** Project/build state is OS data. Compilation and module loading are host adapters. */
export class ProjectService {
  private builder?: BuildProvider;
  private jobs = new Map<string, {value: Job; owner: string; token: Cancellation; release: () => void}>();
  private selected = new Map<string, Selection>();
  private sequence = 0;
  private loadErrors = new Map<string, string>();
  private changing = new Set<string>();
  constructor(private kernel: Kernel, private os: OSServices, private platform: Platform, private render: () => Promise<void>) {
    this.builder = platform.builder;
  }
  connectBuilder(provider: BuildProvider): () => void {
    this.builder = provider;
    return () => { if (this.builder === provider) this.builder = this.platform.builder; };
  }
  installed() { return [...this.selected.values()].map(selection => ({...selection, error: this.loadErrors.get(selection.app)})); }
  selectedBuild(app: string) { return this.selected.get(app)?.build; }
  pathFor(id: string) { return diskPath(this.os.fs, id); }
  projectIdForApp(app: string) { return this.selected.get(app)?.projectId; }
  projectForApp(app: string): string | undefined { const selected = this.selected.get(app); return selected ? this.pathFor(selected.projectId) : undefined; }
  private async persist() {
    const folder = this.os.fs.locate("preferences")!;
    await this.os.fs.writeJSON(folder.id, "project-installs.json", [...this.selected.values()]);
    await this.os.fs.flush();
  }
  async loadInstalled() {
    const file = this.os.fs.child(this.os.fs.locate("preferences")!.id, "project-installs.json");
    if (!file) return;
    let selections: readonly Selection[];
    try { selections = s.parse(selectionsSchema, await this.os.fs.readJSON(file.id)); }
    catch (error) { console.error("Invalid project installs", error); return; }
    for (const selection of selections) {
      try {
        if (getApp(selection.app)) throw new Error("Project app id conflicts with an existing app");
        this.selected.set(selection.app, selection);
        const app = await this.load(selection, this.kernel.disk!);
        if (app.sprites) this.os.sprites.registerAll(app.sprites);
        registerApp(app);
        this.selected.set(selection.app, selection);
      } catch (error) { this.loadErrors.set(selection.app, errorText(error)); }
    }
  }
  private async load(selection: Selection, disk: Disk, sourceRevision?: string) {
    if (!this.platform.loadArtifact) throw new ServiceError("unsupported-operation", "This host cannot load app artifacts");
    const path = `${this.pathFor(selection.projectId)}/dist/${selection.build}`;
    const record = s.parse(artifactSchema, JSON.parse(decoder.decode(await disk.read(path + "/build.json"))));
    if (sourceRevision !== undefined && record.sourceRevision !== sourceRevision) throw new ServiceError("conflict", "Sources changed after this build; rebuild before installing");
    const code = await disk.stat(path + "/index.js");
    if (record.id !== selection.build || code.revision !== record.codeRevision) throw new ServiceError("conflict", "Build artifact was edited; rebuild from source");
    const module = validateModule(selection.app, await this.platform.loadArtifact(decoder.decode(await disk.read(code.path)), record.id));
    if (missingCapabilities(module.default.requires, this.os.capabilities).length) throw new ServiceError("unsupported-operation", "Build needs unavailable host capabilities");
    // Sprites are registered only after module validation; names belong to the app's bundle.
    return {...module.default, sprites: {...module.default.sprites, ...module.sprites}};
  }
  async create(path: string, id: string, title: string, e: Execution) {
    if (!/^[a-z][a-z0-9_-]{0,63}$/.test(id)) throw new ServiceError("invalid-argument", "Use a lowercase app id with letters, digits, underscores or hyphens");
    if (getApp(id)) throw new ServiceError("conflict", "App id is already registered");
    await e.disk.mkdir(path);
    await e.disk.mkdir(path + "/src");
    await e.disk.mkdir(path + "/dist");
    await e.disk.write(path + "/mockintosh.json", encoder.encode(JSON.stringify({id, title, entry: "src/index.tsx", sdkVersion: "2"}, null, 2)), 0);
    await e.disk.write(path + "/src/index.tsx", encoder.encode(counterSource(id, title)), 0);
    await e.disk.write(path + "/README.md", encoder.encode("Edit src/index.tsx, build, then install. Restore switches to the previous successful build.\n"), 0);
    return e.disk.stat(path);
  }
  private async snapshot(path: string, e: Execution) {
    const project = await e.disk.stat(path);
    const manifestResource = await e.disk.stat(path + "/mockintosh.json");
    const manifest = s.parse(manifestSchema, JSON.parse(decoder.decode(await e.disk.read(manifestResource.path))));
    if (!projectPath(manifest.entry) || !manifest.entry.startsWith("src/")) throw new ServiceError("invalid-argument", "Entry must be a relative source path");
    const resources = [manifestResource];
    const files: {path: string; text: string}[] = [];
    let size = 0;
    const walk = async (directory: string) => {
      for (const file of await e.disk.list(directory)) {
        resources.push(file);
        if (resources.length > 128) throw new ServiceError("invalid-argument", "Project has too many source files");
        if (file.kind === "directory") await walk(file.path);
        else {
          const bytes = await e.disk.read(file.path);
          size += bytes.length;
          if (size > 1048576) throw new ServiceError("invalid-argument", "Project sources exceed 1 MiB");
          files.push({path: file.path.slice(path.length + 1), text: decoder.decode(bytes)});
        }
      }
    };
    resources.push(await e.disk.stat(path + "/src"));
    await walk(path + "/src");
    // A snapshot must not silently combine source revisions while files are edited.
    for (const before of resources) {
      const after = await e.disk.stat(before.path);
      if (after.id !== before.id || after.revision !== before.revision) throw new ServiceError("conflict", "Sources changed during snapshot; submit again");
    }
    const sourceRevision = resources.map(r => `${r.id}:${r.revision}`).sort().join("|");
    return {project, manifest, files, sourceRevision};
  }
  async submit(path: string, e: Execution): Promise<Job> {
    const builder = this.builder;
    if (!builder) throw new ServiceError("unsupported-operation", "No build provider is available on this platform");
    if ([...this.jobs.values()].filter(job => job.value.state === "building").length >= 4) throw new ServiceError("conflict", "Too many active builds");
    const {project, manifest, files, sourceRevision} = await this.snapshot(path, e);
    const id = `build-${this.kernel.instance}-${this.kernel.generation}-${++this.sequence}`;
    const token = new Cancellation();
    const releaseOwner = this.kernel.onSessionEnd(e.caller, () => token.cancel());
    const releaseParent = e.cancellation.subscribe(() => token.cancel());
    const release = () => { releaseOwner(); releaseParent(); };
    const entry = {value: {id, project: project.id, sourceRevision, state: "building", diagnostics: []} as Job, owner: e.caller.id, token, release};
    this.jobs.set(id, entry);
    // Completed build records are persisted; bound the boot's in-memory journal.
    for (const [key, prior] of this.jobs) if (this.jobs.size > 64 && prior.value.state !== "building") this.jobs.delete(key);
    void (async () => {
      try {
        const result = s.parse(buildResult, await builder.build({requestId: id, sourceRevision, entry: manifest.entry, sdkVersion: "2", files}, token));
        token.check();
        if (result.code === undefined || result.diagnostics.length) {
          entry.value = {...entry.value, state: "failed", diagnostics: result.diagnostics};
          return;
        }
        const destination = `${this.pathFor(project.id)}/dist/${id}`;
        await e.disk.mkdir(destination);
        token.check();
        const code = await e.disk.write(destination + "/index.js", encoder.encode(result.code), 0);
        if (result.map) await e.disk.write(destination + "/index.js.map", encoder.encode(result.map), 0);
        token.check();
        await e.disk.write(destination + "/build.json", encoder.encode(JSON.stringify({id, sourceRevision, codeRevision: code.revision, toolchain: result.toolchain})), 0);
        entry.value = {...entry.value, state: "succeeded"};
      } catch (error) {
        entry.value = {...entry.value, state: token.cancelled ? "cancelled" : "failed", diagnostics: [{message: errorText(error)}]};
      } finally { release(); }
    })();
    return {...entry.value};
  }
  status(id: string, caller: KernelSession): Job {
    const job = this.jobs.get(id);
    if (!job || job.owner !== caller.id) throw new ServiceError("missing-resource", "No build for this caller");
    return {...job.value, diagnostics: job.value.diagnostics.map(d => ({...d}))};
  }
  cancel(id: string, caller: KernelSession) { this.status(id, caller); this.jobs.get(id)!.token.cancel(); }
  async install(path: string, build: string, e: Execution, restore = false) {
    const project = await e.disk.stat(path);
    const manifest = s.parse(manifestSchema, JSON.parse(decoder.decode(await e.disk.read(path + "/mockintosh.json"))));
    if (!/^[\w-]+$/.test(build)) throw new ServiceError("invalid-argument", "Invalid build id");
    if (this.changing.has(manifest.id)) throw new ServiceError("conflict", "This app is already changing builds");
    const previous = this.selected.get(manifest.id);
    if (getApp(manifest.id) && (!previous || previous.projectId !== project.id)) throw new ServiceError("conflict", "App id belongs to another app");
    if (restore && (!previous?.previous || previous.previous !== build)) throw new ServiceError("missing-resource", "No previous build");
    this.changing.add(manifest.id);
    const selection: Selection = {projectId: project.id, app: manifest.id, build, ...(previous && previous.build !== build ? {previous: previous.build} : previous?.previous ? {previous: previous.previous} : {})};
    const oldApp = getApp(manifest.id);
    let switched = false;
    try {
      const current = !restore && previous?.build !== build ? await this.snapshot(path, e) : undefined;
      const app = await this.load(selection, e.disk, current?.sourceRevision);
      e.cancellation.check();
      switched = true;
      this.os.instances!.stopApp(manifest.id);
      this.os.sprites.registerAll(app.sprites);
      registerApp(app);
      this.selected.set(manifest.id, selection);
      this.os.openApp(manifest.id);
      await this.render();
      const failure = this.os.instances!.list().find(instance => instance.app === manifest.id && instance.error);
      if (failure) throw new Error(failure.error);
      e.cancellation.check();
      await this.persist();
      const desktop = this.os.fs.locate("desktop")!;
      const shortcuts = this.os.fs.children(desktop.id).filter(node => this.os.fs.attributes(node.id).projectApp === manifest.id);
      if (!shortcuts.length) await this.os.fs.writeJSON(desktop.id, manifest.title, {appId: manifest.id}, {type: MIME.appShortcut, attributes: {icon: app.icon, projectApp: manifest.id}});
      await this.os.fs.flush();
      this.loadErrors.delete(manifest.id);
      return selection;
    } catch (error) {
      if (!switched) throw error;
      this.os.instances!.stopApp(manifest.id);
      if (previous) this.selected.set(manifest.id, previous); else this.selected.delete(manifest.id);
      if (oldApp) { if (oldApp.sprites) this.os.sprites.registerAll(oldApp.sprites); registerApp(oldApp); this.os.openApp(manifest.id); }
      else unregisterApp(manifest.id);
      // Roll back the selected manifest too if later publication failed.
      try { await this.persist(); } catch { /* Preserve the original failure; retry/reconcile disk persistence. */ }
      throw error;
    } finally { this.changing.delete(manifest.id); }
  }
  async restart(app: string, e: Execution, restore = false) {
    const selection = this.selected.get(app);
    if (!selection) throw new ServiceError("missing-resource", "App is not a project install");
    return this.install(this.pathFor(selection.projectId), restore ? selection.previous ?? "" : selection.build, e, restore);
  }
  close() { for (const app of this.selected.keys()) unregisterApp(app); for (const job of this.jobs.values()) { job.token.cancel(); job.release(); } this.jobs.clear(); }
}

export async function registerProjects(kernel: Kernel, os: OSServices, platform: Platform, render: () => Promise<void>): Promise<ProjectService> {
  const projects = new ProjectService(kernel, os, platform, render);
  const add: typeof defineOperation = (...args) => { const op = defineOperation(...args); kernel.register(op); return op; };
  add("source_open", "Open a project in the source editor", {path: s.string}, ["path"], s.object({opened: s.string}), async (a, e) => { await e.disk.stat(a.path); os.openApp("source_editor", {path: a.path}); return {opened: a.path}; });
  add("project_create", "Create an editable Counter app project", {path: s.string, id: s.string, title: s.string}, ["path", "id", "title"], s.resource, (a, e) => projects.create(a.path, a.id, a.title, e));
  add("build_submit", "Snapshot and compile a project; returns a caller-owned job", {path: s.string}, ["path"], jobSchema, (a, e) => projects.submit(a.path, e));
  add("build_status", "Inspect a build job", {id: s.string}, ["id"], jobSchema, async (a, e) => projects.status(a.id, e.caller));
  add("build_cancel", "Cancel a build owned by this caller", {id: s.string}, ["id"], {type: "null"}, async (a, e) => { projects.cancel(a.id, e.caller); return null; });
  add("app_install", "Install and launch an immutable successful project build", {path: s.string, build: s.string}, ["path", "build"], selectionSchema, (a, e) => projects.install(a.path, a.build, e));
  for (const name of ["app_restart", "app_restore"] as const) add(name, name === "app_restart" ? "Restart the selected build with clean app resources" : "Restore and launch the previous successful build", {app: s.string}, ["app"], selectionSchema, (a, e) => projects.restart(a.app, e, name === "app_restore"));
  add("instances", "Inspect actual app instances and their windows", {}, [], s.array(s.object({id: s.string, app: s.string, build: s.string, windows: s.array(s.string), error: s.string}, ["id", "app", "windows"])), async () => os.instances!.list());
  await projects.loadInstalled();
  return projects;
}
