import {
    app,
    BrowserWindow,
    ipcMain,
    WebContentsView
} from "electron";

import path from "path";

import { BookmarkManager } from "./main/bookmarks";
import { NavigationController } from "./main/navigation";
import { resolveNavigationInput } from "./main/urlResolver";
import { TabManager } from "./main/tabs";
import { HistoryManager } from "./main/history";


let navController: NavigationController;

let tabManager: TabManager;

let historyManager: HistoryManager;

let historyView: WebContentsView | null = null;

let historyVisible = false;

let bookmarkManager: BookmarkManager;

let bookmarksView: WebContentsView | null = null;

let bookmarksVisible = false;


/*
 * =========================
 * HISTORY VIEW
 * =========================
 */

function createHistoryView(
    win: BrowserWindow
): WebContentsView {

    const view =
        new WebContentsView({
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,
                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    )
            }
        });


    win.contentView.addChildView(
        view
    );


    const [
        width,
        height
    ] =
        win.getContentSize();


    view.setBounds({
        x: 0,
        y: 100,
        width,
        height: height - 100
    });


    view.setVisible(
        false
    );


    view.webContents.loadFile(
        path.join(
            __dirname,
            "../src/history.html"
        )
    );


    return view;
}


/*
 * =========================
 * SHOW HISTORY
 * =========================
 */

function showHistory(): void {

    if (!historyView) {
        return;
    }


    const win =
        BrowserWindow.getAllWindows()[0];


    if (!win) {
        return;
    }


    /*
     * Only one internal page should
     * be visible at a time.
     */

    if (bookmarksVisible) {
        closeBookmarks();
    }


    historyVisible = true;


    /*
     * Hide the currently active
     * browser tab.
     */

    tabManager.setContentVisible(
        false
    );


    /*
     * Reload so the History UI gets
     * the latest HistoryManager data.
     */

    historyView.webContents.reload();


    historyView.setVisible(
        true
    );


    /*
     * Re-adding an existing child view
     * moves it above the other views.
     */

    win.contentView.addChildView(
        historyView
    );
}


/*
 * =========================
 * CLOSE HISTORY
 * =========================
 */

function closeHistory(): void {

    if (!historyView) {
        return;
    }


    historyVisible = false;


    historyView.setVisible(
        false
    );


    /*
     * Restore the active browser tab.
     *
     * If Bookmarks is visible, it will
     * remain responsible for the content area.
     */

    if (!bookmarksVisible) {
        tabManager.setContentVisible(
            true
        );
    }
}


/*
 * =========================
 * BOOKMARKS VIEW
 * =========================
 */

function createBookmarksView(
    win: BrowserWindow
): WebContentsView {

    const view =
        new WebContentsView({
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,
                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    )
            }
        });


    win.contentView.addChildView(
        view
    );


    const [
        width,
        height
    ] =
        win.getContentSize();


    view.setBounds({
        x: 0,
        y: 100,
        width,
        height: height - 100
    });


    view.setVisible(
        false
    );


    view.webContents.loadFile(
        path.join(
            __dirname,
            "../src/bookmarks.html"
        )
    );


    return view;
}


/*
 * =========================
 * SHOW BOOKMARKS
 * =========================
 */

function showBookmarks(): void {

    if (!bookmarksView) {
        return;
    }


    const win =
        BrowserWindow.getAllWindows()[0];


    if (!win) {
        return;
    }


    /*
     * Only one internal page should
     * be visible at a time.
     */

    if (historyVisible) {
        closeHistory();
    }


    bookmarksVisible = true;


    /*
     * Hide the active browser tab.
     */

    tabManager.setContentVisible(
        false
    );


    /*
     * Reload so the UI gets the
     * latest bookmark data.
     */

    bookmarksView.webContents.reload();


    bookmarksView.setVisible(
        true
    );


    /*
     * Move the bookmarks view above
     * the browser tabs.
     */

    win.contentView.addChildView(
        bookmarksView
    );
}


/*
 * =========================
 * CLOSE BOOKMARKS
 * =========================
 */

function closeBookmarks(): void {

    if (!bookmarksView) {
        return;
    }


    bookmarksVisible = false;


    bookmarksView.setVisible(
        false
    );


    /*
     * Restore the active browser tab
     * unless History is currently open.
     */

    if (!historyVisible) {
        tabManager.setContentVisible(
            true
        );
    }
}


/*
 * =========================
 * CREATE WINDOW
 * =========================
 */

function createWindow(): void {

    const win =
        new BrowserWindow({
            width: 1400,
            height: 900,

            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,

                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    )
            }
        });


    /*
     * =========================
     * DATA MANAGERS
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


    /*
     * =========================
     * CONTROLLERS
     * =========================
     */

    navController =
        new NavigationController();


    tabManager =
        new TabManager(
            win,
            navController,
            historyManager
        );


    /*
     * =========================
     * MAIN BROWSER SHELL
     * =========================
     */

    win.loadFile(
        path.join(
            __dirname,
            "../src/index.html"
        )
    );


    /*
     * =========================
     * INTERNAL VIEWS
     * =========================
     */

    historyView =
        createHistoryView(
            win
        );


    bookmarksView =
        createBookmarksView(
            win
        );


    /*
     * =========================
     * INITIAL TAB
     * =========================
     */

    tabManager.createTab(
        "https://www.youtube.com"
    );


    /*
     * =========================
     * WINDOW RESIZE
     * =========================
     */

    win.on(
        "resize",
        () => {

            const [
                width,
                height
            ] =
                win.getContentSize();


            /*
             * Resize every browser tab.
             */

            for (
                const tab
                of tabManager.getTabs()
            ) {

                tab.webView.setBounds({
                    x: 0,
                    y: 100,
                    width,
                    height: height - 100
                });
            }


            /*
             * Resize History view.
             */

            if (historyView) {

                historyView.setBounds({
                    x: 0,
                    y: 100,
                    width,
                    height: height - 100
                });
            }


            /*
             * Resize Bookmarks view.
             */

            if (bookmarksView) {

                bookmarksView.setBounds({
                    x: 0,
                    y: 100,
                    width,
                    height: height - 100
                });
            }
        }
    );
}


/*
 * =========================
 * APP READY
 * =========================
 */

app.whenReady().then(
    () => {

        createWindow();


        app.on(
            "activate",
            () => {

                if (
                    BrowserWindow
                        .getAllWindows()
                        .length === 0
                ) {

                    createWindow();
                }
            }
        );
    }
);


/*
 * =========================
 * WINDOW CLOSED
 * =========================
 */

app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !==
            "darwin"
        ) {

            app.quit();
        }
    }
);


/*
 * =========================
 * NAVIGATION IPC
 * =========================
 */

ipcMain.on(
    "browser:navigate",
    (_event, input) => {

        /*
         * Internal pages must close
         * when normal browser navigation
         * begins.
         */

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        const url =
            resolveNavigationInput(
                input
            );


        if (
            url.length === 0
        ) {

            return;
        }


        navController.navigate(
            url
        );
    }
);


/*
 * =========================
 * BACK
 * =========================
 */

ipcMain.on(
    "browser:back",
    () => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        navController.goBack();
    }
);


/*
 * =========================
 * FORWARD
 * =========================
 */

ipcMain.on(
    "browser:forward",
    () => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        navController.goForward();
    }
);


/*
 * =========================
 * RELOAD
 * =========================
 */

ipcMain.on(
    "browser:reload",
    () => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        navController.reload();
    }
);


/*
 * =========================
 * NEW TAB
 * =========================
 */

ipcMain.on(
    "browser:new-tab",
    () => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        tabManager.createTab();
    }
);


/*
 * =========================
 * CLOSE TAB
 * =========================
 */

ipcMain.on(
    "browser:close-tab",
    (_event, id) => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        tabManager.closeTab(
            id
        );
    }
);


/*
 * =========================
 * SWITCH TAB
 * =========================
 */

ipcMain.on(
    "browser:switch-tab",
    (_event, id) => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        tabManager.setActiveTab(
            id
        );
    }
);


/*
 * =========================
 * NEXT TAB
 * =========================
 */

ipcMain.on(
    "browser:next-tab",
    () => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        tabManager.switchToNextTab();
    }
);


/*
 * =========================
 * PREVIOUS TAB
 * =========================
 */

ipcMain.on(
    "browser:previous-tab",
    () => {

        if (historyVisible) {
            closeHistory();
        }


        if (bookmarksVisible) {
            closeBookmarks();
        }


        tabManager.switchToPreviousTab();
    }
);


/*
 * =========================
 * GET HISTORY
 * =========================
 */

ipcMain.handle(
    "browser:get-history",
    () => {

        return tabManager.getHistory();
    }
);


/*
 * =========================
 * CLEAR HISTORY
 * =========================
 */

ipcMain.on(
    "browser:clear-history",
    () => {

        tabManager.clearHistory();
    }
);


/*
 * =========================
 * SHOW HISTORY
 * =========================
 */

ipcMain.on(
    "browser:show-history",
    () => {

        showHistory();
    }
);


/*
 * =========================
 * CLOSE HISTORY
 * =========================
 */

ipcMain.on(
    "browser:close-history",
    () => {

        closeHistory();
    }
);


/*
 * =========================
 * GET BOOKMARKS
 * =========================
 */

ipcMain.handle(
    "browser:get-bookmarks",
    () => {

        return bookmarkManager.getAll();
    }
);


/*
 * =========================
 * IS BOOKMARKED
 * =========================
 */

ipcMain.handle(
    "browser:is-bookmarked",
    (_event, url: string) => {

        return bookmarkManager.isBookmarked(
            url
        );
    }
);


/*
 * =========================
 * ADD BOOKMARK
 * =========================
 */

ipcMain.handle(
    "browser:add-bookmark",
    (_event, title: string, url: string) => {

        return bookmarkManager.add(
            title,
            url
        );
    }
);


/*
 * =========================
 * REMOVE BOOKMARK
 * =========================
 */

ipcMain.handle(
    "browser:remove-bookmark",
    (_event, id: string) => {

        bookmarkManager.remove(
            id
        );
    }
);


/*
 * =========================
 * REMOVE BOOKMARK BY URL
 * =========================
 */

ipcMain.handle(
    "browser:remove-bookmark-by-url",
    (_event, url: string) => {

        bookmarkManager.removeByUrl(
            url
        );
    }
);


/*
 * =========================
 * SHOW BOOKMARKS
 * =========================
 */

ipcMain.on(
    "browser:show-bookmarks",
    () => {

        showBookmarks();
    }
);


/*
 * =========================
 * CLOSE BOOKMARKS
 * =========================
 */

ipcMain.on(
    "browser:close-bookmarks",
    () => {

        closeBookmarks();
    }
);