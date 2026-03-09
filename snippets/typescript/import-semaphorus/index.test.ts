// load-modules.fn.test.mts
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import loadModules, {
	isValidModule,
} from "../../main/helpers/load-modules.fn.mjs";

describe("load-modules.fn.test.mts", () => {
	const TMP_DIR = join(import.meta.dirname, "__tmp_modules__");

	const writeModule = async (name: string, content: string) => {
		await writeFile(join(TMP_DIR, name), content, "utf-8");
	};

	beforeEach(async () => {
		await mkdir(TMP_DIR, { recursive: true });
	});

	afterEach(async () => {
		await rm(TMP_DIR, { recursive: true, force: true });
	});

	// fn: isValidModule
	describe("isValidModule", () => {
		test("returns true for object with default function", () => {
			expect(isValidModule({ default: () => {} })).toBe(true);
		});

		test("returns false for null", () => {
			expect(isValidModule(null)).toBe(false);
		});

		test("returns false for missing default", () => {
			expect(isValidModule({ other: () => {} })).toBe(false);
		});

		test("returns false when default is not a function", () => {
			expect(isValidModule({ default: "string" })).toBe(false);
			expect(isValidModule({ default: 42 })).toBe(false);
			expect(isValidModule({ default: null })).toBe(false);
		});

		test("returns false for primitives", () => {
			expect(isValidModule("string")).toBe(false);
			expect(isValidModule(42)).toBe(false);
		});
	});

	// fn loadModules
	describe("loadModules", () => {
		test("returns empty array when no files match", async () => {
			const result = await loadModules().load("handle", TMP_DIR);
			expect(result).toEqual([]);
		});

		test("loads a single valid module", async () => {
			await writeModule(
				"test.handle.mts",
				`export default function handler() { return "ok"; }`,
			);

			const result = await loadModules().load<() => string>("handle", TMP_DIR);

			expect(result).toHaveLength(1);

			// biome-ignore lint/style/noNonNullAssertion: <test>
			expect(typeof result[0]!.default).toBe("function");

			// biome-ignore lint/style/noNonNullAssertion: <test>
			expect(result[0]!.default()).toBe("ok");
		});

		test("loads multiple valid modules", async () => {
			await writeModule(
				"a.handle.mts",
				`export default function a() { return "a"; }`,
			);
			await writeModule(
				"b.handle.mts",
				`export default function b() { return "b"; }`,
			);
			await writeModule(
				"c.handle.mts",
				`export default function c() { return "c"; }`,
			);

			const result = await loadModules().load<() => string>("handle", TMP_DIR);
			expect(result).toHaveLength(3);
			const values = result.map((m) => m.default()).sort();
			expect(values).toEqual(["a", "b", "c"]);
		});

		test("throws when a module has no default export", async () => {
			await writeModule(
				"bad.handle.mts",
				`export const notDefault = () => {};`,
			);

			expect(loadModules().load("handle", TMP_DIR)).rejects.toThrow(
				/does not export a default function/,
			);
		});

		test("throws when default export is not a function", async () => {
			await writeModule("bad.handle.mts", `export default "i am a string";`);

			expect(loadModules().load("handle", TMP_DIR)).rejects.toThrow(
				/does not export a default function/,
			);
		});

		test("ignores files that don't match the pattern", async () => {
			await writeModule(
				"ignored.menu.mts",
				`export default function menu() {}`,
			);
			await writeModule(
				"match.handle.mts",
				`export default function handler() {}`,
			);

			const result = await loadModules().load("handle", TMP_DIR);
			expect(result).toHaveLength(1);
		});

		test("loads modules matching multiple patterns", async () => {
			await writeModule("a.handle.mts", `export default function a() {}`);
			await writeModule("b.menu.mts", `export default function b() {}`);

			const result = await loadModules().load("handle,menu", TMP_DIR);
			expect(result).toHaveLength(2);
		});

		test("handles async default exports", async () => {
			await writeModule(
				"async.handle.mts",
				`export default async function handler() { return "async"; }`,
			);

			const result = await loadModules().load<() => Promise<string>>(
				"handle",
				TMP_DIR,
			);
			expect(result).toHaveLength(1);
			// biome-ignore lint/style/noNonNullAssertion: <test>
			expect(result[0]!.default()).resolves.toBe("async");
		});
	});
});
