/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 40.0, "KoPercent": 60.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2857142857142857, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1"], "isController": false}, {"data": [0.0, 500, 1500, "add to cart"], "isController": true}, {"data": [0.5, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/gp/cart/view.html?ref_=nav_cart"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266"], "isController": false}, {"data": [0.5, 500, 1500, "Go back"], "isController": true}, {"data": [0.0, 500, 1500, "filters"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0"], "isController": false}, {"data": [0.0, 500, 1500, "https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508"], "isController": false}, {"data": [0.0, 500, 1500, "search"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&i=aps"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1"], "isController": false}, {"data": [0.0, 500, 1500, "proceed to buy"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812"], "isController": false}, {"data": [1.0, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 30, 18, 60.0, 247.76666666666668, 3, 2108, 142.0, 847.6000000000008, 1592.6499999999994, 2108.0, 0.22974245870379306, 13.273946403477536, 0.2170662390585154], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1", 1, 0, 0.0, 197.0, 197, 197, 197.0, 197.0, 197.0, 197.0, 5.076142131979695, 21.251388007614214, 7.762928299492385], "isController": false}, {"data": ["add to cart", 1, 1, 100.0, 437.0, 437, 437, 437.0, 437.0, 437.0, 437.0, 2.288329519450801, 7.513050629290618, 7.761101973684211], "isController": true}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0", 1, 0, 0.0, 1171.0, 1171, 1171, 1171.0, 1171.0, 1171.0, 1171.0, 0.8539709649871904, 199.20874252775405, 2.464340040563621], "isController": false}, {"data": ["https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1", 1, 1, 100.0, 216.0, 216, 216, 216.0, 216.0, 216.0, 216.0, 4.62962962962963, 12.690791377314815, 5.579065393518518], "isController": false}, {"data": ["https://www.amazon.in/gp/cart/view.html?ref_=nav_cart", 1, 0, 0.0, 520.0, 520, 520, 520.0, 520.0, 520.0, 520.0, 1.9230769230769231, 546.4449368990385, 2.565354567307692], "isController": false}, {"data": ["https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266", 1, 0, 0.0, 2108.0, 2108, 2108, 2108.0, 2108.0, 2108.0, 2108.0, 0.47438330170777987, 454.38878676470586, 0.372465014231499], "isController": false}, {"data": ["Go back", 1, 0, 0.0, 670.0, 670, 670, 670.0, 670.0, 670.0, 670.0, 1.492537313432836, 424.7186916977612, 3.0579524253731343], "isController": true}, {"data": ["filters", 1, 1, 100.0, 1089.0, 1089, 1089, 1089.0, 1089.0, 1089.0, 1089.0, 0.9182736455463728, 13.354424931129477, 10.749361512855831], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564", 1, 0, 0.0, 141.0, 141, 141, 141.0, 141.0, 141.0, 141.0, 7.092198581560283, 2.9089095744680855, 5.069813829787234], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, 100.0, 295.0, 295, 295, 295.0, 295.0, 295.0, 295.0, 3.389830508474576, 9.739141949152543, 9.07375529661017], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963", 1, 0, 0.0, 174.0, 174, 174, 174.0, 174.0, 174.0, 174.0, 5.747126436781609, 2.357219827586207, 4.108297413793104], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0", 1, 1, 100.0, 194.0, 194, 194, 194.0, 194.0, 194.0, 194.0, 5.154639175257732, 9.61461018041237, 6.231878221649485], "isController": false}, {"data": ["https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html", 13, 13, 100.0, 14.615384615384615, 3, 144, 4.0, 88.39999999999995, 144.0, 144.0, 0.2720234358652438, 0.1392199270244821, 0.15115364746808957], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508", 1, 0, 0.0, 142.0, 142, 142, 142.0, 142.0, 142.0, 142.0, 7.042253521126761, 2.888424295774648, 5.034110915492958], "isController": false}, {"data": ["search", 1, 1, 100.0, 2680.0, 2680, 2680, 2680.0, 2680.0, 2680.0, 2680.0, 0.373134328358209, 358.8244082322761, 1.5752536147388059], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502", 1, 0, 0.0, 142.0, 142, 142, 142.0, 142.0, 142.0, 142.0, 7.042253521126761, 2.888424295774648, 5.034110915492958], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744", 1, 0, 0.0, 142.0, 142, 142, 142.0, 142.0, 142.0, 142.0, 7.042253521126761, 2.888424295774648, 5.034110915492958], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4", 1, 1, 100.0, 236.0, 236, 236, 236.0, 236.0, 236.0, 236.0, 4.237288135593221, 9.02492717161017, 5.366955773305085], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=aps", 1, 1, 100.0, 245.0, 245, 245, 245.0, 245.0, 245.0, 245.0, 4.081632653061225, 7.613201530612245, 4.30484693877551], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1", 1, 0, 0.0, 884.0, 884, 884, 884.0, 884.0, 884.0, 884.0, 1.1312217194570138, 261.27244768099547, 1.8846330599547512], "isController": false}, {"data": ["proceed to buy", 1, 1, 100.0, 1387.0, 1387, 1387, 1387.0, 1387.0, 1387.0, 1387.0, 0.7209805335255948, 170.16196715032444, 2.9494018114635905], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812", 1, 0, 0.0, 150.0, 150, 150, 150.0, 150.0, 150.0, 150.0, 6.666666666666667, 2.734375, 4.765625], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0", 1, 0, 0.0, 286.0, 286, 286, 286.0, 286.0, 286.0, 286.0, 3.4965034965034967, 8.07200611888112, 4.264778190559441], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 13, 72.22222222222223, 43.333333333333336], "isController": false}, {"data": ["503/Service Unavailable", 3, 16.666666666666668, 10.0], "isController": false}, {"data": ["403/Forbidden", 1, 5.555555555555555, 3.3333333333333335], "isController": false}, {"data": ["404/Not Found", 1, 5.555555555555555, 3.3333333333333335], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 30, 18, "400/Bad Request", 13, "503/Service Unavailable", 3, "403/Forbidden", 1, "404/Not Found", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, "403/Forbidden", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html", 13, 13, "400/Bad Request", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=aps", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
