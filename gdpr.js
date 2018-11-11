/*
 * GDPR security script
 */
var gdpr = {

	expire_day : 90,
	gif_src : "fade.jpg",

	oWindow : {
		minWidth:220, minHeight:150, maxWidth:450, maxHeight:350, widthScale:90, heightScale:90,
		title : "Title",
		text : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dapibus neque nec suscipit euismod. Aliquam tempus mollis purus vel fermentum. Donec id bibendum quam, non rhoncus arcu. Ut quis risus dolor. Quisque viverra tempor sem, vel pretium est feugiat nec. In eget tortor mauris.",
		footer : "*Phasellus vulputate lorem metus, egestas accumsan diam tempor eget. Curabitur pulvinar fringilla rhoncus.",
		closeButton : "Save"
	},

    options : {
		"IDs_1" : { text: 'Lorem ipsum 1 (Simple checkbox)',           					value: null, enabled: true },
		"IDs_2" : { text: 'Lorem ipsum 2 (FB Pixel indicator)', 						value: null, enabled: true, 'call': function () {return gdpr.fbPixel('fbpxexamplecode');}},
		"IDs_3" : { text: 'Lorem ipsum 3 (Google analitics indicator)', 				value: null, enabled: true, 'call': function () {return gdpr.ga('UA-analitics-code');}},
		"IDs_4" : { text: 'Lorem ipsum 4 (Without this confirmation will reopen gdpr window on every page)', 	value: null, enabled: true, required: true }
	},

	iFullWidth : 0,
	iFullHeight : 0,
	bFirstRun : true,
	oFade : null,
	is_loaded : false,

	init : function (obj)
	{
		if (gdpr.is_loaded) return;
		console.log ('Initial GDPR Script');
		gdpr.is_loaded = true;

		var is_configured = true;
		for (var opt_id in gdpr.options)
		{
			var value = gdpr.getValue (opt_id);
			if (value == null) {
				is_configured = false;
				gdpr.options [opt_id].value = 'declie';
				gdpr.setValue (opt_id);
			}
			if (typeof (gdpr.options [opt_id].required) == "boolean" && gdpr.options [opt_id].required == true && gdpr.options [opt_id].value != 'accept') is_configured = false;
			if (value == 'accept' && typeof (gdpr.options [opt_id].call) == 'function') gdpr.options [opt_id].call ();
		}
        window[addEventListener ? 'addEventListener':'attachEvent'] (addEventListener?'resize':'onresize', gdpr.Viewport);
	},

	setValue : function (id)
	{
		var isClean = (typeof (gdpr.options [id]) == "undefined" || typeof (gdpr.options [id].value) == "undefined") ? true : false;
		var d = new Date(); d.setTime(d.getTime() + (gdpr.expire_day *24*60*60*1000));
		var expires = (isClean === false) ? "expires="+ d.toUTCString() : "expires=Thu, 01 Jan 1970 00:00:00 UTC";
		var value = (isClean === false) ? gdpr.options [id].value : "";

		document.cookie = id + "=" + value + ";" + expires + ";path=/";
		if (typeof(Storage) !== "undefined") {
			try
			{
				if (isClean === true) localStorage.removeItem(id);
				else localStorage.setItem(id, value);
			} catch (e) { console.log ("gdpr.setValue ["+id+"]: "+e.message); }
		}
		return (!isClean);
	},

	getValue : function (id)
	{
		var name = id + "=";
		var is_option = (typeof(gdpr.options [id]) == "undefined") ? false : true;
		var decodedCookie = decodeURIComponent(document.cookie);
		var cookies = decodedCookie.split(';');
		var value = null;

		for (var index in cookies)
		{
			var c = cookies [index];
			while (c.charAt (0) == ' ') c = c.substring(1);
			if (c.indexOf(name) == 0) {
				value = c.substring(name.length, c.length);
				break;
			}
		}

		if (typeof(Storage) != "undefined") {
			try
			{
				var tmp = localStorage.getItem (id);
				if (tmp != value && is_option) {
					gdpr.options [id].value = (tmp != null) ? tmp : value;
					gdpr.setValue (id);
					value = gdpr.options [id].value;
				} else {
					if (tmp != value && tmp != null) value = tmp;
				}
			} catch (e) { console.log ("gdpr.getValue ["+id+"]: "+e.message); }
		}
        if (!is_configured) gdpr.show();
		if (is_option) gdpr.options [id].value = value;
		return value;
	},

	change : function (obj)
	{
		if (typeof(gdpr.options[obj.id]) == "undefined") return;
		var value = (obj.checked === false) ? 'declie' : 'accept';
		gdpr.options[obj.id].value = value;
		gdpr.setValue (obj.id);
	},

	setAlpha : function (obj, precentage)
	{
		try { obj.filters.alpha.opacity = precentage; }
		catch (err) { obj.style.opacity = (precentage / 100); }
	},

	bEnabled : false,
	show : function (needReload)
	{
		needReload = (typeof(needReload) == "undefined") ? false : needReload;

		if (!document.getElementById ('windowGdpr') && gdpr.bEnabled == false) {
			gdpr.bEnabled = true;
			if (gdpr.bFirstRun) {
				var img = document.createElement('IMG');
				img.src = gdpr.gif_src;
				img.id = 'GtkFadeGif';
				img.style.position = "fixed";
				img.style.top = "0px";
				img.style.left = "0px";
				img.style.zIndex = 10000;
				document.getElementsByTagName ("body") [0].insertBefore (img, document.getElementsByTagName ("body")[0].lastChild);
				gdpr.oFade = document.getElementById ('GtkFadeGif');

				gdpr.oFade.style.left = 0 + "px";
				gdpr.oFade.style.top = 0 + "px";
				gdpr.setAlpha (gdpr.oFade, 0);

				gdpr.bFirstRun = false;
				console.log ('fade added');
				gdpr.Viewport (true);
			}

			var box = document.createElement ("DIV");
			box.id = "windowGdpr";
			if (gdpr.oWindow.title != "") {
				var title = document.createElement ('H1');
				title.innerHTML = gdpr.oWindow.title;
				box.appendChild (title);
			}

			if (gdpr.oWindow.text != "") {
				var text = document.createElement ('P');
				text.innerHTML = gdpr.oWindow.text;
				box.appendChild (text);
			}

			var ul = document.createElement ("UL");
			for (var opt_id in gdpr.options)
			{
				var li = document.createElement ("LI");
				var value = (gdpr.options [opt_id].value === 'accept') ? ' checked="checked"' : '';
				var enabled = (typeof (gdpr.options [opt_id].enabled) != "undefined" && gdpr.options [opt_id].enabled === false) ? " disabled" : "";
				if (typeof (gdpr.options [opt_id].required) == "boolean" && gdpr.options [opt_id].required == true) li.className = "opt-require";
				li.innerHTML = "<label for=\""+ opt_id +"\"><input" + value + " onchange=\"gdpr.change(this)\" type=\"checkbox\" id=\""+ opt_id +"\" "+ enabled +"/>"+ gdpr.options [opt_id].text +"</label>";
				ul.appendChild (li);
			}
			box.appendChild (ul);

			if (gdpr.oWindow.footer != "") {
				var footer = document.createElement ('span');
				footer.innerHTML = gdpr.oWindow.footer;
				box.appendChild (footer);
			}

			box.innerHTML += "<div><input type=\"button\" onclick=\"gdpr.show (true)\" value=\""+ gdpr.oWindow.closeButton +"\" /></div>";
			document.body.appendChild (box);
			gdpr.redrawWindow (true);

		} else {
			if (gdpr.bEnabled == true) {
				if (needReload) location.reload ();
				else {
					gdpr.bEnabled = false;
					var rm = document.getElementById ("windowGdpr");
					rm.remove();
				}
			}
			gdpr.redrawWindow (false);
		}
	},

	Viewport : function (isInitialisation)
	{
		if ( gdpr.bEnabled === true ) {
			var e = window, a = 'inner';
			if ( !( 'innerWidth' in window ) ) { a = 'client'; e = document.documentElement || document.body; }
			gdpr.iFullWidth = e [a+"Width"];
			gdpr.iFullHeight = e [a+"Height"];
			if (typeof (isInitialisation) != "boolean" ) {
				document.getElementById ('GtkFadeGif').style.width = e [a+'Width'] + "px";
				document.getElementById ('GtkFadeGif').style.height = e [a+'Height'] + "px";
				gdpr.redrawWindow(true);
			}
		}
    },

    redrawWindow : function( bFade )
	{
		if ( bFade === true ) {
			gdpr.oFade.style.width = gdpr.iFullWidth + "px";
			gdpr.oFade.style.height = gdpr.iFullHeight + "px";
			gdpr.setAlpha (gdpr.oFade, 80);

			var width = parseInt((parseInt(gdpr.iFullWidth) / 100) * gdpr.oWindow.widthScale);
			if (gdpr.oWindow.minWidth > width) width = gdpr.oWindow.minWidth;
			if (gdpr.oWindow.maxWidth < width) width = gdpr.oWindow.maxWidth;

			var height = parseInt((parseInt(gdpr.iFullHeight) / 100) * gdpr.oWindow.heightScale);
			if (gdpr.oWindow.minHeight > height) height = gdpr.oWindow.minHeight;
			if (gdpr.oWindow.maxHeight < height) height = gdpr.oWindow.maxHeight;

			var pos_x = parseInt((gdpr.iFullWidth - width) / 2);
			var pos_y = parseInt((gdpr.iFullHeight - height) / 2);

			var wdn = document.getElementById ('windowGdpr');
			wdn.style.width = width + "px";
			wdn.style.height = height + "px";
			wdn.style.top = pos_y + "px";
			wdn.style.left = pos_x + "px";
		} else {
			gdpr.oFade.style.width = 0 + "px";
			gdpr.oFade.style.height = 0 + "px";
			gdpr.setAlpha (gdpr.oFade, 0);
		}
	},

	fbPixel : function (fb_uid)
	{
		if (!window.fbq) {
			n=window.fbq = function(){ n.callMethod? n.callMethod.apply(n,arguments) : n.queue.push(arguments); };
			if(!window._fbq) window._fbq = n;
			n.push = n; n.loaded = !0; n.version='2.0'; n.queue = [];

			t=document.createElement ('script');
			t.async = !0;
			t.src = 'https://connect.facebook.net/en_US/fbevents.js';

			s=document.getElementsByTagName ('script') [0];
			s.parentNode.insertBefore (t,s)

			fbq ('init', fb_uid);
			fbq ('track', "PageView");
		}
	},

	ga : function (ga_uid)
	{
		var gd = document.createElement('script');
		googlaAnaliticsIndicator = ga_uid;
		gd.id = 'ga_'+ga_uid; gd.defer = true;  gd.async = true; gd.type = 'text/javascript';
		gd.src = "https://www.googletagmanager.com/gtag/js?id=" + ga_uid; //('https:' == document.location.protocol ? 'https://' : 'http://') + '';
		gd.onload = function() {
			window.dataLayer = window.dataLayer || [];
			function gtag() { dataLayer.push(arguments); }
			gtag('js', new Date());
			gtag('config', googlaAnaliticsIndicator);
		};
		var scpGa = document.getElementsByTagName('script')[0];
		scpGa.parentNode.insertBefore(gd, scpGa);
	},

};

window[addEventListener ? 'addEventListener':'attachEvent'] (addEventListener?'load':'onload', gdpr.init);
