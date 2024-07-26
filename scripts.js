async function chart1() {
    // data
    const data = await d3.csv("https://afifshomali.github.io/data/final.csv");

    // setting up canvas for chart
    const margins = { top: 10, right: 10, bottom: 50, left: 100 };
    const width = 1500 - margins.left - margins.right;
    const height = 1000 - margins.top - margins.bottom;

    const svg = d3.select("#chart1").append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate("+ margins.left +", "+ margins.top +")");
    
    // Adding axes
    const xScale = d3.scaleLog()
        .domain([5000, 2500000])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([-50000, 750000])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", "translate(0, 882)")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Scale for radius values
    const radiusScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.Population)) 
        .range([10, 25]); 

    // Adding axes titles
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .style("text-anchor", "middle")
        .text("Cases");
    

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Mask Uses in 100K");

    // Add invisble tooltip
    const tooltip = d3.select("#chart1")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "grey")
        .style("padding", "5")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "80px")

    // Add colors for regions
    const regioncolors = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Region))])
        .range(d3.schemeCategory10);

    // Add Data & tooltip functionality
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(+d.cases);
        })
        .attr("cy", function(d) {
            return yScale(+d["Mask Use"]);
        })
        .attr("r", function(d) {
            return radiusScale(+d.Population);
        })
        .attr("fill", function(d) {
            return regioncolors(d.Region)
        })
        .on("mouseover", (event, d) => {
            d3.select(event.target).attr("stroke", "black")
            .attr("stroke-width", 2);

            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
              `<p>State: ${d.state}<br>
               <p>Cases: ${d.cases}<br>
               <p>Deaths: ${Math.round(d.deaths)}<br>
               <p>Mask Uses in 100K: ${d["Mask Use"]}<br>
               <p>Population: ${d.Population}</p>`
            )
              .style("left", (event.pageX+10) + "px")
              .style("top", (event.pageY) + "px");
          })
          .on("mouseout", (event) => {
            d3.select(event.target).attr("stroke", "none");
            tooltip.transition().duration(500).style("opacity", 0);
          });
          
    // Add State Codes to each circle
    svg.selectAll(".statecode")
        .data(data)
        .enter()
        .append("text")
        .attr("font-size", 10)
        .attr("fill", "white")
        .attr("x", function(d) {
            return xScale(+d.cases);
        })
        .attr("y", function(d) {
            return yScale(+d["Mask Use"]);
        })
        .style("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(function(d) {
            return d["State Code"];
        });

    //Create legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(20, 20)");
      
    
    const regions = [...new Set(data.map(d => d.Region))];
    const legendItems = legend.selectAll(".legend-item")
        .data(regions)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => "translate(0," + (i * 20) + ")");
      
    legendItems.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 4)
        .attr("fill", regioncolors);
      
    legendItems.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .style("fill", regioncolors)
        .style("font-size", "12px") 
        .attr("alignment-baseline", "middle")
        .text(d => d);
    
    // Add a title for the legend
    legend.append("text")
        .attr("x", 7)
        .attr("y", -8)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Region");

    //Add annotations
    const annotations = [{
        x: xScale(data.find(d => d.state === "California").cases) - 5,
        y: yScale(data.find(d => d.state === "California")["Mask Use"]) + 10,
        note: {
            label: "California had the most cases at the end of 2020 as well as the most jobs lost.",
            bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
            title: "California",
            orientation: "middle",
            align: "left"
        },
        type: d3.annotationCallout,
        dx: -100,
        dy: 50
    },
    {
        x: xScale(data.find(d => d.state === "Idaho").cases)+ 5,
        y: yScale(data.find(d => d.state === "Idaho")["Mask Use"]),
        note: {
            label: "Idaho had the highest job gain rate of 2.79%",
            bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
            title: "Idaho",
            orientation: "middle",
            align: "left"
        },
        type: d3.annotationCallout,
        dx: 30,
        dy: 30
    },
    {
        x: xScale(data.find(d => d.state === "Utah").cases)+ 5,
        y: yScale(data.find(d => d.state === "Utah")["Mask Use"]),
        note: {
            label: "Utah gained jobs during COVID, with about 14 thousand jobs gained.",
            bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
            title: "Utah",
            orientation: "middle",
            align: "left"
        },
        type: d3.annotationCallout,
        dx: 50,
        dy: 10
    }
    ]

    const makeAnnotations = d3.annotation()
        .annotations(annotations);
    
    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);


}


async function chart2() {
    // data
    const data = await d3.csv("https://amche101.github.io/data/final_df.csv");

    // setting up canvas for chart
    const margins = { top: 10, right: 10, bottom: 50, left: 100 };
    const width = 1500 - margins.left - margins.right;
    const height = 1000 - margins.top - margins.bottom;

    const svg = d3.select("#chart2").append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate("+ margins.left +", "+ margins.top +")");
    
    // Adding axes
    const xScale = d3.scaleLinear()
        .domain([10, 220])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([-3500, 13000])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", "translate(0, 720)")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Scale for radius values
    const radiusScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.Population)) 
        .range([10, 25]); 

    // Adding axes titles
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text("Deaths Per 100k");
    

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Jobs Lost Per 100k Employed");

    // Add invisble tooltip
    const tooltip = d3.select("#chart2")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "grey")
        .style("padding", "5")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "80px")

    // Add colors for regions
    const regioncolors = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Region))])
        .range(d3.schemeCategory10);

    // Add Data & tooltip functionality
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale((+d.deaths / +d.Population) * 100000 );
        })
        .attr("cy", function(d) {
            return yScale((+d["Total Job Loss Index"]/ +d.total_li_workers_employed) * 100000);
        })
        .attr("r", function(d) {
            return radiusScale(+d.Population);
        })
        .attr("fill", function(d) {
            return regioncolors(d.Region)
        })
        .on("mouseover", (event, d) => {
            d3.select(event.target).attr("stroke", "black")
            .attr("stroke-width", 2);

            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
              `<p>State: ${d.state}<br>
               <p>Deaths Per 100k: ${Math.round((+d.deaths / +d.Population) * 100000)}<br>
               <p>Jobs Lost Per 100k Employed: ${Math.round((+d["Total Job Loss Index"]/ +d.total_li_workers_employed) * 100000)}<br>
               <p>Total Job Losses: ${d["Total Job Loss Index"]}<br>
               <p>Population: ${d.Population}</p>`
            )
              .style("left", (event.pageX+10) + "px")
              .style("top", (event.pageY) + "px");
          })
          .on("mouseout", (event) => {
            d3.select(event.target).attr("stroke", "none");
            tooltip.transition().duration(500).style("opacity", 0);
          });
          
    // Add State Codes to each circle
    svg.selectAll(".statecode")
        .data(data)
        .enter()
        .append("text")
        .attr("font-size", 10)
        .attr("fill", "white")
        .attr("x", function(d) {
            return xScale((+d.deaths / +d.Population) * 100000);
        })
        .attr("y", function(d) {
            return yScale((+d["Total Job Loss Index"]/ +d.total_li_workers_employed) * 100000);
        })
        .style("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(function(d) {
            return d["State Code"];
        });

    //Create legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(20, 20)");
      
    
    const regions = [...new Set(data.map(d => d.Region))];
    const legendItems = legend.selectAll(".legend-item")
        .data(regions)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => "translate(0," + (i * 20) + ")");
      
    legendItems.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 4)
        .attr("fill", regioncolors);
      
    legendItems.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .style("fill", regioncolors)
        .style("font-size", "12px") 
        .attr("alignment-baseline", "middle")
        .text(d => d);
    
    // Add a title for the legend
    legend.append("text")
        .attr("x", 7)
        .attr("y", -8)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Region");
    
        const annotations = [{
            x: 1140,
            y: 210,
            note: {
                label: "States in the North East region had high job loss rates",
                bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
                title: "North East",
                orientation: "middle",
                align: "left"
            },
            type: d3.annotationCalloutCircle,
            dx: -350,
            dy: -50,
            subject: {
                radius: 200,
            }
        },
        {
            x: 750,
            y: 308,
            note: {
                label: "",
                bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
                orientation: "middle",
                align: "left"
            },
            type: d3.annotationCalloutCircle,
            dx: 40,
            dy: -148,
            subject: {
                radius: 20,
            }
        },
        ]
    
        const makeAnnotations = d3.annotation()
            .annotations(annotations);
        
        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);

    
}

async function chart3() {
    // data
    const data = await d3.csv("https://amche101.github.io/data/final.csv");

    // setting up canvas for chart
    const margins = { top: 10, right: 10, bottom: 50, left: 10 };
    const width = 1500 - margins.left - margins.right;
    const height = 1000 - margins.top - margins.bottom;

    const svg = d3.select("#chart3").append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate("+ margins.left +", "+ margins.top +")");

    const cols = [
        "Agriculture, Forestry, Fishing, and Hunting",
        "Mining, Quarrying, and Oil and Gas Extractions",
        "Utilities",
        "Construction",
        "Manufacturing",
        "Wholesale Trade",
        "Retail Trade",
        "Transportation and Warehousing",
        "Information",
        "Finance and Insurance",
        "Real Estate and Rental and Leasing",
        "Professional, Scientific, and Technical Services",
        "Management of Companies and Enterprises",
        "Administrative and Support and Waste Management and Remediation Services",
        "Educational Services",
        "Health Care and Social Assistance",
        "Arts, Entertainment, and Recreation",
        "Accomodation and Food Services",
        "Other Services",
        "Public Administration"
    ]

    //Create dropdown menu 
    const states = [...new Set(data.map((d) => d.state))];

    d3.select("#select-state").selectAll("option")
        .data(states)
        .enter()
        .append("option")
        .text(function(d) {
            return d;
        })
        .attr("value", function(d) {
            return d;
        });
    //Create Scales
    const xScale = d3.scaleLinear()
        .domain([-5000, 20000])
        .range([0, width]);
    
    const yScale = d3.scaleBand()
        .domain(cols)
        .range([height, 0])

    svg.append("g")
        .attr("transform", "translate(0, "+height+")")
        .call(d3.axisBottom(xScale).ticks(0));

    svg.append("g")
        .attr("transform", "translate(296, 0)")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "10px")
        .attr("x", 10)
        .style("text-anchor", "start");
    
    function updatebars(selected_state) {
        // Re-drawing Bar charts
        svg.selectAll("*").remove();
        
        svg.selectAll(".bar")
            .data(cols)
            .enter()
            .append("rect")
            .attr("x", function(d) {
             return selected_state[d] < 0 ? xScale(selected_state[d]) + 1: xScale(0) + 1;
            })
            .attr("height", yScale.bandwidth())
            .attr("y", function(d) {
                return yScale(d);
            })
            .transition()
            .duration(1000)
            .attr("width", function(d) {
                return Math.abs(xScale(selected_state[d]) - xScale(0));
            })
            .attr("fill", "steelblue");
        
        svg.append("g")
            .attr("transform", "translate(296, 0)")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-size", "10px")
            .attr("x", 10)
            .style("text-anchor", "start");
        
        svg.append("g")
            .attr("transform", "translate(0, "+height+")")
            .call(d3.axisBottom(xScale).ticks(0));
        
        // Add tootips so user can see value of bar
        const tooltip = d3.select("#chart3")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "black")
            .style("padding", "5")
            .style("color", "white")
            .style("width", "200px")
            .style("height", "40px")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center");

        svg.selectAll("rect")
        .on("mouseover", (event, d) => {
            d3.select(event.target).attr("stroke", "black")
            .attr("stroke-width", 2);

            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
              `<p>Jobs Lost in ${d}: ${Math.round(selected_state[d])}</p>`
            )
              .style("left", (event.pageX+10) + "px")
              .style("top", (event.pageY) + "px");
          })
          .on("mouseout", (event) => {
            d3.select(event.target).attr("stroke", "none");
            tooltip.transition().duration(500).style("opacity", 0);
          });

    }

    // Update bar chart when drop down menu changes
    d3.select("#select-state").on("change", function() {
        const state = d3.select(this).property("value");

        const StateData = data.find((d) => d.state === state);

        updatebars(StateData);
    });
    
}