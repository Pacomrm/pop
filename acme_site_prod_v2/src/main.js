/*-------------------------------*/
/* Acme Demo Website */
/* Autor: Michael Rodriguez Marin*/
/* Version: 2.0*/
/* Date: 28/01/19*/
/*-------------------------------*/

/*Navigation toggle*/
function classToggle() {
  const navs = document.querySelectorAll('.navBar__Items')
  
  navs.forEach(nav => nav.classList.toggle('navBar__ToggleShow'));
  navs.forEach(nav => nav.classList.remove('navBar__Items--right'));
}

document.querySelector('.navBar__Link-toggle').addEventListener('click', classToggle);

var galleryBtn = document.getElementById("galleryBtn"),
    testimonialBtn = document.getElementById("testimonialBtn"),
    teamBtn = document.getElementById("teamBtn"),
    nav = document.getElementById("myHeader"),
    arrowBtn = document.getElementById("arrowUp"),
    menuBtn = document.getElementById("menu-icon"),
    header = document.getElementById("myHeader")
    ;

/*Scroll to sections*/
nav.addEventListener('click', setElements, false);
function setElements(event){
  console.log("si");
  switch (event.target) {
    case testimonialBtn:
        TweenLite.to(window, 2, {scrollTo:{y:"#testimonialSection", offsetY:70,ease: Power4.easeOut}});        
      break;
    case galleryBtn:
        TweenLite.to(window, 2, {scrollTo:{y:"#gallerySection", offsetY:70,ease: Power4.easeOut}});
      break;
      case teamBtn:
        TweenLite.to(window, 2, {scrollTo:{y:"#teamSection", offsetY:70,ease: Power4.easeOut}}); 
      break;
    default:
  }
}
arrowBtn.onclick = function(){
        TweenLite.to(window, 1, {scrollTo:{y:0, offsetY:70,onStart:function(){console.log(this);}}});
        TweenLite.to(arrowBtn, 1, {opacity:0});
};

/*Header Scroll*/
window.addEventListener('scroll', function(e) {
  arrowBtn.hidden = (pageYOffset < document.documentElement.clientHeight);
  if (pageYOffset>300) {
    TweenLite.to(arrowBtn, 1, {visibility:'visible'});
    TweenLite.to(arrowBtn, 1, {opacity:1});
  }
  if(pageYOffset>1500){
    TweenLite.to(arrowBtn, 1, {y:-30});
  }
});


/*Gallery functionality*/
var initPhotoSwipeFromDOM = function(gallerySelector) {

    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i];

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {               
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};

initPhotoSwipeFromDOM('.my-gallery');
