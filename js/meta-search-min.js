(function(m, A) {
	var a = {},
		n = $("#meta-search-panel"),
		h = n.find("#meta-search-header"),
		w = h.find("#meta-search-close"),
		p = h.find("#meta-search-box"),
		r = p.find("#meta-search-input-box"),
		u = r.find("#meta-search-input"),
		v = p.find("#meta-search-button"),
		x = h.find("#meta-search-suggest"),
		g = h.find("#meta-search-menu"),
		y = h.find("#meta-search-menu-cursor"),
		z = n.find("#meta-search-body");
	$.extend(!0, a, {
		metaSearchPanelView: n,
		metaSearchHeaderView: h,
		metaSearchMenuView: g,
		metaSearchCloseButtonView: w,
		metaSearchBoxView: p,
		metaSearchMenuCursorView: y,
		metaSearchInputBoxView: r,
		metaSearchInputView: u,
		metaSearchSuggestView: x,
		metaSearchButtonView: v,
		metaSearchBodyView: z,
		metaSearchUrl: "",
		metaSearchTypes: ["baidu", "bing", "sogou", "haoso", "google"],
		metaSearchEngines: [{
			type: "baidu",
			url: baidu_search_url,
			queryParam: "wd"
		}, {
			type: "bing",
			url: bing_search_url,
			queryParam: "q"
		}, {
			type: "sogou",
			url: sogou_search_url,
			queryParam: "query"
		}, {
			type: "haoso",
			url: haosou_search_url,
			queryParam: "q"
		}],
		metaSearchIframeStates: {},
		metaSearchEngineType: null,
		metaSearchEngineMenu: null,
		search_suggest_item: null,
		search_suggest_item_index: -1,
		isOverInSuggest: !1,
		search_suggest_version: null,
		search_keyword: "",
		searchInputShakeing: !1,
		init: function(b, d) {
			a.metaSearchEngineType = d; - 1 == a.metaSearchTypes.indexOf(d) && (a.metaSearchEngineType = a.metaSearchTypes[0]);
			var c = g.find("#meta-search-menu-baidu");
			"bing" == a.metaSearchEngineType ? c = g.find("#meta-search-menu-bing") : "sogou" == a.metaSearchEngineType ? c = g.find("#meta-search-menu-sogou") : "haoso" == a.metaSearchEngineType && (c = g.find("#meta-search-menu-haoso"));
			null != c && (a.metaSearchEngineMenu = c, a.setCursorPosition(c, a.metaSearchEngineType));
			a.invokeSearch(b, a.metaSearchCallback)
		},
		stopDefault: function(a) {
			a && a.preventDefault ? a.preventDefault() : m.event.returnValue = !1;
			return !1
		},
		metaSearchCallback: function(b) {
			var d = a.metaSearchMenuView,
				c = staticServerURI + "/images/icon/",
				e = "baidu.png";
			"bing" == b ? (a.metaSearchIframeStates.bing.loaded = !0, e = "bing.png", b = "meta-search-menu-bing") : "sogou" == b ? (a.metaSearchIframeStates.sogou.loaded = !0, e = "sogou.png", b = "meta-search-menu-sogou") : "haoso" == b ? (a.metaSearchIframeStates.haoso.loaded = !0, e = "360.png", b = "meta-search-menu-haoso") : (a.metaSearchIframeStates.baidu.loaded = !0, b = "meta-search-menu-baidu");
			d.find("#" + b + " span:last").css("background-image", "url('" + c + e + "')")
		},
		searchCallback: function(a, d, c) {
			var b = this;
			b.searchEngineType = d;
			b.callback = c;
			b.run = function() {
				b.callback && b.callback(b.searchEngineType)
			};
			a.attachEvent ? a.attachEvent("onload", function() {
				a.detachEvent("onload", null);
				b.run()
			}) : a.onload = function() {
				a.onload = null;
				b.run()
			}
		},
		invokeSearch: function(b, d) {
			for (var c = a.metaSearchEngines, e = null, f, k = function(a, b) {
					this.iframe = a;
					this.url = b;
					this.run = function(a) {
						var b = this.iframe,
							c = this.url;
						setTimeout(function() {
							b.src = c
						}, a)
					}
				}, l = 0, h = c.length; l < h; l++) {
				e = c[l];
				f = a.getMetaSearchIframe(e.type);
				$.isEmptyObject(f) && (f = document.createElement("iframe"), f.id = a.generateSearchIframeId(e.type), f.style.display = e.type == a.metaSearchEngineType ? "block" : "none", f.className = "meta-search-iframe", f.height = "100%", f.align = "top", f.frameborder = "0", "sogou" == e.type ? f.style.top = "5px" : "haoso" == e.type ? (f.style.top = "-5px", f.style.height = "calc(100% + 5px)") : "bing" == e.type ? (f.style.top = "-45px", f.style.height = "calc(100% + 45px)") : "google" == e.type && (f.style.top = "-106px", f.style.height = "calc(100% + 106px)"), a.metaSearchBodyView.append(f));
				a.metaSearchIframeStates[e.type] = {
					version: (new Date).getTime(),
					loaded: !1
				};
				new a.searchCallback(f, e.type, d);
				var g = e.url + "?" + e.queryParam + "=" + b;
				e.type != a.metaSearchEngineType ? (new k(f, g)).run(500 * l) : f.src = g
			}
		},
		generateSearchIframeId: function(a) {
			return "metaSearch" + a + "Iframe"
		},
		getMetaSearchIframe: function(b) {
			return document.getElementById(a.generateSearchIframeId(b))
		},
		get_search_suggests: function(b, d) {
			a.search_suggest_version = (new Date).getTime();
			$.ajax({
				url: "/front/suggest/",
				type: "get",
				async: !0,
				timeout: 5E3,
				data: {
					wd: b,
					_rd: a.search_suggest_version
				},
				dataType: "json",
				success: function(b) {
					try {
						$.isEmptyObject(b) || b._rd != a.search_suggest_version || (a.render_search_suggests(b.s), d && d())
					} catch (e) {}
				}
			})
		},
		render_search_suggests: function(b) {
			a.clear_suggests();
			for (var d = document.createDocumentFragment(), c = 0, e = b.length; c < e && 10 != c; c++) {
				var f = document.createElement("div"),
					k = "meta-suggest-item";
				9 == c && (k += " meta-suggest-item-end");
				f.className = k;
				d.appendChild(f);
				k = document.createElement("span");
				k.className = "meta-suggest-keyword";
				k.innerHTML = b[c];
				f.appendChild(k)
			}
			b = a.metaSearchSuggestView;
			b.append(d);
			d = b.find(".meta-suggest-item");
			$(d).on("mouseover mouseout click", function(b) {
				"click" == b.type ? (a.metaSearchInputView.val($($(this).find("span").get(0)).text()), a.isOverInSuggest = !1, a.hide_suggests(), a.submitSearch()) : "mouseover" == b.type ? ($.isEmptyObject(a.search_suggest_item) || a.search_suggest_item.removeClass("meta-suggest-item-current"), a.search_suggest_item = $(this), a.search_suggest_item_index = a.search_suggest_item.index(), a.search_suggest_item.addClass("meta-suggest-item-current"), a.isOverInSuggest = !0) : "mouseout" == b.type && ($.isEmptyObject(a.search_suggest_item) || a.search_suggest_item.removeClass("meta-suggest-item-current"), a.search_suggest_item = null, a.isOverInSuggest = !1)
			})
		},
		hide_suggests: function(b, d) {
			a.metaSearchSuggestView.hide();
			a.metaSearchBoxView.removeClass("meta-search-box-foucs");
			a.search_suggest_item = null;
			a.search_suggest_item_index = -1;
			b && a.clear_suggests();
			d && d()
		},
		show_suggests: function(b, d) {
			a.metaSearchSuggestView.show();
			a.metaSearchBoxView.addClass("meta-search-box-foucs");
			d && d()
		},
		clear_suggests: function(b) {
			a.metaSearchSuggestView.empty()
		},
		submitSearch: function() {
			var b = a.metaSearchInputView.val();
			if ("" == b) return a.searchInutViewShake(), !1;
			b = a.metaSearchUrl + "?q=" + encodeURIComponent(b) + "&t=" + a.metaSearchEngineType;
			m.location.href = b
		},
		setCursorPosition: function(b, d, c) {
			var e = a.metaSearchMenuCursorView;
			e.animate({
				left: b.outerWidth() / 2 + b.position().left - 8
			}, c || 200, function() {
				var a = staticServerURI + "/images/icon/",
					b = "baidu_cursor.png";
				"bing" == d ? b = "bing_cursor.png" : "sogou" == d ? b = "sogou_cursor.png" : "haoso" == d ? b = "360_cursor.png" : "google" == d && (b = "google_cursor.png");
				e.css("background-image", "url('" + a + b + "')")
			})
		},
		searchInutViewShake: function() {
			a.searchInputShakeing || (a.searchInputShakeing = !0, a.metaSearchBoxView.animate({
				left: "-10px"
			}, 50).animate({
				left: "10px"
			}, 100).animate({
				left: "-10px"
			}, 100).animate({
				left: "10px"
			}, 100).animate({
				left: "0px"
			}, 50, function() {
				a.searchInputShakeing = !1
			}))
		}
	});
	v.on("click", function(b) {
		"click" == b.type && a.submitSearch()
	});
	u.on("input propertychange focus blur keydown", function(b) {
		if ("input" == b.type || "propertychange" == b.type) {
			b = a.metaSearchInputView.val();
			if (b == a.search_keyword) return !1;
			a.search_keyword = b;
			"" == b ? a.hide_suggests() : a.get_search_suggests(b, function(b) {
				0 == b ? a.hide_suggests() : a.show_suggests()
			})
		} else if ("focus" == b.type) 0 < a.metaSearchSuggestView.children("div").length && a.search_keyword == a.metaSearchInputView.val() && a.show_suggests();
		else if ("blur" == b.type) {
			if (a.isOverInSuggest) return a.stopDefault(b);
			a.hide_suggests()
		} else if ("keydown" == b.type) {
			if (13 == b.keyCode) return a.submitSearch(), !1;
			$.isEmptyObject(a.search_suggest_item) || a.search_suggest_item.removeClass("meta-suggest-item-current");
			var d = a.metaSearchSuggestView.children("div");
			38 == b.keyCode ? (-1 == a.search_suggest_item_index ? (a.search_suggest_item_index = d.length - 1, a.search_suggest_item = $(d.get(a.search_suggest_item_index)), a.search_suggest_item.addClass("meta-suggest-item-current")) : (a.search_suggest_item_index--, -1 != a.search_suggest_item_index ? (a.search_suggest_item = $(d.get(a.search_suggest_item_index)), a.search_suggest_item.addClass("meta-suggest-item-current")) : a.search_suggest_item = null), b.preventDefault()) : 40 == b.keyCode && (a.search_suggest_item_index++, a.search_suggest_item_index == d.length ? (a.search_suggest_item_index = -1, a.search_suggest_item = null) : (a.search_suggest_item = $(d.get(a.search_suggest_item_index)), a.search_suggest_item.addClass("meta-suggest-item-current")));
			if (38 == b.keyCode || 40 == b.keyCode) $.isEmptyObject(a.search_suggest_item) ? a.metaSearchInputView.val(a.search_keyword) : a.metaSearchInputView.val(a.search_suggest_item.find("span").text())
		}
	});
	g.find(".meta-search-menu-item").on("mousedown mouseover mouseout mouseup", function(b) {
		var d = $(this),
			c = d.find("span:last");
		if ("mousedown" == b.type) {
			c.removeClass("icon-hover");
			c.addClass("icon-click");
			b = a.metaSearchEngineType;
			c = d.attr("id");
			c = "meta-search-menu-bing" == c ? a.metaSearchEngineType = "bing" : "meta-search-menu-sogou" == c ? a.metaSearchEngineType = "sogou" : "meta-search-menu-haoso" == c ? a.metaSearchEngineType = "haoso" : "meta-search-menu-google" == c ? a.metaSearchEngineType = "google" : a.metaSearchEngineType = "baidu";
			var e = a.metaSearchBodyView,
				f = e.find("#" + a.generateSearchIframeId(c));
			b != c && (a.metaSearchEngineMenu = d, a.setCursorPosition(d, c), $.isEmptyObject(b) || e.find("#" + a.generateSearchIframeId(b)).hide(), f.show())
		} else "mouseup" == b.type ? (c.removeClass("icon-click"), c.addClass("icon-hover")) : "mouseover" == b.type ? c.addClass("icon-hover") : "mouseout" == b.type && c.removeClass("icon-click icon-hover")
	});
	m.MyMetaSearch = a
})(window, void 0);
$(function() {
	$(window).bind("resize", function() {
		MyMetaSearch.setCursorPosition(MyMetaSearch.metaSearchEngineMenu, MyMetaSearch.metaSearchEngineType, 0)
	});
	MyMetaSearch.init(q, t)
});