import { Tab } from "./tab";

export class NavigationController {
    private activeTab: Tab | null = null;

    setActiveTab(tab: Tab): void {
        this.activeTab = tab;
    }

    navigate(url: string): void {
        if (!this.activeTab) {
            return;
        }

        console.log("[Navigation] navigate:", url);

        this.activeTab.webView.webContents.loadURL(url);
    }

    goBack(): void {
        if (!this.activeTab) {
            return;
        }

        const webContents =
            this.activeTab.webView.webContents;

        if (webContents.canGoBack()) {
            this.activeTab.isHistoryNavigation = true;
            webContents.goBack();
        }
    }

    goForward(): void {
        if (!this.activeTab) {
            return;
        }

        const webContents =
            this.activeTab.webView.webContents;

        if (webContents.canGoForward()) {
            this.activeTab.isHistoryNavigation = true;
            webContents.goForward();
        }
    }

    reload(): void {
        if (!this.activeTab) {
            return;
        }

        this.activeTab.webView.webContents.reload();
    }
}