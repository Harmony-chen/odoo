/** @odoo-module **/

import {CheckBox} from '@web/core/checkbox/checkbox';
import { _t } from "@web/core/l10n/translation";
import {useService, useAutofocus} from "@web/core/utils/hooks";
import {sprintf} from "@web/core/utils/strings";
import {WebsiteDialog} from './dialog';
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import { renderToElement } from "@web/core/utils/render";
import { Component, useEffect, useState, xml, useRef } from "@odoo/owl";

export class PageDependencies extends Component {
    static template = "website.PageDependencies";
    static popoverTemplate = xml`
        <div class="popover o_page_dependencies" role="tooltip">
            <div class="arrow"/>
            <h3 class="popover-header"/>
            <div class="popover-body"/>
        </div>
    `;
    static props = {
        resIds: Array,
        resModel: String,
        mode: String,
    };

    setup() {
        super.setup();
        this.orm = useService('orm');

        this.action = useRef('action');
        this.sprintf = sprintf;

        useEffect(
            () => {
                this.fetchDependencies();
            },
            () => []
        );
        this.state = useState({
            dependencies: {},
            depText: "...",
        });
    }

    async fetchDependencies() {
        this.state.dependencies = await this.orm.call(
            'website',
            'search_url_dependencies',
            [this.props.resModel, this.props.resIds],
        );
        if (this.props.mode === 'popover') {
            this.state.depText = Object.entries(this.state.dependencies)
                .map(dependency => `${dependency[1].length} ${dependency[0].toLowerCase()}`)
                .join(', ');
        }
    }

    showDependencies() {
        $(this.action.el).popover({
            title: _t("Dependencies"),
            boundary: 'viewport',
            placement: 'right',
            trigger: 'focus',
            content: renderToElement("website.PageDependencies.Tooltip", {
                dependencies: this.state.dependencies,
            }),
        }).popover('toggle');
    }
}

export class DeletePageDialog extends Component {
    static template = "website.DeletePageDialog";
    static components = {
        PageDependencies,
        CheckBox,
        WebsiteDialog,
    };
    static props = {
        resIds: Array,
        resModel: String,
        onDelete: { type: Function, optional: true },
        close: Function,
    };

    setup() {
        this.website = useService('website');
        this.title = _t("Delete Page");
        this.deleteButton = _t("Ok");
        this.cancelButton = _t("Cancel");

        this.state = useState({
            confirm: false,
        });
    }

    onConfirmCheckboxChange(checked) {
        this.state.confirm = checked;
    }

    onClickDelete() {
        this.props.close();
        this.props.onDelete();
    }
}

export class DuplicatePageDialog extends Component {
    static components = { WebsiteDialog };
    static template = xml`
    <WebsiteDialog close="props.close" primaryClick="() => this.duplicate()">
        <div class="mb-3 row">
            <label class="col-form-label col-md-3">
                Page Name
            </label>
            <div class="col-md-9">
                <input type="text" t-model="state.name" class="form-control" required="required" t-ref="autofocus"/>
            </div>
        </div>
    </WebsiteDialog>
    `;
    static props = {
        onDuplicate: { type: Function, optional: true },
        close: Function,
        pageId: Number,
    };

    setup() {
        this.orm = useService('orm');
        this.website = useService('website');
        useAutofocus();

        this.state = useState({
            name: '',
        });
    }

    async duplicate() {
        if (this.state.name) {
            const res = await this.orm.call(
                'website.page',
                'clone_page',
                [this.props.pageId, this.state.name]
            );
            this.website.goToWebsite({path: res, edition: true});
        }
        this.props.onDuplicate();
    }
}

export class PagePropertiesDialog extends FormViewDialog {
    static template = "website.PagePropertiesDialog";
    static props = {
        ...FormViewDialog.props,
        onClose: { type: Function, optional: true },
        resModel: { type: String, optional: true },
    };

    static defaultProps = {
        ...FormViewDialog.defaultProps,
        resModel: "website.page",
        title: _t("Page Properties"),
        size: "md",
        context: {
            form_view_ref: "website.website_page_properties_view_form",
        },
        onClose: () => {},
    };

    setup() {
        super.setup();
        this.dialog = useService('dialog');
        this.orm = useService('orm');
        this.website = useService('website');

        this.viewProps.resId = this.resId;
    }

    get resId() {
        return this.props.resId || (this.website.currentWebsite && this.website.currentWebsite.metadata.mainObject.id);
    }

    clonePage() {
        this.dialog.add(DuplicatePageDialog, {
            pageId: this.resId,
            onDuplicate: () => {
                this.props.close();
                this.props.onClose();
            },
        });
    }

    deletePage() {
        const pageIds = [this.resId];
        this.dialog.add(DeletePageDialog, {
            resIds: pageIds,
            resModel: 'website.page',
            onDelete: async () => {
                await this.orm.unlink("website.page", pageIds);
                this.website.goToWebsite({path: '/'});
                this.props.close();
                this.props.onClose();
            },
        });
    }
}
