(function($){
     var MEETUP = 'https://meetup.com'
     , T = {
         glink: function(p) {
             return [MEETUP, p.photo_album.group.urlname].join('/');
         }
         , plink: function(p){
           return [T.glink(p)
                   , 'photos'
                   , p.photo_album.photo_album_id
                   , p.photo_id].join('/');
         }
         , elink: function(p) {
             return [T.glink(p), 'events', p.photo_album.event.id].join('/');
         }
         , mlink:  function(p, t) {
             return [T.glink(p), 'members', p.member.member_id].join('/');
         }
         , a: function(href, txt) {
             return ['<a href="',href,'" target="_blank">',txt,'</a>'].join('');
         }
         , desc: function(p) {
             return p.photo_album.event ?
                  [T.a(T.mlink(p), p.member.name)
                  , " at "
                  , T.a(T.elink(p), p.photo_album.event.name)
                  , " with "
                  , T.a(T.glink(p), p.photo_album.group.name)].join('')
                  : [T.a(T.mlink(p), p.member.name)
                  , " with "
                  , T.a(T.glink(p), p.photo_album.group.name)].join('');
         }
         , img: function(src, classes, alt){
             return ['<img src="',src,'" alt="',(alt||'Group Photo'),'" class="',(classes||''),'"/>'].join('');
         }
         , div:  function(content, classes) {
             return ['<div class="',(classes||''),'">', content, '</div>'].join('');
         }
         , thumb: function(p) {
             return ['<a href="',T.plink(p),'" target="_blank" class="thumb"><span>',T.img(p.photo_link, "pho"),'</span></a>'].join('');
         }
         , full: function(p) {
            return T.div(['<a href="',T.plink(p)
                          ,'" class="full" target="_blank"><span>'
                          ,T.img(p.photo_link, "pho")
                          ,'</span></a>', T.div(T.desc(p))].join(''));
        }
    }
    , Flagged = ['entrepreneur'
        , 'workathome'
        , 'networkmarket'
        , 'figuredrawing'
        , 'modeling'
        , 'wingman',
        , 'model-photography'
        , 'studio-photography']
    , inappropriate = function(t) {
        return Flagged.indexOf(t.urlkey) !== -1;
    }, PHOH = 150, TBPAD = 75;

    $(function() {
        var bg = $("#bg .reel")
        , fg = $("#fg .reel")
        , hl = $("#highlight")
        , queue = []
        , data = []
        , calculateCells = function() {
            /* floor of window.height-padding / photo height */
            var c = 0|(($(window).height()-TBPAD) / PHOH);
            /* ensure an odd number of cells, so center represents focused */
            return (c % 2 !== 0) ? c : c - 1;
        }
        , cells = calculateCells()
        , focusedPhoto = function() {
             var mint = hl.offset().top
            , maxt = mint + PHOH
            , thumbs = $("#bg div.reel .t");
            for(var i = 0, tl = thumbs.size(); i<tl; i++) {
                var t = $(thumbs[i]);
                if(t && t.offset){
                    var ttop = t.offset().top;
                    if(ttop >= mint && ttop <=maxt) {
                        return t.data();
                    }
                }
            }
            return null;
        }
        , refocus = function() {
            var focused = focusedPhoto();
            if(focused) {
                fg.find("div.focused").html(T.div(T.full(focused), "f"));
            }
        }
        , poll = function() {
            var photo = queue.shift();
            if(photo) {
                data.push(photo);
                var thumb = $(T.div(T.thumb(photo), "t")).data(photo);
                thumb.find("img.pho").load(function() {
                   var thumbs = bg.find("div.t")
                    , offset = 10
                    , ftop = thumbs[0]
                        ? parseInt($(thumbs[0]).css("top").replace("px",""))
                        : 0
                    , htopmin = hl.offset().top
                    , htopmax = htopmin + PHOH;
                    var top = thumbs.size() === 0 || (
                        ftop+offset >= htopmin && ftop+offset <= htopmax
                        )
                        ? (PHOH*(0|cells/2)) - offset /* middle (20?) */
                        : ftop - PHOH - 2;
                    thumbs.css({top:top});
                    bg.prepend(thumb)
                    thumb.animate({top:top}, 800, function(){
                        refocus();
                    });
               });
            }
        }
        , onResize = function() {
            cells = calculateCells();
            bg.css({'height':cells*PHOH+"px"});
            hl.css({'top':((0|cells/2))*PHOH+"px"});
            refocus();
        };
        onResize();
        $(window).resize(onResize);
        $("#earlier").bind('click', function(e){
            e.preventDefault();
            if(!$(this).hasClass("odisabled")) {
                $("#bg .reel div.t").animate({top:"-="+PHOH}, 500, function(){
                   refocus();
                });
            }
            return false;
        });
        $("#later").bind('click', function(e){
            e.preventDefault();
            if(!$(this).hasClass("odisabled")) {
                $("#bg .reel div.t").animate({top:"+="+PHOH}, 500, function(){
                   refocus();
                });
            }
            return false;
        });
        setInterval(poll, 3000);
        must.Stream({
            url: "https://stream.dev.meetup.com:8100/2/photos",
            callback: function(photo) {
                var topics = photo.photo_album.group.group_topics;
                if(!topics || topics.filter(inappropriate).length<1) {
                    queue.push(photo);
                }
            }
        });
    });
})(jQuery);
