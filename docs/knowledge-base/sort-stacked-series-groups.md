---
title: Sort Stacked Series in Grouped Charts
page_title: Sort Stacked Series in Grouped Charts
description: "Learn how to sort the stacked series in a grouped Kendo UI Chart."
previous_url: /controls/charts/how-to/sort-stacked-series-groups, /controls/charts/how-to/sorting/sort-stacked-series-groups
slug: howto_sortstackedseriesinagroupedchart_charts
tags: chart, sort, stacked, series, in, grouped, charts
component: chart
type: how-to
res_type: kb
---

## Environment

<table>
 <tr>
  <td>Product</td>
  <td>Progress Kendo UI Chart for jQuery</td>
 </tr>
 <tr>
  <td>Operating System</td>
  <td>Windows 10 64bit</td>
 </tr>
 <tr>
  <td>Visual Studio version</td>
  <td>Visual Studio 2017</td>
 </tr>
 <tr>
  <td>Preferred Language</td>
  <td>JavaScript</td>
 </tr>
</table>

## Description

How can I set the order of the stacked series in a grouped Chart?

## Solution

The order of the stacked series in a grouped chart cannot be set through the `sort` option of the data source.

The reason for this behavior is that the grouping overrides the sort order as part of its implementation. In effect, the sort order is respected only within the resulting groups. Still, you can influence the final order of the stacked series as follows:

* Collect the stack values in an array. The stackValue can be obtained from the [labels.template](/api/javascript/dataviz/ui/chart/configuration/series.labels.template).
* [Sort the categories]({% slug howto_sortcategorisinagroupedchart_charts %}) based on the stack values array.

The following example demonstrates how to sort stacked series values in a grouped Kendo UI Chart.

```dojo
    <div id="chart"></div>
    <script>

      var _globalTimeOut,
          redrawChart = true,
          myValues = {};

      var data = [{
        daysOut: 1,
        type: "A",
        requestor: "Adam"
      },{
        daysOut: 2,
        type: "A",
        requestor: "Bonnie"
      },{
        daysOut: 7,
        type: "A",
        requestor: "Connor"
      },{
        daysOut: 4,
        type: "B",
        requestor: "Adam"
      },{
        daysOut: 6,
        type: "B",
        requestor: "Bonnie"
      },{
        daysOut: 4,
        type: "B",
        requestor: "Zach"
      },{
        daysOut: 3,
        type: "B",
        requestor: "Amber"
      }];

      $("#chart").kendoChart({
        "dataSource": {
          data: data,
          group: {
            field: "type"
          }
        },
        series: [{
          field: "daysOut",
          type: "bar",
          categoryField: "requestor",
          labels: {background: "", visible: true, template: "# if(stackValue) { stackValues[category] = stackValue; } #"},
          stack: true
        }],
        dataBound: function() {
          // Sort on data change
          needsSort = true;
          stackValues = {};
        },
        legendItemClick: function() {
          // Sort on series toggle
          needsSort = true;
        },
        render: function(e) {
          triggerSorting(e);
        }
      });

      function triggerSorting(e) {
        if (!needsSort) {
          return;
        }

        needsSort = false;
        var axis = e.sender.options.categoryAxis;
        axis.categories = axis.categories.sort(function (a, b) {
          if (stackValues[a] < stackValues[b]) {
            return -1;
          }
          if (stackValues[a] > stackValues[b]) {
            return 1;
          }

          return 0;
        });

        e.sender.redraw();
      }
    </script>
```

## See Also

* [Chart JavaScript API Reference](/api/javascript/dataviz/ui/chart)
* [Drawing API]({% slug overview_kendoui_drawingapi %})
* [How to Sort Categories in Grouped Charts]({% slug howto_sortcategorisinagroupedchart_charts %})
* [How to Aggregate Data in Pie Charts]({% slug howto_aggregatedata_piecharts %})
* [How to Draw on Scatter Plots Surface]({% slug howto_drawonscatterplotssurface_charts %})
