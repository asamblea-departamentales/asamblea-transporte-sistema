export const queryKeys = {
  dashboard: ["dashboard"] as const,
  requests: (module: string, filters: object) => ["requests", module, filters] as const,
  catalogs: (module: string) => ["catalogs", module] as const,
  requestDetail: (module: string, id: string | number) => ["request", module, id] as const,
};
