require("./lib/social"); //Do not delete

require("component-leaflet-map");
var d3 = require('d3');

function tooltip_function (d) {
  var html_str = "<div class='name'><span class='bold'>Brewery: </span>"+d.Brewery+"</div><div class='address'><span class='bold'>Address: </span>"+d.Address+", "+d.City+"</div><div class='desc'>"+d.Blurb+"</div>"
  return html_str;
}

//get access to Leaflet and the map
var element = document.querySelector("leaflet-map");
var L = element.leaflet;
var map = element.map;

// Disable drag and zoom handlers.
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.keyboard.disable();

if (screen.width <= 480) {
  map.setView(new L.LatLng(37.75, -122.43), 10);
} else {
  map.setView(new L.LatLng(38.05, -121.8), 8);
}
map.scrollWheelZoom.disable();

/* Initialize the SVG layer */
L.svg().addTo(map)
// map._initPathRoot();

/* We simply pick up the SVG from the map object */

/* Add a LatLng object to each item in the dataset */
beerData.forEach(function(d,idx) {
  if (d.Latitude){
		d.LatLng = new L.LatLng(d.Latitude,
								d.Longitude);
  } else {
    d.LatLng = new L.LatLng(37.75, -122.43);
  }
});

// var srosDataShort = srosMapData;

var svgMap = d3.select("#beer-map").select("svg"),
g = svgMap.append("g");

var feature = g.selectAll("dot")
  .data(beerData)
  .enter().append("circle")
  // .attr("class","dot")
  // .style("stroke", "black")
  .style("opacity", function(d) {
    return 0.6;
  })
  .style("fill", function(d) {
    return "#FFCC32";//"#6C85A5"
    // return "#C4304C"//"#EB5773"//'#E59FA6'//"#EB5773"//"#D13D59"
  })
  .attr("r", function(d) {
    if (screen.width <= 480) {
      return 2;
    } else {
      return 7;
    }
  })
  .on('mouseover', function(d) {
    var html_str = tooltip_function(d);
    // var html_str = "this is a string"
    tooltip.html(html_str);
    tooltip.style("visibility", "visible");
  })
  .on("mousemove", function() {
    if (screen.width <= 480) {
      return tooltip
        .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
        .style("left",10+"px");
    } else {
      return tooltip
        .style("top", (d3.event.pageY+16)+"px")
        .style("left",(d3.event.pageX-50)+"px");
    }
  })
  .on("mouseout", function(){
    // if (screen.width <= 480) {
    //   return federal_tooltip.transition().delay(20).style("visibility", "hidden");
    // } else {
      return tooltip.style("visibility", "hidden");
    // }
  });

if (screen.width <= 480) {

  var node = svgMap.selectAll(".circle")
      .data(beerData)
      .enter().append("g")
      .attr("class","node");

  node.append("text")
      .style("fill","black")
      .style("font-family","AntennaExtraLight")
      .style("font-size","14px")
      .style("font-style","italic")
      .style("visibility",function(d) {
        // if (d.NAME == "Crosby Hotel") {
        //   return "visible"
        // } else {
          return "hidden"
        // }
      })
      .attr("transform",
      function(d) {
        return "translate("+
          (map.latLngToLayerPoint(d.LatLng).x+10) +","+
          map.latLngToLayerPoint(d.LatLng).y +")";
        }
      )
      .text(function(d) {
        return d.NAME
      });
}

map.on("viewreset", update);
update();

function update() {
	feature.attr("transform",
	function(d) {
		return "translate("+
			map.latLngToLayerPoint(d.LatLng).x +","+
			map.latLngToLayerPoint(d.LatLng).y +")";
		}
	)
}

// show tooltip
var tooltip = d3.select("div.tooltip-beermap");

console.log(tooltip);
