// Installed apps import @mockintosh/sdk through the import map. Re-export the
// package specifier so blob artifacts share the OS's AppServicesContext — a
// second evaluation of createContext makes useApp() throw inside a real window.
export * from "@mockintosh/sdk";
