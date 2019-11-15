var socket = io('http://localhost');


var valueline = d3.line().x(
    (d) => { return x(d.time); }
    ).y((d) => { return y(d.values[0]); });


var lineArr = [];
var MAX_LENGTH = 1000;
var duration = 100;
var chart = realTimeLineChart();

function randomNumberBounds(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function seedData() {
  var now = new Date();
  for (var i = 0; i < MAX_LENGTH; ++i) {
    lineArr.push({
      time: new Date(now.getTime() - ((MAX_LENGTH - i) * duration)),
      p1: 0,
      p2: 0,
      p3: 0,
      p4: 0,
      p5: 0,
      p6: 0,
      t1: 0,
      t2: 0
    });
  }
}

socket.on('data', (d) => {
  // console.log(d);
  var lineData = {
    time: d.time,
    p1: d.data.pressure[0] / 5,
    p2: d.data.pressure[1] / 5,
    p3: d.data.pressure[2] / 5,
    p4: d.data.pressure[3] / 5,
    p5: d.data.pressure[4] / 5,
    p6: d.data.pressure[5] / 20,
    t1: d.data.temperature[0],
    t2: d.data.temperature[1]
  };
  lineArr.push(lineData);

  if (lineArr.length > 1000) {
    lineArr.shift();
  }
  d3.select("#chart").datum(lineArr).call(chart);
});

function resize() {
  if (d3.select("#chart svg").empty()) {
    return;
  }
  chart.width(+d3.select("#chart").style("width").replace(/(px)/g, ""));
  d3.select("#chart").call(chart);
}

document.addEventListener("DOMContentLoaded", function() {
  seedData();
  d3.select("#chart").datum(lineArr).call(chart);
  d3.select(window).on('resize', resize);
});