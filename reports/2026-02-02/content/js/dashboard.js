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

    var data = {"OkPercent": 83.33333333333333, "KoPercent": 16.666666666666668};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6714285714285714, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1"], "isController": false}, {"data": [0.0, 500, 1500, "add to cart"], "isController": true}, {"data": [0.5, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/gp/cart/view.html?ref_=nav_cart"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266"], "isController": false}, {"data": [0.5, 500, 1500, "Go back"], "isController": true}, {"data": [0.0, 500, 1500, "filters"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0"], "isController": false}, {"data": [1.0, 500, 1500, "https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508"], "isController": false}, {"data": [0.0, 500, 1500, "search"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&i=aps"], "isController": false}, {"data": [1.0, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1"], "isController": false}, {"data": [0.0, 500, 1500, "proceed to buy"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812"], "isController": false}, {"data": [1.0, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 30, 5, 16.666666666666668, 260.06666666666666, 14, 1118, 104.0, 997.8000000000006, 1114.7, 1118.0, 0.22833483019499795, 4.956285475145754, 0.20338300646568128], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1", 1, 0, 0.0, 1112.0, 1112, 1112, 1112.0, 1112.0, 1112.0, 1112.0, 0.8992805755395684, 127.5915790804856, 1.1320045526079137], "isController": false}, {"data": ["add to cart", 1, 1, 100.0, 722.0, 722, 722, 722.0, 722.0, 722.0, 722.0, 1.3850415512465375, 4.573071762465374, 4.366127077562327], "isController": true}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0", 1, 0, 0.0, 753.0, 753, 753, 753.0, 753.0, 753.0, 753.0, 1.3280212483399734, 156.40562749003985, 3.6326049966799467], "isController": false}, {"data": ["https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1", 1, 1, 100.0, 104.0, 104, 104, 104.0, 104.0, 104.0, 104.0, 9.615384615384617, 26.996319110576923, 10.18817608173077], "isController": false}, {"data": ["https://www.amazon.in/gp/cart/view.html?ref_=nav_cart", 1, 0, 0.0, 505.0, 505, 505, 505.0, 505.0, 505.0, 505.0, 1.9801980198019802, 183.3249535891089, 2.3534189356435644], "isController": false}, {"data": ["https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266", 1, 1, 100.0, 1118.0, 1118, 1118, 1118.0, 1118.0, 1118.0, 1118.0, 0.8944543828264758, 1.7172825357781751, 0.7022864490161002], "isController": false}, {"data": ["Go back", 1, 0, 0.0, 813.0, 813, 813, 813.0, 813.0, 813.0, 813.0, 1.2300123001230012, 114.32507879766298, 2.3411073954489545], "isController": true}, {"data": ["filters", 1, 1, 100.0, 2748.0, 2748, 2748, 2748.0, 2748.0, 2748.0, 2748.0, 0.363901018922853, 111.51718295123726, 4.070431905021834], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564", 1, 0, 0.0, 104.0, 104, 104, 104.0, 104.0, 104.0, 104.0, 9.615384615384617, 3.5306490384615388, 6.873497596153847], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, 100.0, 397.0, 397, 397, 397.0, 397.0, 397.0, 397.0, 2.5188916876574305, 7.391864767002518, 6.1397984886649875], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963", 1, 0, 0.0, 353.0, 353, 353, 353.0, 353.0, 353.0, 353.0, 2.8328611898017, 1.0401912181303117, 2.025053116147309], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0", 1, 1, 100.0, 147.0, 147, 147, 147.0, 147.0, 147.0, 147.0, 6.802721088435374, 13.060693027210885, 5.713222789115647], "isController": false}, {"data": ["https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html", 13, 0, 0.0, 34.61538461538461, 14, 261, 15.0, 165.39999999999992, 261.0, 261.0, 0.2609027234230437, 0.5007560534449195, 0.15673370486884622], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508", 1, 0, 0.0, 104.0, 104, 104, 104.0, 104.0, 104.0, 104.0, 9.615384615384617, 3.5306490384615388, 6.873497596153847], "isController": false}, {"data": ["search", 1, 1, 100.0, 1911.0, 1911, 1911, 1911.0, 1911.0, 1911.0, 1911.0, 0.5232862375719519, 5.303383372579801, 2.0670828427524857], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502", 1, 0, 0.0, 325.0, 325, 325, 325.0, 325.0, 325.0, 325.0, 3.076923076923077, 1.1298076923076923, 2.199519230769231], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744", 1, 0, 0.0, 104.0, 104, 104, 104.0, 104.0, 104.0, 104.0, 9.615384615384617, 3.5306490384615388, 6.873497596153847], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4", 1, 0, 0.0, 1025.0, 1025, 1025, 1025.0, 1025.0, 1025.0, 1025.0, 0.975609756097561, 139.04630335365854, 0.8755716463414634], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=aps", 1, 1, 100.0, 142.0, 142, 142, 142.0, 142.0, 142.0, 142.0, 7.042253521126761, 13.520576584507044, 4.827794894366198], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1", 1, 0, 0.0, 433.0, 433, 433, 433.0, 433.0, 433.0, 433.0, 2.3094688221709005, 266.6804994226328, 4.052847142032332], "isController": false}, {"data": ["proceed to buy", 1, 1, 100.0, 857.0, 857, 857, 857.0, 857.0, 857.0, 857.0, 1.1668611435239205, 140.70134735997667, 4.428146878646441], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812", 1, 0, 0.0, 308.0, 308, 308, 308.0, 308.0, 308.0, 308.0, 3.246753246753247, 1.1921672077922079, 2.3209212662337664], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0", 1, 0, 0.0, 318.0, 318, 318, 318.0, 318.0, 318.0, 318.0, 3.1446540880503147, 7.2351611635220126, 3.0832350628930816], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 3, 60.0, 10.0], "isController": false}, {"data": ["403/Forbidden", 1, 20.0, 3.3333333333333335], "isController": false}, {"data": ["404/Not Found", 1, 20.0, 3.3333333333333335], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 30, 5, "503/Service Unavailable", 3, "403/Forbidden", 1, "404/Not Found", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, "403/Forbidden", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=aps", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
