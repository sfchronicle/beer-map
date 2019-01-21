require("./lib/social"); //Do not delete
require("./lib/leaflet-mapbox-gl");
var d3 = require('d3');

var off_red = "#DE5D26";
var bright_red = "#AB2A00";
var dot_red = "#ff2424";

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
  if (data.SFC_links){
    if (data.SFC_links.split(", ").length > 1){
      var extralinks = "<div class='read-more'><a href='"+data.SFC_links[0]+"' target='_blank'>Chronicle coverage</a></div><div class='read-more'><a href='"+data.SFC_links[1]+"' target='_blank'><i class='fa fa-external-link'></i>Read more</a></div>";
    } else {
      var extralinks = "<div class='read-more'><a href='"+data.SFC_links[0]+"' target='_blank'>Chronicle coverage</a></div>";
    }
    var html = "<div class='brewery-group top active'><div class='name'>"+data.Brewery+"</div><div class='address'>"+data.Address+", "+data.City+"</div><div class='blurb'>"+data.Blurb+"</div>"+extralinks+"<div class='brewery-link'><a href="+data.Website+" target='_blank'>Visit brewery website</a></div></div>";
  } else {
    var html = "<div class='brewery-group top active'><div class='name'>"+data.Brewery+"</div><div class='address'>"+data.Address+", "+data.City+"</div><div class='blurb'>"+data.Blurb+"</div><div class='brewery-link'><a href="+data.Website+" target='_blank'>Visit brewery website</a></div>";
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
  minZoom: 7,
  maxZoom: 15,
  zoomControl: false,
  dragging: true,
  // attributionControl: false
  // touchZoom: true
  // zoomControl: isMobile ? false : true,
  scrollWheelZoom: false
}).setView([sf_lat,sf_long], zoom_deg);
// window.map = map;

var southWest = L.latLng(33.9268878,-130.3795377),
northEast = L.latLng(45.5580821,-114.5673183);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

map.dragging.enable();


// add tiles to the map
var mapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a target="_blank" href="https://carto.com/attributions">CARTO</a>'})
mapLayer.addTo(map);

L.control.zoom({
     position:'topright'
}).addTo(map);


// initializing the svg layer
L.svg().addTo(map);
// map._initPathRoot();

// creating Lat/Lon objects that d3 is expecting
let beerDataNested = {};
beerData.forEach(function(d,idx) {
	d.LatLng = new L.LatLng(+d.Lat,+d.Lng);
  beerDataNested[d.BreweryClass.toLowerCase().split("brewery")[1]] = d;
});

d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

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
      return 5;
    } else {
      return 7;
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
      .style("top", (d3.event.pageY - 350)+"px")
      .style("left",(d3.event.pageX - 50)+"px");
  })
  .on("mouseout", function(){
    return tooltip.style("visibility", "hidden");
  })

  .on("click",function(d){
    d3.select(this).moveToFront();
    $('html, body').animate({scrollTop: $("#scroll-to-top").offset().top}, 600);

    $(".sidebar").animate({ scrollTop: 0 }, "fast");
    $("#brewery-list").animate({ scrollTop: 0 }, "fast");
    $("#psec").animate({ scrollTop: 0 }, "fast");

    $(".brewery-group.active").removeClass("active");
    document.querySelector("#chosen-brewery").innerHTML = fill_info(d);
    document.querySelector("#chosen-brewery-trails").innerHTML = fill_info(d);
    

    // highlight the appropriate dot
    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll('.dot').transition(100).attr("r",7);
    d3.select(this).style("fill",dot_red);
    d3.select(this).style("opacity",1);
    d3.select(this).style("stroke","#696969");

    // pulse animation

    // clear out everything else
    document.getElementById('searchbar').value = "";
    $("#no-results").css("display","none");
    $("#count-results").css("display","none");
    $(".brewery-list").css("margin-top","180px");
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
var panMapToGroup;
$("#searchbar").bind("input propertychange", function () {
  var filterval = $(this).val().toLowerCase().replace(/ /g,'');
  var class_match = 0;
  count = 0;

  // initialize lat/lon grouping to be empty
  var latlngGroup = {};

  document.querySelector("#chosen-brewery").innerHTML = "";
  document.querySelector("#chosen-brewery-trails").innerHTML = "";

  d3.selectAll(".dot").style("fill", "#FFCC32");

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

      // add latitude and longitude to group
      latlngGroup = [...latlngGroup, L.latLng(+beerDataNested[this.id].Lat,+beerDataNested[this.id].Lng)];

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

  // $('html, body').animate({scrollTop: $("#scroll-to-top").offset().top-35}, 600);

  clearTimeout(panMapToGroup);
  var topHeight = document.getElementById("stick-me").getBoundingClientRect().height;
  if (count != 0){

    $("#count-results").css("display","block");
    if (count === 1){
      document.getElementById("count-results").innerHTML = "There is 1 result.";
    } else {
      document.getElementById("count-results").innerHTML = "There are "+count+" results.";
    }
    $("#count-results").css("margin-top",topHeight+"px");
    $(".brewery-list").css("margin-top","20px");
    $("#no-results").css("display","none");

    var myBounds = new L.LatLngBounds(latlngGroup);
    panMapToGroup = setTimeout(function(){
      map.fitBounds(myBounds, {"maxZoom":12} );
    },200)

  } else {
    $("#no-results").css("display","block");
    $("#no-results").css("margin-top",topHeight+"px");
    $("#count-results").css("display","none");
  }

  } else {
    d3.selectAll(".dot").style("stroke","#696969");
    d3.selectAll(".dot").style("fill", "#FFCC32");
    d3.selectAll(".dot").style("opacity", "0.8");
    $("#no-results").css("display","none");
    $("#count-results").css("display","none");
    $(".brewery-list").css("margin-top","180px");
  }

});

// event listener for each brewery that highlights the brewery on the map and calls the function to fill in the info at the top
var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".clickme").forEach(function(group,index) {
  group.addEventListener("click", function(e) {

    if (d3.select("#"+e.target.classList[1].toLowerCase()).attr("r")){

      $("#count-results").css("display","none");
      $(".brewery-list").css("margin-top","180px");

      // highlight the appropriate dot
      d3.selectAll(".dot").style("fill", "#FFCC32");

      $('html, body').animate({scrollTop: $("#scroll-to-top").offset().top}, 600);

      d3.select("#"+e.target.classList[1].toLowerCase())
      .style("fill",dot_red)
      .style("stroke","white")
      .attr("r",12)
      .moveToFront();

      map.setView([beerData[index].LatLng.lat, beerData[index].LatLng.lng],14,{animate:true});
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
        trail_path.push([beerData[ii]["Lat"],beerData[ii]["Lng"]]);
        $("#brewery"+bb.toLowerCase().replace(/ /g,'').replace('.','').replace('.','').replace('(','').replace(')','').replace('&','').replace('/','').replace("'",'')).addClass("beer-trail"); 
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
    $('html, body').animate({scrollTop: $("#scroll-to-top").offset().top}, 600);

    d3.selectAll(".dot").style("fill", "#FFCC32");
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
  d3.selectAll(".dot").style("stroke","#696969");
  $(".brewery-group").addClass("active");
  d3.selectAll(".dot").style("opacity", "0.8");
  $(".dot").removeClass("hide");
  document.getElementById('searchbar').value = "";
  $("#no-results").css("display","none");
  $("#count-results").css("display","none");
  $(".brewery-list").css("margin-top","180px");
});

paths_click.addEventListener("click",function(){

  document.querySelector("#chosen-brewery").innerHTML = "";
  document.querySelector("#chosen-brewery-trails").innerHTML = "";

  d3.selectAll(".dot").style("fill", "#FFCC32");
  d3.selectAll(".dot").style("stroke","#696969");
  if (screen.width >= 480) {
    map.setView(new L.LatLng(37.718929,-122.338428),9,{animate:true});
  } else {
    map.setView(new L.LatLng(37.852280,-122.386665),10,{animate:true});
  }
  paths_click.classList.add("selected");
  search_click.classList.remove("selected");
  reset_click.classList.remove("selected");
  paths_sec.style.display = "block";
  search_sec.style.display = "none";
  $('.dot').addClass('hide');

  d3.selectAll(".leaflet-interactive").style("display", "block");
  d3.selectAll(".leaflet-interactive").style("stroke",off_red);
  d3.selectAll(".leaflet-interactive").style("stroke-width","3");

  $(".brewery-group").addClass("active");
  document.getElementById('searchbar').value = "";
  $("#no-results").css("display","none");
  $("#count-results").css("display","none");
  $(".brewery-list").css("margin-top","180px");
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
  d3.selectAll(".dot").style("stroke","#696969");
  d3.selectAll(".dot").style("opacity", "0.8");
  map.setView(new L.LatLng(sf_lat,sf_long),zoom_deg,{animate:true});
  d3.selectAll(".leaflet-interactive").style("display", "none");

  search_sec.style.display = "block";
  paths_sec.style.display = "none";

  $(".brewery-group").addClass("active");
  document.getElementById('searchbar').value = "";
  $("#no-results").css("display","none");
  $("#count-results").css("display","none");
  $(".brewery-list").css("margin-top","180px");
});




// RSS parser
var Feed = require('./lib/rss');

Feed.load('https://www.sfchronicle.com/default/feed/ultimate-norcal-brewery-map-recirc-2228.php', function(err, rss){

  var items = rss.items.splice(0,3);

  items.forEach(function(item){

    // Get title
    var title = item.title;
    // Get link
    var link = item.link;

    // check if article contains image
    if(item.media){

      // Get first image src
      var imageURL = item.media.content[0].url[0];
      var lastSlash = imageURL.lastIndexOf("/");
      imageURL = imageURL.replace(imageURL.substring(lastSlash+1), "premium_gallery_landscape.jpg");

      // push each story html
      var html = '<div class="story "><a target="_blank" href="'+link+'"><img src="'+imageURL+'"></a><div class="story-info"><h3><a target="_blank" href="'+link+'"><span class="latest-title">'+title+'</span></a></h3></div></div>';
      $('.story.loading').remove();
      $('.stories').append(html);

    }else{
      var html = '<div class="story no-img"><div class="story-info"><h3><a target="_blank" href="'+link+'"><span class="latest-title">'+title+'</span></a></h3></div></div>';
      $('.story.loading').remove();
      $('.stories').append(html);
    }

  });

});
