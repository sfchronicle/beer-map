require("./lib/social"); //Do not delete
require("leaflet");
var d3 = require('d3');

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var sf_lat = 37.85;
  var sf_long = -122.43;
  var zoom_deg = 8;
} else {
  var sf_lat = 37.75;
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
  var html = "<div class='brewery-group-top active'><div class='name'>"+data.Brewery+"<a href="+data.Website+" target='_blank'><i class='fa fa-external-link' aria-hidden='true'></i></a></div><div class='address'>"+data.Address+", "+data.City+"</div><div class='blurb'>"+data.Blurb+"</div></div>";
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
  minZoom: 6,
  maxZoom: 15,
  zoomControl: false,
  dragging: true,
  // touchZoom: true
  // zoomControl: isMobile ? false : true,
  // scrollWheelZoom: false
}).setView([sf_lat,sf_long], zoom_deg);;
// window.map = map;

map.dragging.enable();

// add tiles to the map
var mapLayer = L.tileLayer("https://api.mapbox.com/styles/v1/emro/ciyvuvz1700312so6s8f3ip13/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA",{attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'})
mapLayer.addTo(map);

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
		d.LatLng = new L.LatLng(d.Latitude,
								d.Longitude);
});

// creating svg layer for data
var svgMap = d3.select("#map").select("svg"),
g = svgMap.append("g");

// adding circles to the map
var feature = g.selectAll("circle")
  .data(beerData)
  .enter().append("circle")
  .attr("id",function(d) {
    return d.BreweryClass;
  })
  .attr("class",function(d) {
    return "dot "+d.BreweryClass;
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
      return 9;
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
        .style("top", (d3.event.pageY-260)+"px")
        .style("left",(d3.event.pageX-50)+"px");
    }
  })
  .on("mouseout", function(){
      return tooltip.style("visibility", "hidden");
  });

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
        scrollTop: $("#scroll-to-top").offset().top-35
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
    $('html, body').animate({
        scrollTop: $("#scroll-to-top").offset().top-35
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


// controls for collapsing and expanding sections -----------------------------------

// var search_click = document.getElementById('scntl');
// var search_cntl = document.getElementById('scaret');
// var search_sec = document.getElementById('ssec');
//
// var paths_click = document.getElementById('pcntl');
// var paths_cntl = document.getElementById('pcaret');
// var paths_sec = document.getElementById('psec');
// paths_sec.style.display = "none";
//
// search_click.addEventListener("click",function(){
//   if (search_sec.style.display != "none") {
//     search_sec.style.display = "none";
//     search_cntl.classList.remove('fa-caret-down');
//     search_cntl.classList.add('fa-caret-right');
//     d3.selectAll(".leaflet-clickable").style("display", "none");
//   } else {
//     search_sec.style.display = "block";
//     search_cntl.classList.remove('fa-caret-right');
//     search_cntl.classList.add('fa-caret-down');
//     paths_sec.style.display = "none";
//     paths_cntl.classList.remove('fa-caret-down');
//     paths_cntl.classList.add('fa-caret-right');
//     d3.selectAll(".leaflet-clickable").style("display", "none");
//   }
// });
//
// paths_click.addEventListener("click",function(){
//   if (paths_sec.style.display != "none") {
//     paths_sec.style.display = "none";
//     paths_cntl.classList.remove('fa-caret-down');
//     paths_cntl.classList.add('fa-caret-right');
//     d3.selectAll(".leaflet-clickable").style("display", "none");
//   } else {
//     paths_sec.style.display = "block";
//     paths_cntl.classList.remove('fa-caret-right');
//     paths_cntl.classList.add('fa-caret-down');
//     search_sec.style.display = "none";
//     search_cntl.classList.remove('fa-caret-down');
//     search_cntl.classList.add('fa-caret-right');
//     d3.selectAll(".leaflet-clickable").style("display", "block");
//   }
// });

// beer map paths --------------------------------------------------------------
var polyline = [];
trailsData.forEach(function(d,idx) {
  console.log("NEW TRAIL")
  console.log(d.title);
  var trail_path = [];
  var trailList = d.breweries.split(", ");
  console.log(trailList);
  trailList.forEach(function(bb,bdx) {
    // console.log(bb);
    for (var ii=0; ii < beerData.length; ii++) {
      if (beerData[ii]["Brewery"] == bb) {
        // console.log("we found a match");
        trail_path.push([beerData[ii]["Latitude"],beerData[ii]["Longitude"]]);
      }
    }
  });
  // console.log(d.class);
  console.log("number of stops:");
  console.log(trail_path.length);
  polyline[d.class] = L.polyline(trail_path,
  {
    className: d.class,
    color: "#DE5D26",//"#B38000",
    weight: 3,
    opacity: 1.0,
    lineJoin: "round"
  }).addTo(map);
});

d3.selectAll(".leaflet-clickable").style("display", "none");

// highlighting beer paths -----------------------------------------------------

var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".clickme-trail").forEach(function(group,index) {
  group.addEventListener("click", function(e) {
    $('html, body').animate({
        scrollTop: $("#scroll-to-top").offset().top-35
    }, 600);
    document.querySelector("#chosen-brewery").innerHTML = "";
    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll(".dot").style("opacity", "0.8");
    d3.selectAll(".dot").style("stroke","#696969");
    d3.selectAll(".leaflet-clickable").style("display", "block");
    map.fitBounds(polyline[group.classList[1]].getBounds());
  });
});

// buttons for brewery trails and list -----------------------------------------

var search_click = document.getElementById('list-button');
var search_sec = document.getElementById('ssec');

var paths_click = document.getElementById('trails-button');
var paths_sec = document.getElementById('psec');

var reset_click = document.getElementById("reset-button");

paths_sec.style.display = "none";

search_click.addEventListener("click",function(){
  map.setView(new L.LatLng(sf_lat,sf_long),zoom_deg,{animate:true});
  paths_click.classList.remove("selected");
  search_click.classList.add("selected");
  reset_click.classList.remove("selected");
  search_sec.style.display = "block";
  paths_sec.style.display = "none";
  d3.selectAll(".leaflet-clickable").style("display", "none");
});

paths_click.addEventListener("click",function(){
  document.querySelector("#chosen-brewery").innerHTML = "";
  d3.selectAll(".dot").style("fill", "#FFCC32");
  d3.selectAll(".dot").style("opacity", "0.8");
  d3.selectAll(".dot").style("stroke","#696969");
  if (screen.width >= 480) {
    map.setView(new L.LatLng(37.718929,-122.338428),11,{animate:true});
  } else {
    map.setView(new L.LatLng(37.852280,-122.386665),10,{animate:true});
  }
  paths_click.classList.add("selected");
  search_click.classList.remove("selected");
  reset_click.classList.remove("selected");
  paths_sec.style.display = "block";
  search_sec.style.display = "none";
  d3.selectAll(".leaflet-clickable").style("display", "block");
});

// event listener for re-setting the map
reset_click.addEventListener("click",function(e) {
  paths_click.classList.remove("selected");
  search_click.classList.remove("selected");
  document.querySelector("#chosen-brewery").innerHTML = "";
  d3.selectAll(".dot").style("fill", "#FFCC32");
  d3.selectAll(".dot").style("opacity", "0.8");
  d3.selectAll(".dot").style("stroke","#696969");
  map.setView(new L.LatLng(sf_lat,sf_long),zoom_deg,{animate:true});
  d3.selectAll(".leaflet-clickable").style("display", "none");
});

// hack to fix zooming issue with scrolling ------------------------------------

// document.querySelector(".leaflet-control-zoom").addEventListener("click",function() {
//   console.log("scrolling down");
//   $('html, body').animate({
//       scrollTop: $("#scroll-to-top").offset().top-35
//   }, 600);
// });
