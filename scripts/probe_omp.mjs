const keys = (value) => value && typeof value === "object" ? Object.keys(value).sort() : [];

export default function probe(pi) {
  const report = {
    api_keys: keys(pi),
    has_register_tool: typeof pi?.registerTool === "function",
    has_on: typeof pi?.on === "function",
    has_events: keys(pi?.events),
    model_keys: keys(pi?.models),
    memory_keys: keys(pi?.memory),
  };
  console.error(`NOESIS_OMP_PROBE ${JSON.stringify(report)}`);
  if (typeof pi?.registerTool === "function") {
    pi.registerTool({
      name: "noesis_probe",
      label: "NOESIS probe",
      description: "M0 compatibility probe.",
      parameters: pi.arktype ? pi.arktype({}) : pi.zod ? pi.zod.object({}) : undefined,
      execute: async () => ({ content: [{ type: "text", text: "probe" }] }),
    });
  }
  return {};
}
