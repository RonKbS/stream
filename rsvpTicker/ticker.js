var details = $("#details"), uuid = 0, meetMarkers = [], rsvps = [],
cleanupInterval = 2000, domrm = function(rid) {
    var p = $("#"+rid);
    p.animate({opacity:0, svgR:0}, 1500, function() {
        if(p.HasBubblePopup()) {
            p.RemoveBubblePopup();
        }
        p.remove();
    });
}, cleanup = function() {
    var expiry = 1800000, cutoff = new Date() - expiry;
    var i = 0;
    while(i < rsvps.length && rsvps[i].time < cutoff) {
        domrm(rsvps[i].id);
        i++;
    }
    if (i > 0) rsvps.splice(0, i)
};
setInterval(cleanup, cleanupInterval);

var updateTimes = function() {
    $(".rsvp .time").each(function() {
        var elem = $(this);
        elem.text(mu.Time.ago(elem.attr('mtime')));
    });
}
setInterval(updateTimes, 1000);



var stm = must.Rsvps(function(rsvp) {

    if ( rsvp.response === "yes") {
    	var now = new Date();
    	rsvp.systime = now.getTime();
        var imgCode = "";
        if (rsvp.member.photo != undefined) {
    	 	imgCode = '<img src="'+rsvp.member.photo+'" />';
        }

        msg = ['<div class="rsvp"><span class="member-photo">',imgCode,
				 '</span><div class="member-info"> <span class="member">', rsvp.member.member_name,
                 '</span><span class="will-mup"> will meetup with</span><br/> ',
                 '<span class="group">', rsvp.group.group_name,
                 '</span><br/><span class="place">in ', rsvp.group.group_city, ', ',
                 (rsvp.group.group_state ? rsvp.group.group_state : rsvp.group.group_country).toUpperCase(),
                 '</span><br/> <span class="time" mtime="', rsvp.systime,
                 '">', mu.Time.ago(rsvp.systime), '</span></div></div>'].join('');

        /* push this map entry in a queue to be removed from the dom at a given time */
        rsvps.push({ id: "r-"+uuid++, time: +new Date() });

    	var depth = Math.min(rsvps.length, 60);
        if (depth > 1) {
        	var rate = (depth - 1) * 60 * 1000 / (rsvps[rsvps.length-1].time - rsvps[rsvps.length - depth].time);
            // $("#r").text(Math.round(rate));
        }

        var details = $("#rsvp-detail"),
            detail = $(msg).hide(),
            showDetail = function() {
            let popup = L.popup()
                // .setLatLng(latlng)
                .setContent(msg)

            //   add to map
            if (meetMarkers.length === 10) {
                meetupMap.removeLayer(meetMarkers[meetMarkers.length - 1]);
                meetMarkers.pop()
            }
            meetMarkers.forEach(marker => marker.closeTooltip())
            meetMarkers.unshift(L.marker(
                [rsvp.group.group_lat, rsvp.group.group_lon]
            ).bindPopup(popup).addTo(meetupMap));
            meetMarkers[0].bindTooltip(
                `${rsvp.member.member_name} will meetup with
                 ${rsvp.group.group_name} in ${rsvp.group.group_city}`
            ).openTooltip(); //To open the tooltip

            };
          setTimeout(showDetail, 500);
    }
});

$(window).on("unload", function() {
  $("*").add(document).off();
});
setTimeout(function() {
  // you win, memory leaks! (reload after 6 hours)
  window.location.reload();
}, 21600000);
