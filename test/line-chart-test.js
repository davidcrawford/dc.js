require("./env");

var vows = require('vows');
var assert = require('assert');

var suite = vows.describe('Line chart');

var width = 1100;
var height = 200;

function buildChart(id, xdomain) {
    if(!xdomain)
        xdomain = [new Date(2012, 0, 1), new Date(2012, 11, 31)];

    d3.select("body").append("div").attr("id", id);
    var chart = dc.lineChart("#" + id);
    chart.dimension(dateDimension).group(dateGroup)
        .width(width).height(height)
        .x(d3.time.scale().domain(xdomain))
        .transitionDuration(0)
        .xUnits(d3.time.days);
    chart.render();
    return chart;
}

suite.addBatch({
    'time line chart': {
        topic: function() {
            var chart = buildChart("line-chart");
            chart.filter([new Date(2012, 5, 1), new Date(2012, 5, 30)]);
            chart.redraw();
            return chart;
        },
        'we get something': function(chart) {
            assert.isNotNull(chart);
        },
        'should be registered':function(chart) {
            assert.isTrue(dc.hasChart(chart));
        },
        'svg should be created': function(chart) {
            assert.isFalse(chart.select("svg").empty());
        },
        'dimension should be set': function(chart) {
            assert.equal(chart.dimension(), dateDimension);
        },
        'group should be set': function(chart) {
            assert.equal(chart.group(), dateGroup);
        },
        'width should be set': function(chart) {
            assert.equal(chart.width(), width);
        },
        'height should be set': function(chart) {
            assert.equal(chart.height(), height);
        },
        'height should be used for svg': function(chart) {
            assert.equal(chart.select("svg").attr("height"), height);
        },
        'transition duration should be set': function(chart) {
            assert.equal(chart.transitionDuration(), 0);
        },
        'margin should be set': function(chart) {
            assert.isNotNull(chart.margins());
        },
        'x can be set': function(chart) {
            assert.isTrue(chart.x() != undefined);
        },
        'x range round is auto calculated based on width': function(chart) {
            assert.equal(chart.x().range()[0], 0);
            assert.equal(chart.x().range()[1], 1020);
        },
        'x domain should be set': function(chart) {
            assert.equal(chart.x().domain()[0].getTime(), new Date(2012, 0, 1).getTime());
            assert.equal(chart.x().domain()[1].getTime(), new Date(2012, 11, 31).getTime());
        },
        'y can be set': function(chart) {
            assert.isTrue(chart.y() != undefined);
        },
        'y range round is auto calculated based on height': function(chart) {
            assert.equal(chart.y().range()[0], 160);
            assert.equal(chart.y().range()[1], 0);
        },
        'y domain is auto calculated based on height': function(chart) {
            assert.equal(chart.y().domain()[0], 0);
            assert.equal(chart.y().domain()[1], 3);
        },
        'root g should be created': function(chart) {
            assert.isFalse(chart.select("svg g").empty());
        },
        'axis x should be placed at the bottom': function(chart) {
            assert.equal(chart.select("svg g g.x").attr("transform"), "translate(30,170)");
        },
        'axis y should be placed on the left': function(chart) {
            assert.equal(chart.select("svg g g.y").attr("transform"), "translate(30,10)");
        },
        'x units should be set': function(chart) {
            assert.equal(chart.xUnits(), d3.time.days);
        },
        'x axis should be created': function(chart) {
            assert.isNotNull(chart.xAxis());
        },
        'y axis should be created': function(chart) {
            assert.isNotNull(chart.yAxis());
        },
        'brush should be created': function(chart) {
            assert.isNotNull(chart.select("g.brush"));
        },
        'round should be off by default': function(chart) {
            assert.isTrue(chart.round() == null);
        },
        'round can be changed': function(chart) {
            chart.round(d3.time.day.round);
            assert.isNotNull(chart.round());
        },
        'current filter should be set correctly': function(chart) {
            assert.equal(chart.filter()[0].getTime(), new Date(2012, 5, 1).getTime());
            assert.equal(chart.filter()[1].getTime(), new Date(2012, 5, 30).getTime());
        },
        'filter printer should be set': function(chart) {
            assert.isNotNull(chart.filterPrinter());
        },
        'circle.dot should not be generated by default': function(chart){
            assert.equal(chart.selectAll("circle.dot")[0].length, 0);
        },

        'with brush': {
            'be positioned with offset (left margin)': function(chart) {
                assert.equal(chart.select("g.brush").attr("transform"), "translate(" + chart.margins().left + ",10)");
            },
            'brush fancy resize handle should be created': function(chart) {
                chart.select("g.brush").selectAll(".resize path").each(function(d, i) {
                    if (i == 0)
                        assert.equal(d3.select(this).attr("d"), "M0.5,53.333333333333336A6,6 0 0 1 6.5,59.333333333333336V100.66666666666667A6,6 0 0 1 0.5,106.66666666666667ZM2.5,61.333333333333336V98.66666666666667M4.5,61.333333333333336V98.66666666666667");
                    else
                        assert.equal(d3.select(this).attr("d"), "M-0.5,53.333333333333336A6,6 0 0 0 -6.5,59.333333333333336V100.66666666666667A6,6 0 0 0 -0.5,106.66666666666667ZM-2.5,61.333333333333336V98.66666666666667M-4.5,61.333333333333336V98.66666666666667");
                });
            },
            'background should be stretched': function(chart) {
                assert.equal(chart.select("g.brush rect.background").attr("width"), 1020);
            },
            'background height should be set to chart height': function(chart) {
                assert.equal(chart.select("g.brush rect.background").attr("height"), 160);
            },
            'extent height should be set to chart height': function(chart) {
                assert.equal(chart.select("g.brush rect.extent").attr("height"), 160);
            },
            'extent width should be set based on filter set': function(chart) {
                assert.equal(chart.select("g.brush rect.extent").attr("width"), 81);
            },
            'path rendering': function(chart) {
                assert.equal(chart.select("path.line").attr("d"), "M435.08904109589037,117L474.21232876712327,117L479.8013698630137,10L538.486301369863,117L563.6369863013698,63L650.2671232876712,63");
            },
            'area path should not be there':function(chart) {
                assert.equal(chart.selectAll("path.area")[0].length, 0)
            },
            'selected bars should be push to foreground': function(chart) {
                chart.selectAll("g rect.bar").each(function(d, i) {
                    if (i == 1)
                        assert.equal(d3.select(this).attr("class"), "bar");
                });
            },
            'x value should have default impl': function(chart) {
                assert.isNotNull(chart.keyAccessor());
            },
            'y value should have default impl': function(chart) {
                assert.isNotNull(chart.valueAccessor());
            }
        },
        teardown: function(topic) {
            resetAllFilters();
            resetBody();
        }
    }
});

suite.addBatch({'elastic axis':{
    topic: function() {
        countryDimension.filter("CA");
        var chart = buildChart("elastic-y-line-chart");
        chart.yAxisPadding(10)
            .xAxisPadding(60)
            .elasticX(true)
            .renderArea(true)
            .redraw();
        return chart;
    },
    'y axis should have shrunk triggered by filter': function(chart) {
        assert.equal(chart.y().domain()[1], 1);
    },
    'x domain should be set': function(chart) {
        assert.equal(chart.x().domain()[0].getTime(), new Date("Mon, 26 Mar 2012 04:00:00 GMT").getTime());
        assert.equal(chart.x().domain()[1].getTime(), new Date("Tue, 09 Oct 2012 04:00:00 GMT").getTime());
    },
    'correctly draw line': function(chart) {
        assert.equal(jQuery("#elastic-y-line-chart g.stack0 path.line").attr("d"), "M340.65989847715736,170L413.14720812182736,170L423.502538071066,10L532.233502538071,170L578.8324873096446,10L739.3401015228426,170");
    },
    'correctly draw area': function(chart) {
        assert.equal(jQuery("#elastic-y-line-chart g.stack0 path.area").attr("d"), "M340.65989847715736,170L413.14720812182736,170L423.502538071066,10L532.233502538071,170L578.8324873096446,10L739.3401015228426,170L739.3401015228426,169L578.8324873096446,169L532.233502538071,169L423.502538071066,169L413.14720812182736,169L340.65989847715736,169Z");
    },
    teardown: function(topic) {
        resetAllFilters();
        resetBody();
    }
}});

suite.addBatch({'area chart':{
    topic:function() {
        var chart = buildChart("area-chart");
        chart.renderArea(true);
        chart.render();
        return chart;
    },
    'area path should be generated':function(chart) {
        assert.equal(chart.selectAll("path.area")[0].length, 1)
    },
    'area path should be appended only once':function(chart) {
        chart.redraw();
        assert.equal(chart.selectAll("path.area")[0].length, 1)
    },
    'correctly draw line': function(chart) {
        assert.equal(jQuery("#area-chart g.stack0 path.line").attr("d"), "M435.08904109589037,117L474.21232876712327,117L479.8013698630137,10L538.486301369863,117L563.6369863013698,63L650.2671232876712,63");
    },
    'correctly draw area': function(chart) {
        assert.equal(jQuery("#area-chart g.stack0 path.area").attr("d"), "M435.08904109589037,117L474.21232876712327,117L479.8013698630137,10L538.486301369863,117L563.6369863013698,63L650.2671232876712,63L650.2671232876712,169L563.6369863013698,169L538.486301369863,169L479.8013698630137,169L474.21232876712327,169L435.08904109589037,169Z");
    },
    teardown: function(topic) {
        resetAllFilters();
        resetBody();
    }
}
});

suite.addBatch({'stacked area chart':{
    topic: function() {
        var chart = buildChart("stacked-area-chart", [new Date(2012, 4, 20), new Date(2012, 7, 15)]);
        chart.dimension(dateDimension)
            .group(dateIdSumGroup)
            .stack(dateValueSumGroup)
            .stack(dateValueSumGroup)
            .elasticY(true)
            .renderArea(true);
        chart.render();
        return chart;
    },
    'right number of lines should be rendered': function(chart) {
        assert.equal(jQuery("#stacked-area-chart path.line").size(), 3);
    },
    'correctly draw stack 0 line': function(chart) {
        assert.equal(jQuery("#stacked-area-chart g.stack0 path.line").attr("d"), "M88.62068965517241,169L252.75862068965515,167L276.2068965517241,160L522.4137931034483,168L627.9310344827586,161L991.3793103448276,163");
    },
    'correctly draw stack 1 line': function(chart) {
        assert.equal(jQuery("#stacked-area-chart g.stack1 path.line").attr("d"), "M88.62068965517241,144L252.75862068965515,129L276.2068965517241,85L522.4137931034483,143L627.9310344827586,130L991.3793103448276,119");
    },
    'correctly draw stack 2 line': function(chart) {
        assert.equal(jQuery("#stacked-area-chart g.stack2 path.line").attr("d"), "M88.62068965517241,119L252.75862068965515,91L276.2068965517241,10L522.4137931034483,118L627.9310344827586,99L991.3793103448276,75");
    },
    'right number of areas should be rendered': function(chart) {
        assert.equal(jQuery("#stacked-area-chart path.area").size(), 3);
    },
    'correctly draw stack 0 area': function(chart) {
        assert.equal(jQuery("#stacked-area-chart g.stack0 path.area").attr("d"), "M88.62068965517241,169L252.75862068965515,167L276.2068965517241,160L522.4137931034483,168L627.9310344827586,161L991.3793103448276,163L991.3793103448276,169L627.9310344827586,169L522.4137931034483,169L276.2068965517241,169L252.75862068965515,169L88.62068965517241,169Z");
    },
    'correctly draw stack 1 area': function(chart) {
        assert.equal(jQuery("#stacked-area-chart g.stack1 path.area").attr("d"), "M88.62068965517241,144L252.75862068965515,129L276.2068965517241,85L522.4137931034483,143L627.9310344827586,130L991.3793103448276,119L991.3793103448276,162L627.9310344827586,160L522.4137931034483,167L276.2068965517241,159L252.75862068965515,166L88.62068965517241,168Z");
    },
    'correctly draw stack 2 area': function(chart) {
        assert.equal(jQuery("#stacked-area-chart g.stack2 path.area").attr("d"), "M88.62068965517241,119L252.75862068965515,91L276.2068965517241,10L522.4137931034483,118L627.9310344827586,99L991.3793103448276,75L991.3793103448276,118L627.9310344827586,129L522.4137931034483,142L276.2068965517241,84L252.75862068965515,128L88.62068965517241,143Z");
    }
}});

suite.addBatch({
    'renderlet':{
        topic:function(){
            var chart = buildChart("chart-renderlet");
            chart.renderlet(function(chart){chart.selectAll("path").attr("fill", "red");});
            return chart;
        },
        'custom renderlet should be invoked with render': function(chart){
            chart.render();
            assert.equal(chart.selectAll("path").attr("fill"), "red");
        },
        'custom renderlet should be invoked with redraw': function(chart){
            chart.redraw();
            assert.equal(chart.selectAll("path").attr("fill"), "red");
        },
        teardown: function(topic) {
            resetAllFilters();
            resetBody();
        }
    }
});

suite.addBatch({
    'horizontal grid lines drawing':{
        topic:function(){
            var chart = buildChart("chart-grid-line");
            chart.renderHorizontalGridLines(true);
            chart.render();
            return chart;
        },
        'horizontal grid line g should be generated': function(chart){
            assert.equal(chart.selectAll("g.horizontal")[0].length, 1);
        },
        'horizontal grid lines should be generated': function(chart){
            assert.equal(jQuery("#chart-grid-line g.horizontal line").size(), 7);
        },
        'horizontal grid line x,y should be generated correctly': function(chart){
            assert.equal(jQuery("#chart-grid-line g.horizontal line")[0].getAttribute("x1"), "1");
            assert.equal(jQuery("#chart-grid-line g.horizontal line")[0].getAttribute("y1"), "160");
            assert.equal(jQuery("#chart-grid-line g.horizontal line")[0].getAttribute("x2"), "1020");
            assert.equal(jQuery("#chart-grid-line g.horizontal line")[0].getAttribute("y2"), "160");

            assert.equal(jQuery("#chart-grid-line g.horizontal line")[3].getAttribute("x1"), "1");
            assert.equal(jQuery("#chart-grid-line g.horizontal line")[3].getAttribute("y1"), "80");
            assert.equal(jQuery("#chart-grid-line g.horizontal line")[3].getAttribute("x2"), "1020");
            assert.equal(jQuery("#chart-grid-line g.horizontal line")[3].getAttribute("y2"), "80");
        },
        teardown: function(topic) {
            resetAllFilters();
            resetBody();
        }
    }
});

suite.addBatch({
    'horizontal grid lines drawing w/ custom ticks':{
        topic:function(){
            var chart = buildChart("chart-grid-line-custom-ticks");
            chart.yAxis().tickValues([0, 1, 2]);
            chart.renderHorizontalGridLines(true);
            chart.render();
            return chart;
        },
        'horizontal grid line g should be generated': function(chart){
            assert.equal(chart.selectAll("g.horizontal")[0].length, 1);
        },
        'horizontal grid lines should be generated': function(chart){
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line").size(), 3);
        },
        'horizontal grid line x,y should be generated correctly': function(chart){
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[0].getAttribute("x1"), "1");
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[0].getAttribute("y1"), "160");
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[0].getAttribute("x2"), "1020");
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[0].getAttribute("y2"), "160");

            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[1].getAttribute("x1"), "1");
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[1].getAttribute("y1"), "107");
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[1].getAttribute("x2"), "1020");
            assert.equal(jQuery("#chart-grid-line-custom-ticks g.horizontal line")[1].getAttribute("y2"), "107");
        },
        teardown: function(topic) {
            resetAllFilters();
            resetBody();
        }
    }
});

suite.addBatch({
    'vertical grid lines drawing':{
        topic:function(){
            var chart = buildChart("chart-grid-line-vertical");
            chart.renderVerticalGridLines(true);
            chart.render();
            return chart;
        },
        'vertical grid line g should be generated': function(chart){
            assert.equal(chart.selectAll("g.vertical")[0].length, 1);
        },
        'vertical grid lines should be generated': function(chart){
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line").size(), 12);
        },
        'vertical grid line x,y should be generated correctly': function(chart){
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[1].getAttribute("x1"), "86.63013698630137");
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[1].getAttribute("y1"), "160");
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[1].getAttribute("x2"), "86.63013698630137");
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[1].getAttribute("y2"), "");

            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[3].getAttribute("x1"), "254.18493150684932");
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[3].getAttribute("y1"), "160");
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[3].getAttribute("x2"), "254.18493150684932");
            assert.equal(jQuery("#chart-grid-line-vertical g.vertical line")[3].getAttribute("y2"), "");
        },
        teardown: function(topic) {
            resetAllFilters();
            resetBody();
        }
    }
});


suite.addBatch({
    'tooltip and data point highlight':{
        topic:function(){
            var chart = buildChart("chart-tooltip");
            chart.brushOn(false)
                .title(function(d){return d.value;})
                .dotRadius(10)
                .render();
            return chart;
        },
        'g.brush should not be generated': function(chart){
            assert.equal(chart.selectAll("g.brush")[0].length, 0);
        },
        'circle.dot should be generated per data point': function(chart){
            assert.equal(chart.selectAll("circle.dot")[0].length, 6);
        },
        'circle.dot radius should be configurable': function(chart){
            chart.selectAll("circle.dot").each(function(){
                assert.equal(d3.select(this).attr("r"), 10);
            });
        },
        'circle.dot should be almost invisible by default': function(chart){
            chart.selectAll("circle.dot").each(function(){
                assert.equal(d3.select(this).style("fill-opacity"), 1e-6);
                assert.equal(d3.select(this).style("stroke-opacity"), 1e-6);
            });
        },
        'circle.dot title should be generated per data point': function(chart){
            chart.selectAll("circle.dot").each(function(d){
                assert.equal(d3.select(this).select("title").text(), d.value);
            });
        },
        'hidden ref lines should be generated': function(chart){
            assert.equal(chart.select("path.xRef").style("display"), "none");
            assert.equal(chart.select("path.yRef").style("display"), "none");
        },
        'ref lines should be generated as dash path': function(chart){
            assert.equal(chart.select("path.xRef").attr("stroke-dasharray"), "5,5");
            assert.equal(chart.select("path.yRef").attr("stroke-dasharray"), "5,5");
        },
        teardown: function(topic) {
            resetAllFilters();
            resetBody();
        }
    }
});

suite.export(module);
