sap.ui.define([
    "com/acn/training201/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessagePopover",
    "sap/m/MessageItem"
], function (BaseController, JSONModel, MessageBox, Fragment, BusyIndicator, MessagePopover, MessageItem
) {
    "use strict";

    return BaseController.extend("com.accenture.training201.controller.Detail", {

        onInit: function () {
            var oViewModel = new JSONModel({
                editMode: false,
                createMode: false,
                statusChecked: false,
                messageCount: 0,
                messages: []
            });

            this.getView().setModel(oViewModel, "view");
            this.getRouter().getRoute("RouteDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            var oVM = this.getView().getModel("view");

            if (sEmployeeId === "new") {
                oVM.setProperty("/createMode", true);
                oVM.setProperty("/editMode", false);
                oVM.setProperty("/pageTitle", this.getResourceBundle().getText("newEmployee"));
                this.getView().unbindElement();
                this._clearForm();
            } else {
                oVM.setProperty("/createMode", false);
                oVM.setProperty("/editMode", false);
                this._sEmployeeId = sEmployeeId;
                this._bindEmployee(sEmployeeId);
            }
        },

        _clearForm: function () {
            this.byId("inpEmployeeName").setValue("");
            this.byId("dpBirthDate").setValue("");
            this.byId("inpEmail").setValue("");
            this.byId("inpPhoneNo").setValue("");
            this.byId("inpDepartmentId").setValue("");
            this.byId("dpHireDate").setValue("");
            this.byId("inpSalary").setValue("");
            this.byId("inpCurrencyCode").setValue("");
            this.getView().getModel("view").setProperty("/statusChecked", false);
        },

        _bindEmployee: function (sEmployeeId) {
            var that = this;
            var oModel = this.getView().getModel();
            var sPath = "/Employee('" + sEmployeeId + "')";

            BusyIndicator.show(0);
            new Promise(function (resolve, reject) {
                oModel.read(sPath, {
                    success: function (oData) { resolve(oData); },
                    error: function (oError) { reject(oError); }
                });
            }).then(function (oData) {
                that.getView().bindElement({ path: sPath });
                var oVM = that.getView().getModel("view");
                oVM.setProperty("/pageTitle", oData.EmployeeName);
                oVM.setProperty("/pageSubtitle", oData.EmployeeId);
                oVM.setProperty("/statusChecked", oData.Status === "X");
                BusyIndicator.hide();
            }).catch(function (oError) {
                BusyIndicator.hide();
                MessageBox.error(that._getBackendErrorMessage(oError));
            });
        },

        onSave: function () {
            var that = this;
            var oModel = this.getView().getModel();
            var oVM = this.getView().getModel("view");
            var bCreate = oVM.getProperty("/createMode");
            var oBundle = this.getResourceBundle();

            var oPayload = {
                EmployeeName: this.byId("inpEmployeeName").getValue(),
                BirthDate: this._parseDate(this.byId("dpBirthDate").getDateValue()),
                Email: this.byId("inpEmail").getValue(),
                PhoneNo: this.byId("inpPhoneNo").getValue(),
                DepartmentId: this.byId("inpDepartmentId").getValue(),
                HireDate: this._parseDate(this.byId("dpHireDate").getDateValue()),
                Salary: this.byId("inpSalary").getValue(),
                CurrencyCode: this.byId("inpCurrencyCode").getValue()
            };

            BusyIndicator.show();

            if (bCreate) {
                oModel.create("/Employee", oPayload, {
                    success: function () {
                        BusyIndicator.hide();
                        MessageBox.success(oBundle.getText("createSuccess"), {
                            onClose: function () { that.getRouter().navTo("RouteHome"); }
                        });
                    },
                    error: function (oError) {
                        BusyIndicator.hide();
                        MessageBox.error(that._getBackendErrorMessage(oError));
                    }
                });
            } else {
                var sPath = "/Employee('" + this._sEmployeeId + "')";
                oModel.update(sPath, oPayload, {
                    success: function () {
                        BusyIndicator.hide();
                        MessageBox.success(oBundle.getText("updateSuccess"), {
                            onClose: function () { that.getRouter().navTo("RouteHome"); }
                        });
                    },
                    error: function (oError) {
                        BusyIndicator.hide();
                        MessageBox.error(that._getBackendErrorMessage(oError));
                    }
                });
            }
        },

        //HELPER Private Function
        // DatePicker returns a local JS Date. OData expects UTC.
        _parseDate: function (oDate) {
            if (!oDate) { return null; }
            return new Date(Date.UTC(
                oDate.getFullYear(), oDate.getMonth(), oDate.getDate()
            ));
        },

        _getBackendErrorMessage: function (oError) {
            try {
                var oBody = JSON.parse(
                    oError.responseText || (oError.response && oError.response.body)
                );
                return oBody.error.message.value;
            } catch (e) {
                return oError.message || "An unexpected error occurred.";
            }
        },

        onEdit: function () {
            this.getView().getModel("view").setProperty("/editMode", true);
        },

        // Calculate Total Salary via OData Function Import
        onCalculateSalary: function () {
            console.log("AAAAA")
            var that = this;
            var oModel = this.getView().getModel();

            BusyIndicator.show();
            oModel.callFunction("/CalculateTotalSalary", {
                method: "POST",
                urlParameters: {
                    EmployeeId: this._sEmployeeId || ""
                },
                success: function (oData) {
                    BusyIndicator.hide();
                    var oResult = oData.CalculateTotalSalary || oData;
                    that.byId("txtSalaryTotal").setText(
                        (oResult.SalaryTotal || "") + " " + (oResult.CurrencyCode || "")
                    );
                },
                error: function (oError) {
                    BusyIndicator.hide();
                    MessageBox.error(that._getBackendErrorMessage(oError));
                }
            });
        }

    });
});
