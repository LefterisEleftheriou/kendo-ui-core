(function($, window) {
var visitor = window.visitor,
    slideshow = window.slideshow,
    IMAGESIZES = ["_s", "_t", "_m"],
    imageSize = IMAGESIZES[0],
    template = function(size) { return '<li alt="thumbnail"><img src="http://farm<%=farm%>.static.flickr.com/<%=server%>/<%=id%>_<%=secret%>' + size + '.jpg"></li>'; },
    dataSource = new kendo.data.DataSource({
        page: 1,
        pageSize: 5,
        serverSorting: true,
        transport: {
            read: {
                url: flickr.service,
                cache: true,
                dataType: "json"
            },
            cache: "localstorage",
            dialect: {
                read: function(data) {
                    var params = {
                        text: $("#searchBox").val(),
                        extras: "owner_name,tags",
                        per_page: 500
                    };
                    return flickr.searchParams(params);
                }
            }
        },
        reader: {
            data: function(result) {
                return result.photos.photo;
            },
            total: function(result) {
                return Math.min(result.photos.total, 500);
            }
        }
    }),
    mostPopularDataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: flickr.service,
                cache: true,
                dataType: "json"
            },
            cache: "localstorage",
            dialect: {
                read: function(data) {
                    var params = {
                        extras: "owner_name,tags",
                        per_page: 100
                    };
                    return flickr.mostPopularParams(params);
                }
            }
        },
        reader: {
            data: function(result) {
                return result.photos.photo;
            }
        }
    });

   function displayImages(element) {
       element.find("img")
           .hide()
           .bind("load", function() {
               $(this).fadeIn();
           });
   }

   function showSelectedPhoto(ui) {
       $("#flatSearchPhotos").show();

       ui.element.parent().hide();

       showSelectedPhoto($("img:first", ui.selectable.value()).attr("src").replace("_s", ""));

       dataSource.query({page: 1, pageSize: 500});
   }

   function setBigPhoto(src) {
       var bigPhoto = $("#bigPhoto");
       var loader = $("img.loader");

       if (loader[0]) {
           loader.remove();
       } else {
           bigPhoto.after("<div class='loading'>Loading ...</div>");
       }

       loader = $("<img class='loader' />")
           .hide()
           .appendTo(document.body)
           .attr("src", src)
           .bind("load", function() {
               loader.remove();
               bigPhoto.next(".loading")
               .remove()
               .end()
               .stop(true, true)
               .fadeOut(function() {
                   bigPhoto.attr("src", src);
               })
               .fadeIn();
           });
   }

   window.visitor = {
        mostPopular: function() {
            this.thumbList.append( $("#flatMostPopularPhotos").kendoListView({
                dataSource: mostPopularDataSource,
                template: template("_s"),
                dataBound: function() {
                    var li = this.element.find("li:first");
                    this.selectable.value(li);
                    displayImages(this.element);
                },
                change: function() {
                    setBigPhoto(this.selected().find("img").attr('src').replace("_s", ""));
                }
            }));
        },
        search: function(el) {
            if($("#searchBox").val()) {
                this.searchResult();
                $("#flatMostPopularPhotos").hide();
                $("#flatSearchPhotos").hide();
                $("#mainTemplate").show();
            }
            $("#backButton").text("Back to most popular").data("currentView", "mainTemplate");
            slideshow.init($("#flatSearchPhotos").data("kendoListView"));
        },

        searchResult: function () {
            if(this._searchInitialized){
                dataSource.query({page: 1, pageSize: 5});
                return;
            }
            this._searchInitialized = true;

            $(".paging").kendoPager({ dataSource: dataSource });

            $("#flatSearchPhotos").kendoListView({
                dataSource: dataSource,
                template: template("_s"),
                dataBound: function() {
                    displayImages(this.element);
                },
                change: function() {
                    setBigPhoto(this.selected().find("img").attr('src').replace("_s", ""));
                }
            });
            $("#mainPhotoGrid").kendoGrid({
                dataSource: dataSource,
                pageable: $(".paging").data("kendoPager"),
                selectable: true,
                columns: [
                    { template: '<img src="http://farm<%=farm%>.static.flickr.com/<%=server%>/<%=id%>_<%=secret%>_s.jpg">', title: "PHOTO" },
                    { field: "ownername", title: "AUTHOR" },
                    { field: "title", title: "TITLE" },
                    { field: "tags", title: "TAGS"}
                ],
                change: function() {
                    showSelectedPhoto(this);
                },
                dataBound: function() {
                    displayImages(this.element);
                }
            });

            $("#mainPhotoStrip").kendoListView({
                dataSource: dataSource,
                template: template(imageSize),
                dataBound: function() {
                    displayImages(this.element);
                },
                change: function() {
                    showSelectedPhoto(this);
                }
            })
            .hide();

            $("#slider").kendoSlider({
                orientation: "vertical",
                minValue: 0,
                maxValue: 2,
                largeStep: 1,
                change: function() {
                    imageSize = IMAGESIZES[this.value()];
                    $("#mainPhotoStrip").data("kendoListView").template = kendo.template(template(imageSize));
                    dataSource.read();
                }
            })
            .parent().hide();

            $("#grid").click(function() {
                $("#mainPhotoStrip").hide();
                $("#slider").parent().hide();
                $("#mainPhotoGrid").show();
            });

            $("#listView").click(function(e) {
                $("#mainPhotoGrid").hide();
                $("#mainPhotoStrip").show();
                $("#slider").parent().show();
            });

            $("#backButton").bind("click", function(){
                var element = $(this),
                    view = element.data("currentView");
                if(view === "flatMostPopularPhotos") {
                    element.data("currentView", "mainTemplate");
                    $("#flatSearchPhotos").hide();
                    $("#mainTemplate").show();
                    $("#flatMostPopularPhotos").hide();
                    element.text("Back to most popular");
                    slideshow.init($("#flatSearchPhotos").data("kendoListView"));
                }
                else if(view === "mainTemplate"){
                    element.data("currentView", "flatMostPopularPhotos");
                    $("#flatSearchPhotos").hide();
                    $("#mainTemplate").hide();
                    $("#flatMostPopularPhotos").show();
                    element.text("Back to search results");
                    slideshow.init($("#flatMostPopularPhotos").data("kendoListView"));
                }
            });

            this.thumbList.append($("#flatSearchPhotos"));
        },
        initVisitor: function() {
            $(".i-search").unbind("click").click($.proxy(this.search, this));
            $("#searchBox").bind("change", function() { $(".i-search").click(); });

            this.thumbList = new kendo.ui.Scroller($('<div class="thumb-list">').appendTo("#footer")).scrollElement;

            this.mostPopular();

            $("#backButton").text("");

            slideshow.init($("#flatMostPopularPhotos").data("kendoListView"));
            $("#viewslideshow").click(function() {
                  slideshow.toggle();
            });
        }
   };
})(jQuery, window);
