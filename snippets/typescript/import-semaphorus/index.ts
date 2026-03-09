import { cpus } from "node:os";

export type DefaultModule<T> = { default: T };

export function isValidModule<T>(mod: unknown): mod is DefaultModule<T> {
	return (
		mod !== null &&
		typeof mod === "object" &&
		"default" in mod &&
		typeof (mod as Record<string, unknown>).default === "function"
	);
}

/**
 * - Process in batches sized to CPU count
 * - Collect all files concurrently using async iterator
 */
export default function loadModules() {
	const concurrency = cpus().length * 2;
	const semaphorusQueue: (() => void)[] = [];
	let running = 0;

	return {
		load: async function load<T>(
			/** pattern used for Bun.Glob. */
			pattern: string,
			/** The root directory to start matching from.*/
			dir: string,
		) {
			const modules: DefaultModule<T>[] = [];
			const glob = new Bun.Glob(`**/*.{${pattern}}.mts`);
			const files: string[] = await Array.fromAsync(
				glob.scan({ cwd: dir, absolute: true }),
			);

			if (files.length === 0) return modules;

			for (let i = 0; i < files.length; i += concurrency) {
				const slice = files.slice(i, i + concurrency);
				const batch = await Promise.all(
					slice.map(async (file) => {
						await new Promise<void>((resolve) => {
							// no max reached just count and resolve
							if (running < concurrency) {
								running++;
								resolve();
								return;
							}
							// waiting before resolve because max reached
							else {
								semaphorusQueue.push(() => {
									running++;
									resolve();
								});
							}
						});

						try {
							// execute the async import and wait
							const m = await import(file);
							console.info(`Success loading module "${file}"`);
							running--; // release after import
							const firstOrNothing = semaphorusQueue.shift();
							if (firstOrNothing != null) firstOrNothing();
							return m;
						} catch (e) {
							console.error(`Failed loading module ${file}"`);
							throw e;
						}
					}),
				);

				for (let j = 0; j < batch.length; j++) {
					if (!isValidModule<T>(batch[j])) {
						throw new Error(
							`Module "${slice[j]}" does not export a default function`,
						);
					}

					modules.push(batch[j]);
				}
			}

			return modules;
		},
	};
}
