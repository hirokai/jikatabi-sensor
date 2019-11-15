var socket = io('http://localhost');

var valueline = d3.line().x(
    (d) => { return x(d.time); }
    ).y((d) => { return y(d.values[0]); });


var lineArr = {'DN0519AV': []};
var MAX_LENGTH = 1000;
var duration = 100;
var chart = realTimeLineChart();

function randomNumberBounds(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function seedData() {
  var now = new Date();
  for (var i = 0; i < MAX_LENGTH; ++i) {
    lineArr['DN0519AV'].push({
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

const chart_id = {'DN0519AV': 'chart'}

const onData = (d) => {
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
  lineArr[d.device].push(lineData);

  if (lineArr[d.device].length > 1000) {
    lineArr[d.device].shift();
  }

  d3.select("#" + chart_id[d.device]).datum(lineArr[d.device]).call(chart);
};

const feedFakeData = () => {
  const offset = [0,100,200,300,400,500];
  const time = new Date().getTime();
  const pressure = _.map(offset,(t0) => {
    const cycleIndex = Math.floor((time-t0)/1000);
    const cyclePhase = Math.PI * 2 * ((time-t0)/1000 - Math.floor((time-t0)/1000));
    if(Math.floor(cycleIndex / 2) * 2 != cycleIndex || cyclePhase > Math.PI){
      return 0;
    }
    return Math.sin(Math.PI * 2 * (time - t0) / 1000) * 100;
  });
  var d = {
    device: 'DN0519AV',
    time: time,
    data: {
      pressure,
      temperature: [23,23]
    }
  };
  onData(d);
};

window.setInterval(feedFakeData,10);

socket.on('data', onData);

function resize() {
  _.map(chart_id,(id) => {
    if (d3.select("#"+id+" svg").empty()) {
      return;
    }
    chart.width(+d3.select("#"+id).style("width").replace(/(px)/g, ""));
    d3.select("#"+id).call(chart);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  seedData();
  d3.select("#chart").datum(lineArr['DN0519AV']).call(chart);
  d3.select(window).on('resize', resize);
});