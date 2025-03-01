/* @odoo-module */

import { patch } from "@web/core/utils/patch";
import { AvatarCardResourcePopover } from "@resource_mail/components/avatar_card_resource/avatar_card_resource_popover";
import { useService } from "@web/core/utils/hooks";

const patchAvatarCardResourcePopover = {
    setup() {
        super.setup();
        (this.userInfoTemplate = "hr.avatarCardResourceInfos"),
            (this.actionService = useService("action"));
    },
    get fieldNames() {
        return [...super.fieldNames, "show_hr_icon_display", "hr_icon_display"];
    },
    get email() {
        return this.record.work_email || this.record.email;
    },
    get phone() {
        return this.record.work_phone || this.record.phone;
    },
    async onClickViewEmployee() {
        if (!this.record.employee_id) {
            return;
        }
        const action = await this.orm.call("hr.employee", "get_formview_action", [
            this.record.employee_id[0],
        ]);
        this.actionService.doAction(action);
    },
};

patch(AvatarCardResourcePopover.prototype, patchAvatarCardResourcePopover);
