import { WebContentsView } from "electron";

export class Tab {

    public readonly id: string;

    public readonly webView: WebContentsView;

    /*
     * True when the current navigation was caused
     * by Back or Forward.
     *
     * Back/Forward should not create a new
     * history entry.
     */
    public isHistoryNavigation = false;

    /*
     * Stores a navigation initiated by Z Browser
     * itself, such as typing into the address bar.
     *
     * This lets TabManager distinguish our own
     * navigation from navigation initiated by
     * the website.
     */
    public pendingNavigationUrl: string | null = null;


    constructor() {

        this.id =
            crypto.randomUUID();


        this.webView =
            new WebContentsView({
                webPreferences: {
                    contextIsolation: true,
                    nodeIntegration: false
                }
            });
    }
}