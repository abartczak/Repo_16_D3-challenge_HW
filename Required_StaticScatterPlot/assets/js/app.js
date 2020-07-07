// Define chart here by following in class activities with Hair Metal data
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
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

// Import Data
d3.csv("./assets/data/data.csv").then(function(censusHealthData) {

    // Parse Data & Extract as numbers
    censusHealthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([ d3.min(censusHealthData, d => d.poverty) * 0.8, d3.max(censusHealthData, d => d.poverty) * 1.1 ])
      .range([0, width]);
    var yLinearScale = d3.scaleLinear()
      .domain([ d3.min(censusHealthData, d => d.healthcare) * 0.8, d3.max(censusHealthData, d => d.healthcare) * 1.1 ])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    //  Initialize & Activate tool tip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .html(function(d) {
        return (`${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
      });
    chartGroup.call(toolTip);

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusHealthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "12")
      .attr("class","stateCircle")
      .attr("opacity", ".9")
      .on('mouseover', toolTip.show)
      .on('mouseout', toolTip.hide);

    // Add text to circles
    var circleText = chartGroup.selectAll()
      .data(censusHealthData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("text-anchor", "middle")
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare))
      .attr("dy", "0.3em")
      .attr("class","stateText")
      .attr("font-size","10")
      .on('mouseover', toolTip.show)
      .on('mouseout', toolTip.hide);

    // Verify the aquired Data
    console.log(censusHealthData);

    // Append labels to the chart
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
    }).catch(function(error) {
      console.log(error);
});
