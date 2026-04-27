sap.ui.define([
    "com/acn/training201/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("com.acn.training201.controller.Home", {

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
            console.log("onClear")
        },

        onRowPress: function (oEvent) {
            var sEmployeeId = oEvent.getSource()
                .getBindingContext()
                .getProperty("EmployeeId");
            this.getRouter().navTo("RouteDetail", { employeeId: sEmployeeId });
            console.log(sEmployeeId)
        },

        onCreate: function () {
            this.getRouter().navTo("RouteDetail", { employeeId: "new" });
            console.log("onCreate")
        },



    });
});
