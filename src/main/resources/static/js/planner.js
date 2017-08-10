/**
 * Created by amahalingam on 7/23/17.
 *
 */


function getSearchResults () {
    let cityName = getUrlParameter('location');
    $('#panel-title').append(cityName);
    document.getElementById("city-input").value = cityName;
    $.ajax({
        type: 'GET',
        url: "https://www.expedia.com/lx/api/search",
        dataType: 'json',
        data: {
            "location": cityName
        },
        success: function (response) {
            populateCards(response);
            // createFilterPane(response);
            window.activityResponse = response;
        },
        error: function (e) {
            alert("error " + e.message)
        }
    });
}

let getUrlParameter = function getUrlParameter(sParam) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

// -------------------Activity Cards----------------------

Handlebars.registerHelper('trimString', function(passedString) {
    let theString = passedString.substring(1,passedString.length);
    return new Handlebars.SafeString(theString)
});

Handlebars.registerHelper('increment', function(index) {
    return parseInt(index) + 1;
});

Handlebars.registerHelper('calculateRatings', function(value) {
    return (parseInt(value) * 5)/100;
});

function populateCards (response) {
    let template = $('#handlebars-activity-card').html();
    let templateScript = Handlebars.compile(template);
    let html = templateScript(response.activities.slice(0, 15));
    $('#activies-result').append(html);

}


// ----------------------Display Tab------------------------

let startDate = getUrlParameter('startDate');
let endDate = getUrlParameter('endDate');
if(!startDate || !endDate){
    startDate = new Date().toLocaleDateString();
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    endDate = endDate.toLocaleDateString();
}
document.getElementById("start-date").value = startDate;
document.getElementById("end-date").value = endDate;
let response1 = {date:[]};
let response2 = {date:[]};

for (let d =  new Date(startDate), i=1; d <=  new Date(endDate); d.setDate(d.getDate() + 1), i++) {
    if(i===1){
        response1.date.push({isFirst:true, contentId:'home'+i, date:d.toDateString()});
        response2.date.push({isFirst:true, contentId:'home'+i,listId:'date'+i, mapId:'googleMap'+i,directionsPanelId:'rightPanel'+i});
    }
    else{
        response1.date.push({isFirst:false, contentId:'home'+i, date:d.toDateString()});
        response2.date.push({isFirst:false, contentId:'home'+i,listId:'date'+i, mapId:'googleMap'+i,directionsPanelId:'rightPanel'+i});
    }
}

let template = $('#handlebars-tab-head').html();
let templateScript = Handlebars.compile(template);
let html = templateScript(response1);
$('.nav-tabs').append(html);

template = $('#handlebars-tab-body').html();
templateScript = Handlebars.compile(template);
html = templateScript(response2);
$('.tab-content').append(html);

// -------------------Display Filter pane--------------------

function createFilterPane (response) {
    let filterOptions = {};
    for(let i=0; i<response.activities.length;i++){
        let activity = response.activities[i];
        for(let j=0; j<activity.categories.length;j++){
            let category = activity.categories[j];
            if(category in filterOptions){
                filterOptions[category]++;
            }
            else{
                filterOptions[category]=1;
            }
        }
    }
    let keys = Object.keys(filterOptions);
    let filterOptionsArr = [];
    for(let i=0;i<keys.length;i++){
        let key = keys[i];
        filterOptionsArr.push({catName:key,count:filterOptions[key]});
    }
    let template = $('#handlebars-filter-list').html();
    let templateScript = Handlebars.compile(template);
    let html = templateScript(filterOptionsArr);
    $('#filters').append(html);
}

// -------------------List item functions-----------------------

let dragSrcEl = null;

function handleDragStart(e) {
    this.style.opacity = '0.4';

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';

    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    if (dragSrcEl !== this) {
        let dragSrc = $(dragSrcEl);
        rearrangeMarkers(dragSrc.index(),$(this).index());
        dragSrc.insertBefore(this);
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    let items = document.querySelectorAll('.over');
    [].forEach.call(items, function (item) {
        item.classList.remove('over');
    });
}

// Add an activity to the active tab
function addEvent(activity) {
    let index = $(activity).data('id');
    let actvity_card = window.activityResponse.activities[index];
    let active_tab = $('.tab-pane.active ul');
    let list_id = active_tab[0].id + activity.id;
    activity.classList.add('selected');

    if (!($('#'+list_id).length > 0)){

        let response = {id:list_id, title:actvity_card.title, dataId:activity.id};

        let template = $('#handlebars-list-item').html();
        let templateScript = Handlebars.compile(template);
        let html = templateScript(response);
        active_tab.append(html);

        let item = document.querySelector('#'+list_id);
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragenter', handleDragEnter, false);
        item.addEventListener('dragover', handleDragOver, false);
        item.addEventListener('dragleave', handleDragLeave, false);
        item.addEventListener('drop', handleDrop, false);
        item.addEventListener('dragend', handleDragEnd, false);

        let coords = actvity_card.latLng.split(",");
        if(coords.length > 1){
            addMarker(coords,actvity_card.title);
        }
    }
}

function deleteItem(deleteButton){
    let item = $(deleteButton).parent();
    removeMarker(item.index());
    let activityItem = document.getElementById(item.data('id'));
    activityItem.classList.remove('selected');
    item.remove();
}

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    let map_id = $('.tab-pane.active').data('id');
    let center=display_maps[map_id].getCenter();
    google.maps.event.trigger(display_maps[map_id], "resize");
    display_maps[map_id].setCenter(center);

});



// -----------------------MAP----------------------------
/* initialize map */
function myMap() {
    let cityName = getUrlParameter('location');
    let geocoder = new google.maps.Geocoder();

    let mapProp = {
        zoom:13,
    };

    let startDate = getUrlParameter('startDate');
    let endDate = getUrlParameter('endDate');
    if(!startDate || !endDate){
        startDate = new Date();
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 1)
    }
    window.display_maps = [];
    window.allMarkers = [];
    window.directionsDisplays =[];

    geocoder.geocode( { 'address': cityName }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            for (let d =  new Date(startDate), i=1; d <=  new Date(endDate); d.setDate(d.getDate() + 1), i++) {
                display_maps.push(new google.maps.Map(document.getElementById("googleMap"+i),mapProp));
                display_maps[i-1].setCenter(results[0].geometry.location);
                allMarkers[i-1]=[];
                directionsDisplays.push(new google.maps.DirectionsRenderer());
                directionsDisplays[i-1].setMap(display_maps[i-1]);
                directionsDisplays[i-1].setPanel(document.getElementById('rightPanel'+i));
            }
        } else {
            alert("Could not find location: " + location);
            for (let d =  new Date(startDate), i=1; d <=  new Date(endDate); d.setDate(d.getDate() + 1), i++) {
                display_maps.push(new google.maps.Map(document.getElementById("googleMap"+i),mapProp));
                display_maps[i-1].setCenter(new google.maps.LatLng(41.9027835,12.4963655));
                allMarkers[i-1]=[];
                directionsDisplays.push(new google.maps.DirectionsRenderer());
                directionsDisplays[i-1].setMap(display_maps[i-1]);
                directionsDisplays[i-1].setPanel(document.getElementById('rightPanel'+i));
            }
        }
    });

}

/* add a marker and information window for each activity added to a tab */
function addMarker(coords,title) {
    let map_id = $('.tab-pane.active').data('id');
    let latLng = new google.maps.LatLng(coords[0],coords[1]);

    // TODO - add proper info window for each marker
    let contentString = '<div id="content"><p><b>Uluru</b>, also referred to as <b>Ayers Rock</b></p></div>';

    let infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    let marker = new google.maps.Marker({
        position: latLng,
        map: display_maps[map_id],
        title: title
    });
    marker.addListener('click', function() {
        infowindow.open(display_maps[map_id], marker);
    });
    allMarkers[map_id].push(marker);

    calcRoute(map_id);
}

function removeMarker(markerId){
    let map_id = $('.tab-pane.active').data('id');
    let markerArray = allMarkers[map_id];
    if(markerArray[markerId]){
        markerArray[markerId].setMap(null);
        markerArray.splice(markerId,1);

        calcRoute(map_id);
    }
}

function rearrangeMarkers(markerIdSrc, markerIdDest){
    let map_id = $('.tab-pane.active').data('id');
    let markerArray = allMarkers[map_id];
    let currentSelection = markerArray[markerIdSrc];
    if(currentSelection){
        markerArray.splice(markerIdSrc,1);
        markerArray.splice(markerIdDest,0,currentSelection);

        calcRoute(map_id);
    }
}
/* display the route for the activities currently selected */
// TODO - display path better
function calcRoute(map_id) {
    if(allMarkers[map_id].length > 1) {
        if(!directionsDisplays[map_id].map){
            directionsDisplays[map_id].setMap(display_maps[map_id]);
        }
        let directionsService = new google.maps.DirectionsService();
        let len = allMarkers[map_id].length;
        let waypoints = [];
        for (let i = 1; i < len - 1; i++) {
            waypoints.push({
                location: allMarkers[map_id][i].position,
                stopover: true
            })
        }
        let request = {
            origin: allMarkers[map_id][0].position,
            destination: allMarkers[map_id][len - 1].position,
            travelMode: 'DRIVING',
            waypoints: waypoints,
            optimizeWaypoints: true
        };
        directionsService.route(request, function (response, status) {
            if (status === 'OK') {
                directionsDisplays[map_id].setDirections(response);
            }
            else {
                alert('Directions request failed due to ' + status);
            }
        });
    }
    else{
        if(directionsDisplays[map_id].map) {
            directionsDisplays[map_id].setMap(null);
        }
    }
}
