require("./lib/social"); //Do not delete
// require("component-leaflet-map");
var d3 = require('d3');

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var sf_lat = 37.85;
  var sf_long = -122.43;
  var zoom_deg = 8;
} else {
  var sf_lat = 37.55;
  var sf_long = -122.0;
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
  var html = "<div class='brewery-group-top active'><div class='name'>"+data.Brewery+"</div><div class='address'><a href='"+data.Website+"' target='_blank'>"+data.Address+", "+data.City+"</a></div><div class='blurb'>"+data.Blurb+"</div></div>";
  return html;
}

// function that zooms and pans the data when the map zooms and pans
function update() {
	feature.attr("transform",
	function(d) {
		return "translate("+
			map.latLngToLayerPoint(d.LatLng).x +","+
			map.latLngToLayerPoint(d.LatLng).y +")";
		}
	)
}


// initialize map with center position and zoom levels
var map = L.map("map", {
  minZoom: 7,
  maxZoom: 16,
  zoomControl: false,
  dragging: true,
  touchZoom: true
  // zoomControl: isMobile ? false : true,
  // scrollWheelZoom: false
}).setView([sf_lat,sf_long], zoom_deg);;
// window.map = map;

map.dragging.enable();

// add tiles to the map
var OpenStreetMap = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	maxZoom: 16,
  minZoom: 7,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
OpenStreetMap.addTo(map);

L.control.zoom({
     position:'topright'
}).addTo(map);

// dragging and zooming controls
map.scrollWheelZoom.disable();
// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.keyboard.disable();

// initializing the svg layer
// L.svg().addTo(map)
map._initPathRoot();

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
var svgMap = d3.select("#map").select("svg"),
g = svgMap.append("g");

// adding circles to the map
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
      return 7;
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
        .style("top", 70+"px")
        .style("left",40+"px");
        // .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
        // .style("left",10+"px");
    } else {
      return tooltip
        .style("top", (d3.event.pageY-220)+"px")
        .style("left",(d3.event.pageX-50)+"px");
    }
  })
  .on("mouseout", function(){
      return tooltip.style("visibility", "hidden");
  });

  map.on("viewreset", update);
  update();


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
    d3.selectAll(".dot").style("stroke","black");
    d3.select("#"+e.target.classList[1]).style("fill","red");
    d3.select("#"+e.target.classList[1]).style("opacity","1.0");
    d3.select("#"+e.target.classList[1]).style("stroke","#696969");

    // zoom and pan the map to the appropriate dot
    map.setView(beerData[index].LatLng,map.getZoom(),{animate:true});
    update();
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
    d3.selectAll(".dot").style("stroke","black");
    d3.select("#"+e.target.classList[1]).style("fill","red");
    d3.select("#"+e.target.classList[1]).style("opacity","1.0");
    d3.select("#"+e.target.classList[1]).style("stroke","#696969");

    // zoom and pan the map to the appropriate dot
    map.setView(beerData[index].LatLng,map.getZoom(),{animate:true});
    update();
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
  d3.selectAll(".dot").style("stroke","#696969");
  map.setView(new L.LatLng(sf_lat,sf_long),zoom_deg,{animate:true});
});
