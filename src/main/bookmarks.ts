import fs from "fs";
import path from "path";

export interface Bookmark {
    id: string;
    title: string;
    url: string;
    createdAt: number;
}

export class BookmarkManager {
    private bookmarks: Bookmark[] = [];
    private readonly filePath: string;

    constructor(userDataPath: string) {
        this.filePath = path.join(
            userDataPath,
            "bookmarks.json"
        );

        this.load();
    }

    add(title: string, url: string): Bookmark | null {
        if (!url) {
            return null;
        }

        const existing = this.findByUrl(url);

        if (existing) {
            return existing;
        }

        const bookmark: Bookmark = {
            id: crypto.randomUUID(),
            title: title || url,
            url,
            createdAt: Date.now()
        };

        this.bookmarks.unshift(bookmark);

        this.save();

        console.log(
            "[Bookmarks] Added:",
            bookmark.title,
            bookmark.url
        );

        return bookmark;
    }

    remove(id: string): void {
        const originalLength = this.bookmarks.length;

        this.bookmarks = this.bookmarks.filter(
            (bookmark) => bookmark.id !== id
        );

        if (this.bookmarks.length !== originalLength) {
            this.save();

            console.log(
                "[Bookmarks] Removed:",
                id
            );
        }
    }

    removeByUrl(url: string): void {
        const originalLength = this.bookmarks.length;

        this.bookmarks = this.bookmarks.filter(
            (bookmark) => bookmark.url !== url
        );

        if (this.bookmarks.length !== originalLength) {
            this.save();

            console.log(
                "[Bookmarks] Removed URL:",
                url
            );
        }
    }

    getAll(): Bookmark[] {
        return [...this.bookmarks];
    }

    findByUrl(url: string): Bookmark | null {
        return (
            this.bookmarks.find(
                (bookmark) => bookmark.url === url
            ) ?? null
        );
    }

    isBookmarked(url: string): boolean {
        return this.findByUrl(url) !== null;
    }

    updateTitle(
        url: string,
        title: string
    ): void {
        if (!url || !title) {
            return;
        }

        const bookmark = this.findByUrl(url);

        if (!bookmark) {
            return;
        }

        bookmark.title = title;

        this.save();
    }

    clear(): void {
        this.bookmarks = [];

        this.save();

        console.log("[Bookmarks] Cleared.");
    }

    private load(): void {
        try {
            if (!fs.existsSync(this.filePath)) {
                console.log(
                    "[Bookmarks] No bookmark file found. Starting empty."
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
                    "[Bookmarks] Invalid bookmark file."
                );

                return;
            }

            this.bookmarks = parsed.filter(
                (bookmark): bookmark is Bookmark =>
                    typeof bookmark === "object" &&
                    bookmark !== null &&
                    typeof (bookmark as Bookmark).id === "string" &&
                    typeof (bookmark as Bookmark).title === "string" &&
                    typeof (bookmark as Bookmark).url === "string" &&
                    typeof (bookmark as Bookmark).createdAt === "number"
            );

            console.log(
                `[Bookmarks] Loaded ${this.bookmarks.length} bookmarks.`
            );
        } catch (error) {
            console.error(
                "[Bookmarks] Failed to load:",
                error
            );

            this.bookmarks = [];
        }
    }

    private save(): void {
        try {
            fs.writeFileSync(
                this.filePath,
                JSON.stringify(
                    this.bookmarks,
                    null,
                    2
                ),
                "utf-8"
            );

            console.log(
                `[Bookmarks] Saved ${this.bookmarks.length} bookmarks.`
            );
        } catch (error) {
            console.error(
                "[Bookmarks] Failed to save:",
                error
            );
        }
    }
}