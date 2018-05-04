require("./lib/social"); //Do not delete
require("./lib/leaflet-mapbox-gl");
var d3 = require('d3');

var off_red = "#DE5D26";
var bright_red = "#AB2A00";
var dot_red = "#C5440D";//"red";

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
  console.log(data);
  if (data.SFC_links){
    console.log(data.SFC_links);
    if (data.SFC_links.split(", ").length > 1){
      var extralinks = "<div class='read-more'><a href='"+data.SFC_links[0]+"' target='_blank'><i class='fa fa-external-link'></i>Chronicle coverage</a></div><div class='read-more'><a href='"+data.SFC_links[1]+"' target='_blank'><i class='fa fa-external-link'></i>Read more</a></div>";
    } else {
      var extralinks = "<div class='read-more'><a href='"+data.SFC_links[0]+"' target='_blank'><i class='fa fa-external-link'></i>Chronicle coverage</a></div>";
    }
    var html = "<div class='brewery-group top active'><div class='name'>"+data.Brewery+"</div><div class='address'>"+data.Address+", "+data.City+"</div><div class='blurb'>"+data.Blurb+"</div>"+extralinks+"<div class='brewery-link'><a href="+data.Website+" target='_blank'><i class='fa fa-external-link' aria-hidden='true'></i>Visit brewery website</a></div></div>";
  } else {
    var html = "<div class='brewery-group top active'><div class='name'>"+data.Brewery+"</div><div class='address'>"+data.Address+", "+data.City+"</div><div class='blurb'>"+data.Blurb+"</div><div class='brewery-link'><a href="+data.Website+" target='_blank'><i class='fa fa-external-link' aria-hidden='true'></i>Visit brewery website</a></div>";
  }
  return html;
}

// put info for highlighted brewery trail at the top
function fill_path_info(data){
  var html = "<div class='brewery-group-top active'><div class='name'>"+data.title+"</div><div class='address small'>"+data.breweries+"</div></div>";
  return html;
}


// initialize map with center position and zoom levels
var map = L.map("map", {
  minZoom: 6,
  maxZoom: 15,
  zoomControl: false,
  dragging: true,
  // attributionControl: false
  // touchZoom: true
  // zoomControl: isMobile ? false : true,
  scrollWheelZoom: false
}).setView([sf_lat,sf_long], zoom_deg);
// window.map = map;

map.dragging.enable();

// var gl = L.mapboxGL({
//     accessToken: 'pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA',
//     style: 'mapbox://styles/emro/ciyvuvz1700312so6s8f3ip13'
// }).addTo(map);

// var attribution = L.control.attribution();
// attribution.setPrefix('');
// attribution.addAttribution('Map data: <a href="http://openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> | <a href="https://www.mapbox.com/map-feedback/" target="_blank" class="mapbox-improve-map">Improve this map</a>');
// attribution.addTo(map);

// add tiles to the map
var mapLayer = L.tileLayer("https://api.mapbox.com/styles/v1/emro/ciyvuvz1700312so6s8f3ip13/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA",{attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'})
mapLayer.addTo(map);

L.control.zoom({
     position:'topright'
}).addTo(map);

// dragging and zooming controls
// map.scrollWheelZoom.disable();
// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.keyboard.disable();

// initializing the svg layer
L.svg().addTo(map);
// map._initPathRoot();

// creating Lat/Lon objects that d3 is expecting
beerData.forEach(function(d,idx) {
	d.LatLng = new L.LatLng(+d.Latitude,+d.Longitude);
});

// creating svg layer for data
var svgMap = d3.select("#map").select("svg").attr("style","z-index:300"),//.attr('style', 'pointer-events:all'),
g = svgMap.append("g");

// adding circles to the map
var feature = g.selectAll("circle")
  .data(beerData)
  .enter().append("circle")
  .attr("id",function(d) {
    return d.BreweryClass.toLowerCase();
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
      return 8;
    } else {
      return 10;
    }
  })
  .on('mouseover', function(d) {
    if (screen.width >= 1024){
      var html_str = tooltip_function(d);
      tooltip.html(html_str);
      tooltip.style("visibility", "visible");
    }
  })
  .on("mousemove", function() {
    return tooltip
      .style("top", (d3.event.pageY - 250)+"px")
      .style("left",(d3.event.pageX - 50)+"px");
  })
  .on("mouseout", function(){
    return tooltip.style("visibility", "hidden");
  })
  .on("click",function(d){
    $('html, body').animate({scrollTop: $("#scroll-to-top").offset().top-35}, 600);

    $(".sidebar").animate({ scrollTop: 0 }, "fast");
    $("#brewery-list").animate({ scrollTop: 0 }, "fast");
    $("#psec").animate({ scrollTop: 0 }, "fast");

    document.querySelector("#chosen-brewery").innerHTML = fill_info(d);
    document.querySelector("#chosen-brewery-trails").innerHTML = fill_info(d);

    // highlight the appropriate dot
    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll(".dot").style("opacity", "0.2");
    d3.selectAll(".dot").transition(0).attr("r",10);
    d3.selectAll(".dot").style("stroke","black");

    d3.select(this).style("fill",dot_red);
    d3.select(this).style("opacity","1.0");
    d3.select(this).transition(0).attr("r",15);
    // d3.select(this).style("stroke","#696969");

    d3.select("."+d.BreweryClass.split("brewery")[1].toLowerCase()).classed("active",true);

    // zoom and pan the map to the appropriate dot
    // map.setView([sf_lat,sf_long], zoom_deg, {animate:false} );
    map.panTo([d.LatLng.lat, d.LatLng.lng],{animate:true},{duration:1});
    // map.setView([d.LatLng.lat, d.LatLng.lng],map.getZoom(),{animate:true});

    $(".brewery-group").addClass("active");
    document.getElementById('searchbar').value = "";
    $("#no-results").css("display","none");
  });

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

// map.on("moveend", update);
map.setView([sf_lat,sf_long], zoom_deg);
map.on("viewreset", update);
map.on("zoom", update);
// map.on("load", update);
update();

// show tooltip
var tooltip = d3.select("div.tooltip-beermap");
var count;

// searchbar code
$("#searchbar").bind("input propertychange", function () {
  var filterval = $(this).val().toLowerCase().replace(/ /g,'');
  var class_match = 0;
  count = 0;
  document.querySelector("#chosen-brewery").innerHTML = "";
  document.querySelector("#chosen-brewery-trails").innerHTML = "";

  d3.selectAll(".dot").style("fill", "#FFCC32");
  d3.selectAll(".dot").style("opacity", "0.2");
  d3.selectAll(".dot").transition(0).attr("r",10);

  $(".sidebar").animate({ scrollTop: 0 }, "fast");
  $("#brewery-list").animate({ scrollTop: 0 }, "fast");

  if (filterval != ""){

  $(".brewery-group").filter(function() {

    var classes = this.className.split(" ");
    for (var i=0; i< classes.length; i++) {

      var current_class = classes[i].toLowerCase();

      if ( current_class.match(filterval)) {
        class_match = class_match + 1;
      }
    }

    if (class_match > 0) {
      $(this).addClass("active");
      d3.select("#brewery"+this.id).style("stroke","black");
      d3.select("#brewery"+this.id).style("fill", "#FFCC32");
      d3.select("#brewery"+this.id).style("opacity", "1.0");
      count+=1;
    } else {
      $(this).removeClass("active");
      d3.select("#brewery"+this.id).style("stroke","#696969");
      d3.select("#brewery"+this.id).style("fill", "#FFCC32");
      d3.select("#brewery"+this.id).style("opacity", "0");
    }
    class_match = 0;

  });

  if (count != 0){
    $("#no-results").css("display","none");
  } else {
    $("#no-results").css("display","block");
  }

  } else {
    d3.selectAll(".dot").style("stroke","#696969");
    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll(".dot").style("opacity", "0.8");
    d3.selectAll(".dot").transition(0).attr("r",10);
    $("#no-results").css("display","none");
  }
  console.log(count);

  // update();

});

// event listener for each brewery that highlights the brewery on the map and calls the function to fill in the info at the top
var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".clickme").forEach(function(group,index) {
  group.addEventListener("click", function(e) {

    if (d3.select("#"+e.target.classList[1].toLowerCase()).attr("r") != 15){

      // highlight the appropriate dot
      d3.selectAll(".dot").style("fill", "#FFCC32");
      d3.selectAll(".dot").style("opacity", "0.2");
      d3.selectAll(".dot").transition(0).attr("r",10);
      // d3.selectAll(".dot").style("stroke","black");

      $('html, body').animate({scrollTop: $("#scroll-to-top").offset().top-35}, 600);

      document.querySelector("#chosen-brewery").innerHTML = fill_info(beerData[index]);

      d3.select("#"+e.target.classList[1].toLowerCase()).style("fill",dot_red);
      d3.select("#"+e.target.classList[1].toLowerCase()).transition(100).attr("r",15);
      d3.select("#"+e.target.classList[1].toLowerCase()).style("opacity","1.0");
      d3.select("#"+e.target.classList[1].toLowerCase()).style("stroke","#696969");

      // zoom and pan the map to the appropriate dot
      // map.setView([sf_lat,sf_long], zoom_deg);
      // map.setView([beerData[index].LatLng.lat, beerData[index].LatLng.lng],map.getZoom(),{animate:true});
      map.panTo([beerData[index].LatLng.lat, beerData[index].LatLng.lng],{animate:true},{duration:1});
    }

  });
});

// beer map paths --------------------------------------------------------------
var polyline = [];
trailsData.forEach(function(d,idx) {
  var trail_path = [];
  var trailList = d.breweries.split(", ");
  trailList.forEach(function(bb,bdx) {
    for (var ii=0; ii < beerData.length; ii++) {
      if (beerData[ii]["Brewery"] == bb) {
        trail_path.push([beerData[ii]["Latitude"],beerData[ii]["Longitude"]]);
      }
    }
  });
  polyline[d.class] = L.polyline(trail_path,
  {
    className: d.class,
    color: off_red,//"#B38000",
    weight: 3,
    opacity: 1.0,
    lineJoin: "round",
    clickable: false
  }).addTo(map);
});

d3.selectAll(".leaflet-interactive").style("display", "none");

// highlighting beer paths -----------------------------------------------------

var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".clickme-trail").forEach(function(group,index) {
  // console.log(group.classList[1]);
  group.addEventListener("click", function(e) {
    $('html, body').animate({scrollTop: $("#scroll-to-top").offset().top-35}, 600);

    $(".sidebar").animate({ scrollTop: 0 }, "fast");
    $("#brewery-list").animate({ scrollTop: 0 }, "fast");

    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll(".dot").style("opacity", "0.8");
    d3.selectAll(".dot").style("stroke","#696969");
    d3.selectAll(".leaflet-interactive").style("display", "block");
    map.fitBounds(polyline[group.classList[1]].getBounds(), {"maxZoom":13} );

    d3.selectAll(".leaflet-interactive").style("stroke",off_red);
    d3.selectAll(".leaflet-interactive").style("opacity","0.6");
    d3.selectAll(".leaflet-interactive").style("stroke-width","3");
    d3.selectAll("."+group.classList[1]).style("stroke",bright_red);
    d3.selectAll("."+group.classList[1]).style("opacity","1.0");
    d3.selectAll("."+group.classList[1]).style("stroke-width","5");

    document.querySelector("#chosen-brewery").innerHTML = fill_path_info(trailsData[index]);
    $(".brewery-group").addClass("active");
    document.getElementById('searchbar').value = "";
    $("#no-results").css("display","none");
  });
});
//
// buttons for brewery trails and list -----------------------------------------

var search_click = document.getElementById('list-button');
var search_sec = document.getElementById('ssec');

var paths_click = document.getElementById('trails-button');
var paths_sec = document.getElementById('psec');

var reset_click = document.getElementById("reset-button");

paths_sec.style.display = "none";

search_click.addEventListener("click",function(){
  document.querySelector("#chosen-brewery").innerHTML = "";
  document.querySelector("#chosen-brewery-trails").innerHTML = "";

  map.setView(new L.LatLng(sf_lat,sf_long),zoom_deg,{animate:true});
  // $("#brewery-list").animate({ scrollTop: 0 }, "fast");
  $(".sidebar").animate({ scrollTop: 0 }, "fast");
  $("#brewery-list").animate({ scrollTop: 0 }, "fast");

  paths_click.classList.remove("selected");
  search_click.classList.add("selected");
  reset_click.classList.remove("selected");
  search_sec.style.display = "block";
  paths_sec.style.display = "none";
  d3.selectAll(".leaflet-interactive").style("display", "none");

  d3.selectAll(".dot").style("fill", "#FFCC32");
  d3.selectAll(".dot").style("opacity", "0.8");
  d3.selectAll(".dot").style("stroke","#696969");
  $(".brewery-group").addClass("active");
  document.getElementById('searchbar').value = "";
  $("#no-results").css("display","none");
});

paths_click.addEventListener("click",function(){

  document.querySelector("#chosen-brewery").innerHTML = "";
  document.querySelector("#chosen-brewery-trails").innerHTML = "";

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

  d3.selectAll(".leaflet-interactive").style("display", "block");
  d3.selectAll(".leaflet-interactive").style("stroke",off_red);
  d3.selectAll(".leaflet-interactive").style("opacity","1.0");
  d3.selectAll(".leaflet-interactive").style("stroke-width","3");

  $(".brewery-group").addClass("active");
  document.getElementById('searchbar').value = "";
  $("#no-results").css("display","none");
});

// event listener for re-setting the map
reset_click.addEventListener("click",function(e) {

  $(".sidebar").animate({ scrollTop: 0 }, "fast");
  $("#brewery-list").animate({ scrollTop: 0 }, "fast");

  paths_click.classList.remove("selected");
  search_click.classList.remove("selected");

  document.querySelector("#chosen-brewery").innerHTML = "";
  document.querySelector("#chosen-brewery-trails").innerHTML = "";

  d3.selectAll(".dot").style("fill", "#FFCC32");
  d3.selectAll(".dot").transition(100).attr("r",10);
  d3.selectAll(".dot").style("opacity", "0.8");
  d3.selectAll(".dot").style("stroke","#696969");
  map.setView(new L.LatLng(sf_lat,sf_long),zoom_deg,{animate:true});
  d3.selectAll(".leaflet-interactive").style("display", "none");

  search_sec.style.display = "block";
  paths_sec.style.display = "none";

  $(".brewery-group").addClass("active");
  document.getElementById('searchbar').value = "";
  $("#no-results").css("display","none");
});
