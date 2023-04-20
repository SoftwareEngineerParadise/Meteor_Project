import { TaxRateService } from "../../settings/settings-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CountryService } from "../../js/country-service";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
import FxApi from "../../settings/currencies-setting/FxApi";
import { currencySymbolEmpty } from "./CurrencyGlobals";
import LoadingOverlay from "../../LoadingOverlay";
import { Template } from 'meteor/templating';
import './editcurrencypop.html';

let sideBarService = new SideBarService();

let defaultCurrencyCode = CountryAbbr; // global variable "AUD"

Template.editcurrencypop.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecordscurrencypop = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.countryData = new ReactiveVar();
});

Template.editcurrencypop.onRendered(function () {
  LoadingOverlay.show();
  let templateObject = Template.instance();
  let taxRateService = new TaxRateService();
  const dataTableList = [];
  const tableHeaderList = [];

  var countryService = new CountryService();
  let countries = [];

  function MakeNegative() {
    $("td").each(function () {
      if (
        $(this)
          .text()
          .indexOf("-" + Currency) >= 0
      )
        $(this).addClass("text-danger");
    });
  }

  $("#tblCurrencyList tbody").on(
    "click",
    "tr .colCode, tr .colCurrency, tr .colSymbol, tr .colBuyRate, tr .colSellRate, tr .colCountry, tr .colRateLastModified, tr .colDescription",
    function () {
      var listData = $(this).closest("tr").attr("id");
      if (listData) {
        $("#add-currency-title").text("Edit Currency");
        $("#sedtCountry").prop("readonly", true);
        if (listData !== "") {
          listData = Number(listData);
          //taxRateService.getOneCurrency(listData).then(function (data) {

          var currencyid = listData || "";
          var country =
            $(event.target).closest("tr").find(".colCountry").text() || "";
          var currencyCode =
            $(event.target).closest("tr").find(".colCode").text() || "";
          var currencySymbol =
            $(event.target).closest("tr").find(".colSymbol").text() || "";
          var currencyName =
            $(event.target).closest("tr").find(".colCurrency").text() || "";
          var currencyDesc =
            $(event.target).closest("tr").find(".colDescription").text() || "";
          var currencyBuyRate =
            $(event.target).closest("tr").find(".colBuyRate").text() || 0;
          var currencySellRate =
            $(event.target).closest("tr").find(".colSellRate").text() || 0;
          //data.fields.Rate || '';
          $("#edtCurrencyID").val(currencyid);
          $("#sedtCountry").val(country);
          $("#sedtCountry").attr("readonly", true);
          $("#sedtCountry").attr("disabled", "disabled");
          $("#currencyCode").val(currencyCode);
          $("#currencySymbol").val(currencySymbol);
          $("#edtCurrencyName").val(currencyName);
          $("#edtCurrencyDesc").val(currencyDesc);
          $("#edtBuyRate").val(currencyBuyRate);
          $("#edtSellRate").val(currencySellRate);
          $('#editcurrencypop').modal('show');
          //Make btnDelete "Make Active or In-Active"
          if(status == "In-Active"){
              $('#view-in-active').html("<button class='btn btn-success btnActivateCurrency vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
          }else{
              $('#view-in-active').html("<button class='btn btn-danger btnDeleteCurrency vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
          }
        }
      }
    }
  );

  templateObject.getTaxRates = function () {
    getVS1Data("TCurrency").then(function (dataObject) {
        if (dataObject.length == 0) {
          taxRateService
            .getCurrencies()
            .then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.tcurrency.length; i++) {
                // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
                var dataList = {
                  id: data.tcurrency[i].ID || "",
                  code: data.tcurrency[i].Code || "N/A",
                  currency: data.tcurrency[i].Currency || "N/A",
                  symbol: data.tcurrency[i].CurrencySymbol || currencySymbolEmpty,
                  buyrate: data.tcurrency[i].BuyRate || "-",
                  sellrate: data.tcurrency[i].SellRate || "-",
                  country: data.tcurrency[i].Country || "N/A",
                  ratelastmodified: data.tcurrency[i].RateLastModified || "-",
                  description: data.tcurrency[i].CurrencyDesc || "N/A",
                };

                dataTableList.push(dataList);
                //}
              }

              templateObject.datatablerecordscurrencypop.set(dataTableList);

              if (templateObject.datatablerecordscurrencypop.get()) {
                Meteor.call(
                  "readPrefMethod",
                  localStorage.getItem("mycloudLogonID"),
                  "tblCurrencyList",
                  function (error, result) {
                    if (error) {
                    } else {
                      if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                          let customcolumn = result.customFields;
                          let columData = customcolumn[i].label;
                          let columHeaderUpdate = customcolumn[
                            i
                          ].thclass.replace(/ /g, ".");
                          let hiddenColumn = customcolumn[i].hidden;
                          let columnClass = columHeaderUpdate.split(".")[1];
                          let columnWidth = customcolumn[i].width;
                          let columnindex = customcolumn[i].index + 1;

                          if (hiddenColumn == true) {
                            $("." + columnClass + "").addClass("hiddenColumn");
                            $("." + columnClass + "").removeClass("showColumn");
                          } else if (hiddenColumn == false) {
                            $("." + columnClass + "").removeClass(
                              "hiddenColumn"
                            );
                            $("." + columnClass + "").addClass("showColumn");
                          }
                        }
                      }
                    }
                  }
                );

                setTimeout(function () {
                  MakeNegative();
                }, 100);
              }

              $(".fullScreenSpin").css("display", "none");
              // setTimeout(function() {
              //     $('#tblCurrencyList').DataTable({
              //         columnDefs: [{
              //                 type: 'date',
              //                 targets: 0
              //             },
              //             {
              //                 "orderable": false,
              //                 "targets": -1
              //             }
              //         ],
              //         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              //         buttons: [{
              //             extend: 'excelHtml5',
              //             text: '',
              //             download: 'open',
              //             className: "btntabletocsv hiddenColumn",
              //             filename: "taxratelist_" + moment().format(),
              //             orientation: 'portrait',
              //             exportOptions: {
              //                 columns: ':visible'
              //             }
              //         }, {
              //             extend: 'print',
              //             download: 'open',
              //             className: "btntabletopdf hiddenColumn",
              //             text: '',
              //             title: 'Tax Rate List',
              //             filename: "taxratelist_" + moment().format(),
              //             exportOptions: {
              //                 columns: ':visible'
              //             }
              //         }],
              //         select: true,
              //         destroy: true,
              //         colReorder: true,
              //         colReorder: {
              //             fixedColumnsRight: 1
              //         },
              //         // bStateSave: true,
              //         // rowId: 0,
              //         paging: false,
              //         "scrollY": "400px",
              //         "scrollCollapse": true,
              //         info: true,
              //         responsive: true,
              //         "order": [
              //             [0, "asc"]
              //         ],
              //         action: function() {
              //             $('#tblCurrencyList').DataTable().ajax.reload();
              //         },
              //         "fnDrawCallback": function(oSettings) {
              //             setTimeout(function() {
              //                 MakeNegative();
              //             }, 100);
              //         },
              //         "fnInitComplete": function() {
              //             $("<button class='btn btn-primary btnAddNewCurrency' data-dismiss='modal' data-toggle='modal' data-target='#newCurrencyModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblCurrencyList_filter");
              //         },
              //
              //     }).on('page', function() {
              //         setTimeout(function() {
              //             MakeNegative();
              //         }, 100);
              //         let draftRecord = templateObject.datatablerecordscurrencypop.get();
              //         templateObject.datatablerecordscurrencypop.set(draftRecord);
              //     }).on('column-reorder', function() {
              //
              //     }).on('length.dt', function(e, settings, len) {
              //         setTimeout(function() {
              //             MakeNegative();
              //         }, 100);
              //     });
              //
              //     // $('#tblCurrencyList').DataTable().column( 0 ).visible( true );
              //     $('.fullScreenSpin').css('display', 'none');
              // }, 0);

              var columns = $("#tblCurrencyList th");
              let sTible = "";
              let sWidth = "";
              let sIndex = "";
              let sVisible = "";
              let columVisible = false;
              let sClass = "";
              $.each(columns, function (i, v) {
                if (v.hidden == false) {
                  columVisible = true;
                }
                if (v.className.includes("hiddenColumn")) {
                  columVisible = false;
                }
                sWidth = v.style.width.replace("px", "");

                let datatablerecordObj = {
                  sTitle: v.innerText || "",
                  sWidth: sWidth || "",
                  sIndex: v.cellIndex || "",
                  sVisible: columVisible || false,
                  sClass: v.className || "",
                };
                tableHeaderList.push(datatablerecordObj);
              });
              templateObject.tableheaderrecords.set(tableHeaderList);
              $("div.dataTables_filter input").addClass(
                "form-control form-control-sm"
              );
            })
            .catch(function (err) {
              // Bert.alert('<strong>' + err + '</strong>!', 'danger');
              $(".fullScreenSpin").css("display", "none");
              // Meteor._reload.reload();
            });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tcurrency;
          let lineItems = [];
          let lineItemObj = {};
          for (let i = 0; i < data.tcurrency.length; i++) {
            // let taxRate = (useData[i].fields.Rate * 100).toFixed(2) + '%';
            var dataList = {
              id: data.tcurrency[i].Id || "",
              code: data.tcurrency[i].Code || "-",
              currency: data.tcurrency[i].Currency || "-",
              symbol: data.tcurrency[i].CurrencySymbol || "-",
              buyrate: data.tcurrency[i].BuyRate || "-",
              sellrate: data.tcurrency[i].SellRate || "-",
              country: data.tcurrency[i].Country || "-",
              description: data.tcurrency[i].CurrencyDesc || "-",
              ratelastmodified: data.tcurrency[i].RateLastModified || "-",
            };

            dataTableList.push(dataList);
            //}
          }

          templateObject.datatablerecordscurrencypop.set(dataTableList);

          if (templateObject.datatablerecordscurrencypop.get()) {
            setTimeout(function () {
              MakeNegative();
            }, 100);
          }

          $(".fullScreenSpin").css("display", "none");
          setTimeout(function () {
            // $('#tblCurrencyList').DataTable({
            //     columnDefs: [
            //         // {type: 'date', targets: 0},
            //         // { "orderable": false, "targets": -1 }
            //     ],
            //     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            //     buttons: [{
            //         extend: 'excelHtml5',
            //         text: '',
            //         download: 'open',
            //         className: "btntabletocsv hiddenColumn",
            //         filename: "taxratelist_" + moment().format(),
            //         orientation: 'portrait',
            //         exportOptions: {
            //             columns: ':visible'
            //         }
            //     }, {
            //         extend: 'print',
            //         download: 'open',
            //         className: "btntabletopdf hiddenColumn",
            //         text: '',
            //         title: 'Tax Rate List',
            //         filename: "taxratelist_" + moment().format(),
            //         exportOptions: {
            //             columns: ':visible'
            //         }
            //     }],
            //     select: true,
            //     destroy: true,
            //     colReorder: true,
            //     colReorder: {
            //         fixedColumnsRight: 1
            //     },
            //     // bStateSave: true,
            //     // rowId: 0,
            //     paging: false,
            //     // "scrollY": "400px",
            //     // "scrollCollapse": true,
            //     pageLength: initialDatatableLoad,
            //     lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
            //     info: true,
            //     responsive: true,
            //     "order": [
            //         [0, "asc"]
            //     ],
            //     action: function() {
            //         $('#tblCurrencyList').DataTable().ajax.reload();
            //     },
            //     "fnDrawCallback": function(oSettings) {
            //         setTimeout(function() {
            //             MakeNegative();
            //         }, 100);
            //     },
            //     "fnInitComplete": function() {
            //         $("<button class='btn btn-primary btnAddNewCurrency' data-dismiss='modal' data-toggle='modal' data-target='#newCurrencyModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblCurrencyList_filter");
            //     },
            //
            // }).on('page', function() {
            //     setTimeout(function() {
            //         MakeNegative();
            //     }, 100);
            //     let draftRecord = templateObject.datatablerecordscurrencypop.get();
            //     templateObject.datatablerecordscurrencypop.set(draftRecord);
            // }).on('column-reorder', function() {
            //
            // }).on('length.dt', function(e, settings, len) {
            //     setTimeout(function() {
            //         MakeNegative();
            //     }, 100);
            // });

            // $('#tblCurrencyList').DataTable().column( 0 ).visible( true );
            $(".fullScreenSpin").css("display", "none");
          }, 0);

          var columns = $("#tblCurrencyList th");
          let sTible = "";
          let sWidth = "";
          let sIndex = "";
          let sVisible = "";
          let columVisible = false;
          let sClass = "";
          $.each(columns, function (i, v) {
            if (v.hidden == false) {
              columVisible = true;
            }
            if (v.className.includes("hiddenColumn")) {
              columVisible = false;
            }
            sWidth = v.style.width.replace("px", "");

            let datatablerecordObj = {
              sTitle: v.innerText || "",
              sWidth: sWidth || "",
              sIndex: v.cellIndex || "",
              sVisible: columVisible || false,
              sClass: v.className || "",
            };
            tableHeaderList.push(datatablerecordObj);
          });
          templateObject.tableheaderrecords.set(tableHeaderList);
          $("div.dataTables_filter input").addClass(
            "form-control form-control-sm"
          );
        }
      }).catch(function (err) {
        taxRateService
          .getCurrencies()
          .then(function (data) {
            let lineItems = [];
            let lineItemObj = {};
            for (let i = 0; i < data.tcurrency.length; i++) {
              // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
              var dataList = {
                id: data.tcurrency[i].Id || "",
                code: data.tcurrency[i].Code || "-",
                currency: data.tcurrency[i].Currency || "-",
                symbol: data.tcurrency[i].CurrencySymbol || "-",
                buyrate: data.tcurrency[i].BuyRate || "-",
                sellrate: data.tcurrency[i].SellRate || "-",
                country: data.tcurrency[i].Country || "-",
                description: data.tcurrency[i].CurrencyDesc || "-",
                ratelastmodified: data.tcurrency[i].RateLastModified || "-",
              };

              dataTableList.push(dataList);
              //}
            }

            templateObject.datatablerecordscurrencypop.set(dataTableList);

            if (templateObject.datatablerecordscurrencypop.get()) {
              Meteor.call(
                "readPrefMethod",
                localStorage.getItem("mycloudLogonID"),
                "tblCurrencyList",
                function (error, result) {
                  if (error) {
                  } else {
                    if (result) {
                      for (let i = 0; i < result.customFields.length; i++) {
                        let customcolumn = result.customFields;
                        let columData = customcolumn[i].label;
                        let columHeaderUpdate = customcolumn[i].thclass.replace(
                          / /g,
                          "."
                        );
                        let hiddenColumn = customcolumn[i].hidden;
                        let columnClass = columHeaderUpdate.split(".")[1];
                        let columnWidth = customcolumn[i].width;
                        let columnindex = customcolumn[i].index + 1;

                        if (hiddenColumn == true) {
                          $("." + columnClass + "").addClass("hiddenColumn");
                          $("." + columnClass + "").removeClass("showColumn");
                        } else if (hiddenColumn == false) {
                          $("." + columnClass + "").removeClass("hiddenColumn");
                          $("." + columnClass + "").addClass("showColumn");
                        }
                      }
                    }
                  }
                }
              );

              setTimeout(function () {
                MakeNegative();
              }, 100);
            }

            $(".fullScreenSpin").css("display", "none");
            // setTimeout(function() {
            //     $('#tblCurrencyList').DataTable({
            //         columnDefs: [{
            //                 type: 'date',
            //                 targets: 0
            //             },
            //             {
            //                 "orderable": false,
            //                 "targets": -1
            //             }
            //         ],
            //         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            //         buttons: [{
            //             extend: 'excelHtml5',
            //             text: '',
            //             download: 'open',
            //             className: "btntabletocsv hiddenColumn",
            //             filename: "taxratelist_" + moment().format(),
            //             orientation: 'portrait',
            //             exportOptions: {
            //                 columns: ':visible'
            //             }
            //         }, {
            //             extend: 'print',
            //             download: 'open',
            //             className: "btntabletopdf hiddenColumn",
            //             text: '',
            //             title: 'Tax Rate List',
            //             filename: "taxratelist_" + moment().format(),
            //             exportOptions: {
            //                 columns: ':visible'
            //             }
            //         }],
            //         select: true,
            //         destroy: true,
            //         colReorder: true,
            //         colReorder: {
            //             fixedColumnsRight: 1
            //         },
            //         // bStateSave: true,
            //         // rowId: 0,
            //         paging: false,
            //         "scrollY": "400px",
            //         "scrollCollapse": true,
            //         info: true,
            //         responsive: true,
            //         "order": [
            //             [0, "asc"]
            //         ],
            //         action: function() {
            //             $('#tblCurrencyList').DataTable().ajax.reload();
            //         },
            //         "fnDrawCallback": function(oSettings) {
            //             setTimeout(function() {
            //                 MakeNegative();
            //             }, 100);
            //         },
            //         "fnInitComplete": function() {
            //             $("<button class='btn btn-primary btnAddNewCurrency' data-dismiss='modal' data-toggle='modal' data-target='#newCurrencyModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblCurrencyList_filter");
            //         },
            //
            //     }).on('page', function() {
            //         setTimeout(function() {
            //             MakeNegative();
            //         }, 100);
            //         let draftRecord = templateObject.datatablerecordscurrencypop.get();
            //         templateObject.datatablerecordscurrencypop.set(draftRecord);
            //     }).on('column-reorder', function() {
            //
            //     }).on('length.dt', function(e, settings, len) {
            //         setTimeout(function() {
            //             MakeNegative();
            //         }, 100);
            //     });
            //
            //     // $('#tblCurrencyList').DataTable().column( 0 ).visible( true );
            //     $('.fullScreenSpin').css('display', 'none');
            // }, 0);

            var columns = $("#tblCurrencyList th");
            let sTible = "";
            let sWidth = "";
            let sIndex = "";
            let sVisible = "";
            let columVisible = false;
            let sClass = "";
            $.each(columns, function (i, v) {
              if (v.hidden == false) {
                columVisible = true;
              }
              if (v.className.includes("hiddenColumn")) {
                columVisible = false;
              }
              sWidth = v.style.width.replace("px", "");

              let datatablerecordObj = {
                sTitle: v.innerText || "",
                sWidth: sWidth || "",
                sIndex: v.cellIndex || "",
                sVisible: columVisible || false,
                sClass: v.className || "",
              };
              tableHeaderList.push(datatablerecordObj);
            });
            templateObject.tableheaderrecords.set(tableHeaderList);
            $("div.dataTables_filter input").addClass(
              "form-control form-control-sm"
            );
          })
          .catch(function (err) {
            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
            $(".fullScreenSpin").css("display", "none");
            // Meteor._reload.reload();
          });
      });
  };

  // templateObject.getTaxRates();

  //   templateObject.getCountryData = function () {
  //     getVS1Data("TCountries")
  //       .then(function (dataObject) {
  //         if (dataObject.length == 0) {
  //           countryService.getCountry().then((data) => {
  //             for (let i = 0; i < data.tcountries.length; i++) {
  //               countries.push(data.tcountries[i].Country);
  //             }
  //             countries.sort((a, b) => a.localeCompare(b));
  //             templateObject.countryData.set(countries);
  //           });
  //         } else {
  //           let data = JSON.parse(dataObject[0].data);
  //           let useData = data.tcountries;
  //           for (let i = 0; i < useData.length; i++) {
  //             countries.push(useData[i].Country);
  //           }
  //           countries.sort((a, b) => a.localeCompare(b));
  //           templateObject.countryData.set(countries);
  //         }
  //       })
  //       .catch(function (err) {
  //         countryService.getCountry().then((data) => {
  //           for (let i = 0; i < data.tcountries.length; i++) {
  //             countries.push(data.tcountries[i].Country);
  //           }
  //           countries.sort((a, b) => a.localeCompare(b));
  //           templateObject.countryData.set(countries);
  //         });
  //       });
  //   };
  //   templateObject.getCountryData();

  $(document).on("click", ".table-remove", function () {
    event.stopPropagation();
    event.stopPropagation();
    var targetID = $(event.target).closest("tr").attr("id"); // table row ID
    $("#selectDeleteLineID").val(targetID);
    $("#deleteLineModal").modal("toggle");
  });

  $("#tblCurrencyList tbody").on(
    "click",
    "tr .colCode, tr .colCurrency, tr .colSymbol, tr .colBuyRate, tr .colSellRate, tr .colCountry, tr .colRateLastModified, tr .colDescription",
    function () {
      var listData = $(this).closest("tr").attr("id");
      if (listData) {
        $("#add-currency-title").text("Edit Currency");
        $("#sedtCountry").prop("readonly", true);
        if (listData !== "") {
          listData = Number(listData);
          //taxRateService.getOneCurrency(listData).then(function (data) {

          var currencyid = listData || "";
          var country =
            $(event.target).closest("tr").find(".colCountry").text() || "";
          var currencyCode =
            $(event.target).closest("tr").find(".colCode").text() || "";
          var currencySymbol =
            $(event.target).closest("tr").find(".colSymbol").text() || "";
          var currencyName =
            $(event.target).closest("tr").find(".colCurrency").text() || "";
          var currencyDesc =
            $(event.target).closest("tr").find(".colDescription").text() || "";
          var currencyBuyRate =
            $(event.target).closest("tr").find(".colBuyRate").text() || 0;
          var currencySellRate =
            $(event.target).closest("tr").find(".colSellRate").text() || 0;
          //data.fields.Rate || '';
          $("#edtCurrencyID").val(currencyid);
          $("#sedtCountry").val(country);
          $("#sedtCountry").attr("readonly", true);
          $("#sedtCountry").attr("disabled", "disabled");
          $("#currencyCode").val(currencyCode);
          $("#currencySymbol").val(currencySymbol);
          $("#edtCurrencyName").val(currencyName);
          $("#edtCurrencyDesc").val(currencyDesc);
          $("#edtBuyRate").val(currencyBuyRate);
          $("#edtSellRate").val(currencySellRate);

          //});

          $(this).closest("tr").attr("data-target", "#myModal");
          $(this).closest("tr").attr("data-toggle", "modal");
        }
      }
    }
  );
});

Template.editcurrencypop.events({
  "change #editCountry": async (e) => {
    LoadingOverlay.show();

    let taxRateService = new TaxRateService();
    let selectCountry = $("#sedtCountry").val();
    $("#edtCurrencyID").val("");

    $("#currencyCode").val("");
    $("#currencySymbol").val("");
    $("#edtCurrencyName").val("");
    $("#edtCurrencyDesc").val("");
    $("#edtBuyRate").val("");
    $("#edtSellRate").val("");

    if (selectCountry != "") {
      const data = await taxRateService.getOneCurrencyByCountry(selectCountry);

      if (data) {
        /**
         * Let's call the Fx APis here
         */

        for (let i = 0; i < data.tcurrency.length; i++) {
          if (data.tcurrency[i].Country === selectCountry) {
            var currencyid = data.tcurrency[i].Id || "";
            var country = data.tcurrency[i].Country || "";
            var currencyCode = data.tcurrency[i].Code || "";
            var currencySymbol = data.tcurrency[i].CurrencySymbol || "";
            var currencyName = data.tcurrency[i].Currency || "";
            var currencyDesc = data.tcurrency[i].CurrencyDesc;
            var currencyBuyRate = data.tcurrency[i].BuyRate || 0;
            var currencySellRate = data.tcurrency[i].SellRate || 0;

            let currencyRates = await FxApi.getExchangeRate(
              currencyName,
              defaultCurrencyCode
            ); // we were using currencyCode instead...
            if (currencyRates) {
              currencyBuyRate = currencyRates.buy;
              currencySellRate = currencyRates.sell;
            }

            $("#edtCurrencyID").val(currencyid);
            // $('#sedtCountry').val(country);

            $("#currencyCode").val(currencyCode);
            $("#currencySymbol").val(currencySymbol);
            $("#edtCurrencyName").val(currencyName);
            $("#edtCurrencyDesc").val(currencyDesc);
            $("#edtBuyRate").val(currencyBuyRate);
            $("#edtSellRate").val(currencySellRate);
            setTimeout(() => {
              triggerChangeEventOnRequiredFields();
            }, 1000);
          }
        }
      }
    }
    $(".fullScreenSpin").css("display", "none");
  },
  "click #editCountry": (e) => {
    $("#countryModal").modal("show");
  },
  "click #btnNewInvoice": function (event) {
    // FlowRouter.go('/invoicecard');
  },
  "click .chkDatatable": function (event) {
    var columns = $("#tblCurrencyList th");
    let columnDataValue = $(event.target)
      .closest("div")
      .find(".divcolumn")
      .text();

    $.each(columns, function (i, v) {
      let className = v.classList;
      let replaceClass = className[1];

      if (v.innerText == columnDataValue) {
        if ($(event.target).is(":checked")) {
          $("." + replaceClass + "").css("display", "table-cell");
          $("." + replaceClass + "").css("padding", ".75rem");
          $("." + replaceClass + "").css("vertical-align", "top");
        } else {
          $("." + replaceClass + "").css("display", "none");
        }
      }
    });
  },
  "click .resetTable": function (event) {
    var getcurrentCloudDetails = CloudUser.findOne({
      _id: localStorage.getItem("mycloudLogonID"),
      clouddatabaseID: localStorage.getItem("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblCurrencyList",
        });
        if (checkPrefDetails) {
          CloudPreference.remove(
            {
              _id: checkPrefDetails._id,
            },
            function (err, idTag) {
              if (err) {
              } else {
                Meteor._reload.reload();
              }
            }
          );
        }
      }
    }
  },
  "click .saveTable": function (event) {
    let lineItems = [];
    $(".columnSettings").each(function (index) {
      var $tblrow = $(this);
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
        colHidden = false;
      } else {
        colHidden = true;
      }
      let lineItemObj = {
        index: index,
        label: colTitle,
        hidden: colHidden,
        width: colWidth,
        thclass: colthClass,
      };

      lineItems.push(lineItemObj);
    });

    var getcurrentCloudDetails = CloudUser.findOne({
      _id: localStorage.getItem("mycloudLogonID"),
      clouddatabaseID: localStorage.getItem("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblCurrencyList",
        });
        if (checkPrefDetails) {
          CloudPreference.update(
            {
              _id: checkPrefDetails._id,
            },
            {
              $set: {
                userid: clientID,
                username: clientUsername,
                useremail: clientEmail,
                PrefGroup: "salesform",
                PrefName: "tblCurrencyList",
                published: true,
                customFields: lineItems,
                updatedAt: new Date(),
              },
            },
            function (err, idTag) {
              if (err) {
                $("#myModal2").modal("toggle");
              } else {
                $("#myModal2").modal("toggle");
              }
            }
          );
        } else {
          CloudPreference.insert(
            {
              userid: clientID,
              username: clientUsername,
              useremail: clientEmail,
              PrefGroup: "salesform",
              PrefName: "tblCurrencyList",
              published: true,
              customFields: lineItems,
              createdAt: new Date(),
            },
            function (err, idTag) {
              if (err) {
                $("#myModal2").modal("toggle");
              } else {
                $("#myModal2").modal("toggle");
              }
            }
          );
        }
      }
    }
    $("#myModal2").modal("toggle");
  },
  "blur .divcolumn": function (event) {
    let columData = $(event.target).text();

    let columnDatanIndex = $(event.target)
      .closest("div.columnSettings")
      .attr("id");
    var datable = $("#tblCurrencyList").DataTable();
    var title = datable.column(columnDatanIndex).header();
    $(title).html(columData);
  },
  "change .rngRange": function (event) {
    let range = $(event.target).val();
    $(event.target)
      .closest("div.divColWidth")
      .find(".spWidth")
      .html(range + "px");

    let columData = $(event.target)
      .closest("div.divColWidth")
      .find(".spWidth")
      .attr("value");
    let columnDataValue = $(event.target)
      .closest("div")
      .prev()
      .find(".divcolumn")
      .text();
    var datable = $("#tblCurrencyList th");
    $.each(datable, function (i, v) {
      if (v.innerText == columnDataValue) {
        let className = v.className;
        let replaceClass = className.replace(/ /g, ".");
        $("." + replaceClass + "").css("width", range + "px");
      }
    });
  },
  "click .btnOpenSettings": function (event) {
    let templateObject = Template.instance();
    var columns = $("#tblCurrencyList th");

    const tableHeaderList = [];
    let sTible = "";
    let sWidth = "";
    let sIndex = "";
    let sVisible = "";
    let columVisible = false;
    let sClass = "";
    $.each(columns, function (i, v) {
      if (v.hidden == false) {
        columVisible = true;
      }
      if (v.className.includes("hiddenColumn")) {
        columVisible = false;
      }
      sWidth = v.style.width.replace("px", "");

      let datatablerecordObj = {
        sTitle: v.innerText || "",
        sWidth: sWidth || "",
        sIndex: v.cellIndex || "",
        sVisible: columVisible || false,
        sClass: v.className || "",
      };
      tableHeaderList.push(datatablerecordObj);
    });
    templateObject.tableheaderrecords.set(tableHeaderList);
  },
  "click #exportbtn": function () {
    LoadingOverlay.show();
    jQuery("#tblCurrencyList_wrapper .dt-buttons .btntabletocsv").click();
    $(".fullScreenSpin").css("display", "none");
  },
  "click .btnRefresh": function () {
    LoadingOverlay.show();
    sideBarService
      .getCurrencies()
      .then(function (dataReload) {
        addVS1Data("TCurrency", JSON.stringify(dataReload))
          .then(function (datareturn) {
            location.reload(true);
          })
          .catch(function (err) {
            location.reload(true);
          });
      })
      .catch(function (err) {
        location.reload(true);
      });
  },
  "click .btnAddNewDepart": function () {
    $("#newTaxRate").css("display", "block");
  },
  "click .btnCloseAddNewDept": function () {
    playCancelAudio();
    setTimeout(function(){
    $("#newTaxRate").css("display", "none");
    }, delayTimeAfterSound);
  },
  "click .btnDeleteCurrency": function () {
    playDeleteAudio();
    let taxRateService = new TaxRateService();
    setTimeout(function(){
    let currencyId = $("#selectDeleteLineID").val();

    let objDetails = {
      type: "TCurrencyList",
      fields: {
        Id: currencyId,
        Active: false,
      },
    };

    taxRateService
      .saveCurrency(objDetails)
      .then(function (objDetails) {
        sideBarService
          .getCurrencies()
          .then(function (dataReload) {
            addVS1Data("TCurrencyList", JSON.stringify(dataReload))
              .then(function (datareturn) {
                Meteor._reload.reload();
              })
              .catch(function (err) {
                Meteor._reload.reload();
              });
          })
          .catch(function (err) {
            Meteor._reload.reload();
          });
      })
      .catch(function (err) {
        swal({
          title: "Oooops...",
          text: err,
          type: "error",
          showCancelButton: false,
          confirmButtonText: "Try Again",
        }).then((result) => {
          if (result.value) {
            Meteor._reload.reload();
          } else if (result.dismiss === "cancel") {
          }
        });
        $(".fullScreenSpin").css("display", "none");
      });
    }, delayTimeAfterSound);
  },
  "click .btnAddCurrency": function () {
    $("#add-currency-title").text("Add New Currency");
    $("#sedtCountry").val("");
    $("#edtCurrencyID").val("");
    $("#sedtCountry").removeAttr("readonly", true);
    $("#sedtCountry").removeAttr("disabled", "disabled");
    $("#currencyCode").val("");
    $("#currencySymbol").val("");
    $("#edtCurrencyName").val("");
    $("#edtCurrencyName").val("");
    $("#edtBuyRate").val(1);
    $("#edtSellRate").val(1);
    //Make btnDelete "Make Active or In-Active"
    if(status == "In-Active"){
        $('#view-in-active').html("<button class='btn btn-success btnActivateCurrency vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
    }else{
        $('#view-in-active').html("<button class='btn btn-danger btnDeleteCurrency vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    }
  },

  "click .editcurrencypop .btnSaveCurrency": function () {
    playSaveAudio();
    let taxRateService = new TaxRateService();
    setTimeout(function(){

    LoadingOverlay.show();
    var currencyid = $("#editCurrencyID").val();
    var country = $("#editCountry").val();
    var currencyCode = $("#editCurrencyCode").val();
    var currencySymbol = $("#editCurrencySymbol").val();
    var currencyName = $("#editCurrencyName").val();
    var currencyDesc = $("#editCurrencyDesc").val();
    var currencyBuyRate = $("#editBuyRate").val() || 0;
    var currencySellRate = $("#editSellRate").val() || 0;
    //Make btnDelete "Make Active or In-Active"
    if(status == "In-Active"){
        $('#view-in-active').html("<button class='btn btn-success btnActivateCurrency vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
    }else{
        $('#view-in-active').html("<button class='btn btn-danger btnDeleteCurrency vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    }

    let objDetails = "";
    if (currencyName === "") {
      Bert.alert(
        "<strong>WARNING:</strong> Currency Name cannot be blank!",
        "warning"
      );
      $(".fullScreenSpin").css("display", "none");
      e.preventDefault();
    }

    if (currencyid == "") {
      objDetails = {
        type: "TCurrencyList",
        fields: {
          Active: true,
          //Country: country,
          Code: currencyCode,
          CurrencySymbol: currencySymbol,
          Currency: currencyName,
          CurrencyDesc: currencyDesc,
          BuyRate: parseFloat(currencyBuyRate) || 1,
          SellRate: parseFloat(currencySellRate) || 1,
        },
      };
    } else {
      objDetails = {
        type: "TCurrencyList",
        fields: {
          ID: parseInt(currencyid),
          Active: true,
          //Country: country,
          Code: currencyCode,
          CurrencySymbol: currencySymbol,
          Currency: currencyName,
          CurrencyDesc: currencyDesc,
          BuyRate: parseFloat(currencyBuyRate) || 1,
          SellRate: parseFloat(currencySellRate) || 1,
        },
      };
    }

    taxRateService
      .saveCurrency(objDetails)
      .then(function (objDetails) {
        sideBarService
          .getCurrencies()
          .then(function (dataReload) {
            $("#sltCurrency").val(currencyCode);
            addVS1Data("TCurrencyList", JSON.stringify(dataReload))
              .then(function (datareturn) {
                $("#newCurrencyModal").modal("toggle");
                $(".fullScreenSpin").css("display", "none");
              })
              .catch(function (err) {
                $("#newCurrencyModal").modal("toggle");
                $(".fullScreenSpin").css("display", "none");
              });
          })
          .catch(function (err) {
            $("#newCurrencyModal").modal("toggle");
            $(".fullScreenSpin").css("display", "none");
          });
      })
      .catch(function (err) {
        swal({
          title: "Oooops...",
          text: err,
          type: "error",
          showCancelButton: false,
          confirmButtonText: "Try Again",
        }).then((result) => {
          if (result.value) {
            $("#editCurrencyModal").modal("toggle");
            $(".fullScreenSpin").css("display", "none");
          } else if (result.dismiss === "cancel") {
          }
        });
        $("#edit-currency-title").text("Edit Currency");
        $(".fullScreenSpin").css("display", "none");
      });
    }, delayTimeAfterSound);
  },
  "change .editNewCurrency input": (e) => {
    //$(".btnSaveCurrency").attr("disabled", !isAllRequiredInputsFilled());
  },
  "keyup .editNewCurrency input": (e) => {
    //$(".btnSaveCurrency").attr("disabled", !isAllRequiredInputsFilled());
  },
});

Template.editcurrencypop.helpers({
  datatablerecordscurrencypop: () => {
    return Template.instance()
      .datatablerecordscurrencypop.get()
      .sort(function (a, b) {
        if (a.code == "NA") {
          return 1;
        } else if (b.code == "NA") {
          return -1;
        }
        return a.code.toUpperCase() > b.code.toUpperCase() ? 1 : -1;
        // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblCurrencyList",
    });
  },
  countryList: () => {
    return Template.instance().countryData.get();
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },
});

export function triggerChangeEventOnRequiredFields() {
  $("#editCurrencyModal .editNewCurrency input[required]").each((i, element) => {
    $(element).trigger("change");
  });
}

function isAllRequiredInputsFilled() {
  return 1;
  const inputs = $("#editCurrencyModal .editNewCurrency input[required]");
  let filledCount = 0;

  $(inputs).each((i, input) => {
    if ($.trim($(input).val()).length > 0) {
      filledCount = filledCount +1;
    }
  });

  return inputs.length == filledCount;
}