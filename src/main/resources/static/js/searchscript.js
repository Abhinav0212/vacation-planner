(function ($) {
    var mapSearch = {
        geoItems: {},
        hotelMarkers: [],
        activityMarkers: [],
        poiMarkers: [],
        yelpMarkers: [],
        yelp2Markers: [],
        yelp3Markers: [],
        init: function()
        {
            var $dest = $('.dest'),
                $show_hide_button = $('#show_hide_panel_button'),
                $show_hide_searchTabs_button = $('#show_hide_searchtabs_button'),
                $panel = $('#panel'),
                $searchTabsPanel = $('#searchtabspanel'),
                $mapcontainer = $('.mapcontainer');

            $show_hide_button.click(function () {
                // close
                //if ($show_hide_button.attr('class') === "active")
                //{
                //    $show_hide_button.removeClass("active");
                //    $mapcontainer.css('width', '100%');
                //}
                //else // open
                //{
                //    $show_hide_button.addClass("active");
                //    $mapcontainer.css('width', '75%');
                //}
                $panel.animate({height: 'toggle'});
            });

            $show_hide_searchTabs_button.click(function () {
                $searchTabsPanel.animate({height: 'toggle'});
            });

            var URI = "/search/getGeocode?dest=" + $dest.text();
            var latlong, viewport;
            var myself = this;
            var styleArray = [
                {
                    featureType: "all",
                    stylers: [
                        { saturation: -80 }
                    ]
                },{
                    featureType: "road.arterial",
                    elementType: "geometry",
                    stylers: [
                        { hue: "#00ffee" },
                        { saturation: 50 }
                    ]
                },{
                    featureType: "poi.business",
                    elementType: "labels",
                    stylers: [
                        { visibility: "off" }
                    ]
                }
            ];
            $.get(URI, function(res){
                latlong = res.results[0].geometry.location;
                viewport = res.results[0].geometry.viewport;
            }).done(function(){
                myself.map = new google.maps.Map(document.getElementById('map'), {
                    center: latlong,
                    zoom: 8,
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.BOTTOM_CENTER
                    }
                });
                var sw, ne, bounds;
                sw = new google.maps.LatLng(parseFloat(viewport.southwest.lat), parseFloat(viewport.southwest.lng));
                ne = new google.maps.LatLng(parseFloat(viewport.northeast.lat), parseFloat(viewport.northeast.lng));
                bounds = new google.maps.LatLngBounds();
                bounds.extend(sw);
                bounds.extend(ne);
                myself.map.fitBounds(bounds);
                //myself.map.setOptions({styles:styleArray});
                myself.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('legend'));
                myself.initData();
                myself.initSearchFields();
            });
        },
        formatDate: function(date)
        {
            var dates = date.split('/');
            return dates[2] + '-' + dates[0] + '-' + dates[1];
        },
        initSearchFields: function()
        {
            var $dest = $('.dest'),
                $sDate = $('.sDate'),
                $eDate = $('.eDate');

            var $hotelSearchBtn = $('.hotelSearchButton'),
                $activitySearchBtn = $('.activitySearchButton'),
                $poiSearchBtn = $('.poiSearchButton'),
                $yelpSearchBtn1 = $('#yelpSearchButton1'),
                $yelpSearchBtn2 = $('#yelpSearchButton2'),
                $yelpSearchBtn3 = $('#yelpSearchButton3'),
                $allBtns = $('.hotelSearchButton, .activitySearchButton, .poiSearchButton, #yelpSearchButton1, #yelpSearchButton2, #yelpSearchButton3');

            var myself = this;

            $allBtns.on('mousedown', function(){
                $allBtns.css('border-radius', '3px');
                $allBtns.css('border', '3px solid blue');
            });

            $allBtns.on('mouseup', function(){
                $allBtns.css('border', 'none');
            });


            $hotelSearchBtn.on('click', function(){
                var priceFrom = $('.priceFilterFrom').val(),
                    priceTo = $('.priceFilterTo').val(),
                    count = $('.hotelCount').val(),
                    starRating = '';
                for (var i = 0; i < 5; i++)
                {
                    var selector = '.starFilter' + parseInt(i+1);
                    var $starFilter = $(selector);
                    if ($starFilter.prop('checked')){
                        starRating += (parseInt($starFilter.val())*10).toString() + ',';
                    }
                }
                priceFrom = priceFrom? priceFrom : 0;
                priceTo = priceTo? priceTo : 10000;
                count = count? count : 10;
                var hotelsURI = '/search/getHotelsData?dest=' + $dest.text() + '&sDate=' + myself.formatDate($sDate.text()) +
                    '&eDate=' +  myself.formatDate($eDate.text()) + '&count=' + count + '&priceFrom=' + priceFrom + '&priceTo=' + priceTo +
                    '&starRating=' + starRating.slice(0,-1);
                $.when($.get(hotelsURI)).done(function(res){
                    myself.removeMarkers(myself.hotelMarkers);
                    myself.geoItems.hotels = res;
                    myself.addMarkers(myself.geoItems.hotels, 0);
                    myself.clearListView('hotel');
                    myself.populateHotelListView(myself.geoItems.hotels);
                    myself.updateLegends();
                });
            });

            $activitySearchBtn.on('click', function(){
                var count = $('.activityCount').val();
                count = count? count : 10;
                var activitiesURI = '/search/getActivitiesData?dest=' + $dest.text() + '&sDate=' + myself.formatDate($sDate.text()) +
                    '&eDate=' +  myself.formatDate($eDate.text()) + '&count=' +count;
                $.when($.get(activitiesURI)).done(function(res){
                    myself.removeMarkers(myself.activityMarkers);
                    myself.geoItems.activities = res;
                    myself.addMarkers(myself.geoItems.activities, 0);
                    myself.clearListView('activity');
                    myself.populateActivityListView(myself.geoItems.activities);
                    myself.updateLegends();
                });
            });

            $poiSearchBtn.on('click', function(){
                var count = $('.poiCount').val();
                count = count? count : 10;
                var POIURI = '/search/getPOIData?dest='+ $dest.text() + '&count='+ count;
                $.when($.get(POIURI)).done(function(res){
                    myself.removeMarkers(myself.poiMarkers);
                    myself.geoItems.pois = res;
                    myself.addMarkers(myself.geoItems.pois, 0);
                    myself.clearListView('poi');
                    myself.populatePOIListView(myself.geoItems.pois);
                    myself.updateLegends();
                });
            });

            // initial yelp search change
            $yelpSearchBtn1.on('click', function(){
                var term = $('#searchTerm1').val(),
                    sort = $('#yelpSortMenu1').val(),
                    count = $('#yelpCount1').val();
                count = count? count : 10;
                var yelpURI = '/search/getYelpData?dest='+ $dest.text() + '&count='+ count + '&term=' + term + '&sort=' + sort;
                $.when($.get(yelpURI)).done(function(res){
                    myself.removeMarkers(myself.yelpMarkers);
                    myself.geoItems.yelps = res;
                    myself.addMarkers(myself.geoItems.yelps, 0);
                    myself.clearListView('yelp');
                    myself.populateYelpListView(myself.geoItems.yelps,0, term);
                    myself.updateLegends();
                });
            });
            $yelpSearchBtn2.on('click', function(){
                var term = $('#searchTerm2').val(),
                    sort = $('#yelpSortMenu2').val(),
                    count = $('#yelpCount2').val();
                count = count? count : 10;
                var yelpURI = '/search/getYelpData?dest='+ $dest.text() + '&count='+ count + '&term=' + term + '&sort=' + sort;
                $.when($.get(yelpURI)).done(function(res){
                    if (myself.yelp2Markers) myself.removeMarkers(myself.yelp2Markers);
                    myself.geoItems.yelps2 = res;
                    myself.addMarkers(myself.geoItems.yelps2, 1);
                    if (myself.yelp2Markers) myself.clearListView('yelp2'); //TODO
                    myself.populateYelpListView(myself.geoItems.yelps2, 1, term);
                    myself.updateLegends();
                });
            });
            $yelpSearchBtn3.on('click', function(){
                var term = $('#searchTerm3').val(),
                    sort = $('#yelpSortMenu3').val(),
                    count = $('#yelpCount3').val();
                count = count? count : 10;
                var yelpURI = '/search/getYelpData?dest='+ $dest.text() + '&count='+ count + '&term=' + term + '&sort=' + sort;
                $.when($.get(yelpURI)).done(function(res){
                    if (myself.yelp3Markers) myself.removeMarkers(myself.yelp3Markers);
                    myself.geoItems.yelps3 = res;
                    myself.addMarkers(myself.geoItems.yelps3, 2);
                    if (myself.yelp3Markers) myself.clearListView('yelp3');
                    myself.populateYelpListView(myself.geoItems.yelps3, 2, term);
                    myself.updateLegends();
                });
            });
        },
        clearListView: function (category)
        {
            var $list;
            switch (category){
                case 'activity':
                    $list = $('#activity-list');
                    break;
                case 'hotel':
                    $list = $('#hotel-list');
                    break;
                case 'poi':
                    $list = $('#poi-list');
                    break;
                case 'yelp':
                    $list = $('#yelp-list');
                    break;
                case 'yelp2':
                    $list = $('#yelp2-list');
                    break;
                case 'yelp3':
                    $list = $('#yelp3-list');
                    break;
            }
            $list.empty();
        },
        populateHotelListView: function(items)
        {
            var $hotellist = $('#hotel-list');
            for (var i = 0; i < items.length; i++)
            {
                var thumbnail = '<li class="listItem"><img src=' + items[i].image + ' alt="icon" class="listItemthumbnails">',
                    name = '<div class="listItemInfo"><p class="name">' + '<b>' + parseInt(i+1) + '. ' + items[i].name + '</b>' + '</p>',
                    price = '<p class="price">Price: ' + items[i].price + '</p>',
                    starRating = '<p class="starRating">Star-rating: ' + items[i].starRating + '</p>',
                    reviewRating = '<p class="reviewRating">Review: ' + items[i].reviewRating + '</p>',
                    button = '<a target="_blank" class="bookButton" href=' + items[i].url  +'><img class="bookImg" src="../images/Book.png"></a></div></li>';
                $hotellist.append(thumbnail+name+price+starRating+reviewRating+button);
            }
        },
        populateActivityListView: function(items)
        {
            var $hotellist = $('#activity-list');
            for (var i = 0; i < items.length; i++)
            {
                var thumbnail = '<li class="listItem"><img src=' + items[i].image + ' alt="icon" class="listItemthumbnails">',
                    name = '<div class="listItemInfo"><p class="name">' + '<b>'  + parseInt(i+1) + '. ' + items[i].name + '</b>' + '</p>',
                    price = '<p class="price">Price: ' + items[i].price + '</p>',
                    reviewRating = '<p class="reviewRating">Review: ' + items[i].review + '</p>',
                    button = '<a target="_blank" class="bookButton" href=' + items[i].url  +'><img class="bookImg" src="../images/Book.png"></a></div></li>';
                $hotellist.append(thumbnail+name+price+reviewRating+button);
            }
        },
        populateYelpListView: function(items, yelpSearchType, searchTerm)
        {
            var $yelpTab, $yelplist;
            switch(yelpSearchType){
                case 0:
                    $yelpTab = $('.yelptab');
                    $yelplist= $('#yelp-list');
                    break;
                case 1:
                    $yelpTab = $('.yelp2tab');
                    $yelplist= $('#yelp2-list');
                    break;
                case 2:
                    $yelpTab = $('.yelp3tab');
                    $yelplist= $('#yelp3-list');
                    break;
            }
            for (var i = 0; i < items.length; i++)
            {
                var thumbnail = '<li class="listItem"><img src=' + items[i].image + ' alt="icon" class="listItemthumbnails">',
                    name = '<div class="listItemInfo"><p class="name">' + '<b>' + parseInt(i+1) + '. ' + items[i].name + '</b>' + '</p>',
                    reviewRating = '<p class="reviewRating">Review: ' + items[i].review + '</p>',
                    button = '<a target="_blank" class="yelpButton" href=' + items[i].url  +'><img class="yelpImg" src="../images/yelp.png"></a></div></li>';
                $yelpTab.text(searchTerm);
                $yelplist.append(thumbnail+name+reviewRating+button);
            }
        },
        populatePOIListView: function(items)
        {
            var $hotellist = $('#poi-list'),
                alphabet = 'ABCDEFGHIJ';
            for (var i = 0; i < items.length; i++)
            {
                var name = '<li class="listItem"><div class="listItemInfo"><p class="name">' + alphabet[i] + '. ' + items[i].name + '</p></div></li>';
                $hotellist.append(name);
            }
        },
        addMarkers: function(items, yelpSearchType)
        {
            var imageURI = '../markers/',
                imagePNG = '.png',
                alphabet = 'ABCDEFGHIJ',
                imageName,
                markerCategory,
                activitiesCount = 1,
                poisCount = 0,
                hotelsCount = 1,
                yelpCount = 1;

            for (var i = 0; i < items.length; i++)
            {
                var stringLatLong = items[i].latLng.split(',');
                var latlong = new google.maps.LatLng(parseFloat(stringLatLong[0]), parseFloat(stringLatLong[1]));
                var infowindow = new google.maps.InfoWindow();
                var infowindowcontent;

                switch(items[i].type){
                    case 'activity':
                        imageName = 'activities_' + activitiesCount;
                        markerCategory = this.activityMarkers;
                        var img = '<div class="infoWindow"><img src=' + items[i].image + ' alt="icon" class="listItemthumbnails">',
                            name = '<div class="listItemInfo"><p class="name">' + '<b>' + items[i].name + '</b>' + '</p>',
                            price = '<p class="price">Price: ' + items[i].price + '</p>',
                            reviewRating = '<p class="reviewRating">Review: ' + items[i].review + '</p>',
                            button = '<a target="_blank" class="bookButton" href=' + items[i].url  +'><img class="bookImg" src="../images/Book.png"></a></div></div>';
                        infowindowcontent = img+name+price+reviewRating+button;
                        //if( activitiesCount===1 ) this.updateLegend(imageURI+imageName+imagePNG, 'Activity');
                        activitiesCount++;
                        break;
                    case 'poi':
                        imageName = 'brown_' + alphabet[poisCount % alphabet.length]; // Alphabet driven since no sort order
                        markerCategory = this.poiMarkers;
                        infowindowcontent = '<div class="listItemInfo"><p class="name">' + alphabet[i] + '. ' + items[i].name + '</p></div>';
                        //if( poisCount===0 ) this.updateLegend(imageURI+imageName+imagePNG, 'POI');
                        poisCount++;
                        break;
                    case 'yelp':
                        if (yelpSearchType === 0) {
                            imageName = 'red_';
                            markerCategory = this.yelpMarkers;
                        }
                        if (yelpSearchType === 1) {
                            imageName = 'green_';
                            markerCategory = this.yelp2Markers;
                        }
                        if (yelpSearchType === 2) {
                            imageName = 'blue_';
                            markerCategory = this.yelp3Markers;
                        }
                        imageName += yelpCount;
                        var thumbnail = '<div class="infoWindow"><img src=' + items[i].image + ' alt="icon" class="listItemthumbnails">',
                            name = '<div class="listItemInfo"><p class="name">' + '<b>' + parseInt(i+1) + '. ' + items[i].name + '</b>' + '</p>',
                            reviewRating = '<p class="reviewRating">Review: ' + items[i].review + '</p>',
                            button = '<a target="_blank" class="yelpButton" href=' + items[i].url  +'><img class="bookImg" src="../images/yelp.png"></a></div></div>';
                        infowindowcontent = thumbnail+name+reviewRating+button;
                        //if( yelpCount===1 && yelpSearchType===0) this.updateLegend(imageURI+imageName+imagePNG, 'Yelp');
                        if( yelpCount===1 && yelpSearchType===1) {
                            //this.updateLegend(imageURI+imageName+imagePNG,  $('#searchTerm1').val());
                            $('.yelp2tab').css('display', 'block');
                            $('#yelp2-list').css('display', 'block');
                        }
                        if( yelpCount===1 && yelpSearchType===2) {
                            //this.updateLegend(imageURI+imageName+imagePNG, $('#searchTerm2').val());
                            $('.yelp3tab').css('display', 'block');
                            $('#yelp3-list').css('display', 'block');
                        }
                        yelpCount++;
                        break;
                    case 'hotel':
                        imageName = 'hotel_' + hotelsCount;
                        markerCategory = this.hotelMarkers;
                        var thumbnail = '<div class="infoWindow"><img src=' + items[i].image + ' alt="icon" class="listItemthumbnails">',
                            name = '<div class="listItemInfo"><p class="name">' + '<b>' + parseInt(i+1) + '. ' + items[i].name + '</b>' + '</p>',
                            price = '<p class="price">Price: ' + items[i].price + '</p>',
                            starRating = '<p class="starRating">Star-rating: ' + items[i].starRating + '</p>',
                            reviewRating = '<p class="reviewRating">Review: ' + items[i].reviewRating + '</p>',
                            button = '<a target="_blank" class="bookButton" href=' + items[i].url  +'><img class="bookImg" src="../images/Book.png"></a></div></div>';
                        infowindowcontent = thumbnail+name+price+starRating+reviewRating+button;
                        //if( hotelsCount===1 ) this.updateLegend(imageURI+imageName+imagePNG, 'Hotel');
                        hotelsCount++;
                        break;
                }

                var marker = new google.maps.Marker({
                    position: latlong,
                    map: this.map,
                    icon: imageURI+imageName+imagePNG,
                    animation: google.maps.Animation.DROP,
                    info:infowindowcontent
                });

                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(this.info);
                    infowindow.open(map, this);
                });
                markerCategory.push(marker);
            }
            return {};
        },
        removeMarkers:function(items)
        {
            for(i=0; i<items.length; i++){
                items[i].setMap(null);
            }
            return {};
        },
        updateLegend: function(markerIcon, category)
        {
            var legend = document.getElementById('legend');
            var div = document.createElement('div');
            div.innerHTML = '<img src="' + markerIcon + '"> ' + category;
            legend.appendChild(div);
        },
        updateLegends: function()
        {
            var legend = document.getElementById('legend');
            $('#legend').html("");

            if (this.hotelMarkers && this.hotelMarkers.length > 0){
                var div = document.createElement('div');
                div.innerHTML = '<img src="' + '../markers/hotel_1.png' + '"> ' + "Hotel";
                legend.appendChild(div);
            }
            if (this.activityMarkers && this.activityMarkers.length > 0){
                var div = document.createElement('div');
                div.innerHTML = '<img src="' + '../markers/activities_1.png' + '"> ' + "Activity";
                legend.appendChild(div);
            }
            if (this.poiMarkers && this.poiMarkers.length > 0){
                var div = document.createElement('div');
                div.innerHTML = '<img src="' + '../markers/brown_A.png' + '"> ' + "POI";
                legend.appendChild(div);
            }
            if (this.yelpMarkers && this.yelpMarkers.length > 0){
                var div = document.createElement('div');
                div.innerHTML = '<img src="' + '../markers/red_1.png' + '"> ' + $('#searchTerm1').val();
                legend.appendChild(div);
            }
            if (this.yelp2Markers && this.yelp2Markers.length > 0){
                var div = document.createElement('div');
                div.innerHTML = '<img src="' + '../markers/green_1.png' + '"> ' + $('#searchTerm2').val();
                legend.appendChild(div);
            }
            if (this.yelp3Markers && this.yelp3Markers.length > 0){
                var div = document.createElement('div');
                div.innerHTML = '<img src="' + '../markers/blue_1.png' + '"> ' + $('#searchTerm3').val();
                legend.appendChild(div);
            }
        },
        initData: function(date)
        {
            var $dest = $('.dest'),
                $sDate = $('.sDate'),
                $eDate = $('.eDate');

            var activitiesURI = '/search/getActivitiesData?dest=' + $dest.text() + '&sDate=' + this.formatDate($sDate.text()) +
                '&eDate=' +  this.formatDate($eDate.text()) + '&count=' + 10;
            var hotelsURI = '/search/getHotelsData?dest=' + $dest.text() + '&sDate=' + this.formatDate($sDate.text()) +
                '&eDate=' +  this.formatDate($eDate.text()) + '&count=' + 10;
            var yelpURI = '/search/getYelpData?dest='+ $dest.text() + '&count='+ 10 + '&term=' + 'restaurant' + '&sort=' + 2;
            var POIURI = '/search/getPOIData?dest='+ $dest.text() + '&count='+ 10;

            var myself = this;
            $.when($.get(hotelsURI), $.get(activitiesURI), $.get(yelpURI), $.get(POIURI)).done(function(hotels, activities, yelps, pois){
                myself.geoItems = {
                    hotels: hotels[0],
                    activities: activities[0],
                    yelps: yelps[0],
                    pois: pois[0]
                };
            }).done(function(){
                myself.addMarkers(myself.geoItems.hotels, 0);
                myself.addMarkers(myself.geoItems.activities, 0);
                myself.addMarkers(myself.geoItems.yelps, 0);
                myself.addMarkers(myself.geoItems.pois, 0);
                myself.populateHotelListView(myself.geoItems.hotels);
                myself.populateActivityListView(myself.geoItems.activities);
                myself.populatePOIListView(myself.geoItems.pois);
                myself.populateYelpListView(myself.geoItems.yelps, 0, 'Restaurants');
                myself.updateLegends();
            });
        }
    };
    $(window).on('load', function() {
        mapSearch.init();
    });

})(jQuery);
