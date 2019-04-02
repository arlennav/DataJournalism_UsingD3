var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on x-axis label
function getXScale(censusData, chosenXAxis) {
  // create scales
  if (chosenXAxis === "income") {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) - 5000, d3.max(censusData, d => d[chosenXAxis]) + 5000])
      .range([0, width]);
  }
  else {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) - 2, d3.max(censusData, d => d[chosenXAxis]) + 5])
      .range([0, width]);
  }
  
  return xLinearScale;
}

// function used for updating y-scale var upon click on y-axis label
function getYScale(censusData, chosenYAxis) {
  // create scales
  myYdomain = d3.extent(censusData, d => d[chosenYAxis]);

  var yLinearScale = d3.scaleLinear()
    //.domain([0, d3.max(censusData, d => d[chosenYAxis])])
    .domain([myYdomain[0] - 2, myYdomain[1] + 2])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, textsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  textsGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]) - 7)
    .attr("dy", d => newYScale(d[chosenYAxis]) + 4);

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity:";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes:";
  }
  else {
    var ylabel = "Healthcare:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      if (chosenXAxis === "age") {
        var xlabel = `Age: ${d[chosenXAxis]}<br>`;
      }
      else if (chosenXAxis === "income") {
        var xlabel = `Income: $${d[chosenXAxis]}<br>`;
      }
      else {
        var xlabel = `Poverty: ${d[chosenXAxis]}%<br>`;
      }

      return `${d.state}<br>${xlabel} ${ylabel} ${d[chosenYAxis]}%`
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(censusData => {

  // parse data
  censusData.forEach(data => {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    data.age = +data.age;
  });

  // Create x scale function
  var xLinearScale = getXScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = getYScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.append("g").selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // append text with state abbr
  var textsGroup = chartGroup.append("g").selectAll("text")
    .data(censusData)
    .enter()
    .append('text')
    .attr('dx', d => xLinearScale(d[chosenXAxis]) - 7)
    .attr('dy', d => yLinearScale(d[chosenYAxis]) + 4)
    .text(d => d.abbr)
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "#ffffff")

  // Create group for 3 x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  ////////////////////////////////
  //Create x-axis labels
  ////////////////////////////////
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty %");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for 3 y-axis labels
  var labelsYGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  ////////////////////////////////
  //Create y-axis labels
  ////////////////////////////////
  var obesityLabel = labelsYGroup.append("text")
    .attr("y", 25 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obess (%)");

  var smokesLabel = labelsYGroup.append("text")
    .attr("y", 35 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = labelsYGroup.append("text")
    .attr("y", 55 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  var textsGroup = updateToolTip(chosenXAxis, chosenYAxis, textsGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text").on("click", function () {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;
      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = getXScale(censusData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      textsGroup = updateToolTip(chosenXAxis, chosenYAxis, textsGroup);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "income") {
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
      } else {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });
  // y axis labels event listener
  labelsYGroup.selectAll("text").on("click", function () {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = getYScale(censusData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circlesGroup = renderCircles(circlesGroup, textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      textsGroup = updateToolTip(chosenXAxis, chosenYAxis, textsGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      } else {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });
});
