/* @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { Record } from "./record";

export class DiscussApp extends Record {
    /** @returns {import("models").DiscussApp} */
    static new(data) {
        const res = super.new(data);
        Object.assign(res, {
            channels: this.store.DiscussAppCategory.insert({
                extraClass: "o-mail-DiscussSidebarCategory-channel",
                id: "channels",
                name: _t("Channels"),
                isOpen: false,
                canView: true,
                canAdd: true,
                serverStateKey: "is_discuss_sidebar_category_channel_open",
                addTitle: _t("Add or join a channel"),
                addHotkey: "c",
            }),
            chats: this.store.DiscussAppCategory.insert({
                extraClass: "o-mail-DiscussSidebarCategory-chat",
                id: "chats",
                name: _t("Direct messages"),
                isOpen: false,
                canView: false,
                canAdd: true,
                serverStateKey: "is_discuss_sidebar_category_chat_open",
                addTitle: _t("Start a conversation"),
                addHotkey: "d",
            }),
        });
        return res;
    }
    /** @returns {import("models").DiscussApp} */
    static get(data) {
        return super.get(data);
    }
    /** @returns {import("models").DiscussApp} */
    static insert() {
        const app = this.get() ?? this.new();
        return app;
    }

    /** @type {'mailbox'|'all'|'channel'|'chat'|'livechat'} */
    activeTab = "all";
    isActive = false;
    thread = Record.one("Thread");
    channels = Record.one("DiscussAppCategory");
    chats = Record.one("DiscussAppCategory");
    // mailboxes in sidebar
    inbox = Record.one("Thread");
    starred = Record.one("Thread");
    history = Record.one("Thread");
}

DiscussApp.register();
