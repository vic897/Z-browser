import fs from "fs";
import path from "path";

export interface HistoryEntry {
    url: string;
    title: string;
    timestamp: number;
}

export class HistoryManager {
    private entries: HistoryEntry[] = [];
    private readonly filePath: string;

    constructor(userDataPath: string) {
        this.filePath = path.join(
            userDataPath,
            "history.json"
        );

        this.load();
    }

    addEntry(url: string, title: string): void {
        if (!url) {
            return;
        }

        this.entries.push({
            url,
            title: title || url,
            timestamp: Date.now()
        });

        this.save();
    }

    updateLatestTitle(
        url: string,
        title: string
    ): void {
        if (!url || !title) {
            return;
        }

        for (let i = this.entries.length - 1; i >= 0; i--) {
            if (this.entries[i].url === url) {
                this.entries[i].title = title;
                this.save();
                return;
            }
        }
    }

    getEntries(): HistoryEntry[] {
        return [...this.entries];
    }

    clear(): void {
        this.entries = [];
        this.save();
    }

    search(query: string): HistoryEntry[] {
        const value = query
            .trim()
            .toLowerCase();

        if (!value) {
            return this.getEntries();
        }

        return this.entries.filter(
            (entry) =>
                entry.url
                    .toLowerCase()
                    .includes(value) ||
                entry.title
                    .toLowerCase()
                    .includes(value)
        );
    }

    private load(): void {
        try {
            if (!fs.existsSync(this.filePath)) {
                console.log(
                    "[History] No history file found. Starting empty."
                );
                return;
            }

            const data = fs.readFileSync(
                this.filePath,
                "utf-8"
            );

            const parsed: unknown = JSON.parse(data);

            if (!Array.isArray(parsed)) {
                console.error(
                    "[History] Invalid history file."
                );
                return;
            }

            this.entries = parsed.filter(
                (entry): entry is HistoryEntry =>
                    typeof entry === "object" &&
                    entry !== null &&
                    typeof (entry as HistoryEntry).url === "string" &&
                    typeof (entry as HistoryEntry).title === "string" &&
                    typeof (entry as HistoryEntry).timestamp === "number"
            );

            console.log(
                `[History] Loaded ${this.entries.length} entries.`
            );
        } catch (error) {
            console.error(
                "[History] Failed to load history:",
                error
            );

            this.entries = [];
        }
    }

    private save(): void {
        try {
            fs.writeFileSync(
                this.filePath,
                JSON.stringify(
                    this.entries,
                    null,
                    2
                ),
                "utf-8"
            );

            console.log(
                `[History] Saved ${this.entries.length} entries.`
            );
        } catch (error) {
            console.error(
                "[History] Failed to save history:",
                error
            );
        }
    }
}