require("./lib/social"); //Do not delete
require("component-leaflet-map");
var d3 = require('d3');

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var sf_lat = 37.85;
  var sf_long = -122.43;
  var zoom_deg = 8;
} else {
  var sf_lat = 38.05;
  var sf_long = -121.8;
  var zoom_deg = 9;
}

// tooltip information
function tooltip_function (d) {
  var html_str = "<div class='name'>"+d.Brewery+"</div>"
  return html_str;
}

// put info for highlighted brewery at the top
function fill_info(data){
  var strBrewery = data.Brewery;
  var strCity = data.City;
  // var html = "<div class='brewery-group'>FILL IN MY INFO HERE!!!</div>"
  var html = "<div class='brewery-group-top active'><div class='name'>"+data.Brewery+"</div><div class='address'><a href='"+data.Website+"' target='_blank'>"+data.Address+", "+data.City+"</a></div><div class='blurb'>"+data.Blurb+"</div></div>";
  return html;
}

// function that zooms and pans the data when the map zooms and pans
function update() {
  console.log("we are updating");
	feature.attr("transform",
	function(d) {
    // console.log(d);
    // console.log(map.latLngToLayerPoint(d.LatLng));
		return "translate("+
			map.latLngToLayerPoint(d.LatLng).x +","+
			map.latLngToLayerPoint(d.LatLng).y +")";
		}
	)
}

// function update() {
//   feature.attr("cx",function(d) { return map.latLngToLayerPoint(d.LatLng).x})
//   feature.attr("cy",function(d) { return map.latLngToLayerPoint(d.LatLng).y})
//   // feature.attr("r",function(d) { return 1/70*Math.pow(2,map.getZoom())})
//   console.log(map.getZoom());
// }

// //get access to Leaflet and the map
var element = document.querySelector("leaflet-map");
var L = element.leaflet;
var map = element.map;
// map.options.minZoom = 7;
// map.options.maxZoom = 16;
// map.options.zoomControl = true;
// map.zoomControl.setPosition('topright');

// map.addLayer( new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar',minZoom: "7",maxZoom: "16"}).addTo(map));

// dragging and zooming controls
// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
// map.keyboard.disable();

// setting the center point
map.setView(new L.LatLng(sf_lat,sf_long), zoom_deg);

// initializing the svg layer
L.svg().addTo(map)

console.log(map);

// creating Lat/Lon objects that d3 is expecting
beerData.forEach(function(d,idx) {
  if (d.Latitude){
		d.LatLng = new L.LatLng(d.Latitude,
								d.Longitude);
  } else {
    // this is a hack for entries in the spreadsheet that are missing data and this should be deleted before publication
    d.LatLng = new L.LatLng(37.75, -122.43);
  }
});

// creating svg layer for data
var svgMap = d3.select("#beer-map").select("svg"),
g = svgMap.append("g");

// adding
var feature = g.selectAll("circle")
  .data(beerData)
  .enter().append("circle")
  .attr("id",function(d) {
    return d.Brewery.toLowerCase().replace(/ /g,'');
  })
  .attr("class",function(d) {
    return "dot "+d.Brewery.toLowerCase().replace(/ /g,'');
  })
  .style("opacity", function(d) {
    return 0.8;
  })
  .style("fill", function(d) {
    return "#FFCC32";
  })
  .style("stroke","#696969")
  .attr("r", function(d) {
    if (screen.width <= 480) {
      return 4;
    } else {
      return 7;
    }
  })
  .on('mouseover', function(d) {
    var html_str = tooltip_function(d);
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
      return tooltip.style("visibility", "hidden");
  });


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

// show tooltip
var tooltip = d3.select("div.tooltip-beermap");

// searchbar code
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

// event listener for each brewery that highlights the brewery on the map and calls the function to fill in the info at the top
var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".clickme").forEach(function(group,index) {
  group.addEventListener("click", function(e) {
    $('html, body').animate({
        scrollTop: $("#scroll-to-top").offset().top
    }, 600);
    document.querySelector("#chosen-brewery").innerHTML = fill_info(beerData[index]);

    // highlight the appropriate dot
    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll(".dot").style("opacity", "0.2");
    d3.select("#"+e.target.classList[1]).style("fill","red");
    d3.select("#"+e.target.classList[1]).style("opacity","1.0");

    // zoom and pan the map to the appropriate dot
    map.setView(beerData[index].LatLng,9,{animate:true});
    // update();
  });
});

// event listener for each dot
qsa(".dot").forEach(function(group,index) {
  group.addEventListener("click", function(e) {
    console.log(e.target.classList);
    $('html, body').animate({
        scrollTop: $("#scroll-to-top").offset().top
    }, 600);
    document.querySelector("#chosen-brewery").innerHTML = fill_info(beerData[index]);

    // highlight the appropriate dot
    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll(".dot").style("opacity", "0.2");
    d3.select("#"+e.target.classList[1]).style("fill","red");
    d3.select("#"+e.target.classList[1]).style("opacity","1.0");

    // zoom and pan the map to the appropriate dot
    map.setView(beerData[index].LatLng,9,{animate:true});
    // update();
  });
});

// event listener for re-setting the map
document.querySelector("#reset-button").addEventListener("click",function(e) {
  console.log(e);
  $('html, body').animate({
      scrollTop: $("#scroll-to-top").offset().top
  }, 600);
  document.querySelector("#chosen-brewery").innerHTML = "";
  d3.selectAll(".dot").style("fill", "#FFCC32");
  d3.selectAll(".dot").style("opacity", "0.8");
  map.setView(new L.LatLng(sf_lat,sf_long), zoom_deg);
});
