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
  map.setView(new L.LatLng(37.85, -122.43), 8);
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
  .attr("id",function(d) {
    return d.Brewery.toLowerCase().replace(/ /g,'');
    // console.log(d.Brewery.toLowerCase().replace(/ /g,''));
  })
  .attr("class","dot")
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
      return 4;
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


// if (screen.width <= 480) {

  // var node = svgMap.selectAll(".circle")
  //     .data(beerData)
  //     .enter().append("g")
  //     .attr("class","node")
  //     .attr("id",function(d) {
  //       d.Brewery.toLowerCase().replace(/ /g,'');
  //       console.log(d.Brewery.toLowerCase().replace(/ /g,''));
  //     })
  //
  // node.append("text")
  //     .style("fill","black")
  //     .style("font-family","AntennaExtraLight")
  //     .style("font-size","14px")
  //     .style("font-style","italic")
  //     .style("visibility",function(d) {
  //       // if (d.NAME == "Crosby Hotel") {
  //       //   return "visible"
  //       // } else {
  //         return "hidden"
  //       // }
  //     })
  //     .attr("transform",
  //     function(d) {
  //       return "translate("+
  //         (map.latLngToLayerPoint(d.LatLng).x+10) +","+
  //         map.latLngToLayerPoint(d.LatLng).y +")";
  //       }
  //     )
  //     .text(function(d) {
  //       return d.NAME
  //     });
// }

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

//$("input").change(function() {
$("input").bind("input propertychange", function() {
  var filter = $(this).val().toLowerCase().replace(/ /g,'');
  var class_match = 0;

  $(".brewery-group").filter(function() {

    var classes = this.className.split(" ");
    for (var i=0; i< classes.length; i++) {

      var current_class = classes[i].toLowerCase();

      if (classes[i] != "column" && classes[i] != "restaurant") {
        if ( current_class.match(filter)) {
          class_match = class_match + 1;
        }
      }
    }
    if (class_match > 0) {
      $(this).addClass("active");
    } else {
      $(this).removeClass("active");
    }
    class_match = 0;

  });

});

function fill_info(data){
  var strBrewery = data.Brewery;
  var strCity = data.City;
  // var html = "<div class='brewery-group'>FILL IN MY INFO HERE!!!</div>"
  var html = "<div class='brewery-group-top active'><div class='name'>"+data.Brewery+"</div><div class='address'><a href='"+data.Website+"' target='_blank'>"+data.Address+", "+data.City+"</a></div><div class='blurb'>"+data.Blurb+"</div></div>";
  return html;
}

var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".clickme").forEach(function(group,index) {
  group.addEventListener("click", function(e) {
    console.log(e.target.classList);
    $('html, body').animate({
        scrollTop: $("#scroll-to-top").offset().top
    }, 600);
    document.querySelector("#chosen-brewery").innerHTML = fill_info(beerData[index]);
    console.log(beerData[index]);
    var circles = d3.selectAll(".dot").style("fill", "#FFCC32");
    var circles = d3.selectAll(".dot").style("opacity", "0.6");
    var circle_highlight = d3.select("#"+e.target.classList[1]).style("fill","red");
    var circle_highlight = d3.select("#"+e.target.classList[1]).style("opacity","1.0");
  });
});


// var reset_bubbles = function () {
//     var circles = svg.selectAll(".dot").attr("opacity", "0.5");
//     myEl.attr("opacity","1.0");
//   } else {
//     var circles = svg.selectAll(".dot").attr("opacity", "1.0");
//     var circlestext = svg.selectAll(".dottext").attr("opacity", "1.0");
//   }
