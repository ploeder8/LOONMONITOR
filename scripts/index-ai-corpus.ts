import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
const OPENAI_API_BASE = "https://api.openai.com/v1";
const CORPUS_ROOTS = ["knowledgebase"];
const INDEXED_EXTENSIONS = new Set([".md", ".json", ".html"]);
type OpenAiFile = {
    id: string;
};
type VectorStore = {
    id: string;
};
async function main() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY ontbreekt. Run via `pnpm exec vercel env pull .env.local` of zet de env var lokaal.");
    }
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID || (await createVectorStore(apiKey)).id;
    const files = await collectCorpusFiles();
    console.log(`Indexeer ${files.length} corpusbestanden naar vector store ${vectorStoreId}`);
    for (const filePath of files) {
        const relativePath = normalizePath(path.relative(process.cwd(), filePath));
        const uploaded = await uploadFile(apiKey, filePath, relativePath);
        await attachFileToVectorStore(apiKey, vectorStoreId, uploaded.id);
        console.log(`- ${relativePath}`);
    }
    console.log("");
    console.log(`OPENAI_VECTOR_STORE_ID=${vectorStoreId}`);
    console.log("Zet deze waarde in Vercel wanneer dit een nieuwe vector store is.");
}
async function collectCorpusFiles(): Promise<string[]> {
    const files: string[] = [];
    for (const root of CORPUS_ROOTS) {
        await collectFromDirectory(path.resolve(root), files);
    }
    return files.sort((a, b) => a.localeCompare(b));
}
async function collectFromDirectory(directory: string, files: string[]): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            await collectFromDirectory(fullPath, files);
            continue;
        }
        if (entry.isFile() && INDEXED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            const info = await stat(fullPath);
            if (info.size > 0)
                files.push(fullPath);
        }
    }
}
async function createVectorStore(apiKey: string): Promise<VectorStore> {
    const response = await openAiFetch(apiKey, "/vector_stores", {
        method: "POST",
        body: JSON.stringify({
            name: `Jaakie kennisbank ${new Date().toISOString().slice(0, 10)}`,
        }),
    });
    return response.json();
}
async function uploadFile(apiKey: string, filePath: string, relativePath: string): Promise<OpenAiFile> {
    const inhoud = await readFile(filePath, "utf8");
    const bronHeader = `Bronbestand: ${relativePath}\n\n`;
    const blob = new Blob([bronHeader, inhoud], { type: "text/plain;charset=utf-8" });
    const form = new FormData();
    form.set("purpose", "assistants");
    form.set("file", blob, relativePath.replace(/[\\/]/g, "__"));
    const response = await fetch(`${OPENAI_API_BASE}/files`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: form,
    });
    if (!response.ok) {
        throw new Error(`OpenAI file upload faalde voor ${relativePath}: ${response.status} ${await response.text()}`);
    }
    return response.json();
}
async function attachFileToVectorStore(apiKey: string, vectorStoreId: string, fileId: string): Promise<void> {
    await openAiFetch(apiKey, `/vector_stores/${vectorStoreId}/files`, {
        method: "POST",
        body: JSON.stringify({ file_id: fileId }),
    });
}
async function openAiFetch(apiKey: string, pathName: string, init: RequestInit): Promise<Response> {
    const response = await fetch(`${OPENAI_API_BASE}${pathName}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...init.headers,
        },
    });
    if (!response.ok) {
        throw new Error(`OpenAI API-fout ${response.status}: ${await response.text()}`);
    }
    return response;
}
function normalizePath(value: string): string {
    return value.replace(/\\/g, "/");
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
