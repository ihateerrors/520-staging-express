var mapModule;
var markers = new Array();

$(document).ready(function () {
    mapModule = function() {
        var map = L.map('map').setView([47.644262, -122.304371], 13);

        //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        //    subdomains: ['a', 'b', 'c']
        //}).addTo(map);

        L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '&copy; Map data ©2019 Google',
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3']
        }).addTo(map);

        return {
            map: map,
        };
    }();
});


function showDetail(activityId) {
    $.post("/place/ForActivity", { activityId: activityId }, function (list) {
        drawPlaces(list);
    }, "json");
}

function showPlaces() {
    
    var startDate = $("#startDate").val();
    var endDate = $("#endDate").val();
    
    var typeList = "";
    var typeBoxes = $("input[name='typeId']");
    $.each(typeBoxes, function(i, typeBox) {
        if (typeBox.checked) {
            if (typeList) {
                typeList += ",";
            }
            typeList += typeBox.value;
        }
    });

    $.post("/place/list", { startDate: startDate, endDate: endDate, typeList: typeList }, function (list) {
        drawPlaces(list);
    }, "json");
}

function clearMap() {
    for (i in mapModule.map._layers) {
        if (mapModule.map._layers[i]._path != undefined) {
            mapModule.map.removeLayer(mapModule.map._layers[i]);
        }
    }
    
    for (var i = 0; i < markers.length; i++) {
        mapModule.map.removeLayer(markers[i]);
    }
    markers = [];
    $("#activityList").empty();

}

function formatDate(date) {
    if (!date) {
        return '';
    }

    if (!date.getYear) {
        date = new Date(parseInt(date.substr(6, 13)));//raw Epoch time
        date = date.toISOString();//convert to ISO timestamp so moment.js can consume it
    }

    if (moment(date).isDST()) {//if we are currently in Daylight Savings Time, add 7 hours, else add 8
        return moment(date).add(7, 'hours').format('MM/DD/YYYY');
    } else {
        return moment(date).add(8, 'hours').format('MM/DD/YYYY');
    }
}


function drawPlaces(list) {
    var bounds = new L.LatLngBounds();

    var sideContents = "";
    var index = 0;
    var maxIndex = 0;
    var activityIndexes = new Object();
    

    $.each(list, function (i, place) {
        var currentPlace = place.Place;
        var activityArray = place.Activities;
        var popContents = "";
        var currentActivityId = "";
        //var iconColor = place.Color;
        
        $.each(activityArray, function (k, activity) {
            var addToSide = true;
            var activityId = activity.ActivityId;
            if (activityIndexes[activityId]) {
                //don't create a new indexID for this, re-use an existing one.
                index = activityIndexes[activityId];

                //dont' add it to the sidebar below, as it's already there.
                addToSide = false;
            }
            else
            {
                maxIndex++;
                index = maxIndex;
                activityIndexes[activityId] = index;
            }
            popContents += '<p class="nomarge"><strong>' + activity.Name + '</strong></p>';

            if (activity.Date && activity.EndDate) {
                popContents += formatDate(activity.Date);
                popContents += " to " + formatDate(activity.EndDate) + "<br/>";
            } else {
                if (activity.Date) {
                    popContents += formatDate(activity.Date) + "<br/>";
                }
            }


            if (activity.StartTime && activity.EndTime) {
                popContents += activity.StartTime;
                popContents += " to " + activity.EndTime + "<br/>";
            }
            popContents += "<p><a href='/activity/view/" + activity.ActivityId + "'>more info</a></p>";
            if (activity.Description) {
                popContents += "<p>" + activity.Description + "</p>";
            }

            $.each(activity.CustomFields, function(fieldIndex, customField) {
                if (customField.CustomFieldName == "Contact Info") {
                    if (customField.CustomFieldDescription) {
                        var contactInfo = customField.CustomFieldDescription;
                        contactInfo = contactInfo.replace("sr520bridge@wsdot.wa.gov", "<a href='mailto:sr520bridge@wsdot.wa.gov'>sr520bridge@wsdot.wa.gov</a><br/>")
                        contactInfo = contactInfo.replace("- 24-hour", "24-hour");
                        popContents += contactInfo  + "<br/>";
                    }
                }
            });

            if (addToSide) {        // where legend items are defined
                if (place.Color == "red") {
                    sideContents += "<div class='leaflet-marker-icon divIconLabel-orange leaflet-zoom-animated leaflet-clickable' tabindex='0'>" + index + "</div>";


                } else if (place.Color == "orange") {
                    sideContents += "<div class='leaflet-marker-icon divIconLabel-orange leaflet-zoom-animated leaflet-clickable' tabindex='0'>" + index + "</div>";
                } else {
                    sideContents += "<div class='leaflet-marker-icon divIconLabel-orange leaflet-zoom-animated leaflet-clickable' tabindex='0'>" + index + "</div>";
                }
                
                sideContents += " <a href='/activity/view/" + activity.ActivityId + "'>" + activity.Name + "</a><br><br>";
                if (activity.Description) {

                }
                sideContents += "</div>";
            }
            currentActivityId = activity.ActivityId;
        });
        // End of place making


        $("#activityList").empty();
        $("#activityList")(sideContents);

        var labelPoint;
        
        if (currentPlace.Point) {
            labelPoint = new L.LatLng(currentPlace.Point.Lat, currentPlace.Point.Lng);
        }
        
        //drawing place
        if (currentPlace.Points) {
            var points = new Array();
            $.each(currentPlace.Points, function (j, point) {
                var latlng = new L.LatLng(point.Lat, point.Lng);
                labelPoint = latlng;
                points.push(latlng);
            });
            bounds.extend(points);

            var options = { color: place.Color, fillOpacity: 0.6 };
            if (currentPlace.GeoEntityTypeId == 1) {
                var polygon = new L.Polygon(points, options).addTo(mapModule.map);
                //use the midpoint of the polygon to place the label
                var pointindex = Math.floor(points.length / 2);
                labelPoint = points[pointindex];
                if (popContents) {
                    polygon.bindPopup(popContents);
                }
            }
            else {
                var polyline = new L.Polyline(points, options).addTo(mapModule.map);
                //use the midpoint of the line to place the label
                var linepointindex = Math.floor(points.length / 2);
                labelPoint = points[linepointindex];
                if (popContents) {
                    polyline.bindPopup(popContents);
                }
            }
        }
        if (index > 0) {
            if (place.Color == "red") {
                var myIcon = L.divIcon({ className: "divIconLabel-red", html: index });
                var marker = L.marker(labelPoint, { icon: myIcon }).addTo(mapModule.map);
                markers.push(marker);
                if (popContents) {
                    marker.bindPopup(popContents);
                }
                bounds.extend(labelPoint);
            } else if (place.Color == "orange") {
                var myIcon = L.divIcon({ className: "divIconLabel-orange", html: index });
                var marker = L.marker(labelPoint, { icon: myIcon }).addTo(mapModule.map);
                markers.push(marker);
                if (popContents) {
                    marker.bindPopup(popContents);
                }
                bounds.extend(labelPoint);
            } else /*if (place.Color == "green")*/ {
                var myIcon = L.divIcon({ className: "divIconLabel-green", html: index });
                var marker = L.marker(labelPoint, { icon: myIcon }).addTo(mapModule.map);
                markers.push(marker);
                if (popContents) {
                    marker.bindPopup(popContents);
                }
                bounds.extend(labelPoint);
            }         
        }
    });
    mapModule.map.fitBounds(bounds);
}





