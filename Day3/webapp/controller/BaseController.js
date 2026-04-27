sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.acn.training201.controller.BaseController", {

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        setBusy: function (bBusy) {
            this.getView().setBusy(bBusy);
        }

    });
});
