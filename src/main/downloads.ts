import fs from "fs";
import path from "path";

import {
    DownloadItem,
    session,
    shell
} from "electron";


export type DownloadState =
    | "progressing"
    | "completed"
    | "cancelled"
    | "failed";


export interface DownloadEntry {

    id: string;

    filename: string;

    url: string;

    path: string;

    state: DownloadState;

    receivedBytes: number;

    totalBytes: number;

    startTime: number;

    endTime?: number;
}


export class DownloadManager {

    private downloads: DownloadEntry[] = [];

    private readonly downloadDirectory: string;

    private readonly filePath: string;

    private saveTimer:
        NodeJS.Timeout | null = null;

    private readonly activeDownloads =
        new Map<string, DownloadItem>();

    private readonly updateListeners:
        Array<
            (
                downloads: DownloadEntry[]
            ) => void
        > = [];

    private initialized = false;


    constructor(
        userDataPath: string
    ) {

        this.downloadDirectory =
            path.join(
                userDataPath,
                "downloads"
            );


        this.filePath =
            path.join(
                userDataPath,
                "downloads.json"
            );


        fs.mkdirSync(
            this.downloadDirectory,
            {
                recursive: true
            }
        );


        this.load();


        console.log(
            "[Downloads] Directory:",
            this.downloadDirectory
        );
    }


    /* =========================
       INITIALIZE
    ========================= */

    initialize(): void {

        if (this.initialized) {
            return;
        }


        this.initialized = true;


        session.defaultSession.on(
            "will-download",
            (_event, item) => {

                this.handleDownload(
                    item
                );
            }
        );


        console.log(
            "[Downloads] Manager initialized."
        );
    }


    /* =========================
       UPDATE LISTENERS
    ========================= */

    onUpdated(
        listener: (
            downloads: DownloadEntry[]
        ) => void
    ): void {

        this.updateListeners.push(
            listener
        );
    }


    private notifyUpdated(): void {

        const downloads =
            this.getAll();


        for (
            const listener
            of this.updateListeners
        ) {

            listener(
                downloads
            );
        }
    }


    /* =========================
       HANDLE DOWNLOAD
    ========================= */

    private handleDownload(
        item: DownloadItem
    ): void {

        const id =
            crypto.randomUUID();


        const filename =
            item.getFilename();


        const filePath =
            this.getUniqueFilePath(
                filename
            );


        item.setSavePath(
            filePath
        );


        const entry: DownloadEntry = {

            id,

            filename:
                path.basename(
                    filePath
                ),

            url:
                item.getURL(),

            path:
                filePath,

            state:
                "progressing",

            receivedBytes:
                0,

            totalBytes:
                item.getTotalBytes(),

            startTime:
                Date.now()
        };


        this.downloads.unshift(
            entry
        );


        this.activeDownloads.set(
            id,
            item
        );


        this.save();

        this.notifyUpdated();


        console.log(
            "[Downloads] Started:",
            entry.filename
        );


        /* =========================
           UPDATED
        ========================= */

        item.on(
            "updated",
            (_event, state) => {

                entry.receivedBytes =
                    item.getReceivedBytes();


                entry.totalBytes =
                    item.getTotalBytes();


                if (
                    state === "interrupted"
                ) {

                    entry.state =
                        "failed";


                    entry.endTime =
                        Date.now();


                    this.activeDownloads.delete(
                        id
                    );


                    this.save();

                    this.notifyUpdated();


                    console.log(
                        "[Downloads] Interrupted:",
                        entry.filename
                    );


                    return;
                }


                this.scheduleSave();

                this.notifyUpdated();

                this.logProgress(
                    entry
                );
            }
        );


        /* =========================
           DONE
        ========================= */

        item.once(
            "done",
            (_event, state) => {

                entry.receivedBytes =
                    item.getReceivedBytes();


                entry.totalBytes =
                    item.getTotalBytes();


                entry.endTime =
                    Date.now();


                this.activeDownloads.delete(
                    id
                );


                if (
                    state === "completed"
                ) {

                    entry.state =
                        "completed";


                    console.log(
                        "[Downloads] Completed:",
                        entry.filename
                    );

                } else if (
                    state === "cancelled"
                ) {

                    entry.state =
                        "cancelled";


                    console.log(
                        "[Downloads] Cancelled:",
                        entry.filename
                    );

                } else {

                    entry.state =
                        "failed";


                    console.log(
                        "[Downloads] Failed:",
                        entry.filename
                    );
                }


                this.save();

                this.notifyUpdated();
            }
        );
    }


    /* =========================
       CANCEL
    ========================= */

    cancel(
        id: string
    ): void {

        const item =
            this.activeDownloads.get(
                id
            );


        if (!item) {

            console.log(
                "[Downloads] No active download:",
                id
            );

            return;
        }


        item.cancel();


        console.log(
            "[Downloads] Cancel requested:",
            id
        );
    }


    /* =========================
       OPEN
    ========================= */

    async open(
        id: string
    ): Promise<void> {

        const download =
            this.downloads.find(
                (entry) =>
                    entry.id === id
            );


        if (!download) {

            console.error(
                "[Downloads] Download not found:",
                id
            );

            return;
        }


        if (
            download.state !==
            "completed"
        ) {

            console.error(
                "[Downloads] Download is not completed:",
                download.filename
            );

            return;
        }


        if (
            !fs.existsSync(
                download.path
            )
        ) {

            console.error(
                "[Downloads] File does not exist:",
                download.path
            );

            return;
        }


        const error =
            await shell.openPath(
                download.path
            );


        if (error) {

            console.error(
                "[Downloads] Failed to open:",
                error
            );

        } else {

            console.log(
                "[Downloads] Opened:",
                download.path
            );
        }
    }


    /* =========================
       SHOW IN FOLDER
    ========================= */

    showInFolder(
        id: string
    ): void {

        const download =
            this.downloads.find(
                (entry) =>
                    entry.id === id
            );


        if (!download) {

            console.error(
                "[Downloads] Download not found:",
                id
            );

            return;
        }


        if (
            !fs.existsSync(
                download.path
            )
        ) {

            console.error(
                "[Downloads] File does not exist:",
                download.path
            );

            return;
        }


        shell.showItemInFolder(
            download.path
        );


        console.log(
            "[Downloads] Showing in folder:",
            download.path
        );
    }


    /* =========================
       GET ALL
    ========================= */

    getAll(): DownloadEntry[] {

        return this.downloads.map(
            (download) => ({
                ...download
            })
        );
    }


    /* =========================
       CLEAR
    ========================= */

    clear(): void {

        this.downloads = [];


        this.save();

        this.notifyUpdated();


        console.log(
            "[Downloads] History cleared."
        );
    }


    /* =========================
       REMOVE
    ========================= */

    remove(
        id: string
    ): void {

        const originalLength =
            this.downloads.length;


        this.downloads =
            this.downloads.filter(
                (download) =>
                    download.id !== id
            );


        if (
            this.downloads.length !==
            originalLength
        ) {

            this.save();

            this.notifyUpdated();


            console.log(
                "[Downloads] Removed:",
                id
            );
        }
    }


    /* =========================
       UNIQUE FILE PATH
    ========================= */

    private getUniqueFilePath(
        filename: string
    ): string {

        const safeFilename =
            path.basename(
                filename
            );


        const extension =
            path.extname(
                safeFilename
            );


        const baseName =
            path.basename(
                safeFilename,
                extension
            );


        let filePath =
            path.join(
                this.downloadDirectory,
                safeFilename
            );


        let counter = 1;


        while (
            fs.existsSync(
                filePath
            )
        ) {

            filePath =
                path.join(
                    this.downloadDirectory,
                    `${baseName} (${counter})${extension}`
                );


            counter++;
        }


        return filePath;
    }


    /* =========================
       LOG PROGRESS
    ========================= */

    private logProgress(
        entry: DownloadEntry
    ): void {

        if (
            entry.totalBytes <= 0
        ) {

            return;
        }


        const percentage =
            (
                entry.receivedBytes /
                entry.totalBytes
            ) * 100;


        if (
            percentage >= 100
        ) {

            return;
        }


        console.log(
            `[Downloads] ${entry.filename}: ${percentage.toFixed(1)}%`
        );
    }


    /* =========================
       LOAD
    ========================= */

    private load(): void {

        try {

            if (
                !fs.existsSync(
                    this.filePath
                )
            ) {

                console.log(
                    "[Downloads] No download history found. Starting empty."
                );

                return;
            }


            const data =
                fs.readFileSync(
                    this.filePath,
                    "utf-8"
                );


            const parsed: unknown =
                JSON.parse(
                    data
                );


            if (
                !Array.isArray(
                    parsed
                )
            ) {

                console.error(
                    "[Downloads] Invalid download history file."
                );

                return;
            }


            this.downloads =
                parsed
                    .filter(
                        (
                            download
                        ): download is DownloadEntry => {

                            if (
                                typeof download !==
                                    "object" ||
                                download === null
                            ) {

                                return false;
                            }


                            const entry =
                                download as DownloadEntry;


                            return (

                                typeof entry.id ===
                                    "string" &&

                                typeof entry.filename ===
                                    "string" &&

                                typeof entry.url ===
                                    "string" &&

                                typeof entry.path ===
                                    "string" &&

                                (
                                    entry.state ===
                                        "progressing" ||

                                    entry.state ===
                                        "completed" ||

                                    entry.state ===
                                        "cancelled" ||

                                    entry.state ===
                                        "failed"
                                ) &&

                                typeof entry.receivedBytes ===
                                    "number" &&

                                typeof entry.totalBytes ===
                                    "number" &&

                                typeof entry.startTime ===
                                    "number"
                            );
                        }
                    )
                    .map(
                        (
                            download
                        ) => ({

                            ...download,

                            state:
                                download.state ===
                                "progressing"

                                    ? "failed"

                                    : download.state
                        })
                    );


            console.log(
                `[Downloads] Loaded ${this.downloads.length} downloads.`
            );

        } catch (error) {

            console.error(
                "[Downloads] Failed to load:",
                error
            );


            this.downloads = [];
        }
    }


    /* =========================
       SAVE
    ========================= */

    private save(): void {

        try {

            fs.writeFileSync(
                this.filePath,

                JSON.stringify(
                    this.downloads,
                    null,
                    2
                ),

                "utf-8"
            );


            console.log(
                `[Downloads] Saved ${this.downloads.length} downloads.`
            );

        } catch (error) {

            console.error(
                "[Downloads] Failed to save:",
                error
            );
        }
    }


    /* =========================
       SCHEDULE SAVE
    ========================= */

    private scheduleSave(): void {

        if (
            this.saveTimer !== null
        ) {

            return;
        }


        this.saveTimer =
            setTimeout(
                () => {

                    this.saveTimer =
                        null;

                    this.save();

                },
                1000
            );
    }
}