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

    var data = {"OkPercent": 86.66666666666667, "KoPercent": 13.333333333333334};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1"], "isController": false}, {"data": [0.0, 500, 1500, "add to cart"], "isController": true}, {"data": [0.5, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0"], "isController": false}, {"data": [1.0, 500, 1500, "https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/gp/cart/view.html?ref_=nav_cart"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266"], "isController": false}, {"data": [0.5, 500, 1500, "Go back"], "isController": true}, {"data": [0.0, 500, 1500, "filters"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0"], "isController": false}, {"data": [1.0, 500, 1500, "https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508"], "isController": false}, {"data": [0.0, 500, 1500, "search"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/s?k=laptops&i=aps"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1"], "isController": false}, {"data": [0.5, 500, 1500, "proceed to buy"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812"], "isController": false}, {"data": [1.0, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 30, 4, 13.333333333333334, 270.0, 3, 2855, 75.5, 779.5000000000001, 1917.2499999999986, 2855.0, 0.22849308808408547, 9.322361797383754, 0.19958930747553222], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1", 1, 0, 0.0, 128.0, 128, 128, 128.0, 128.0, 128.0, 128.0, 7.8125, 48.370361328125, 9.83428955078125], "isController": false}, {"data": ["add to cart", 1, 1, 100.0, 442.0, 442, 442, 442.0, 442.0, 442.0, 442.0, 2.2624434389140275, 7.474459134615384, 7.061298076923077], "isController": true}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0", 1, 0, 0.0, 1150.0, 1150, 1150, 1150.0, 1150.0, 1150.0, 1150.0, 0.8695652173913044, 272.85411005434787, 2.0388926630434785], "isController": false}, {"data": ["https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1", 1, 0, 0.0, 349.0, 349, 349, 349.0, 349.0, 349.0, 349.0, 2.865329512893983, 9.463422277936964, 3.0360180873925504], "isController": false}, {"data": ["https://www.amazon.in/gp/cart/view.html?ref_=nav_cart", 1, 0, 0.0, 748.0, 748, 748, 748.0, 748.0, 748.0, 748.0, 1.3368983957219251, 353.94646139705884, 1.5888724097593583], "isController": false}, {"data": ["https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266", 1, 0, 0.0, 2855.0, 2855, 2855, 2855.0, 2855.0, 2855.0, 2855.0, 0.3502626970227671, 100.14332038091068, 0.275010945709282], "isController": false}, {"data": ["Go back", 1, 0, 0.0, 971.0, 971, 971, 971.0, 971.0, 971.0, 971.0, 1.0298661174047374, 273.0372200051493, 1.9601651004119465], "isController": true}, {"data": ["filters", 1, 1, 100.0, 669.0, 669, 669, 669.0, 669.0, 669.0, 669.0, 1.4947683109118086, 45.6926149103139, 17.01466741405082], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564", 1, 0, 0.0, 75.0, 75, 75, 75.0, 75.0, 75.0, 75.0, 13.333333333333334, 4.895833333333334, 9.53125], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, 100.0, 366.0, 366, 366, 366.0, 366.0, 366.0, 366.0, 2.73224043715847, 8.023288080601093, 6.574453551912568], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963", 1, 0, 0.0, 255.0, 255, 255, 255.0, 255.0, 255.0, 255.0, 3.9215686274509802, 1.4399509803921569, 2.8033088235294117], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0", 1, 1, 100.0, 120.0, 120, 120, 120.0, 120.0, 120.0, 120.0, 8.333333333333334, 15.999348958333334, 7.820638020833334], "isController": false}, {"data": ["https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html", 13, 0, 0.0, 6.692307692307692, 3, 32, 4.0, 21.999999999999993, 32.0, 32.0, 0.27410546734982183, 0.5291438025808084, 0.1646650707930082], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508", 1, 0, 0.0, 75.0, 75, 75, 75.0, 75.0, 75.0, 75.0, 13.333333333333334, 4.895833333333334, 9.53125], "isController": false}, {"data": ["search", 1, 1, 100.0, 3370.0, 3370, 3370, 3370.0, 3370.0, 3370.0, 3370.0, 0.29673590504451036, 87.27628894658753, 1.201432678041543], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502", 1, 0, 0.0, 76.0, 76, 76, 76.0, 76.0, 76.0, 76.0, 13.157894736842104, 4.831414473684211, 9.405838815789474], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744", 1, 0, 0.0, 78.0, 78, 78, 78.0, 78.0, 78.0, 78.0, 12.82051282051282, 4.707532051282051, 9.164663461538462], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4", 1, 1, 100.0, 150.0, 150, 150, 150.0, 150.0, 150.0, 150.0, 6.666666666666667, 14.563802083333334, 6.640625], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=aps", 1, 1, 100.0, 216.0, 216, 216, 216.0, 216.0, 216.0, 216.0, 4.62962962962963, 8.888527199074074, 3.6304615162037037], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1", 1, 0, 0.0, 783.0, 783, 783, 783.0, 783.0, 783.0, 783.0, 1.277139208173691, 398.25914950510855, 1.7822577426564494], "isController": false}, {"data": ["proceed to buy", 1, 0, 0.0, 1499.0, 1499, 1499, 1499.0, 1499.0, 1499.0, 1499.0, 0.66711140760507, 211.53099462141427, 2.271045280186791], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812", 1, 0, 0.0, 223.0, 223, 223, 223.0, 223.0, 223.0, 223.0, 4.484304932735426, 1.6465807174887892, 3.2055773542600896], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0", 1, 0, 0.0, 366.0, 366, 366, 366.0, 366.0, 366.0, 366.0, 2.73224043715847, 5.315061475409836, 2.5934938524590163], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 3, 75.0, 10.0], "isController": false}, {"data": ["403/Forbidden", 1, 25.0, 3.3333333333333335], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 30, 4, "503/Service Unavailable", 3, "403/Forbidden", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, "403/Forbidden", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=aps", 1, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
