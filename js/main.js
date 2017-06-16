var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([height, 0], 0.1, 1);

var y = d3.scale.linear()
    .range([0, width]);


var xAxis = d3.svg.axis()
    .scale(x)
    .orient("left");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("bottom")
    .tickFormat(formatPercent);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data.tsv", function(error, data) {

  data.forEach(function(d) {
    d.frequency = +d.frequency;
  });

  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svg.append("g")
      .attr("class", "x axis")      
      .call(xAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");


  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis) 
      .attr("transform", "translate(0," + height + ")");


  svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("width", function(d) { return y(d.frequency); })
      .attr("y", function(d) { return   x(d.letter ); })
      .attr("height",  x.rangeBand());

   d3.select("input").on("change", change);
  

  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
   var x0 = x.domain(data.sort(this.checked
        ? function(a, b) { return b.frequency - a.frequency; }
        : function(a, b) { return d3.ascending(a.letter, b.letter); })
        .map(function(d) { return d.letter; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.letter) - x0(b.letter); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("y", function(d) { return x0(d.letter); });

    transition.select(".x.axis")
      .call(xAxis)
      .selectAll("g")
      .delay(delay);
  }
});

function changeColor(event) {
    var bars = document.getElementsByClassName("bar")
    for(var i = 0; i < bars.length; i++)
        bars[i].style.fill=  "rgb(" + window.pageYOffset/7 + ","+  (255 - window.pageYOffset/7) +  ", 0 )"; 
}

window.addEventListener("scroll", changeColor);

