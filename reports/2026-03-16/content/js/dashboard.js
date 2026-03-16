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

    var data = {"OkPercent": 93.33333333333333, "KoPercent": 6.666666666666667};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1"], "isController": false}, {"data": [0.0, 500, 1500, "add to cart"], "isController": true}, {"data": [0.5, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1"], "isController": false}, {"data": [1.0, 500, 1500, "https://www.amazon.in/gp/cart/view.html?ref_=nav_cart"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266"], "isController": false}, {"data": [0.5, 500, 1500, "Go back"], "isController": true}, {"data": [0.0, 500, 1500, "filters"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564"], "isController": false}, {"data": [0.0, 500, 1500, "https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0"], "isController": false}, {"data": [1.0, 500, 1500, "https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508"], "isController": false}, {"data": [0.0, 500, 1500, "search"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502"], "isController": false}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/s?k=laptops&i=aps"], "isController": false}, {"data": [0.5, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1"], "isController": false}, {"data": [0.0, 500, 1500, "proceed to buy"], "isController": true}, {"data": [1.0, 500, 1500, "https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812"], "isController": false}, {"data": [1.0, 500, 1500, "https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 30, 2, 6.666666666666667, 351.2999999999999, 8, 2207, 118.0, 1113.2, 1671.8499999999992, 2207.0, 0.22373199889625547, 37.665092657675125, 0.20501483622817682], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://www.amazon.in/Lenovo-inches-27-94-128GB-Wi-Fi/dp/B09DYD3D1C/ref=sr_1_1?dd=L45E1VCYK7HNMtdM3Eg4qQ%2C%2C&dib=eyJ2IjoiMSJ9.DP85JMCpGEp0pI9oczr37IDmRQh0vX9emoFECWyu4Nepzx_EkcZauX9Rfn2eEpeQyIsvYVMnjQJrUNZ2bxctjoFShTsvyWxv754sxhSTsT53joAQJb5W4o4AexLTdtthiO9yowxKYuBo69POaaOSgrMX6BTMAmKA-Q7JSxUbvK5IZQm46O_QOrouHzKEcbxY.xqI666ick3ZWknvxe19ghrLyNziAszYKQInVi1cRiSU&dib_tag=se&keywords=laptops&qid=1751980035&refinements=p_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&rnid=2665398031&s=computers&sr=1-1", 1, 0, 0.0, 2207.0, 2207, 2207, 2207.0, 2207.0, 2207.0, 2207.0, 0.45310376076121434, 713.0618663627096, 0.6907177446760309], "isController": false}, {"data": ["add to cart", 1, 1, 100.0, 616.0, 616, 616, 616.0, 616.0, 616.0, 616.0, 1.6233766233766236, 5.359996448863637, 5.497920048701299], "isController": true}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0", 1, 0, 0.0, 789.0, 789, 789, 789.0, 789.0, 789.0, 789.0, 1.2674271229404308, 406.0928093314322, 3.6054836026615966], "isController": false}, {"data": ["https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1", 1, 1, 100.0, 253.0, 253, 253, 253.0, 253.0, 253.0, 253.0, 3.952569169960474, 11.097301136363637, 3.693953804347826], "isController": false}, {"data": ["https://www.amazon.in/gp/cart/view.html?ref_=nav_cart", 1, 0, 0.0, 433.0, 433, 433, 433.0, 433.0, 433.0, 433.0, 2.3094688221709005, 620.653958573903, 2.4560659642032334], "isController": false}, {"data": ["https://www.amazon.in/s/ref=nb_sb_noss_2?url=search-alias%3Dkitchen&field-keywords=laptops&crid=2J02LCQT3SXKR&sprefix=laptops%2Ckitchen%2C266", 1, 0, 0.0, 1061.0, 1061, 1061, 1061.0, 1061.0, 1061.0, 1061.0, 0.942507068803016, 266.4211607563619, 0.7400153157398681], "isController": false}, {"data": ["Go back", 1, 0, 0.0, 724.0, 724, 724, 724.0, 724.0, 724.0, 724.0, 1.3812154696132597, 371.69938061118785, 2.456243525552486], "isController": true}, {"data": ["filters", 1, 0, 0.0, 4575.0, 4575, 4575, 4575.0, 4575.0, 4575.0, 4575.0, 0.2185792349726776, 597.6086492486338, 2.5576331967213113], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980036564&s=AXGvtlVuuJFW2J1klt22SC8J16I26BXSjb4QF_bljXPV&gdpr_consent=&gdpr_consent_avl=&cb=1751980036564", 1, 0, 0.0, 100.0, 100, 100, 100.0, 100.0, 100.0, 100.0, 10.0, 3.671875, 7.1484375], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, 100.0, 331.0, 331, 331, 331.0, 331.0, 331.0, 331.0, 3.0211480362537766, 8.865771336858005, 8.07212990936556], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751979989963&s=AWnafigVpPSNDZYZ-_UxMlK6_5pz5e_SnjIqVr3W2cwF&gdpr_consent=&gdpr_consent_avl=&cb=1751979989963", 1, 0, 0.0, 345.0, 345, 345, 345.0, 345.0, 345.0, 345.0, 2.898550724637681, 1.0643115942028987, 2.0720108695652177], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242&dc&qid=1751980004&rnid=91049095031&ref=sr_nr_p_123_1&ds=v1%3AMwq7TVqkNCYd2%2FdFuENV8TRt9u%2BTncFhOmWpqNKDSw0", 1, 0, 0.0, 1119.0, 1119, 1119, 1119.0, 1119.0, 1119.0, 1119.0, 0.8936550491510277, 584.9871188002681, 0.8666010388739946], "isController": false}, {"data": ["https://images-eu.ssl-images-amazon.com/images/S/apesafeframe/ape/sf/desktop/sf-1.50.f5f4de2b.html", 13, 0, 0.0, 19.000000000000004, 8, 135, 9.0, 85.39999999999995, 135.0, 135.0, 0.2524124808263596, 0.29606133380579774, 0.1459449267518397], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980013508&s=Acnx-1Koh4jjXbQUO-GWO2Swlj7pHBQgY-OurQvdCLrj&gdpr_consent=&gdpr_consent_avl=&cb=1751980013508", 1, 0, 0.0, 99.0, 99, 99, 99.0, 99.0, 99.0, 99.0, 10.101010101010102, 3.708964646464646, 7.2206439393939394], "isController": false}, {"data": ["search", 1, 0, 0.0, 2794.0, 2794, 2794, 2794.0, 2794.0, 2794.0, 2794.0, 0.35790980672870437, 501.21004272548316, 1.4316392269148175], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980074502&s=AdArRuhrWCKOWyCKZtNIpN6kiukDJ0DS53opAPuS3SIw&gdpr_consent=&gdpr_consent_avl=&cb=1751980074502", 1, 0, 0.0, 285.0, 285, 285, 285.0, 285.0, 285.0, 285.0, 3.5087719298245617, 1.2883771929824563, 2.5082236842105265], "isController": false}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980059744&s=Af0F35DLvea0ePZgAnTg-q0bz47J15Z02CPonzImAvQG&gdpr_consent=&gdpr_consent_avl=&cb=1751980059744", 1, 0, 0.0, 101.0, 101, 101, 101.0, 101.0, 101.0, 101.0, 9.900990099009901, 3.6355198019801978, 7.077660891089108], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=computers&rh=n%3A976392031%2Cp_90%3A6741118031%2Cp_123%3A391242%2Cp_n_pct-off-with-tax%3A2665401031&dc&qid=1751980012&rnid=2665398031&ref=sr_nr_p_n_pct-off-with-tax_4&ds=v1%3AN1VKHrXoHv%2F3lLuyY5nYPP5snSO8n22iQQnQeMYjim4", 1, 0, 0.0, 856.0, 856, 856, 856.0, 856.0, 856.0, 856.0, 1.1682242990654206, 576.4479592581775, 1.4739705023364487], "isController": false}, {"data": ["https://www.amazon.in/s?k=laptops&i=aps", 1, 0, 0.0, 1234.0, 1234, 1234, 1234.0, 1234.0, 1234.0, 1234.0, 0.8103727714748784, 902.1743947528363, 0.6354778666936791], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-1", 1, 0, 0.0, 511.0, 511, 511, 511.0, 511.0, 511.0, 511.0, 1.9569471624266144, 623.4711350293542, 3.1895945450097845], "isController": false}, {"data": ["proceed to buy", 1, 1, 100.0, 1042.0, 1042, 1042, 1042.0, 1042.0, 1042.0, 1042.0, 0.9596928982725528, 310.18699016314775, 3.6269643714011517], "isController": true}, {"data": ["https://aax-eu.amazon-adsystem.com/s/iu3?d=amazon.in&slot=navFooter&a2=0101fd34016f8935e968e197bbf3c5935bac5562da9afd833a1e115e6e234caba0c1&old_oo=0&ts=1751980142812&s=AZuF5UW9mSE--7tp1pWW9ulrQTX-JwTAN3GEng6Xl74Z&gdpr_consent=&gdpr_consent_avl=&cb=1751980142812", 1, 0, 0.0, 291.0, 291, 291, 291.0, 291.0, 291.0, 291.0, 3.4364261168384878, 1.2618127147766325, 2.456507731958763], "isController": false}, {"data": ["https://www.amazon.in/checkout/entry/cart?tangoWeblabStatus=tango_enable_unrec_customer&pipelineType=Chewbacca&referrer=cart&ref_=ox_sw_proceed&isEligibilityLogicDisabled=1&proceedToCheckout=1&oldCustomerId=0-0", 1, 0, 0.0, 277.0, 277, 277, 277.0, 277.0, 277.0, 277.0, 3.6101083032490977, 6.5468467960288805, 4.3857175090252705], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["403/Forbidden", 1, 50.0, 3.3333333333333335], "isController": false}, {"data": ["404/Not Found", 1, 50.0, 3.3333333333333335], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 30, 2, "403/Forbidden", 1, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/gp/remotepagelet/signin/checkout-perf-initiate-and-store.html?siteState=isRegularCheckout.1", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://www.amazon.in/cart/add-to-cart/ref=dp_start-bbf_1_glance", 1, 1, "403/Forbidden", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
