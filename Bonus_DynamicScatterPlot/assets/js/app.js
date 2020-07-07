// Define chart here by following in class activities with Hair Metal data
var svgWidth = 960;
var svgHeight = 620;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//
// Define some supporting fuctions allowing transitions between axies
//

// Choose Initial chart setup
var selXValue = "poverty";
var selYValue = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(censusHealthData, selXValue) {
  var xLinearScale = d3.scaleLinear()
    .domain([ d3.min(censusHealthData, d => d[selXValue]) * 0.8, d3.max(censusHealthData, d => d[selXValue]) * 1.2 ])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating x-scale var upon click on axis label
function yScale(censusHealthData, selYValue) {
  var yLinearScale = d3.scaleLinear()
    .domain([ d3.min(censusHealthData, d => d[selYValue]) * 0.8, d3.max(censusHealthData, d => d[selYValue]) * 1.1 ])
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
function renderYAxes(newYScale, YAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  YAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, selXValue, newYScale, selYValue) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[selXValue]))
    .attr("cy", d => newYScale(d[selYValue]));
  return circlesGroup;
}

//circleText
function renderText(circleText, newXScale, selXValue, newYScale, selYValue) {
  circleText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[selXValue]))
    .attr("y", d => newYScale(d[selYValue]));;
  return circleText;
}

// Update X & Y lables dynamically
function setLabel(value) {
  var label;
  switch (value) {
    case 'poverty':
      label = "Poverty %:";
    case 'age':
      label = "Age:";
    case 'income':
      label = "Household Income:";
    case 'obesity':
      label = "Obese:";
    case 'smokes':
      label = "Smokes:";
    case 'healthcare':
      label = "Lacks Healthcare:";
    default:
      console.log(`Sorry, the provided value of ${value} in not a valid data point.`);
  }
  return label;
}

// Update circles group with new tooltip with new X & Y values
function updateToolTip(selXValue,selYValue, circlesGroup) {
  console.log("update tool tip", selXValue);

  // Update X & Y lables depending on their corresponding selXValue & selXValue values
  var xlabel = setLabel(selXValue);
  var ylabel = setLabel(selYValue);

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
          return (`${d.state}<br>${xlabel} ${d[selXValue]}<br>${ylabel} ${d[selYValue]}`); //============add chosen
    });

  // Call tooltip methon, show data on mouseover event, hide data on mouseout event
  circlesGroup.call(toolTip);
  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data,this);
  })
  .on("mouseout", function (data, index) {
    toolTip.hide(data,this);
  });

  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv").then(function (censusHealthData) {

  // Step 1: Parse Data/Cast as numbers
  // ==============================
  censusHealthData.forEach(function (data) {   // Everything in csv comes in as string
    data.poverty = +data.poverty;  // parse as numbers
    data.obesity = +data.obesity;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusHealthData, selXValue);


  var yLinearScale = yScale(censusHealthData, selYValue);


  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);


  // Step 4: Append Axes to the chart
  // ==============================
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);

  // Create Circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusHealthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[selXValue]))
    .attr("cy", d => yLinearScale(d[selYValue]))
    .attr("r", "12")
    .attr("class", "stateCircle") //circle color styling on d3Style.css, class .stateCircle
    .attr("opacity", ".9");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // Define X axis label groups
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty %");
  var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 45)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");
  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");


  // Define Y axis label groups
  var obesityLabel = labelsGroup.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height -60))
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obesity (%)");
  var smokesLabel = labelsGroup.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height -40))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");
  var healthcareLabel = labelsGroup.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height -20))
    .attr("value", "healthcare")
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

    // Add text to circle
    var circleText = chartGroup.selectAll()
      .data(censusHealthData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("text-anchor", "middle")
      .attr("x", d => xLinearScale(d[selXValue]))
      .attr("y", d => yLinearScale(d[selYValue]))
      .attr("dy", "0.3em")
      .attr("class","stateText")
      .attr("font-size","10")

  console.log(censusHealthData);

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(selXValue, selYValue,circlesGroup);

  // X axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");

    if(true) {
      // Handle X axis transition related updates
      if (value == "income" || value=="age" || value=="poverty") {
        console.log(value)

        // Update selXValue with value & pass it to xLinearScale
        selXValue = value;
        xLinearScale = xScale(censusHealthData, selXValue);

        // Update x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // Activate corresponding X values via bold text
        switch (value) {
          case 'income':
            incomeLabel.classed("active", true).classed("inactive", false);
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", false).classed("inactive", true);
          case 'age':
            ageLabel.classed("active", true).classed("inactive", false);
            povertyLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", false).classed("inactive", true);
          case 'poverty':
            povertyLabel.classed("active", true).classed("inactive", false);
            incomeLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", false).classed("inactive", true);
          default:
            console.log(`Sorry, the provided value of ${value} in not a valid.`);
        }
      }
      // Handle Y axis transition related updates
      else if (value == "obesity" || value=="smokes" || value=="healthcare") {
        console.log(value)

        // Update selYValue with value & pass it to yLinearScale
        selYValue = value;
        yLinearScale = yScale(censusHealthData, selYValue);

        // Activate corresponding Y values via bold text
        switch (value) {
          case 'obesity':
            obesityLabel.classed("active", true).classed("inactive", false);
            healthcareLabel.classed("active", false).classed("inactive", true);
            smokesLabel.classed("active", false).classed("inactive", true);
          case 'smokes':
            smokesLabel.classed("active", true).classed("inactive", false);
            healthcareLabel.classed("active", false).classed("inactive", true);
            obesityLabel.classed("active", false).classed("inactive", true);
          case 'healthcare':
            healthcareLabel.classed("active", true).classed("inactive", false);
            obesityLabel.classed("active", false).classed("inactive", true);
            smokesLabel.classed("active", false).classed("inactive", true);
          default:
        }
      }
      else {
        console.log(`Sorry, the provided value of ${value} in not a valid.`);
      }

      // Update circle shapes with new x values as corresponding text
      circlesGroup = renderCircles(circlesGroup, xLinearScale, selXValue, yLinearScale, selYValue);
      circleText = renderText(circleText, xLinearScale, selXValue, yLinearScale, selYValue);

      // Update tooltips with new corresponding data
      circlesGroup = updateToolTip(selXValue, selYValue, circlesGroup);
    }
  });
}).catch(function (error) {
  console.log(error);
});
