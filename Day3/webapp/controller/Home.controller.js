sap.ui.define([
    "com/acn/training200/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
], function (BaseController, JSONModel, Filter, FilterOperator, MessageBox, Fragment, Dialog, Button, Text) {
    "use strict";

    return BaseController.extend("com.acn.training200.controller.Home", {

        onInit: function () {
            this.getRouter()
                .getRoute("RouteHome")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oBinding = this.byId("employeeTable").getBinding("items");
            if (oBinding) { oBinding.refresh(); }
        },

        onSearch: function () {
            var aFilters = [];
            var sQuery = this.byId("searchField").getValue();
            var sDepartment = this.byId("departmentSelect").getSelectedKey();
            var sStatus = this.byId("statusSelect").getSelectedKey();

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("EmployeeId", FilterOperator.Contains, sQuery),
                        new Filter("EmployeeName", FilterOperator.Contains, sQuery)
                    ],
                    and: false   // OR between EmployeeId and EmployeeName 
                }));
            }
            if (sDepartment) {
                aFilters.push(new Filter("DepartmentId", FilterOperator.EQ, sDepartment));
            }
            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            this.byId("employeeTable").getBinding("items").filter(aFilters);
        },

        onClear: function () {
            this.byId("searchField").setValue("");
            this.byId("departmentSelect").setSelectedKey("");
            this.byId("statusSelect").setSelectedKey("");
            this.byId("employeeTable").getBinding("items").filter([]);
        },

        onRowPress: function (oEvent) {
            var sEmployeeId = oEvent.getSource()
                .getBindingContext()
                .getProperty("EmployeeId");
            this.getRouter().navTo("RouteDetail", { employeeId: sEmployeeId });
        },
        onCreate: function () {
            this.getRouter().navTo("RouteDetail", { employeeId: "new" });
        },
        onDelete: function (oEvent) {
            this._sDeletePath = oEvent.getSource().getBindingContext().getPath();
            var that = this;
            var oBundle = this.getResourceBundle();

            if (!this._oDeleteDialog) {
                this._oDeleteDialog = new Dialog({
                    title: oBundle.getText("deleteDialogTitle"),
                    type: "Message",
                    content: new Text({ text: oBundle.getText("deleteDialogMessage") }),
                    beginButton: new Button({
                        text: oBundle.getText("delete"),
                        type: "Reject",
                        press: function () { that.onConfirmDelete(); }
                    }),
                    endButton: new Button({
                        text: oBundle.getText("cancel"),
                        press: function () { that.onCancelDelete(); }
                    })
                });
                this.getView().addDependent(this._oDeleteDialog);
            }
            this._oDeleteDialog.open();
        },

        onConfirmDelete: function () {
            var that = this;
            var oModel = this.getView().getModel();
            var oBundle = this.getResourceBundle();

            this._oDeleteDialog.close();

            new Promise(function (resolve, reject) {
                oModel.remove(that._sDeletePath, {
                    success: function () { resolve(); },
                    error: function (oError) { reject(oError); }
                });
            }).then(function () {
                sap.m.MessageToast.show(oBundle.getText("deleteSuccess"));
            }).catch(function () {
                MessageBox.error(oBundle.getText("deleteError"));
            });
        },

        onCancelDelete: function () {
            this._oDeleteDialog.close();
        },
    });
});
