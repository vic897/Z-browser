import {
    contextBridge,
    ipcRenderer
} from "electron";

import type { Bookmark } from "./main/bookmarks";


contextBridge.exposeInMainWorld(
    "browserAPI",
    {

        /*
         * =========================
         * NAVIGATION
         * =========================
         */

        navigate: (
            url: string
        ): void => {

            ipcRenderer.send(
                "browser:navigate",
                url
            );
        },


        goBack: (): void => {

            ipcRenderer.send(
                "browser:back"
            );
        },


        goForward: (): void => {

            ipcRenderer.send(
                "browser:forward"
            );
        },


        reload: (): void => {

            ipcRenderer.send(
                "browser:reload"
            );
        },


        /*
         * =========================
         * TABS
         * =========================
         */

        newTab: (): void => {

            ipcRenderer.send(
                "browser:new-tab"
            );
        },


        closeTab: (
            id: string
        ): void => {

            ipcRenderer.send(
                "browser:close-tab",
                id
            );
        },


        switchTab: (
            id: string
        ): void => {

            ipcRenderer.send(
                "browser:switch-tab",
                id
            );
        },


        nextTab: (): void => {

            ipcRenderer.send(
                "browser:next-tab"
            );
        },


        previousTab: (): void => {

            ipcRenderer.send(
                "browser:previous-tab"
            );
        },


        /*
         * =========================
         * BROWSER EVENTS
         * =========================
         */

        onURLChanged: (
            callback: (
                url: string
            ) => void
        ): void => {

            ipcRenderer.on(
                "browser:url-changed",
                (
                    _event,
                    url: string
                ) => {

                    callback(url);
                }
            );
        },


        onLoadingChanged: (
            callback: (
                loading: boolean
            ) => void
        ): void => {

            ipcRenderer.on(
                "browser:loading",
                (
                    _event,
                    loading: boolean
                ) => {

                    callback(loading);
                }
            );
        },


        onTabsUpdated: (
            callback: (
                tabs: unknown[]
            ) => void
        ): void => {

            ipcRenderer.on(
                "browser:tabs-updated",
                (
                    _event,
                    tabs: unknown[]
                ) => {

                    callback(tabs);
                }
            );
        },


        /*
         * =========================
         * HISTORY
         * =========================
         */

        getHistory: (): Promise<unknown[]> => {

            return ipcRenderer.invoke(
                "browser:get-history"
            );
        },


        clearHistory: (): void => {

            ipcRenderer.send(
                "browser:clear-history"
            );
        },


        showHistory: (): void => {

            ipcRenderer.send(
                "browser:show-history"
            );
        },


        closeHistory: (): void => {

            ipcRenderer.send(
                "browser:close-history"
            );
        },


        /*
         * =========================
         * BOOKMARKS
         * =========================
         */

        getBookmarks: (): Promise<Bookmark[]> => {

            return ipcRenderer.invoke(
                "browser:get-bookmarks"
            );
        },


        isBookmarked: (
            url: string
        ): Promise<boolean> => {

            return ipcRenderer.invoke(
                "browser:is-bookmarked",
                url
            );
        },


        addBookmark: (
            title: string,
            url: string
        ): Promise<Bookmark | null> => {

            return ipcRenderer.invoke(
                "browser:add-bookmark",
                title,
                url
            );
        },


        removeBookmark: (
            id: string
        ): Promise<void> => {

            return ipcRenderer.invoke(
                "browser:remove-bookmark",
                id
            );
        },


        removeBookmarkByUrl: (
            url: string
        ): Promise<void> => {

            return ipcRenderer.invoke(
                "browser:remove-bookmark-by-url",
                url
            );
        },


        showBookmarks: (): void => {

            ipcRenderer.send(
                "browser:show-bookmarks"
            );
        },


        closeBookmarks: (): void => {

            ipcRenderer.send(
                "browser:close-bookmarks"
            );
        }
    }
);