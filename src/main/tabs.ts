import { BrowserWindow } from "electron";
import { Tab } from "./tab";
import { NavigationController } from "./navigation";
import { HistoryManager } from "./history";

export class TabManager {
    private readonly tabs: Tab[] = [];
    private activeTabId: string | null = null;

    private readonly win: BrowserWindow;
    private readonly navigationController: NavigationController;
    private readonly historyManager: HistoryManager;

    constructor(
        win: BrowserWindow,
        navigationController: NavigationController,
        historyManager: HistoryManager
    ) {
        this.win = win;
        this.navigationController = navigationController;
        this.historyManager = historyManager;
    }

    createTab(url: string = "https://www.google.com"): Tab {
        const tab = new Tab();

        this.tabs.push(tab);

        this.win.contentView.addChildView(tab.webView);

        tab.webView.setBounds({
            x: 0,
            y: 100,
            width: this.win.getContentSize()[0],
            height: this.win.getContentSize()[1] - 100
        });

        tab.webView.setVisible(false);

        this.setupTabEvents(tab);

        this.setActiveTab(tab.id);

        console.log("[Tabs] Creating tab:", url);

        tab.webView.webContents.loadURL(url);

        this.sendTabsUpdate();

        return tab;
    }

    private setupTabEvents(tab: Tab): void {
        const webContents = tab.webView.webContents;

        /*
         * Main-frame navigation.
         *
         * This is where we record browser history.
         *
         * We intentionally do NOT record did-navigate-in-page here.
         * Sites such as Google can emit many in-page navigation events
         * for a single user action.
         */
        webContents.on("did-navigate", (_event, url) => {
            console.log("🔥 did-navigate:", url);

            if (tab.isHistoryNavigation) {
                console.log("[History] Back/forward navigation - not recording");

                tab.isHistoryNavigation = false;
            } else {
                this.recordHistory(tab, url);
            }

            if (tab.id === this.activeTabId) {
                this.win.webContents.send("browser:url-changed", url);
            }

            this.sendTabsUpdate();
        });

        /*
         * Same-document navigation is intentionally ignored for now.
         *
         * Examples:
         * - Google internal URL changes
         * - hash changes
         * - SPA route changes
         *
         * We can support these later with proper navigation IDs.
         */
        webContents.on("did-navigate-in-page", (_event, url, isMainFrame) => {
            if (!isMainFrame) {
                return;
            }

            console.log("↪ did-navigate-in-page ignored:", url);

            if (tab.id === this.activeTabId) {
                this.win.webContents.send("browser:url-changed", url);
            }

            this.sendTabsUpdate();
        });

        webContents.on("page-title-updated", (_event, title) => {
            const url = webContents.getURL();

            console.log("[History] title updated:", title);

            this.historyManager.updateLatestTitle(url, title);

            this.sendTabsUpdate();
        });

        webContents.on("did-start-loading", () => {
            this.win.webContents.send("browser:tab-loading", {
                id: tab.id,
                loading: true
            });
        });

        webContents.on("did-stop-loading", () => {
            console.log(
                "[Navigation] did-stop-loading:",
                webContents.getURL()
            );

            this.win.webContents.send("browser:tab-loading", {
                id: tab.id,
                loading: false
            });
        });
    }

    private recordHistory(tab: Tab, url: string): void {
        if (!url) {
            return;
        }

        const title = tab.webView.webContents.getTitle();

        console.log("🔥 HISTORY RECORD:", url);

        this.historyManager.addEntry(
            url,
            title || url
        );

        console.log(
            "🔥 HISTORY SIZE:",
            this.historyManager.getEntries().length
        );
    }

    setActiveTab(id: string): void {
        const tab = this.tabs.find((item) => item.id === id);

        if (!tab) {
            return;
        }

        this.activeTabId = id;

        for (const currentTab of this.tabs) {
            currentTab.webView.setVisible(
                currentTab.id === this.activeTabId
            );
        }

        this.navigationController.setActiveTab(tab);

        const currentURL = tab.webView.webContents.getURL();

        if (currentURL) {
            this.win.webContents.send(
                "browser:url-changed",
                currentURL
            );
        }

        this.sendTabsUpdate();
    }

    setContentVisible(visible: boolean): void {
        for (const tab of this.tabs) {
            tab.webView.setVisible(
                visible && tab.id === this.activeTabId
            );
        }
    }

    closeTab(id: string): void {
        const index = this.tabs.findIndex(
            (tab) => tab.id === id
        );

        if (index === -1) {
            return;
        }

        const tab = this.tabs[index];

        this.win.contentView.removeChildView(tab.webView);

        this.tabs.splice(index, 1);

        if (this.tabs.length === 0) {
            this.activeTabId = null;
            this.sendTabsUpdate();
            return;
        }

        if (this.activeTabId === id) {
            const nextIndex = Math.min(
                index,
                this.tabs.length - 1
            );

            this.setActiveTab(
                this.tabs[nextIndex].id
            );
        } else {
            this.sendTabsUpdate();
        }
    }

    getActiveTab(): Tab | null {
        if (!this.activeTabId) {
            return null;
        }

        return (
            this.tabs.find(
                (tab) => tab.id === this.activeTabId
            ) ?? null
        );
    }

    getTabs(): Tab[] {
        return [...this.tabs];
    }

    switchToNextTab(): void {
        if (this.tabs.length <= 1) {
            return;
        }

        const currentIndex = this.tabs.findIndex(
            (tab) => tab.id === this.activeTabId
        );

        if (currentIndex === -1) {
            return;
        }

        const nextIndex =
            (currentIndex + 1) % this.tabs.length;

        this.setActiveTab(
            this.tabs[nextIndex].id
        );
    }

    switchToPreviousTab(): void {
        if (this.tabs.length <= 1) {
            return;
        }

        const currentIndex = this.tabs.findIndex(
            (tab) => tab.id === this.activeTabId
        );

        if (currentIndex === -1) {
            return;
        }

        const previousIndex =
            (currentIndex - 1 + this.tabs.length) %
            this.tabs.length;

        this.setActiveTab(
            this.tabs[previousIndex].id
        );
    }

    getHistory() {
        return this.historyManager.getEntries();
    }

    clearHistory(): void {
        this.historyManager.clear();
    }

    private sendTabsUpdate(): void {
        const tabs = this.tabs.map((tab) => ({
            id: tab.id,
            title:
                tab.webView.webContents.getTitle() ||
                "New Tab",
            url:
                tab.webView.webContents.getURL() ||
                "",
            active:
                tab.id === this.activeTabId
        }));

        this.win.webContents.send(
            "browser:tabs-updated",
            tabs
        );
    }
}