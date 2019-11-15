var socket = io('http://localhost');


var valueline = d3.line().x(
    (d) => { return x(d.time); }
    ).y((d) => { return y(d.values[0]); });


var lineArr = [];
var MAX_LENGTH = 100;
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
      x: 0,
      y: 0,
      z: 0,
      v_in: 0
    });
  }
}

socket.on('data', (d) => {
  var lineData = {
    time: d.time,
    x: d.analog[0],
    y: d.analog[1],
    z: d.analog[2],
    v_in: d.v_in,
  };
  lineArr.push(lineData);

  if (lineArr.length > 30) {
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