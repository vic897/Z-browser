import {
    app,
    BrowserWindow,
    WebContentsView,
    ipcMain
} from "electron";

import path from "path";

import { NavigationController } from "./main/navigation";
import { TabManager } from "./main/tabs";
import { HistoryManager } from "./main/history";
import { BookmarkManager } from "./main/bookmarks";
import { DownloadManager } from "./main/downloads";
import { resolveNavigationInput } from "./main/urlResolver";


let mainWindow: BrowserWindow | null = null;

let navController: NavigationController;
let tabManager: TabManager;
let historyManager: HistoryManager;
let bookmarkManager: BookmarkManager;
let downloadManager: DownloadManager;


/* =========================
   HISTORY VIEW
========================= */

let historyView: WebContentsView | null = null;
let historyVisible = false;


/* =========================
   BOOKMARKS VIEW
========================= */

let bookmarksView: WebContentsView | null = null;
let bookmarksVisible = false;


/* =========================
   DOWNLOADS VIEW
========================= */

let downloadsView: WebContentsView | null = null;
let downloadsVisible = false;


/* =========================
   SHOW / CLOSE HISTORY
========================= */

function showHistory(): void {

    if (!historyView || !mainWindow) {
        return;
    }

    historyVisible = true;

    tabManager.setContentVisible(false);

    bookmarksVisible = false;

    if (bookmarksView) {
        bookmarksView.setVisible(false);
    }

    downloadsVisible = false;

    if (downloadsView) {
        downloadsView.setVisible(false);
    }

    historyView.webContents.reload();

    historyView.setVisible(true);

    mainWindow.contentView.addChildView(
        historyView
    );
}


function closeHistory(): void {

    if (!historyView) {
        return;
    }

    historyVisible = false;

    historyView.setVisible(false);

    if (
        !bookmarksVisible &&
        !downloadsVisible
    ) {

        tabManager.setContentVisible(true);
    }
}


/* =========================
   SHOW / CLOSE BOOKMARKS
========================= */

function showBookmarks(): void {

    if (!bookmarksView || !mainWindow) {
        return;
    }

    bookmarksVisible = true;

    historyVisible = false;

    if (historyView) {
        historyView.setVisible(false);
    }

    downloadsVisible = false;

    if (downloadsView) {
        downloadsView.setVisible(false);
    }

    tabManager.setContentVisible(false);

    bookmarksView.webContents.reload();

    bookmarksView.setVisible(true);

    mainWindow.contentView.addChildView(
        bookmarksView
    );
}


function closeBookmarks(): void {

    if (!bookmarksView) {
        return;
    }

    bookmarksVisible = false;

    bookmarksView.setVisible(false);

    if (
        !historyVisible &&
        !downloadsVisible
    ) {

        tabManager.setContentVisible(true);
    }
}


/* =========================
   SHOW / CLOSE DOWNLOADS
========================= */

function showDownloads(): void {

    if (!downloadsView || !mainWindow) {
        return;
    }

    downloadsVisible = true;

    historyVisible = false;

    if (historyView) {
        historyView.setVisible(false);
    }

    bookmarksVisible = false;

    if (bookmarksView) {
        bookmarksView.setVisible(false);
    }

    tabManager.setContentVisible(false);

    downloadsView.webContents.reload();

    downloadsView.setVisible(true);

    mainWindow.contentView.addChildView(
        downloadsView
    );
}


function closeDownloads(): void {

    if (!downloadsView) {
        return;
    }

    downloadsVisible = false;

    downloadsView.setVisible(false);

    if (
        !historyVisible &&
        !bookmarksVisible
    ) {

        tabManager.setContentVisible(true);
    }
}


/* =========================
   CREATE WINDOW
========================= */

function createWindow(): void {

    mainWindow =
        new BrowserWindow({

            width: 1400,

            height: 900,

            minWidth: 900,

            minHeight: 600,

            webPreferences: {

                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    ),

                contextIsolation: true,

                nodeIntegration: false,

                sandbox: false
            }
        });


    /*
     * =========================
     * MANAGERS
     * =========================
     */

    historyManager =
        new HistoryManager(
            app.getPath("userData")
        );


    bookmarkManager =
        new BookmarkManager(
            app.getPath("userData")
        );


    downloadManager =
        new DownloadManager(
            app.getPath("userData")
        );


    navController =
        new NavigationController();


    tabManager =
        new TabManager(
            mainWindow,
            navController,
            historyManager
        );


    downloadManager.initialize();


    /*
     * =========================
     * BROWSER SHELL
     * =========================
     */

    mainWindow.loadFile(
        path.join(
            __dirname,
            "../src/index.html"
        )
    );


    /*
     * =========================
     * HISTORY VIEW
     * =========================
     */

    historyView =
        new WebContentsView({

            webPreferences: {

                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    ),

                contextIsolation: true,

                nodeIntegration: false,

                sandbox: false
            }
        });


    mainWindow.contentView.addChildView(
        historyView
    );


    historyView.setBounds({

        x: 0,

        y: 100,

        width:
            mainWindow.getContentBounds().width,

        height:
            mainWindow.getContentBounds().height -
            100
    });


    historyView.setVisible(false);


    historyView.webContents.loadFile(
        path.join(
            __dirname,
            "../src/history.html"
        )
    );


    /*
     * =========================
     * BOOKMARKS VIEW
     * =========================
     */

    bookmarksView =
        new WebContentsView({

            webPreferences: {

                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    ),

                contextIsolation: true,

                nodeIntegration: false,

                sandbox: false
            }
        });


    mainWindow.contentView.addChildView(
        bookmarksView
    );


    bookmarksView.setBounds({

        x: 0,

        y: 100,

        width:
            mainWindow.getContentBounds().width,

        height:
            mainWindow.getContentBounds().height -
            100
    });


    bookmarksView.setVisible(false);


    bookmarksView.webContents.loadFile(
        path.join(
            __dirname,
            "../src/bookmarks.html"
        )
    );


    /*
     * =========================
     * DOWNLOADS VIEW
     * =========================
     */

    downloadsView =
        new WebContentsView({

            webPreferences: {

                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    ),

                contextIsolation: true,

                nodeIntegration: false,

                sandbox: false
            }
        });


    mainWindow.contentView.addChildView(
        downloadsView
    );


    downloadsView.setBounds({

        x: 0,

        y: 100,

        width:
            mainWindow.getContentBounds().width,

        height:
            mainWindow.getContentBounds().height -
            100
    });


    downloadsView.setVisible(false);


    downloadsView.webContents.loadFile(
        path.join(
            __dirname,
            "../src/downloads.html"
        )
    );


    /*
     * =========================
     * DOWNLOAD EVENTS
     * =========================
     */

    downloadManager.onUpdated(
        (downloads) => {

            if (
                !downloadsView ||
                downloadsView.webContents.isDestroyed()
            ) {

                return;
            }


            downloadsView.webContents.send(
                "browser:downloads-updated",
                downloads
            );
        }
    );


    /*
     * =========================
     * INITIAL TAB
     * =========================
     */

    const initialTab =
        tabManager.createTab(
            "https://www.youtube.com"
        );


    navController.setActiveTab(
        initialTab
    );


    /*
     * =========================
     * WINDOW RESIZE
     * =========================
     */

    mainWindow.on(
        "resize",
        () => {

            if (!mainWindow) {
                return;
            }


            const bounds =
                mainWindow.getContentBounds();


            historyView?.setBounds({

                x: 0,

                y: 100,

                width: bounds.width,

                height:
                    bounds.height - 100
            });


            bookmarksView?.setBounds({

                x: 0,

                y: 100,

                width: bounds.width,

                height:
                    bounds.height - 100
            });


            downloadsView?.setBounds({

                x: 0,

                y: 100,

                width: bounds.width,

                height:
                    bounds.height - 100
            });
        }
    );
}


/* =========================
   APP LIFECYCLE
========================= */

app.whenReady().then(() => {

    createWindow();


    app.on(
        "activate",
        () => {

            if (
                BrowserWindow.getAllWindows()
                    .length === 0
            ) {

                createWindow();
            }
        }
    );
});


app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {

            app.quit();
        }
    }
);


/* =========================
   NAVIGATION IPC
========================= */

ipcMain.on(
    "browser:navigate",
    (_event, input: string) => {

        closeHistory();

        closeBookmarks();

        closeDownloads();


        const url =
            resolveNavigationInput(
                input
            );


        if (!url) {
            return;
        }


        navController.navigate(
            url
        );
    }
);


ipcMain.on(
    "browser:back",
    () => {

        closeHistory();

        closeBookmarks();

        closeDownloads();

        navController.goBack();
    }
);


ipcMain.on(
    "browser:forward",
    () => {

        closeHistory();

        closeBookmarks();

        closeDownloads();

        navController.goForward();
    }
);


ipcMain.on(
    "browser:reload",
    () => {

        closeHistory();

        closeBookmarks();

        closeDownloads();

        navController.reload();
    }
);


/* =========================
   TAB IPC
========================= */

ipcMain.on(
    "browser:new-tab",
    () => {

        closeHistory();

        closeBookmarks();

        closeDownloads();


        const tab =
            tabManager.createTab();


        navController.setActiveTab(
            tab
        );
    }
);


ipcMain.on(
    "browser:close-tab",
    (_event, id: string) => {

        closeHistory();

        closeBookmarks();

        closeDownloads();

        tabManager.closeTab(id);
    }
);


ipcMain.on(
    "browser:switch-tab",
    (_event, id: string) => {

        closeHistory();

        closeBookmarks();

        closeDownloads();

        tabManager.setActiveTab(
            id
        );
    }
);


ipcMain.on(
    "browser:next-tab",
    () => {

        closeHistory();

        closeBookmarks();

        closeDownloads();

        tabManager.switchToNextTab();
    }
);


ipcMain.on(
    "browser:previous-tab",
    () => {

        closeHistory();

        closeBookmarks();

        closeDownloads();

        tabManager.switchToPreviousTab();
    }
);


/* =========================
   HISTORY IPC
========================= */

ipcMain.handle(
    "browser:get-history",
    () => {

        return tabManager.getHistory();
    }
);


ipcMain.on(
    "browser:clear-history",
    () => {

        tabManager.clearHistory();
    }
);


ipcMain.on(
    "browser:show-history",
    () => {

        showHistory();
    }
);


ipcMain.on(
    "browser:close-history",
    () => {

        closeHistory();
    }
);


/* =========================
   BOOKMARK IPC
========================= */

ipcMain.handle(
    "browser:get-bookmarks",
    () => {

        return bookmarkManager.getAll();
    }
);


ipcMain.handle(
    "browser:is-bookmarked",
    (
        _event,
        url: string
    ) => {

        return bookmarkManager.isBookmarked(
            url
        );
    }
);


ipcMain.handle(
    "browser:add-bookmark",
    (
        _event,
        title: string,
        url: string
    ) => {

        return bookmarkManager.add(
            title,
            url
        );
    }
);


ipcMain.handle(
    "browser:remove-bookmark",
    (
        _event,
        id: string
    ) => {

        bookmarkManager.remove(
            id
        );
    }
);


ipcMain.handle(
    "browser:remove-bookmark-by-url",
    (
        _event,
        url: string
    ) => {

        bookmarkManager.removeByUrl(
            url
        );
    }
);


ipcMain.on(
    "browser:show-bookmarks",
    () => {

        showBookmarks();
    }
);


ipcMain.on(
    "browser:close-bookmarks",
    () => {

        closeBookmarks();
    }
);


/* =========================
   DOWNLOAD IPC
========================= */


/*
 * GET DOWNLOADS
 */

ipcMain.handle(
    "browser:get-downloads",
    () => {

        return downloadManager.getAll();
    }
);


/*
 * REMOVE DOWNLOAD
 */

ipcMain.handle(
    "browser:remove-download",
    (
        _event,
        id: string
    ) => {

        downloadManager.remove(
            id
        );
    }
);


/*
 * CLEAR DOWNLOADS
 */

ipcMain.on(
    "browser:clear-downloads",
    () => {

        downloadManager.clear();
    }
);


/*
 * CANCEL DOWNLOAD
 *
 * Preload uses ipcRenderer.send(),
 * so this must use ipcMain.on().
 */

ipcMain.on(
    "browser:cancel-download",
    (
        _event,
        id: string
    ) => {

        downloadManager.cancel(
            id
        );
    }
);


/*
 * OPEN DOWNLOAD
 *
 * Registered exactly once.
 */

ipcMain.handle(
    "browser:open-download",
    async (
        _event,
        id: string
    ) => {

        console.log(
            "[Downloads IPC] Open:",
            id
        );

        await downloadManager.open(
            id
        );
    }
);


/*
 * SHOW DOWNLOAD IN FOLDER
 *
 * Registered exactly once.
 */

ipcMain.on(
    "browser:show-download-in-folder",
    (
        _event,
        id: string
    ) => {

        console.log(
            "[Downloads IPC] Show in folder:",
            id
        );

        downloadManager.showInFolder(
            id
        );
    }
);


/*
 * SHOW DOWNLOADS VIEW
 */

ipcMain.on(
    "browser:show-downloads",
    () => {

        showDownloads();
    }
);


/*
 * CLOSE DOWNLOADS VIEW
 */

ipcMain.on(
    "browser:close-downloads",
    () => {

        closeDownloads();
    }
);