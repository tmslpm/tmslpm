const WRITE_TO_FILE: boolean = true;
const CONFIG_PREFIX: string = "tms";
const CONFIG_CLONE: [FnCreate, ...{ names: string[], color: string }[]][] = [
  [
    (names, color) => [
      MakeClone(
        `${names[0]}-css`,
        "css",
        color,
        ...names.map(name => `${name}.css`)
      )
    ],
    {
      names: ["helloworld"],
      color: "blue-700"
    }
  ],

  [
    (names, color) => [
      MakeClone(
        `${names[0]}-ts-json`,
        "json",
        color,
        ...names.map(name => `${name}.json`)
      ),
      MakeClone(
        `${names[0]}-ts`,
        "typescript",
        color,
        ...names.flatMap(v => [
          `${v}.ts`,
          `${v}.mts`,
          `${v}.cts`,
          `${v}.tsx`,
          `${v}.d.ts`,
          `${v}.d.mts`,
          `${v}.d.cts`,
        ])
      ),
      MakeClone(
        `${names[0]}-ts-test`,
        "test-ts",
        color,
        ...names.flatMap(v => [
          `${v}.test.ts`,
          `${v}.test.mts`,
          `${v}.test.cts`,
          `${v}.test.tsx`,
        ])
      )
    ],

    // ex: [ foo.type.ts ]
    {
      names: ["type"],
      color: "blue-400"
    },

    // ex: [ foo.function.ts ]
    {
      names: ["function", "func", "fn", "helper"],
      color: "lime-700"
    },

    // ex: [ foo.class.ts ]
    {
      names: ["class"],
      color: "green-600"
    },

    // ex: [ foo.entity.ts ]
    {
      names: ["entity"],
      color: "indigo-400"
    },

    // ex: [ foo.repository.ts ]
    {
      names: ["repository", "repos"],
      color: "green-500"
    },

    // ex: [ foo.enum.ts ]
    {
      names: ["enum"],
      color: "teal-500"
    },

    // ex: [ foo.service.ts ]
    {
      names: ["service", "singleton", "controller"],
      color: "yellow-600"
    },
  ]
];

const MakeClone = (name: string, base: string, color: string, ...exts: string[]) =>
  ({ name: `${CONFIG_PREFIX}-${name}`, base, color, fileExtensions: exts });

(async function main(): Promise<void> {
  console.group("starting generation...");

  const patternExts = new Set<string>();
  const colorClones = new Set<string>();
  const data = new Map<string, Clone[]>();

  for (const element of CONFIG_CLONE) {
    const [fnCreate, ...configs] = element;

    for (const config of configs) {
      const key = `${CONFIG_PREFIX}-${config.names[0]}`;

      console.group(`processing "${key}"...`);

      if (data.has(key)) throw new Error(
        `Duplicate clone name: "${config.names[0]}"`
      );

      const result = fnCreate(config.names, config.color);

      const exts = result.flatMap(v => v.fileExtensions);
      const duplicateExt = exts.find(ext => patternExts.has(ext));
      if (duplicateExt) throw new Error(
        `Duplicate file extension: "${duplicateExt}"` +
        ` (already registered by another clone)`
      );

      const colors = result.flatMap(v => v.color);
      const duplicateColor = colors.find(v => colorClones.has(v));
      if (duplicateColor) throw new Error(
        `Duplicate color: "${duplicateColor}"` +
        ` (already registered by another color)`
      );

      for (const ext of exts) patternExts.add(ext);
      for (const color of colors) colorClones.add(color);

      data.set(key, result);

      console.log(`- ${result.length} clones | ${exts.length} extensions`);
      console.groupEnd();
    }
  }

  const allClones = [...data.values()].flat();

  const serialized = JSON.stringify({
    "material-icon-theme.files.customClones": allClones
  }, null, 2);

  console.groupEnd();
  console.log(`generation complete — ${data.size} groups, ${allClones.length} clones total`);

  if (WRITE_TO_FILE) {
    const bytes = await Bun.write("material-icon-theme.output.json", serialized);
    const resolved = (await import("path")).resolve("material-icon-theme.output.json");
    console.log(`written ${bytes} bytes → ${resolved}`);
  } else {
    console.log("result:");
    console.log(serialized);
  }
})();

type Clone = { name: string, base: string, color: string, fileExtensions: string[] };
type FnCreate = (names: string[], color: string) => Clone[];
