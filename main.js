// ==UserScript==
// @name         F1TV+
// @namespace    https://najdek.github.io/f1tv_plus/
// @version      1.0
// @description  A few improvements to F1TV
// @author       Adrian Sale
// @match        https://f1tv.formula1.com/*
// @sandbox		 'JavaScript'
// @grant        GM_addElement
// @grant        unsafeWindow
// @require 	 https://code.jquery.com/jquery-3.6.0.min.js
// @require 	 https://cdn.jsdelivr.net/npm/signalr@2.4.3/jquery.signalR.js
// @require 	 https://cdn.jsdelivr.net/npm/pako@2.0.4/dist/pako_inflate.min.js
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==
// https://cdn.bitmovin.com/player/web/8.84.0/bitmovinplayer.js
//https://code.jquery.com/jquery-3.6.0.min.js
//https://cdn.jsdelivr.net/npm/signalr@2.4.3/jquery.signalR.min.js
//https://cdn.bitmovin.com/player/web/8/bitmovinplayer.js
//https://cdn.bitmovin.com/player/web/8.84.0/bitmovinplayer-ui.css
/* TODO
*Custom offset for timing - live is about 20s fast.
*changing driver feed buggers up telemetry ? fixed (wrong var used in function)
-Driver location map ?241 is SC - CHECK CONSOLE _ SHOULD OUTPUT UNRECOGNISED IDs
add weather panel
team radio player, right click style menu for filter, auto reduce volume of other videos.
?speed overlay graph live
alternative time synch for live streams.
layout editor
default layouts.
current tyre width wrong + centre elements - change this element to two - the image (then only change the src when needed) and the text.
check if additional streams are available and if not just load the single video as a backup (otherwise it just fails)
option to load live streams from start or live - auto just load from start.
clear up old code
Team Symbol.
*fix timezone difference ?should use index.js - this was for the sunday date. seems to be working? - should be fixed forcing UTC timezone to work out sunday date
*forced time delta for separate feeds, e.g. sky stream 25s, f1 live 10 etc
UI
custom driver view - i.e. click on driver to see data.
data displayed in driver view
stretched layout
allow aspect ratio true to crop video view
?last lap delta to driver ahead.
quali timing
driver overlay - driver name, sort out gaps, add fastest lap and last lap. ?sector times. Tyre age + type.


//grants
GM.xmlHttpRequest
//unsafeWindow
//        GM_addElement
//       GM_getResourceText

//bitmovin key.
//f142443f-c4c6-4b76-852f-bd1962c06732
/****************************************************************************
 * Copyright (C) 2022, Bitmovin, Inc., All RightsIjw Reserved
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 *
 * Bitmovin Player Version 8.84.0
 *
 ****************************************************************************/

let bitmovin_added = false;
(function() {
	'use strict';

	//let unsafeWindow = window;

	var smVersion = "1.0";
	//<updateDescription>Update details:<br>multi-view: fix offsets not loading from database</updateDescription>

	var smUpdateUrl = "https://raw.githubusercontent.com/najdek/f1tv_plus/master/f1tv_plus.user.js";
	//var smSyncDataUrl = "https://raw.githubusercontent.com/najdek/f1tv_plus/master/sync_offsets.json";

	//// SETTINGS FOR MULTI-POPOUT MODE ////
	var BROWSER_USED_HEIGHT = 70; // height [px] of window that is used by browser/system (title bar, url bar, etc) | Default value: 70
	var BROWSER_USED_WIDTH = 9; // width [px] of window that is used by browser/system | Default value: 9
	// settings above are browser and OS dependent. If values are too small, windows will overlap. If too high, there will be gaps between windows.

	var smPopupPositions = [
		//       [],
		// offset X %, offset Y %, width %, height %
		//       // 1 WINDOW:
		//        [
		//           [0, 0, 100, 100]
		//        ],
		// 2 WINDOWS:
		[
			[0, 0, 50, 100],
			[50, 0, 50, 100]
		],
		// 3 WINDOWS:
		[
			[0, 0, 66.6, 100],
			[66.6, 0, 33.3, 50],
			[66.6, 50, 33.3, 50]
		],
		// 4 WINDOWS:
		[
			[0, 0, 50, 50],
			[50, 0, 50, 50],
			[0, 50, 50, 50],
			[50, 50, 50, 50]
		],
		// 5 WINDOWS:
		[
			[30, 0, 40, 100],
			[0, 0, 30, 50],
			[0, 50, 30, 50],
			[70, 0, 30, 50],
			[70, 50, 30, 50]
		],
		// 6 WINDOWS:
		[
			[0, 0, 33.3, 50],
			[33.3, 0, 33.3, 50],
			[66.6, 0, 33.3, 50],
			[0, 50, 33.3, 50],
			[33.3, 50, 33.3, 50],
			[66.6, 50, 33.3, 50]
		],
		// 7 WINDOWS:
		[
			[30, 0, 40, 100],
			[0, 0, 30, 33.3],
			[0, 33.3, 30, 33.3],
			[0, 66.6, 30, 33.3],
			[70, 0, 30, 33.3],
			[70, 33.3, 30, 33.3],
			[70, 66.6, 30, 33.3]
		],
		// 8 WINDOWS:
		[
			[0, 0, 25, 50],
			[25, 0, 25, 50],
			[50, 0, 25, 50],
			[75, 0, 25, 50],
			[0, 50, 25, 50],
			[25, 50, 25, 50],
			[50, 50, 25, 50],
			[75, 50, 25, 50]
		],
		// 9 WINDOWS:
		[
			[0, 0, 33.3, 33.3],
			[33.3, 0, 33.3, 33.3],
			[66.6, 0, 33.3, 33.3],
			[0, 33.3, 33.3, 33.3],
			[33.3, 33.3, 33.3, 33.3],
			[66.6, 33.3, 33.3, 33.3],
			[0, 66.6, 33.3, 33.3],
			[33.3, 66.6, 33.3, 33.3],
			[66.6, 66.6, 33.3, 33.3]
		],
		// 10 WINDOWS:
		[
			[25, 0, 50, 50],
			[25, 50, 50, 50],
			[0, 0, 25, 25],
			[0, 25, 25, 25],
			[0, 50, 25, 25],
			[0, 75, 25, 25],
			[75, 0, 25, 25],
			[75, 25, 25, 25],
			[75, 50, 25, 25],
			[75, 75, 25, 25]
		]
	];

	const playerConfig = {
		"key": "f142443f-c4c6-4b76-852f-bd1962c06732",
		"playback": {
			"muted": false,
			"autoplay": true,
		}
		,
		ui: false,
	};

	let i = 0;
	const DATA_PANEL_HEADER = i++,
		DATA_PANEL_LEADERBOARD = i++,
		DATA_PANEL_RACE_CONTROL = i++,
		DATA_PANEL_DRIVER_TRACKER = i++,
		DATA_PANEL_TEAM_RADIO = i++,
		DATA_PANEL_WEATHER = i++;

	i = 0;
	const LEADERBOARD_DRIVER_POSITION = i++,
		LEADERBOARD_TEAM_COLOUR = i++,
		LEADERBOARD_DRIVER_NUMBER = i++,
		LEADERBOARD_DRIVER_SHORTNAME = i++,
		LEADERBOARD_DRIVER_SURNAME = i++,
		LEADERBOARD_DRIVER_SHORT_FULLNAME = i++,
		LEADERBOARD_DRIVER_FULLNAME = i++,
		LEADERBOARD_INTERVAL = i++,
		LEADERBOARD_GAP_TO_LEADER = i++,
		LEADERBOARD_FASTEST_LAP_TIME = i++,
		LEADERBOARD_LAST_LAP_TIME = i++,
		LEADERBOARD_SECTOR_TIMES_ALL = i++,
		LEADERBOARD_SECTOR_TIMES_COMPACT = i++, //just diplays the most recent sector.
		LEADERBOARD_LATEST_TIME = i++,
		LEADERBOARD_SECTOR_WIDGET = i++,
		LEADERBOARD_TELEMETRY_WIDGET = i++,
		LEADERBOARD_DRS = i++,
		LEADERBOARD_PITSTOP_COUNT = i++,
		LEADERBOARD_TYRE_STORY = i++,
		LEADERBOARD_TYRE_STORY_COMPACT = i++,
		LEADERBOARD_CURRENT_TYRE = i++,
		LEADERBOARD_CURRENT_TYRE_AND_AGE = i++,
		LEADERBOARD_POSITION_CHANGE = i++;
/*
	//source and destination layouts
	//dx, dy, dw, dh, sx, sy, sw, sh
	var smSquashedDataLayout = [
		[0,0,60,80, 8,18,31,70],//timings (main video playing)
		[10, 13, 12.75, 60,18,16.6,15,66.1], //sector times
		[23,90,77,10,2,83.5,97,12]
	];

	var canvas = new Array();
	var canvasContext = new Array();
	var canvasDims = [ //the sizes of the canvas' in pixels
		[100, 100],
		[100, 100]
	];
	var canvasViewDims = [ //the location and size of the canvas' in %
		[0, 13, 22.8, 60], //sector times
		[23,90,77,10]
	];

	//this describes what to draw in the canvas
	//   0  	      1   	            2  			     3  		     4  											         5        6       7  	       8           9          10            11    12
	// count, source_x_start, source_x_per_item, source_y_start, source_y_per_item (added to y_start to get the next item), source_w, source_h, dest_x, dest_x_per_item, dest_y, dest_y_per_item, dest_w, dest_h
	var aCanvasDrawInstructions_Race = [
		[//canvas 1

			[20, 2.5, 0, 16.3, 3.3, 9.5, 2.5, 0, 0, 0, 5, 36, 5],//column 1
			[20, 12.9, 0, 16.3, 3.3, 5, 2.5, 36, 0, 0, 5, 19, 5],
			[20, 18.75, 0, 16.3, 3.3, 4.5, 2.5, 55, 0, 0, 5, 18, 5],
			[20, 24.25, 0, 16.3, 3.3, 4.5, 2.5, 73, 0, 0, 5, 18, 5],
			[20, 30.5, 0, 16.3, 3.3, 2.4, 2.5, 91, 0, 0, 5, 9, 5]
			// [],//2

		],
		[//canvas 2
			[1, 2, 0, 83.5, 0, 97, 12, 0, 0, 0, 0, 100,100]
		]
	];

	//this describes what to draw in the canvas
	//   0  	      1   	            2  			     3  		     4  											         5        6       7  	       8           9          10            11    12
	// count, source_x_start, source_x_per_item, source_y_start, source_y_per_item (added to y_start to get the next item), source_w, source_h, dest_x, dest_x_per_item, dest_y, dest_y_per_item, dest_w, dest_h
	var aCanvasDrawInstructions_Quali = [
		[//canvas 1

			[20, 2.5, 0, 16.3, 3.3, 6.75, 2.5, 0, 0, 0, 5, 22, 5],//column 1
			[20, 10.5, 0, 16.3, 3.3, 4.5, 2.5, 22, 0, 0, 5, 15, 5],
			[20, 17.5, 0, 16.3, 3.3, 3.75, 2.5, 37, 0, 0, 5, 12, 5],
			[20, 23.5, 0, 16.3, 3.3, 6, 2.5, 49, 0, 0, 5, 17, 5],
			[20, 31, 0, 16.3, 3.3, 40.5, 2.5, 66, 0, 0, 5, 34, 5]
			// [],//2

		],
		[//canvas 2
			[1, 2, 0, 83.5, 0, 97, 12, 0, 0, 0, 0, 100,100]
		]
	];
	var aCanvasDrawInstructions;
*/
	i = 0;
	const LAYOUT_VIDEO_WINDOW_ID = i++,
		LAYOUT_VIDEO_X = i++,
		LAYOUT_VIDEO_Y = i++,
		LAYOUT_VIDEO_W = i++,
		LAYOUT_VIDEO_H = i++,
		LAYOUT_VIDEO_FEED = i++,
		LAYOUT_VIDEO_VOLUME = i++,
		LAYOUT_VIDEO_MAINTAIN_ASPECT = i++,
		LAYOUT_VIDEO_AUTO_QUALITY = i++,
		LAYOUT_VIDEO_CROP_X = i++,
		LAYOUT_VIDEO_CROP_Y = i++,
		LAYOUT_VIDEO_CROP_W = i++,
		LAYOUT_VIDEO_CROP_H = i++,
		LAYOUT_AUDIO_MIX = i++;

	i = 0;
	const LAYOUT_DATA_WINDOW_ID = i++,
		LAYOUT_DATA_FEED = i++,
		LAYOUT_DATA_X = i++,
		LAYOUT_DATA_Y = i++,
		LAYOUT_DATA_W = i++,
		LAYOUT_DATA_H = i++,
		LAYOUT_DATA_OPTION1 = i++,
		LAYOUT_DATA_OPTION2 = i++;

   const gDefaultAudioMix = {
	   "f1 live": 0.5,
	   "internaitonal": 0.5,
	   "data": 0.5,
	   "tracker": 0.5,
	   "ham": 1.0,
	   "rus": 1.0,
	   "lec": 0.0,
	   "sai": 0.0,
	   "ver": 1.0,
	   "per": 1.0,
	   "nor": 1.0,
	   "ric": 1.0,
	   "str": 1.0,
	   "vet": 1.0,
	   "tsu": 0.0,
	   "gas": 1.0,
	   "bot": 0.0,
	   "msc": 0.0,
	   "dev": 1.0,
	   "alb": 0.0,
	   "oco": 0.0,
	   "zho": 0.0,
	   "mag": 0.0,
	   "alo": 0.0,
	   "lat": 1.0
   };

   function getDefaultAudioMix(p_id)
   {
	   if(gDefaultAudioMix[p_id])
		   return gDefaultAudioMix[p_id];
	   
	   return 0.5;
   }

   const gLayout16by9 = [
	   {
		   name: "One",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 100, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")]
			   ],
		   data: []
	   }
	   ,
	   {
		   name: "Two",
		  window_count: 1,
		  video: [
			  [0, 0, 0, 50, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			  [0, 50, 0, 50, 100, "data", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")]
			  ],
			  data: []
	  }
	   ,
	   {
		   name: "Three",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 50, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 50,0,50,50, "data",0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			   [0, 50,50,50,50, "tracker",0.0, true, true, 0,0,100,100, getDefaultAudioMix("tracker")]
			   ],
			   data: []
	   }
	   ,
	   {
		   name: "Four",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 50, 50, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 0, 50, 50, 50, "ver", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 50,0,50,50, "data",0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			   [0, 50,50,50,50, "tracker",0.0, true, true, 0,0,100,100, getDefaultAudioMix("tracker")]
			   ],
			   data: []
	   }
	   ,
	   {
		   name: "Five",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 50, 50, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 50,0,50,50, "data",0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			   [0, 0,50,33.333,50, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 33.333,50,33.333,50, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			   [0, 66.666,50,33.33,50, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")]
			   ],
			   data: []
	   }
	   ,
	   {
		   name: "Six",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 33.333, 50, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 33.333,0,33.333,50, "data",0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			   [0, 66.666,0,33.333,50, "tracker",0, true, true, 0,0,100,100, getDefaultAudioMix("tracker")],
			   [0, 0,50,33.333,50, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 33.333,50,33.333,50, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			   [0, 66.666,50,33.33,50, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")]
			   ],
		   data:[]
	   }
	   ,
	   {
		   name: "Six",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 66.666, 66.666, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 66.666, 0,33.333,33.333, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			   [0, 66.666,33.333,33.333,33.333, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 66.666,66.666,33.333,33.333, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 33.333,66.666,33.333,33.333, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 0,66.666,33.333,33.333, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")]
			   ],
			   data:[]
	   }
	   ,
	   {
		   name: "Eight",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 75, 75, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 75, 0,25,25, "nor",0, true, true, 0,0,100,100, getDefaultAudioMix("nor")],
			   [0, 75,25,25,25, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 75,50,25,25, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 75,75,25,25, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 50,75,25,25, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")],
			   [0, 25,75,25,25, "sai",0, true, true, 0,0,100,100, getDefaultAudioMix("sai")],
			   [0, 0,75,25,25, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")]
			   ],
		   data:[]
	   }
	   ,
	   {
		   name: "Ten",
		   window_count: 1,
		   video: [
			   [0, 25, 0, 50, 50, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 25, 50,50,50, "data",0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			   [0, 0,0,25,25, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 0,25,25,25, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 0,50,25,25, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 0,75,25,25, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")],
			   [0, 75,0,25,25, "sai",0, true, true, 0,0,100,100, getDefaultAudioMix("sai")],
			   [0, 75,25,25,25, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			   [0, 75,50,25,25, "nor",0, true, true, 0,0,100,100, getDefaultAudioMix("nor")],
			   [0, 75,75,25,25, "bot",0, true, true, 0,0,100,100, getDefaultAudioMix("bot")]
			   ],
		   data:[]
	   }
   ];

	const gDataLayout16by9 = [
		{
		   name: "One + Overlapped Sidebar",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 100, 100, "f1 live", 0.7, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")]
			   ],
		   data: [	[0, DATA_PANEL_HEADER, 0, 0, 20, 7],
			   [0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50,
				   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
				   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_CURRENT_TYRE_AND_AGE]
			   ],
			   [0, DATA_PANEL_RACE_CONTROL, 0, 57, 20, 18]
			   ,
			   [0, DATA_PANEL_DRIVER_TRACKER, 0, 75, 20, 25, true]//,
			   //[0, DATA_PANEL_TEAM_RADIO, 90, 50, 10, 5]
	   ]
	   }
		,
		{
		   name: "Two + Overlapped Sidebar + Tracker",
			window_count: 1,
			video: [
				[0, 0, 0, 100, 100, "f1 live", 0.7, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[0, 0,75,25,25, "ham",1.0, false, true, 0,0,100,100, getDefaultAudioMix("ham")]
				],
			data: [	[0, DATA_PANEL_HEADER, 0, 0, 20, 7],
				[0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50,
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_CURRENT_TYRE_AND_AGE]
				],
				[0, DATA_PANEL_RACE_CONTROL, 0, 57, 20, 18]
				,
				[0, DATA_PANEL_DRIVER_TRACKER, 78, 20, 20, 30, false]//,
				//[0, DATA_PANEL_TEAM_RADIO, 90, 50, 10, 5]
		]
		}
		,
		{
		   name: "Four + Sidebar",
			window_count: 1,
			video: [
			   [0, 33.333, 0, 66.666, 66.666, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 66.666,66.666,33.333,33.333, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 33.333,66.666,33.333,33.333, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 0,66.666,33.333,33.333, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")]
				],
			data: [	[0, DATA_PANEL_HEADER, 0, 0, 33.333, 7],
				   [0, DATA_PANEL_LEADERBOARD, 0, 7, 33.333, 45,
					   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
					   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_CURRENT_TYRE_AND_AGE]
				   ],
				   [0, DATA_PANEL_RACE_CONTROL, 0, 52, 33.333, 14.666]
				]
		}
		,
		{
		   name: "Five + Sidebar",
			window_count: 1,
			video: [
			   [0, 25, 0, 75, 75, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 75,75,25,25, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 50,75,25,25, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 25,75,25,25, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 0,75,25,25, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")]
				],
			data: [	[0, DATA_PANEL_HEADER, 0, 0, 25, 7],
				   [0, DATA_PANEL_LEADERBOARD, 0, 7, 25, 50,
					   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
					   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_CURRENT_TYRE_AND_AGE]
				   ],
				   [0, DATA_PANEL_RACE_CONTROL, 0, 57, 25, 18]
				]
		}
		,
		{
		   name: "Four + Sidebar + Map",
			window_count: 1,
			video: [
			   [0, 20, 0, 80, 80, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 80,80,20,20, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 60,80,20,20, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 40,80,20,20, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 20,80,20,20, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")]
				],
			data: [	[0, DATA_PANEL_HEADER, 0, 0, 34, 7],
				   [0, DATA_PANEL_LEADERBOARD, 0, 7, 34, 55,
					   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
					   [LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_SECTOR_TIMES_COMPACT, LEADERBOARD_DRS, LEADERBOARD_TYRE_STORY]
				   ],
				   [0, DATA_PANEL_RACE_CONTROL, 0, 62, 34, 18],
				   [0, DATA_PANEL_DRIVER_TRACKER, 0, 80, 20, 20, true]
				]
		}
		,
		{
			name: "Six + Sidebar",
			window_count: 1,
			video: [
				[0, 25, 0, 50, 50, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[0, 25, 50,50,50, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[0, 75,0,25,25, "sai",0, true, true, 0,0,100,100, getDefaultAudioMix("sai")],
				[0, 75,25,25,25, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
				[0, 75,50,25,25, "nor",0, true, true, 0,0,100,100, getDefaultAudioMix("nor")],
				[0, 75,75,25,25, "bot",0, true, true, 0,0,100,100, getDefaultAudioMix("bot")]
				],
			data:[	[0, DATA_PANEL_HEADER, 0, 0, 25, 7],
					[0, DATA_PANEL_LEADERBOARD, 0, 7, 25, 50,
						[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
						[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_TYRE_STORY_COMPACT]
					],
					[0, DATA_PANEL_RACE_CONTROL, 0, 57, 25, 18]
					,
					[0, DATA_PANEL_DRIVER_TRACKER, 0, 75, 25, 25, true]
				]
		}
		,
		{
			name: "Seven + Sidebar + Tracker",
			window_count: 1,
			video: [
				[0, 0, 0, 75, 75, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[0, 75, 0,25,25, "nor",0, true, true, 0,0,100,100, getDefaultAudioMix("nor")],
				[0, 75,25,25,25, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
				[0, 75,50,25,25, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[0, 75,75,25,25, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
				[0, 50,75,25,25, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")],
				[0, 25,75,25,25, "sai",0, true, true, 0,0,100,100, getDefaultAudioMix("sai")]
				],
			data:[	[0, DATA_PANEL_HEADER, 0, 0, 15, 7],
				[0, DATA_PANEL_LEADERBOARD, 0, 7, 15, 50,
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE],
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE]
				],
				[0, DATA_PANEL_RACE_CONTROL, 0, 57, 15, 18]
				,
				[0, DATA_PANEL_DRIVER_TRACKER, 0, 75, 25, 25, true]
			]
		}		
	];

	const gLayout21by9 = [
	   {
		   name: "Five",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 76.19, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 76.19,0,23.81,25, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 76.19,25,23.81,25, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 76.19,50,23.81,25, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			   [0, 76.19,75,23.81,25, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")]
			   ],
			   data: []
	   }
		,
	   {
		   name: "Six",
		   window_count: 1,
		   video: [
			   [0, 0, 0, 76.19, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [0, 76.19,0,23.81,20, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			   [0, 76.19,20,23.81,20, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			   [0, 76.19,40,23.81,20, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			   [0, 76.19,60,23.81,20, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			   [0, 76.19,80,23.81,20, "tracker",0, true, true, 0,0,100,100, getDefaultAudioMix("tracker")]
			   ],
			   data: []
	   }
   ];

	const gDataLayout21by9 = [
		{
			name: "Five",
			window_count: 1,
			video: [
				[0, 0, 0, 76.19, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[0, 76.19,0,23.81,25, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[0, 76.19,25,23.81,25, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
				[0, 76.19,50,23.81,25, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
				[0, 76.19,75,23.81,25, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")]
				],
				data: [	[0, DATA_PANEL_HEADER, 0, 0, 20, 7],
						[0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50,
							[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
							[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_CURRENT_TYRE_AND_AGE]
						],
						[0, DATA_PANEL_RACE_CONTROL, 0, 57, 20, 18]
						,
						[0, DATA_PANEL_DRIVER_TRACKER, 0, 75, 20, 25, true]//,
						//[0, DATA_PANEL_TEAM_RADIO, 90, 50, 10, 5]
					]
		}
		,
		{
			name: "Six",
			window_count: 1,
			video: [
				[0, 0, 0, 76.19, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[0, 76.19,0,23.81,20, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[0, 76.19,20,23.81,20, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
				[0, 76.19,40,23.81,20, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
				[0, 76.19,60,23.81,20, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
				[0, 76.19,80,23.81,20, "tracker",0, true, true, 0,0,100,100, getDefaultAudioMix("tracker")]
				],
				data: [	[0, DATA_PANEL_HEADER, 0, 0, 20, 7],
						[0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50,
							[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
							[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_CURRENT_TYRE_AND_AGE]
						],
						[0, DATA_PANEL_RACE_CONTROL, 0, 57, 20, 18]
						,
						[0, DATA_PANEL_DRIVER_TRACKER, 0, 75, 20, 25, true]//,
						//[0, DATA_PANEL_TEAM_RADIO, 90, 50, 10, 5]
					]
		}
	];

	const gLayoutMultiWindow = [
	   {
		   name: "One + One",
		   window_count: 2,
		   video: [
			   [0, 0, 0, 100, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			   [1, 0, 0, 100, 100, "data", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")]
			   ],
		   data: []
	   }
	   ,
	   {
		   name: "One + Four",
		  window_count: 2,
		  video: [
			  	[0, 0, 0, 50, 100, "f1 live", 0.7, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			  	[1, 0,0,50,50, "data", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
				[1, 50,0,50,50, "ham",1.0, false, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[1, 50,50,50,50, "rus",0, false, true, 0,0,100,100, getDefaultAudioMix("rus")],
				[1, 0,50,50,50, "lec",0, false, true, 0,0,100,100, getDefaultAudioMix("lec")]
			  ],
			  data: []
	   }
	   ,
	   {
		name: "One + Six",
	   window_count: 2,
	   video: [
			[0, 0, 0, 100, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			[1, 0, 0, 66.666, 66.666, "data", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			[1, 66.666, 0,33.333,33.333, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			[1, 66.666,33.333,33.333,33.333, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			[1, 66.666,66.666,33.333,33.333, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			[1, 33.333,66.666,33.333,33.333, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			[1, 0,66.666,33.333,33.333, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")],
		   ],
		   data: []
		}
	   ,
	   {
		   name: "Four + Four",
		  window_count: 2,
		  video: [
				[0, 0,0,50,50, "f1 live", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[0, 50,0,50,50, "data",1.0, false, true, 0,0,100,100, getDefaultAudioMix("data")],
				[0, 50,50,50,50, "tracker",0, false, true, 0,0,100,100, getDefaultAudioMix("tracker")],
				[0, 0,50,50,50, "ver",0, false, true, 0,0,100,100, getDefaultAudioMix("ver")],
			  	[1, 0,0,50,50, "sai", 0.0, false, true, 0,0,100,100, getDefaultAudioMix("sai")],
				[1, 50,0,50,50, "ham",1.0, false, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[1, 50,50,50,50, "rus",0, false, true, 0,0,100,100, getDefaultAudioMix("rus")],
				[1, 0,50,50,50, "lec",0, false, true, 0,0,100,100, getDefaultAudioMix("lec")]
			  ],
			  data: []
	   }
		,
	   {
		name: "Six + Four",
	   window_count: 2,
	   video: [
			[0, 0, 0, 66.666, 66.666, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			[0, 66.666, 0,33.333,33.333, "lec",0, true, true, 0,0,100,100, getDefaultAudioMix("lec")],
			[0, 66.666,33.333,33.333,33.333, "rus",0, true, true, 0,0,100,100, getDefaultAudioMix("rus")],
			[0, 66.666,66.666,33.333,33.333, "ham",0, true, true, 0,0,100,100, getDefaultAudioMix("ham")],
			[0, 33.333,66.666,33.333,33.333, "ver",0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			[0, 0,66.666,33.333,33.333, "per",0, true, true, 0,0,100,100, getDefaultAudioMix("per")],
			[1, 0,0,50,50, "tracker", 0.0, false, true, 0,0,100,100, getDefaultAudioMix("tracker")],
			[1, 50,0,50,50, "data",0.0, false, true, 0,0,100,100, getDefaultAudioMix("data")],
			[1, 50,50,50,50, "sai",0, false, true, 0,0,100,100, getDefaultAudioMix("sai")],
			[1, 0,50,50,50, "bot",0, false, true, 0,0,100,100, getDefaultAudioMix("bot")]
		   ],
		   data: []
	}
	,
	{
		name: "One + One + One",
		window_count: 3,
		video: [
			[0, 0, 0, 100, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			[1, 0, 0, 100, 100, "data", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			[2, 0, 0, 100, 100, "tracker", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("tracker")]
			],
		data: []
	}
	,
	{
		name: "One + One + Four",
		window_count: 3,
		video: [
			[0, 0, 0, 100, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			[1, 0, 0, 100, 100, "data", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("data")],
			[2, 0,0,50,50, "ver", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			[2, 50,0,50,50, "ham",1.0, false, true, 0,0,100,100, getDefaultAudioMix("ham")],
			[2, 50,50,50,50, "rus",0, false, true, 0,0,100,100, getDefaultAudioMix("rus")],
			[2, 0,50,50,50, "lec",0, false, true, 0,0,100,100, getDefaultAudioMix("lec")]
			],
		data: []
	}
	,
	{
		name: "One + Four + Four",
		window_count: 3,
		video: [
			[0, 0, 0, 100, 100, "f1 live", 1.0, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
			[1, 0,0,50,50, "tracker", 0.0, false, true, 0,0,100,100, getDefaultAudioMix("tracker")],
			[1, 50,0,50,50, "data",0.0, false, true, 0,0,100,100, getDefaultAudioMix("data")],
			[1, 50,50,50,50, "sai",0, false, true, 0,0,100,100, getDefaultAudioMix("sai")],
			[1, 0,50,50,50, "bot",0, false, true, 0,0,100,100, getDefaultAudioMix("bot")],
			[2, 0,0,50,50, "ver", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
			[2, 50,0,50,50, "ham",1.0, false, true, 0,0,100,100, getDefaultAudioMix("ham")],
			[2, 50,50,50,50, "rus",0, false, true, 0,0,100,100, getDefaultAudioMix("rus")],
			[2, 0,50,50,50, "lec",0, false, true, 0,0,100,100, getDefaultAudioMix("lec")]
			],
		data: []
	}
   ];

	const gDataLayoutMultiWindow = [
		{
			name: "One with Data + Four",
			window_count: 2,
			video: [
				[0, 0, 0, 100, 100, "f1 live", 0.7, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[1, 0,0,50,50, "ver", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
				[1, 50,0,50,50, "ham",1.0, false, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[1, 50,50,50,50, "rus",0, false, true, 0,0,100,100, getDefaultAudioMix("rus")],
				[1, 0,50,50,50, "lec",0, false, true, 0,0,100,100, getDefaultAudioMix("lec")]
				],
			data: [	[0, DATA_PANEL_HEADER, 0, 0, 20, 7],
						[0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50,
							[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
							[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_CURRENT_TYRE_AND_AGE]
						],
						[0, DATA_PANEL_RACE_CONTROL, 0, 57, 20, 18]
						,
						[0, DATA_PANEL_DRIVER_TRACKER, 0, 75, 20, 25, true]//,
						//[0, DATA_PANEL_TEAM_RADIO, 90, 50, 10, 5]
				]
		}
		,
		{
			name: "One + Four with Large Data",
			window_count: 2,
			video: [
				[1, 0, 0, 100, 100, "f1 live", 0.7, true, true, 0,0,100,100, getDefaultAudioMix("f1 live")],
				[0, 75,0,25,25, "ver", 0.0, true, true, 0,0,100,100, getDefaultAudioMix("ver")],
				[0, 75,25,25,25, "ham",1.0, false, true, 0,0,100,100, getDefaultAudioMix("ham")],
				[0, 75,50,25,25, "rus",0, false, true, 0,0,100,100, getDefaultAudioMix("rus")],
				[0, 75,75,25,25, "lec",0, false, true, 0,0,100,100, getDefaultAudioMix("lec")]
				],
			data: [	[0, DATA_PANEL_HEADER, 0, 0, 75, 7],
					[0, DATA_PANEL_LEADERBOARD, 0, 7, 75, 58,
						[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_FULLNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET],
						[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_FULLNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_SECTOR_TIMES_ALL, LEADERBOARD_LAST_LAP_TIME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_DRS, LEADERBOARD_PITSTOP_COUNT, LEADERBOARD_TYRE_STORY, LEADERBOARD_SECTOR_WIDGET, LEADERBOARD_TELEMETRY_WIDGET]
					],
					[0, DATA_PANEL_RACE_CONTROL, 0,65, 37.5, 35]
					,
					[0, DATA_PANEL_DRIVER_TRACKER, 37.5, 65, 37.5, 35, true]//,
			//[0, DATA_PANEL_TEAM_RADIO, 90, 50, 10, 5]
				]
		}
	];

	const gLayouts = [
		   [
			   gLayout16by9,
			   gDataLayout16by9
		   ],
		   [//this will be 21by9
			   gLayout21by9,
			   gDataLayout21by9
		   ],
		   [//this will be multi-window.
			   gLayoutMultiWindow,
			   gDataLayoutMultiWindow
		   ]

	];

	const gLayoutTitles = [
	   ["16 by 9", "21 by 9", "Multi-Window"],
	   ["Video", "Data+Video"]
	];

	/*

	//[x (%),y,w,h, video string, volume 0..1, maintain aspect ratio true/false, the x,y,w,h of the video to squash into the display area, if maintaining aspect ratio, garuantees this area is viewable.]
	// settings optimized for display with 16:9 aspect ratio (full screen)
	//8,23,31,70]
	var smFramePositions16by9 = [
		//       [],
		// offset X %, offset Y %, width %, height %
		// 1 WINDOW:
		//        [],
		// 2 WINDOWS:
		[ //If the data-squashed view is drawn, best to put it first as the fullscreen works better(dbclick works) - it doesn't on the videos without them being in an iframe.
			[0,0,100,100, "data", 0.0, false, 0, 0, 100, 100, canvasViewDims]
			//,
			// [50, 0, 90, 90, "f1 live", 0.7, false, 4.5,5,91.5, 91],
		],

		[
			//[0, 0, 100, 100, "f1 live", 0.7, true, 0,0,100,100],
			//[20, 0, 80, 100, "f1 live", 0.7, false,  18,0,82,100],
			[25, 0, 75, 80, "f1 live", 0.7,  false,  18,0,82,100],//20,0,80,100], //4.5,5,91.5, 91]
			[0,80,25,20, "ham",1.0, false, 0,0,100,100],
			[25,80,25,20, "rus",1.0, false, 0,0,100,100]
		],
		// 3 WINDOWS:
		[
			[10, 0, 90, 90, "f1 live", 0.7, false, 4.5,5,91.5,91],
			[0,50,50,100, "data", 0.0, true, 0, 0, 100, 100, canvasViewDims],

			[0,73,23,27, "ham",1.0, false, 0,0,100,100]
			/*
			[0,0,100,100, "f1 live", 0.5, false, 4,5,92,92],
			[0,80,20,20, "HAM", 1.0, true],
			[0,11,20,67, "data", 0, false, 8,23,23,65]
			//[0,15,20,70, "data", 0, false, 8,18,31,70]
			/*
			[0,0,100,100],
			[70,0,30,30],
			[70,50,30,30]
			/*
			[0, 16.667, 66.667, 66.667],
			[66.667, 16.667, 33.333, 33.333],
			[66.667, 50, 33.333, 33.333]*
		],
		// 4 WINDOWS:
		[
			[0,100,100,100, "data-squashed", 0.0, true, 0, 0, 100, 100, canvasViewDims],
			[10, 0, 90, 90, "f1 live", 0.7, false, 4.5,5,91.5,91],
			[0,73,23,27, "HAM",1.0, false, 0,0,100,100],
			[0,0,10,13, "RUS", 0, false, 0,0,100,100]
			/*

			[0,0,100,100, "f1 live", 0.5, true],
			[80,0,20,20, "HAM", 1.0, true],
			[85,20,15,15, "RUS", 0, true],
			[0,15,20,70, "data", 0, false, 8,18,31,70]
			//[0,15,25,85, "data", 0, false, 0,20,33,70],


			/*
			[0, 0, 50, 50],
			[50, 0, 50, 50],
			[0, 50, 50, 50],
			[50, 50, 50, 50]*
		],
		// 5 WINDOWS:
		[
			[0, 8.333, 50, 50],
			[50, 8.333, 50, 50],
			[0, 58.333, 33.333, 33.333],
			[33.333, 58.333, 33.333, 33.333],
			[66.666, 58.333, 33.333, 33.333]
		],
		// 6 WINDOWS:
		[
			[0, 0, 66.666, 66.666],
			[66.666, 0, 33.333, 33.333],
			[66.666, 33.333, 33.333, 33.333],
			[0, 66.666, 33.333, 33.333],
			[33.333, 66.666, 33.333, 33.333],
			[66.666, 66.666, 33.333, 33.333]
		],
		// 7 WINDOWS:
		[],
		// 8 WINDOWS:
		[],
		// 9 WINDOWS:
		[
			[0, 0, 33.3, 33.3],
			[33.3, 0, 33.3, 33.3],
			[66.6, 0, 33.3, 33.3],
			[0, 33.3, 33.3, 33.3],
			[33.3, 33.3, 33.3, 33.3],
			[66.6, 33.3, 33.3, 33.3],
			[0, 66.6, 33.3, 33.3],
			[33.3, 66.6, 33.3, 33.3],
			[66.6, 66.6, 33.3, 33.3]
		],
		// 10 WINDOWS:
		[
			[25, 0, 50, 50],
			[25, 50, 50, 50],
			[0, 0, 25, 25],
			[0, 25, 25, 25],
			[0, 50, 25, 25],
			[0, 75, 25, 25],
			[75, 0, 25, 25],
			[75, 25, 25, 25],
			[75, 50, 25, 25],
			[75, 75, 25, 25]
		]
	];

	// settings optimized for display with 21:9 aspect ratio (full screen)
	var smFramePositions21by9 = [
		//        [],
		// offset X %, offset Y %, width %, height %
		// 1 WINDOW:
		//       [
		//            [0, 0, 100, 100]
		//        ],
		// 2 WINDOWS:
		[
			[0, 16.25, 50, 50],
			[50, 16.25, 50, 50]
		],
		// 3 WINDOWS:
		[
			[0, 5, 66.666, 90],
			[66.666, 5, 33.333, 45],
			[66.666, 50, 33.333, 45]
		],
		// 4 WINDOWS:
		[
			[12.943, 0, 37.057, 50],
			[50, 0, 37.057, 50],
			[12.943, 50, 37.057, 50],
			[50, 50, 37.057, 50]
		],
		// 5 WINDOWS:
		[
			[25, 16.25, 50, 67.5],
			[0, 16.25, 25, 33.75],
			[0, 50, 25, 33.75],
			[75, 16.25, 25, 33.75],
			[75, 50, 25, 33.75]
		],
		// 6 WINDOWS:
		[
			[0, 5, 33.333, 45],
			[33.333, 5, 33.333, 45],
			[66.666, 5, 33.333, 45],
			[0, 50, 33.333, 45],
			[33.333, 50, 33.333, 45],
			[66.666, 50, 33.333, 45]
		],
		// 7 WINDOWS:
		[
			[25, 16.25, 50, 67.5],
			[0, 0, 25, 33.333],
			[0, 33.333, 25, 33.333],
			[0, 66.666, 25, 33.333],
			[75, 0, 25, 33.333],
			[75, 33.333, 25, 33.333],
			[75, 66.666, 25, 33.333]
		],
		// 8 WINDOWS:
		[
			[31.458, 0, 37.057, 50],
			[31.458, 50, 37.057, 50],
			[6.458, 0, 25, 33.333],
			[6.458, 33.333, 25, 33.333],
			[6.458, 66.666, 25, 33.333],
			[68.515, 0, 25, 33.333],
			[68.515, 33.333, 25, 33.333],
			[68.515, 66.666, 25, 33.333]
		],
		// 9 WINDOWS:
		[
			[12.995, 0, 25, 33.333],
			[37.995, 0, 25, 33.333],
			[62.995, 0, 25, 33.333],
			[12.995, 33.333, 25, 33.333],
			[37.995, 33.333, 25, 33.333],
			[62.995, 33.333, 25, 33.333],
			[12.995, 66.666, 25, 33.333],
			[37.995, 66.666, 25, 33.333],
			[62.995, 66.666, 25, 33.333]
		]
	];*/
	////////////////////////////////////////
	const g_aDefaultVideoOffsets = {
	   "international": -15000,
	   "f1 live": -10000,
	   "tracker": -10000,
	   "data": -10000,
	   "driver": -7000,
	};

	const g_aDefaultLiveVideoOffsets = {
	   "international": -25000,
	   "f1 live": -10000,
	   "tracker": -10000,
	   "data": -10000,
	   "driver": -7000,
	};

	function getDefaultVideoOffset(p_title, p_is_live)
	{
	   let offsets;
	   if(p_is_live)
		   offsets = g_aDefaultLiveVideoOffsets;
	   else
		   offsets = g_aDefaultVideoOffsets;

	   if(p_title.length === 3)
		   return offsets.driver; 

	   if( offsets[p_title])
		   return offsets[p_title];

	   return -10000; //default is 10s if not recognised video.
	}

	var VIDEO_SPEEDS = [
		[10, "0.1x"],
		[25, "0.25x"],
		[50, "0.5x"],
		[75, "0.75x"],
		[100, "1x (Normal)"],
		[125, "1.25x"],
		[150, "1.5x"],
		[200, "2x"],
		[400, "4x"]
	];

	const LAYOUT_THEATRE = i++,
		LAYOUT_POPOUT = i++,
		LAYOUT_MULTIVIEW = i++,
		LAYOUT_SUBMULTIVIEW = i++;

	//for some reason the style of the bitmovin player doesn't get added to the page when loading it in an injected script.
	const g_sMutliviewHeaderHTML = '<html lang="en" data-react-helmet="lang">\
		<head>\
		<title>F1TV++</title>\
		<style>\
		/* latin-ext */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: italic;\
			font-weight: 600;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPFcZTIAOhVxoMyOr9n_E7fdMbe0IhDb5yciWM.woff2) format("woff2");\
			unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\
		}\
		/* latin */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: italic;\
			font-weight: 600;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPFcZTIAOhVxoMyOr9n_E7fdMbe0IhDYZyc.woff2) format("woff2");\
			unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\
		}\
		/* latin-ext */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 400;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPecZTIAOhVxoMyOr9n_E7fdM3mDbRS.woff2) format("woff2");\
			unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\
		}\
		/* latin */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 400;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPecZTIAOhVxoMyOr9n_E7fdMPmDQ.woff2) format("woff2");\
			unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\
		}\
		/* latin-ext */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 600;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGIVzY4SY.woff2) format("woff2");\
			unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\
		}\
		/* latin */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 600;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGItzYw.woff2) format("woff2");\
			unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\
		}			\
		/* latin-ext */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 700;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPDcZTIAOhVxoMyOr9n_E7ffHjDGIVzY4SY.woff2) format("woff2");\
			unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\
		}\
		/* latin */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 700;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPDcZTIAOhVxoMyOr9n_E7ffHjDGItzYw.woff2) format("woff2");\
			unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\
		}\
		/* latin-ext */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 900;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPDcZTIAOhVxoMyOr9n_E7ffEDBGIVzY4SY.woff2) format("woff2");\
			unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\
		}\
		/* latin */\
		@font-face {\
			font-family: "Titillium Web";\
			font-style: normal;\
			font-weight: 900;\
			src: url(https://fonts.gstatic.com/s/titilliumweb/v15/NaPDcZTIAOhVxoMyOr9n_E7ffEDBGItzYw.woff2) format("woff2");\
			unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\
		}\
		body {\
			overflow: hidden;\
			background-color: black;\
		}\
		.bitmovinplayer-poster {\
			position : absolute;\
			top : 0;\
			bottom : 0;\
			left : 0;\
			right : 0;\
			display : none;\
			background-size : contain;\
			background-position : center;\
			background-repeat : no-repeat;\
		}\
\
		.bitmovinplayer-container {\
			padding: 0;\
			margin: 0;\
			position : relative;\
			/* overflow:hidden will be needed in the future to allow fit/stretch/etc the video */\
			overflow : hidden;\
			min-height: 150px;\
			min-width: 260px;\
			box-sizing: content-box;\
			background-color: transparent;\
			width: 100%;\
			height: 100%;\
		}\
		.bitmovinplayer-container:before {\
			display: block;\
			content: "";\
			width: 100%;\
		}\
		.bitmovinplayer-container video, .bitmovinplayer-container object, .bitmovinplayer-container > canvas {\
			position: absolute;\
			top: 0;\
			left:0;\
			bottom:0;\
			right:0;\
			width: 100%;\
			height: 100%;\
		}\
\
		.bitmovinplayer-container > * {\
			-webkit-box-sizing: border-box;\
			-moz-box-sizing: border-box;\
			box-sizing: border-box;\
			padding: 0;\
		}\
\
		.bitmovinplayer-container.aspect-16x9:before {\
			padding-bottom: 56.25%;\
		}\
		.bitmovinplayer-container.aspect-16x10:before {\
			padding-bottom: 62.5%;\
		}\
		.bitmovinplayer-container.aspect-4x3:before {\
			padding-bottom: 75%;\
		}\
		.bitmovinplayer-container.aspect-3x2:before {\
			padding-bottom: 66.66%;\
		}\
\
		/* e.g. wordpress sets the height for these elements to "auto" which leads to problems for example on Windows 7 in IE11 (with Flash) */\
		.bitmovinplayer-container object, .bitmovinplayer-container embed, .bitmovinplayer-container img {\
			height: 100%;\
		}\
\
		.bitmovinplayer-container, .bitmovinplayer-ad-container {\
			width:100%;\
			height:100%;\
			background-color: black;\
			color: #ffffff;\
			/* make text (like subtitles etc.) unselectable */\
			-webkit-touch-callout: none;\
			-webkit-user-select: none;\
			-khtml-user-select: none;\
			-moz-user-select: none;\
			-ms-user-select: none;\
			user-select: none;\
			-webkit-tap-highlight-color: transparent;\
		}\
		.bitmovinplayer-container video, .bitmovinplayer-ad-container video {\
			object-fit: contain;\
			-o-object-fit: contain;\
		}\
		/* fullscreen */\
		html:-ms-fullscreen {\
			width:100%;\
			height:100%;\
		}\
		:-webkit-full-screen {\
			background-color:transparent;\
			width: 100% !important;\
			height: 100% !important;\
		}\
		video:-webkit-full-screen + .bitmovinplayer-ctrl {\
			background:#ccc; /* required for Chrome which doesnt heed the transparent value set above */\
		}\
		/* hide controls on fullscreen with WebKit */\
		*[data-fullscreen=true], *[data-legacy-fullscreen=true] {\
			max-width:100%;\
			max-height:100%;\
			width:100% !important;\
			height:100% !important;\
			background-color: black !important;\
			margin:0;\
			padding:0;\
			position: fixed !important;\
			top: 0 !important;\
			left: 0 !important;\
		}\
		*[data-legacy-fullscreen=true] {\
			z-index: 99999;\
		}\
\
		.bitmovinplayer-error-message ul {\
			text-align: left;\
		}\
\
		.bitmovinplayer-error-message a {\
			color: #31c5c7;\
		}\
		/* from http://stackoverflow.com/a/37553385 */\
		.bitmovinplayer-container video::-webkit-media-controls-panel {\
			display: none!important;\
			-webkit-appearance: none;\
		}\
		.bitmovinplayer-container video::--webkit-media-controls-play-button {\
			display: none!important;\
			-webkit-appearance: none;\
		}\
		.bitmovinplayer-container video::-webkit-media-controls-start-playback-button {\
			display: none!important;\
			-webkit-appearance: none;\
		}\
		*{\
			box-sizing: border-box;\
		}\
		.click_to_start\
		{\
		   position: absolute;\
		   z-index: 2000;\
		   border: 0;\
		   left: 0%;\
		   top: 0%;\
		   width: 100%;\
		   height: 100%;\
		   font-size: 500%;\
		   color: white;\
		   overflow: hidden;\
		   line-height: 100vh;\
		   text-align: center;\
		   vertical-align: middle;\
		   background-color: black;\
		}\
		\
		.video-table {\
			font-family:Verdana,sans-serif;\
			border-collapse: collapse;\
			width: 100%;\
			max-width: 100%;\
		}\
			\
		.video-table td, .video-table th {\
			border: 1px solid #ddd;\
			padding: 4px;\
		}\
\
		.video-table tr:nth-child(even){\
			background-color: #f2f2f2;\
		}\
\
		.video-table tr {\
			/*background-color: #ddd;*/\
			color: white;\
			width: 100%;\
			max-width: 100%;\
		}\
\
		.video_overlay\
		{\
		   position: absolute;\
		   z-index: 1001;\
		   border: 0;\
		   left: 0%;\
		   top: 0%;\
		   width: 100%;\
		   height: 100%;\
		   overflow:hidden;\
		}\
\
		.video-table th {\
			padding-top: 4px;\
			padding-bottom: 4px;\
			text-align: left;\
			background-color: red;\
			color: white;\
			font-weight: 400;\
		}\
\
		.container-div {\
			padding: 4px 4px;\
			box-sizing: border-box;\
		}\
		\
		.container-content {\
			margin: 4px 4px 4px 4px;\
			box-sizing: border-box;\
		}\
		\
		.seekbar_container {\
			display: flex;\
			justify-content: center;\
			/* for vertical aligning */\
			align-items: center;\
		}\
		\
		.slider{\
			accent-color: red;\
		}\
		\
		.time_display{\
			color: white;\
			min-width:75px;\
			text-align: center;\
			/* make text (like subtitles etc.) unselectable */\
			-webkit-touch-callout: none;\
			-webkit-user-select: none;\
			-khtml-user-select: none;\
			-moz-user-select: none;\
			-ms-user-select: none;\
			user-select: none;\
			-webkit-tap-highlight-color: transparent;\
		}\
		\
		.timing-view\
		{\
			font-family: Titillium Web, Helvetica, sans serif;\
			font-style: normal;\
			font-weight: 400;\
			overflow:hidden;\
		}\
		.data_panel\
		{\
			font-family: Titillium Web, Helvetica, sans serif;\
			font-style: normal;\
			font-weight: 400;\
			overflow:hidden;\
			color: white;\
			position: absolute;\
			z-index: 1050;\
			background-color: rgba(0, 0, 0, 0.850);\
		}\
		.horizontal\
		{\
			display: flex;\
			justify-content: left;\
			/* for vertical aligning */\
			align-items: center;\
		}\
		.timing-header\
		{\
			width: 100%;\
			height: 100%;\
			flex-wrap: wrap;\
			transition: background-color 2s;\
		}\
		.timer-time-remaining\
		{\
			width: 50%;\
			height: 100%;\
			text-align: left;\
		}\
		.timer-header-lower\
		{\
			height: 40%;\
			text-align: center;\
		}\
		.timer-header-upper\
		{\
			height: 60%;\
		}\
		.timer-track-status\
		{\
			width: 50%;\
			height: 100%;\
			font-weight: 700;\
			font-size: 100%;\
			text-align: right;\
		}\
		.timing-f1-logo\
		{\
			height: 100%;\
			width:20%;\
			left:0%;\
		}\
		.timing-session-name\
		{\
			font-weight: 700;\
			font-size: 150%;\
			width: 30%;\
			left: 20%;\
		}\
		.timing-driver-tracker\
		{\
			color: white;\
			background-color: rgba(0,0,0,0);\
			/*background-image: url("https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Netherlands_Circuit.png.transform/9col/image.png"/*https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Hungar%20carbon.png"*/);*/\
			background-size: 100% 100%;\
		}\
		.timing-session-lap-count\
		{\
			font-weight: 600;\
			font-size: 150%;\
			width: 100%;\
			text-align: right;\
		}\
		.leaderboard_background {\
			overflow: hidden;\
			background-image: repeating-linear-gradient(rgba(255, 255, 255, 0.1) 0% 5%, rgba(255, 255, 255, 0.0) 5% 10%);\
			background-color:  rgba(0,0,0,0.85);\
		}\
		.leaderboard {\
			overflow: visible;\
			display: flex;\
			flex-direction: column;\
			width:100%;\
			height:100%;\
		}\
		.leaderboard_row {\
			display: flex;\
			justify-content: left;\
			/* for vertical aligning */\
			align-items: center;\
			height:5%;\
			transition: top 0.5s;\
			position:absolute;\
		}\
		.leaderboard_minisector_row {\
			display: flex;\
			justify-content: left;\
			/* for vertical aligning */\
			align-items: center;\
			height: 50%;\
		}\
		.leaderboard_sub_row {\
			justify-content: left;\
			/* for vertical aligning */\
			align-items: center;\
		}\
		.leaderboard-content {\
			/*margin: 1x 1px 1px 1px;*/\
			/*box-sizing: border-box;*/\
			overflow: hidden;\
			margin-right:0.1em;\
		}\
		.leaderboard_text{\
			font-family: Titillium Web, Helvetica, sans serif;\
			font-style: normal;\
			font-weight: 400;\
			font-size: 100%;\
			color: white;\
			text-align: center;\
			/* make text (like subtitles etc.) unselectable */\
			-webkit-touch-callout: none;\
			-webkit-user-select: none;\
			-khtml-user-select: none;\
			-moz-user-select: none;\
			-ms-user-select: none;\
			user-select: none;\
			-webkit-tap-highlight-color: transparent;\
		}\
		.leaderboard_pb_text_colour\
		{\
			color:rgb(0,255,0);\
		}\
		.leaderboard_fastest_text_colour\
		{\
			color: rgb(255,0,255);\
		}\
		.leaderboard_team_colour{\
			min-width: 3px;\
			max-width: 3px;\
			min-height: 65%;\
		}\
		.leaderboard_id{\
			min-width:1.56em;\
			max-width:1.56em;\
			font-weight: 600;\
		}\
		.leaderboard_driver_number{\
			font-style: italic;\
			min-width:1.56em;\
			max-width:1.56em;\
			font-weight: 600;\
			text-align: center;\
		}\
		.leaderboard_shortname{\
			min-width:2.5em;\
			max-width:2.5em;\
			font-weight: 600;\
			text-align: left;\
		}\
		.leaderboard_name{\
			min-width:6.25em;\
			max-width:6.25em;\
			font-weight: 600;\
			text-align: left;\
		}\
		.leaderboard_truncated_fullname{\
			min-width:7.8125em;\
			max-width:7.8125em;\
			font-weight: 600;\
			text-align: left;\
		}\
		.leaderboard_fullname{\
			min-width:10em;\
			max-width:10em;\
			font-weight: 600;\
			text-align: left;\
		}\
		.leaderboard_time{\
			min-width:4.0625em;\
			max-width:4.0625em;\
		}\
		.leaderboard_time_midlong{\
			font-style: italic;\
			min-width:4.5em;\
			max-width:4.5em;\
		}\
		.leaderboard_time_long{\
			font-style: italic;\
			min-width:6.25em;\
			max-width:6.25em;\
		}\
		.leaderboard_drs {\
			height:75%;\
			font-size: 65%;\
			color:green;\
			border: 1px solid green;\
			border-radius: 0.25em;\
			font-weight: 600;\
			padding-left: 0.125em;\
			padding-right: 0.125em;\
			min-width:2.3em;\
			max-width:2.3em;\
		}\
		.leaderboard_minisector_widget {\
			min-width: 0.2em;\
			max-width: 0.2em;\
			height:100%;\
		}\
		.leaderboard_sector_widget {\
			width: 100%;\
			height:15%;\
			background-color:rgba(0,0,0, 0.5);\
		}\
		.leaderboard_bg_yellow_text_colour\
		{\
			background-color:yellow;\
		}\
		.leaderboard_bg_pb_text_colour\
		{\
			background-color:green;\
		}\
		.leaderboard_bg_fastest_text_colour\
		{\
			background-color:purple;\
		}\
		.leaderboard_telemetry_widget_pedal {\
			width: 2.0em;\
			height:25%;\
			background-color:rgba(0,0,0,0.25);\
		}\
		.leaderboard_throttle_widget {\
			width:100%;\
			height:100%;\
			background-color:rgba(0,155,0,1.0);\
		}\
		.leaderboard_brake_widget {\
			width:100%;\
			height:100%;\
			background-color:rgba(155,0,0,1.0);\
		}\
		.leaderboard_speed {\
			min-width:4.0em;\
			max-width:4.0em;\
		}\
		.leaderboard_gear {\
			min-width:2.5em;\
			max-width:2.5em;\
		}\
		.timing_tyre_image {\
			vertical-align:middle;\
			height:80%;\
		}\
		.leaderboard_tyre_story{\
			font-style: italic;\
			min-width:9.0em;\
			max-width:9.0em;\
			font-weight: 600;\
			text-align: left;\
			height:100%;\
		}\
		.leaderboard_tyre_current{\
			font-style: italic;\
			min-width:3.0em;\
			max-width:3.0em;\
			font-weight: 600;\
			text-align: left;\
		}\
		.driver_tracker_dot{\
			transition: x 0.1s linear, y 0.1s linear;\
			position: absolute;\
			/*border-radius: 50%;\
			min-width:1.6em;\
			max-width:1.6em;\
			min-height:1.6em;\
			max-height:1.6em;*/\
			font-size: 100%;\
			text-align: center;\
			text-shadow: 1px 1px black;\
		}\
		.race_control_messages{\
			overflow: scroll;\
			-ms-overflow-style: none;  /* IE and Edge */\
			scrollbar-width: none;  /* Firefox */\
			z-index:1050;\
			position:absolute;\
			background-color: rgba(0, 0, 0, 0.850);\
		}\
		.race_control_messages::-webkit-scrollbar {\
			display: none;\
		}\
		.race_control_individual_message{\
			animation: race_control_fade 5s 1;\
		}\
		@keyframes race_control_fade {\
			from {background-color: rgba(30,70,150,0.75);}\
			to {background-color: rgba(255,255,255,0);}\
		}\
		.overlay_telemetry_widget{\
		   left:5%;\
		   top: 50%;\
		   width:90%;\
		   height: 45%;\
		   position:absolute;\
		}\
		.overlay_telemetry_widget_circle_progress{\
		   fill:transparent;\
		   stroke:rgba(0,0,0,0.5);\
		   stroke-width:11;\
		   stroke-linecap:round;\
		   stroke-dashoffset:0;\
		}\
		.overlay_telemetry_widget_throttle{\
		   cx:200;\
		   cy:95;\
		   r: 65;\
		   stroke-dasharray:408.407;\
		   stroke:green;\
		   transform: rotate(180deg);\
		   transform-origin: 200px 95px;\
		}\
		.overlay_telemetry_widget_brake{\
		   cx:200;\
		   cy:95;\
		   r: 65;\
		   stroke-dasharray:408.407;\
		   stroke:red;\
		   transform: scaleY(-1.0);\
		   transform-origin: 200px 95px;\
		}\
		.overlay_telemetry_widget_speedometer{\
		   cx:200;\
		   cy:95;\
		   r: 80;\
		   stroke-dasharray:502.655;\
		   stroke:blue;\
		   transform: rotate(180deg);\
		   transform-origin: 200px 95px;\
		}\
		/*.overlay_telemetry_widget_throttle{\
		   left:5%;\
		   top:87%;\
		   width:35%;\
		   height: 8%;\
		   position:absolute;\
		   transform: rotate(-45deg);\
		}\
		.overlay_telemetry_widget_brake{\
		   left:5%;\
		   top:77%;\
		   width:35%;\
		   height: 8%;\
		   position:absolute;\
		   transform: rotate(-45deg);\
		}*/\
		.overlay_telemetry_widget_pedal_rect{\
		   x:0%;\
		   y:0%;\
		   width:100;\
		   height: 100;\
		}\
	   .overlay_telemetry_widget_pedal_rect_bg{\
		   fill:rgba(0,0,0,0.25);\
		}\
		.overlay_telemetry_widget_pedal_rect_throttle{\
		   fill:rgba(0,155,0,1.0);\
		}\
		.overlay_telemetry_widget_pedal_rect_brake{\
		   fill:rgba(155,0,0,1.0);\
		}\
		.overlay_telemetry_widget_gear_bg{\
		   x: 189;\
		   y: 45;\
		   width: 22;\
		   height: 25;\
		   rx: 5;\
		   ry: 5;\
		   fill: rgba(0,0,0,0.5);\
		}\
		.overlay_telemetry_widget_gear{\
		   fill:white;\
		}\
		.overlay_telemetry_widget_drs_bg{\
		   x: 184;\
		   y: 75;\
		   width: 32;\
		   height: 15;\
		   rx: 2;\
		   ry: 2;\
		   stroke: green;\
		   fill: rgba(0,155,0,0.0);\
		}\
		.overlay_telemetry_widget_drs{\
		   fill:green;\
		}\
		.overlay_telemetry_widget_speed{\
		   left:5%;\
		   top:40%;\
		   width:25%;\
		   height: 10%;\
		   position:absolute;\
		   fill:white;\
		}\
		.overlay_telemetry_widget_interval{\
		   left:5%;\
		   top:50%;\
		   width:25%;\
		   height: 10%;\
		   position:absolute;\
		   fill:white;\
		}\
		.overlay_telemetry_widget_leader{\
		   left:5%;\
		   top:60%;\
		   width:25%;\
		   height: 10%;\
		   position:absolute;\
		   fill:white;\
		}\
		</style>\
		<meta name="description" content="An F1 video application" data-react-helmet="true">\
		<meta charset="UTF-8" data-react-helmet="true">\
		<link href="https://fonts.googleapis.com/css?family=Titillium+Web:400,600,600i" rel="stylesheet" type="text/css">\
		</head>';

	const g_sMutliviewMainBodyHTML = '<body>\
		<div id="click_to_start" class="click_to_start">CLICK TO START</div>\
		<div id="videos"></div>\
		<div id="control-bar" style="min-height: 25%; position: absolute; z-index: 1100; left: 0px; bottom: 0px; width: 100%">\
		<div id="control-bar-viewer" class="container-div" style="position: absolute;  bottom: 0px; width: 100%; background-color: rgba(0, 0, 0, 0.750); display:none;">\
		<div class="seekbar_container">\
		<button id="play-video" class="container-content">PLAY/PAUSE</button>\
		<span class="time_display container-content" id="current-played-time">00:00:00</span>\
		<input id="seekbar" class="slider container-content" type="range" min="0" max="100" value="0" style="width: 100%;"> \
		<span class="time_display container-content" id="total-time">00:60:00</span>\
		<button id="fullscreen" class="container-content">Fullscreen</button>\
		</div>\
		<div class="container-content">\
			<table class="video-table" id="video-settings-table">\
				<tr>\
					<th>Video ID</th>\
					<th>Feed</th>\
					<th>Audio</th>\
					<th>Volume</th>\
					<th>Left/Right Audio Mix</th>\
					<th>Quality</th>\
					<th>Live Synch.</th>\
					<th>Time Offset</th>\
				</tr>\
			</table>\
		</div>\
		</div></div>\
		</body></html>';

	const g_sMutliviewSubBodyHTML = '<body>\
			<div id="click_to_start" class="click_to_start">CLICK TO START</div>\
			<div id="videos"></div>\
		</body></html>';

	let gContentID = "";
	var gLayoutType = LAYOUT_THEATRE;
	var gDataSquashedWindowID = -1;
	let gLayoutSubType = 0;//"16by9" of 21 by 9 or multiwindow;
	let gLayoutViewType = 0; //Video or data+video
	let gLayoutID = 0;
	let gLayoutSubWindowID = 0;
	var gMultiviewLayout; //ultimately a copy of smFramePositionsXXbyXX[xx]

	var location_hash_split = window.location.hash.split(":");

	if (location_hash_split[0] == "#f1tvplus")
	{
		gContentID = location_hash_split[1]
		switch(location_hash_split[2])
		{
			case "theatre":
				gLayoutType = LAYOUT_THEATRE;
				break;

			case "popout":
				gLayoutType = LAYOUT_POPOUT;
				break;

			case "multipopout":
				gLayoutType = LAYOUT_MULTIVIEW;
				gLayoutSubType = location_hash_split[3];
				gLayoutViewType = [location_hash_split[4]];
				gLayoutID = location_hash_split[5];
				gMultiviewLayout = gLayouts[location_hash_split[3]][location_hash_split[4]][location_hash_split[5]];
/*
				switch(location_hash_split[3])
				{
					case "16by9":
						gMultiviewLayout = gDataLayout16by9[location_hash_split[4]];
						break;

					case "21by9":
						gMultiviewLayout = gDataLayout16by9[location_hash_split[4]];
						break;
				}*/
				break;

			case "submultipopout":
				gLayoutType = LAYOUT_SUBMULTIVIEW;
				gLayoutSubType = location_hash_split[3];
				gLayoutViewType = [location_hash_split[4]];
				gLayoutID = location_hash_split[5];
				gLayoutSubWindowID = location_hash_split[6];
				gMultiviewLayout = gLayouts[location_hash_split[3]][location_hash_split[4]][location_hash_split[5]];

				/*
				switch(location_hash_split[3])
				{
					case "16by9":
						gMultiviewLayout = gDataLayout16by9[location_hash_split[4]];
						break;

					case "21by9":
						gMultiviewLayout = gDataLayout16by9[location_hash_split[4]];
						break;
				}*/
				break;
		}
	}

	function setupTheatre()
	{
		if (document.readyState === 'loading')
		{// Loading hasn't finished yet
			unsafeWindow.addEventListener('DOMContentLoaded', setupTheatre);
			return;
		}

		var smHtml = "<div id='sm-theater-style'>" +
			"<style>" +
			"#sm-btn-theater { background-color: #ffc1c1; }" +
			".vod-detail-page .container-lg:first-of-type { width: 100%; max-width: 100%; }" +
			".vod-detail-page .container-lg:first-of-type .col-xl-10.offset-xl-1 { margin: 0; width: 100%; max-width: 100%; flex: 0 0 100%; }" +
			".inset-video-item-container { margin-top: 0 !important; }" +
			".inset-video-item-image-container { max-height: calc(100vh - 100px); }" +
			".inset-video-item-play-action-container { width: 100%; }" +
			".sticky-header-wrapper.is-menu { margin-bottom: 94px; }" +
			"nav.navbar { height: auto !important; }" +
			"</style>" +
			"</div>";
		document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smHtml);
	}

	function destroyTheatre()
	{
		var el = document.getElementById("sm-theater-style");
		if(el)
			el.outerHTML = "";
	}

	function setupPopout()
	{
		var smHtml = "<div id='sm-popup-id' style='display: none;'>0</div>" +
			"<div class='sm-bg' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index: 999;'>" +
			"<img style='display: block; margin: 50vh auto auto auto; transform: translateY(-50%);' src='https://f1tv.formula1.com/static/3adbb5b25a6603f282796363a74f8cf3.png'>" +
			"</div>" +
			"<style>" +
			"body {overflow: hidden;}" +
			".inset-video-item-image-container {position: fixed !important; z-index: 1000; top: 0; left: 0; height: 100%; width: 100%; background-color: #000;}" +
			".inset-video-item-image {margin-top: 50vh; transform: translateY(-50%);}" +
			".inset-video-item-play-action-container {width: 100%;}" +
			"</style>";
		document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smHtml);
	}

	//WILL FAIL IF SESSION CROSSES MIDNIGHT.
	class date_time
	{
		m_iYear = 0;
		m_iMonth = 0;
		m_iDay = 0;
		m_iHour = 0;
		m_iMins = 0;
		m_fSecs = 0; //floating point

		m_fTimeInSecs = 0; //ignoring date, time in seconds since midnight (float)

		constructor(p_year, p_month, p_day, p_hour, p_mins, p_secs)
		{
			this.m_iYear = p_year ? p_year : 0;
			this.m_iMonth = p_month ? p_month : 0;
			this.m_iDay = p_day ? p_day : 0;
			this.m_iHour = p_hour ? p_hour : 0;
			this.m_iMins = p_mins ? p_mins : 0;
			this.m_fSecs = p_secs ? p_secs : 0;

			this.#calcTimeInSecs();
		}

		#calcTimeInSecs()
		{
			this.m_fTimeInSecs = this.m_iHour * 3600 + this.m_iMins * 60 + this.m_fSecs;
		}

		isEqual(p_datetime)
		{
			return this.m_iYear == p_datetime.m_iYear &&
				this.m_iMonth == p_datetime.m_iMonth &&
				this.m_iDay == p_datetime.m_iDay &&
				this.m_iHour == p_datetime.m_iHour &&
				this.m_iMins == p_datetime.m_iMins &&
				this.m_fSecs == p_datetime.m_fSecs;
		}

		addTime(p_rhs)
		{
			this.m_fTimeInSecs += p_rhs.m_fTimeInSecs;
			this.m_iHour = Math.floor(this.m_fTimeInSecs / 3600);
			this.m_iMins = Math.floor((this.m_fTimeInSecs - (hours * 3600)) / 60);
			this.m_fSecs = this.m_fTimeInSecs - (hours * 3600) - (minutes * 60);
		}

		getTimeDifferenceSeconds(p_rhs)
		{
			return this.m_fTimeInSecs - p_rhs.m_fTimeInSecs;
		}

		toTimeString()
		{
			return this.m_iHour.toString().padStart(2, '0') + ":" +
					this.m_iMins.toString().padStart(2, '0') + ":" +
					Math.floor(this.m_fSecs).toString().padStart(2, '0');
		}

		addSeconds(p_secs)
		{
			this.m_fTimeInSecs += p_secs;
			this.m_iHour = Math.floor(this.m_fTimeInSecs / 3600);
			this.m_iMins = Math.floor((this.m_fTimeInSecs - (this.m_iHour * 3600)) / 60);
			this.m_fSecs = this.m_fTimeInSecs - (this.m_iHour * 3600) - (this.m_iMins * 60);
		}

		subtractSeconds(p_secs)
		{
			this.m_fTimeInSecs -= p_secs;
			this.m_iHour = Math.floor(this.m_fTimeInSecs / 3600);
			this.m_iMins = Math.floor((this.m_fTimeInSecs - (this.m_iHour * 3600)) / 60);
			this.m_fSecs = this.m_fTimeInSecs - (this.m_iHour * 3600) - (this.m_iMins * 60);
		}

		subtractJSONTime(p_rhs)
		{
			this.m_fTimeInSecs -= p_rhs.m_fTimeInSecs;
			this.m_iHour = Math.floor(this.m_fTimeInSecs / 3600);
			this.m_iMins = Math.floor((this.m_fTimeInSecs - (this.m_iHour * 3600)) / 60);
			this.m_fSecs = this.m_fTimeInSecs - (this.m_iHour * 3600) - (this.m_iMins * 60);
		}

		addJSONTime(p_rhs)
		{
			this.m_fTimeInSecs += p_rhs.m_fTimeInSecs;
			this.m_iHour = Math.floor(this.m_fTimeInSecs / 3600);
			this.m_iMins = Math.floor((this.m_fTimeInSecs - (this.m_iHour * 3600)) / 60);
			this.m_fSecs = this.m_fTimeInSecs - (this.m_iHour * 3600) - (this.m_iMins * 60);
		}

		setByTimeInSeconds(p_secs)
		{
			this.m_fTimeInSecs = p_secs;
			this.m_iHour = Math.floor(this.m_fTimeInSecs / 3600);
			this.m_iMins = Math.floor((this.m_fTimeInSecs - (this.m_iHour * 3600)) / 60);
			this.m_fSecs = this.m_fTimeInSecs - (this.m_iHour * 3600) - (this.m_iMins * 60);
		}

		isLessThan(p_rhs)
		{
			return this.m_fTimeInSecs < p_rhs.m_fTimeInSecs;
		}

		lerp(p_rhs, p_frac)
		{
			this.m_fTimeInSecs += (p_rhs.m_fTimeInSecs - this.m_fTimeInSecs) * p_frac;
			this.m_iHour = Math.floor(this.m_fTimeInSecs / 3600);
			this.m_iMins = Math.floor((this.m_fTimeInSecs - (this.m_iHour * 3600)) / 60);
			this.m_fSecs = this.m_fTimeInSecs - (this.m_iHour * 3600) - (this.m_iMins * 60);
		}
	}

	function copyDateTime(p_rhs)
	{
		return new date_time(p_rhs.m_iYear,
					p_rhs.m_iMonth,
					p_rhs.m_iDay,
					p_rhs.m_iHour,
					p_rhs.m_iMins,
					p_rhs.m_fSecs);
	}



	function parseDateTime(p_str)
	{
		let start = 0;
		let end = p_str.indexOf('-', start);
		let year = parseInt(p_str.slice(start, end));
		start = end + 1;

		end = p_str.indexOf('-', start);
		let month = parseInt(p_str.slice(start, end));
		start = end + 1;

		end = p_str.indexOf('T', start);
		let day = parseInt(p_str.slice(start, end));
		start = end + 1;

		end = p_str.indexOf(':', start);
		let hour = parseInt(p_str.slice(start, end));
		start = end + 1;

		end = p_str.indexOf(':', start);
		let mins = parseInt(p_str.slice(start, end));
		start = end + 1;

		end = p_str.indexOf('Z', start);
		if(end === -1) end = p_str.length;
		let secs = parseFloat(p_str.slice(start, end));

		return new date_time(year, month, day, hour, mins, secs);
	}

	function parseTimeSinceMidnight(p_utc)
	{
		let start = p_utc.indexOf('T', 0) + 1;
		let end = p_utc.indexOf(':', start);
		let hour = parseInt(p_utc.slice(start, end));
		start = end + 1;

		end = p_utc.indexOf(':', start);
		let mins = parseInt(p_utc.slice(start, end));
		start = end + 1;

		end = p_utc.indexOf('Z', start);
		if(end === -1) end = p_utc.length;
		let secs = parseFloat(p_utc.slice(start, end));

		return hour * 3600 + mins * 60 + secs;
	}

	function parseJSONTime(p_str)
	{
		let start = 0;
		let end = p_str.indexOf(':', start);
		let hour = parseInt(p_str.slice(start, end));
		start = end + 1;

		end = p_str.indexOf(':', start);
		let mins = parseInt(p_str.slice(start, end));
		start = end + 1;

		let secs = parseFloat(p_str.slice(start));

		return new date_time(0, 0, 0, hour, mins, secs);
	}

	function parseJSONTimeSinceMidnight(p_str)
	{
		let start = 0;
		let end = p_str.indexOf(':', start);
		let hour = parseInt(p_str.slice(start, end));
		start = end + 1;

		end = p_str.indexOf(':', start);
		let mins = parseInt(p_str.slice(start, end));
		start = end + 1;

		let secs = parseFloat(p_str.slice(start));

		return hour * 3600 + mins * 60 + secs;;
	}

	function timeInSecondsToString(p_time)
	{
		let t = new date_time();
		t.setByTimeInSeconds(p_time);
		return t.toTimeString();
	}

	function splitByLine(p_str)
	{
		return p_str.split("\r\n");
	}

	function getFirstLine(p_str)
	{
		return p_str.split("\r\n", 1)[0];
	}

	function decodeToJSON(p_data)
	{
		let data = atob(p_data);
		data = pako.inflateRaw(Uint8Array.from(data, c => c.charCodeAt(0)), {to: 'string'});
		return JSON.parse(data);
	}

	function decodeToString(p_data)
	{
		let data = atob(p_data);
		return pako.inflateRaw(Uint8Array.from(data, c => c.charCodeAt(0)), {to: 'string'});
	}

	function decodeToArray(p_data)
	{
		let start = 0,
			end = 0,
			str = "",
			first = 0,
			last = 0,
			b_first = true;

		start = p_data.indexOf('"', 0);
		while(start != -1)
		{
			start++;
			end = p_data.indexOf('"', start);
			let new_str = decodeToString(p_data.slice(start, end));

			start = p_data.indexOf('"', end + 1 );

			//trim the string so it forms a valid array.
			if(!b_first)
			{
				b_first = false;
				first = new_str.indexOf('[{', 0);
				last = new_str.indexOf('}]', 0);

				if(start == -1)
					str += new_str.slice(first + 1, last + 1);
				else
					str += new_str.slice(first + 1, last + 1) + ',';
			}
			else
			{
				b_first = false;
				last = new_str.indexOf('}]', 0);
				str += new_str.slice(0, last + 1) + ',';
			}
		}

		str += ']}';

		return JSON.parse(str);

		/*			//?save the first time - could be useful for syncing??
			let i = 0
			for(let i = 0; i < lines.length - 1; i++)
			{
				let data = decodeToJSON( lines[i].split('"')[1]);
				this.#m_aCarData.push(...data['Entries']);
			}*/
	}

	class message_stream
	{
		#m_aMessages;
		#m_iNextMessageID;
		#m_fPrintFunction;

		constructor(p_fPrint)
		{
			if(p_fPrint)
				this.#m_fPrintFunction = p_fPrint;
			else
				this.#m_fPrintFunction = null;

			this.#m_iNextMessageID = 0;
			this.#m_aMessages = new Array();
		}

		addData(p_data)
		{
			this.#m_aMessages[this.#m_aMessages.length] = p_data;
		}

		resetIndex()
		{
			this.#m_iNextMessageID = 0;
		}

		getCount()
		{
			return this.#m_aMessages.length;
		}

		getUpdates(p_time)
		{
			if( ! this.#m_aMessages || ! this.#m_aMessages.length)
				return null;

			let output = new Array();
			let id = this.#m_iNextMessageID;
			while(this.#m_aMessages[id] &&
				this.#m_aMessages[id].Utc < p_time)
			{
				if(this.#m_fPrintFunction)
					output[output.length] = this.#m_fPrintFunction(this.#m_aMessages[id]);
				else
					output[output.length] = this.#m_aMessages[id];

				id++;
			}

			this.#m_iNextMessageID = id;

			return output;
		}
	};

	class json_stream
	{
		#m_aData; //this will be 2d array - 1 entry for each second, then the sorted entries for that single second of time.
		#m_tStartTime;
		//#m_tEndTime;
		#m_fGetInterpolatedData;

		constructor(p_fPrint)
		{
			this.#m_fGetInterpolatedData = p_fPrint;
			this.#m_tStartTime = null;
			this.#m_aData = new Array();
		}

		//must be added in time order.
		//p_data must have a time entry stored in: Utc
		addDataEntry(p_data)
		{
			if(this.#m_tStartTime === null)
				this.#m_tStartTime = p_data.Utc;//copyDateTime(p_data.Utc);

			let id = Math.floor(p_data.Utc/*.m_fTimeInSecs*/ - this.#m_tStartTime/*.m_fTimeInSecs*/);

			if(!this.#m_aData[id])
				this.#m_aData[id] = new Array();

			this.#m_aData[id][this.#m_aData[id].length] = p_data;

			//check the prior seconds have data within them.
			id--;
			while(id > 0 && ! this.#m_aData[id])
			{
				//we just put the same piece of data here.
				//it will get properly interpolated using the actual m_fTimeInSecs in getData.
				//will result in some duplication, but saves the potential for an unknown number of empty seconds to skip in getData
				this.#m_aData[id] = [p_data];
				id--;
			}
		}

		getData(p_time)
		{
			if(this.#m_aData.length === 0 )
				return {};

			let id = Math.floor(p_time/*.m_fTimeInSecs*/ - this.#m_tStartTime/*.m_fTimeInSecs*/);
			id = Math.min(Math.max(id, 0), this.#m_aData.length - 1); //clamp

			let i = 0,
				count = this.#m_aData[id].length;

			while( i < count &&
					p_time/*.m_fTimeInSecs*/ > this.#m_aData[id][i].Utc/*.m_fTimeInSecs*/)
				i++;

			let high;
			let low;

			if(i === count)
			{
				if(id === this.#m_aData.length - 1)//this is the very last data entry, doesn't need interpolating
					return this.#m_fGetInterpolatedData(this.#m_aData[id][i-1], this.#m_aData[id][i-1], 1.0);
				else//use the first item in next seconds' data.
					high = this.#m_aData[id+1][0];
			}
			else
			{
				high = this.#m_aData[id][i];
			}

			if(i === 0)
			{
				if(id === 0)//this is the very first data entry, doesn't need interpolating
					return this.#m_fGetInterpolatedData(this.#m_aData[id][i], this.#m_aData[id][i], 1.0);
				else//use the last item in previous seconds' data.
					low = this.#m_aData[id-1][this.#m_aData[id-1].length - 1];
			}
			else
			{
				low = this.#m_aData[id][i-1];
			}

			if(high.Utc === low.Utc)
				return this.#m_fGetInterpolatedData(low, high, 1.0);

			let frac = (p_time/*.m_fTimeInSecs*/ - low.Utc/*.m_fTimeInSecs*/) / (high.Utc/*.m_fTimeInSecs*/ - low.Utc/*.m_fTimeInSecs*/);

			return this.#m_fGetInterpolatedData(low, high, frac);
		}
	}

	class live_timing
	{
		//https://www.formula1.com/etc/designs/fom-website/images/LT/img/circuit-maps/Silverstone.png
		//https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/medium-used.png


		#m_eRenderer;
		#m_sApiRoot = "https://livetiming.formula1.com/signalr";
		#connection;
		#hubProxy;
		#m_aDriverInfo;

		#m_fHeartBeatTimeDelta;
		#m_msTiming;
		#m_msTimingApp;
		#m_msExtrapolatedClock
		#m_msRaceControlMessages;
		#m_msLaps;
		#m_msSessionStatus;
		//#m_iNextMessageID; //this is the ID of the next message in the queue

		#m_jsCarData;
		#m_jsPosData;

		#m_tRaceStartTime;

		#m_tCurrentTime;

		#m_iLapCount;

		#m_aDriverLapTimes;
		#m_aFastestLap;
		#m_bCircuitMapCreated;

		constructor(p_layout, p_renderer, p_session_name)
		{
			//start the signalr connection
			this.#connection = $.hubConnection(this.#m_sApiRoot, { useDefaultPath: false });
			this.#hubProxy = this.#connection.createHubProxy('Streaming');
			this.#hubProxy.on('feed',this.#onData.bind(this));
			this.#connection.logging = true;
			this.#connection.start({waitForPageLoad: false, transport: ['serverSentEvents', 'webSockets', 'foreverFrame', 'longPolling']})
				.done(this.#onConnectionStart.bind(this))
				.fail(function()
				{
					console.log('Live Timing: Could not connect');
				});

				this.#m_msTiming = new message_stream();
				this.#m_msTimingApp = new message_stream();
				this.#m_msExtrapolatedClock = new message_stream();

				this.#m_msRaceControlMessages = new message_stream(/*this.#printRaceControlMessage.bind(this)*/);
				this.#m_msLaps = new message_stream(this.#printLapMessage.bind(this));
				this.#m_msSessionStatus = new message_stream(this.#printSessionStatusMessage.bind(this));

				this.#m_jsCarData = new json_stream(this.#getInterpolatedCarData.bind(this));
				this.#m_jsPosData = new json_stream(this.#getInterpolatedCarPos.bind(this));
				/*
			this.#m_msTiming = new message_stream(this.#printTimingMessage.bind(this));
			this.#m_msRaceControlMessages = new message_stream(this.#printRaceControlMessage.bind(this));
			this.#m_msLaps = new message_stream(this.#printLapMessage.bind(this));
			this.#m_msSessionStatus = new message_stream(this.#printSessionStatusMessage.bind(this));

			this.#m_jsCarData = new json_stream(this.#getInterpolatedCarData.bind(this));
			this.#m_jsPosData = new json_stream(this.#getInterpolatedCarPos.bind(this));*/

			this.#m_eRenderer = p_renderer;
			this.#m_eRenderer.setSessionName(p_session_name);
			//to signify nothing displayed.
			this.#m_tCurrentTime = new date_time(0,0,0,0,0,0);

			this.#m_iLapCount = 50;
			this.#m_fHeartBeatTimeDelta = 0;

			this.#m_aDriverLapTimes = new Array();
			this.#m_aFastestLap = new Array();
			this.#m_bCircuitMapCreated = false;

			//this.#m_aDriverList = null;

			//get the links for the year,
			//event
			//session type
			//	resultObj.containers[0].metadata.year
		}
/*
		#resetMessageStreams()
		{
			this.#m_msTiming.m_iNextMessageID = 0;
			this.#m_msRaceControlMessages.m_iNextMessageID = 0;
			this.#m_msLaps.m_iNextMessageID = 0;
			this.#m_msSessionStatus.m_iNextMessageID = 0;
		}*/


		#onConnectionStart()
		{
			let topics = ["Heartbeat", "CarData.z", "Position.z",
					   "ExtrapolatedClock", "TopThree", "RcmSeries",
					   "TimingStats", "TimingAppData",
					   "WeatherData", "TrackStatus", "DriverList",
					   "RaceControlMessages", "SessionInfo",
					   "SessionData", "LapCount", "TimingData"];

			//alert("done");
			console.log('Now connected, connection ID=' + this.#connection.id);

			this.#hubProxy.invoke('Subscribe',topics)
				.done(this.#onInitialData.bind(this))
				.fail(function (error) {
					console.log('Invocation of Subscribe failed. Error: ' + error);
				});
		}

		#onInitialData(p_data)
		{
			for(let info in p_data)
			{
				this.#onData(info, p_data[info], p_data["Heartbeat"].Utc);
			}

			console.log(p_data);
		}

		#onData(p_category, p_data, p_date)
		{
			//this.#m_saved_data[this.#m_saved_data.length] = {};
			//this.#m_saved_data[this.#m_saved_data.length-1][p_category] = p_data;
			//console.log(JSON.stringify(this.#m_saved_data));

			let json_time = parseTimeSinceMidnight(p_date);
			let time = json_time + this.#m_fHeartBeatTimeDelta;
			//this.#m_fHeartBeatTimeDelta =
			//USE THE HEARTBEAT TO MAINTAIN A UTC TIME DELTA FOR TIME RECORDING
			console.log(p_category + "  :  " + p_date + "  :   " + JSON.stringify(p_data));
			//let time = parseDateTime(p_date);

			switch(p_category)
			{
				case "Heartbeat":
					this.#m_fHeartBeatTimeDelta = parseTimeSinceMidnight(p_data.Utc) - json_time;
					break;
				case "CarData.z":
					this.#onLoadCarData(p_data, time);
					break;
				case "Position.z":
					this.#onPositionData(p_data, time);
					break;
				case "ExtrapolatedClock":
					this.#onExtrapolatedClockData(p_data, time);
					break;
				case "TopThree":
					break;
				case "RcmSeries":
					break;
				case "TimingStats":
					break;
				case "TimingAppData":
					this.#onTimingAppData(p_data, time);
					break;
				case "WeatherData":
					/*        "WeatherData": {
			"AirTemp": "22.7",
			"Humidity": "77.0",
			"Pressure": "1017.2",
			"Rainfall": "0",
			"TrackTemp": "33.6",
			"WindDirection": "147",
			"WindSpeed": "1.2",
			"_kf": true
		}
					*/
					break;
				case "TrackStatus":
					break;
				case "DriverList":
					if(! this.#m_aDriverInfo)
						this.#onDriverListData(p_data);
					break;
				case "RaceControlMessages":
					console.log("RaceControlMessages : " + JSON.stringify(p_data));
					this.#onLoadRaceControlMessages(p_data, time);
					break;
				case "SessionInfo":
					this.#m_eRenderer.setSessionInfo(p_data);
					//this.#onSessionInfoData(p_data, time);
					break;
				case "SessionData":
					this.#onLoadSessionData(p_data, time);
					break;
				case "LapCount":
					if(p_data.TotalLaps)
						this.#m_iLapCount = p_data.TotalLaps;
					break;
				case "TimingData":
					this.#onTimingData(p_data, time);
					break;

			}
			//console.log(p_data);
		}

		//only gets called once.
		#onDriverListData(p_data)
		{
			this.#m_aDriverInfo = p_data;
			delete(this.#m_aDriverInfo._kf);
		}

		#onTimingData(p_data, p_time)
		{
			if(this.#m_msTiming.getCount() === 0)
			{ //this puts in the initial list.
				this.#m_msTiming.addData({"Lines": this.#m_aDriverInfo,
											"Utc": 0/*new date_time()*/});
			}

			let data = p_data;
			data.Utc = p_time;
			this.#m_msTiming.addData(data);

			for(const id in data.Lines)
			{
				if(data.Lines[id].LastLapTime && data.Lines[id].LastLapTime.Value && data.Lines[id].LastLapTime.Value.length)
				{
					if(!this.#m_aDriverLapTimes[id])
						this.#m_aDriverLapTimes[id] = new Array();

					this.#m_aDriverLapTimes[id][this.#m_aDriverLapTimes[id].length] =
					{
						"LapTime" : data.Lines[id].LastLapTime.Value,
						"Utc" : data.Utc
					}

					if(data.Lines[id].LastLapTime.PersonalFastest && this.#m_aDriverLapTimes[id].length - 1 > 0 && !this.#m_bCircuitMapCreated)//this ensures its not the first lap recorded, as this may not have complete GPS data - it needs to be the second lap
						this.#createCircuitMap(id, this.#m_aDriverLapTimes[id].length - 1);

					if(data.Lines[id].LastLapTime.OverallFastest)
					{
						this.#m_aFastestLap[0] = id;
						this.#m_aFastestLap[1] = this.#m_aDriverLapTimes[id].length - 1;
					}
				}
			}
		}

		#onTimingAppData(p_data, p_time)
		{
			let data = p_data;
			data.Utc = p_time;
			this.#m_msTimingApp.addData(data);
		}

		/*
		#printTimingMessage(p_item)
		{
			return p_item;
		}
*/
		#onExtrapolatedClockData(p_data, p_time)
		{
			let data = p_data;
			data.Utc = p_time;
			this.#m_msExtrapolatedClock.addData(data);

			/*
			for(let i = 0; i < p_data.Messages.length; i++)
			{
				let data = p_data.Messages[i];
				data.Utc = parseDateTime(p_data.Messages[i].Utc);
				this.#m_msExtrapolatedClock.addData(data);
			}

			console.log(this.#m_msRaceControlMessages);*/
		}

		#onLoadRaceControlMessages(p_data, p_time)
		{
			//for(let i = 0; i < p_data.Messages.length; i++)
			for(const i in p_data.Messages)
			{
				let data = p_data.Messages[i];
				data.Utc = parseTimeSinceMidnight/*parseDateTime*/(p_data.Messages[i].Utc);
				this.#m_msRaceControlMessages.addData(data);
			}

			console.log(this.#m_msRaceControlMessages);
		}
/*
		#printRaceControlMessage(p_item)
		{
			//let output;
			let item = p_item.Utc.toTimeString() + ": ";

			switch(p_item.Category)
			{
				case 'Drs':
					item += p_item.Message;
					break;

				case 'Flag':
					item += p_item.Category + " : " + p_item.Message;
					break;

				case 'Other':
				default:
					item += p_item.Message;
					break;
			}
			return item;
		}*/

		#onLoadSessionData(p_data, p_time)
		{
			if(p_data.Series)
			{
				//for(let i = 0; i < p_data.Series.length; i++)
				for(const i in p_data.Series)
				{
					let data = p_data.Series[i];
					data.Utc = parseTimeSinceMidnight/*parseDateTime*/(p_data.Series[i].Utc);
					this.#m_msLaps.addData(data);
				}
			}

			if(p_data.StatusSeries)
			{
				//for(let i = 0; i < p_data.StatusSeries.length; i++)
				for(const i in p_data.StatusSeries)
				{
					let data = p_data.StatusSeries[i];
					data.Utc = parseTimeSinceMidnight/*parseDateTime*/(p_data.StatusSeries[i].Utc);
					this.#m_msSessionStatus.addData(data);

					if(data.SessionStatus &&
						data.SessionStatus == "Started")
						this.#m_tRaceStartTime = data.Utc;
				}
			}

			//console.log(this.#m_msLaps);
			//console.log(this.#m_msSessionStatus);
		}

		#printLapMessage(p_item)
		{
			if(p_item.Lap)
				return [p_item.Lap, this.#m_iLapCount];

			if(p_item.QualifyingPart)
				return [p_item.QualifyingPart];
		}

		#printSessionStatusMessage(p_item)
		{
			if(p_item.SessionStatus)
			{
				return {SessionStatus: p_item.SessionStatus}
			}
			else if(p_item.TrackStatus)
			{
				return {TrackStatus: p_item.TrackStatus}
			}
			else
				return {};
		}

		#onLoadCarData(p_data, p_time)
		{
			let data = decodeToJSON(p_data).Entries;

			for( let i = 0; i < data.length; i++)
			{
				data[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(data[i].Utc);
				this.#m_jsCarData.addDataEntry(data[i]);
			}
		}

		#getInterpolatedCarData(p_low, p_high, p_lerp_amount)
		{
			let output = {};
			//{'0': 'RPM', '2': 'Speed', '3': 'nGear', '4': 'Throttle', '5': 'Brake', '45': 'DRS'}

			for(const id in p_low.Cars)
			{
				output[id] = {};
				output[id].rpm = p_low.Cars[id].Channels[0] + p_lerp_amount *  (p_high.Cars[id].Channels[0] - p_low.Cars[id].Channels[0]);
				output[id].speed = p_low.Cars[id].Channels[2] + p_lerp_amount *  (p_high.Cars[id].Channels[2] - p_low.Cars[id].Channels[2]);
				output[id].gear = p_low.Cars[id].Channels[3];
				output[id].throttle = p_low.Cars[id].Channels[4] + p_lerp_amount *  (p_high.Cars[id].Channels[4] - p_low.Cars[id].Channels[4]);
				output[id].brake = p_low.Cars[id].Channels[5];
				output[id].drs = p_low.Cars[id].Channels[45];
			}
			return output;
		}

		#onPositionData(p_data, p_time)
		{
			let data = decodeToJSON(p_data).Position;

			for( let i = 0; i < data.length; i++)
			{
				data[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(data[i].Timestamp);
				delete data[i].Timestamp;//we don't need this anymore.
				this.#m_jsPosData.addDataEntry(data[i]);
			}

			return;
		}

		#getInterpolatedCarPos(p_low, p_high, p_lerp_amount)
		{
			let output = {};

			for(const id in p_low.Entries)
			{
				output[id] = {};
				output[id].status = p_low.Entries[id].Status;
				output[id].x = p_low.Entries[id].X + p_lerp_amount *  (p_high.Entries[id].X - p_low.Entries[id].X);
				output[id].y = p_low.Entries[id].Y + p_lerp_amount *  (p_high.Entries[id].Y - p_low.Entries[id].Y);
				output[id].z = p_low.Entries[id].Z + p_lerp_amount *  (p_high.Entries[id].Z - p_low.Entries[id].Z);
			}
			return output;
		}

		#createCircuitMap(p_id, p_lap_num)
		{
		   //in live timing this uses the PB time that is not the first lap.
		   //The first driver to set this is p_id
		   //it has to not be the first lap as this may not have complete GPS data

		   if(p_lap_num == 0)
			   return;

		   //1st Utc
		   let first = this.#m_aDriverLapTimes[p_id][p_lap_num-1].Utc;
		   let second = this.#m_aDriverLapTimes[p_id][p_lap_num].Utc;

		   let interval = (second - first) / 500;

		   let trackMapArray = new Array();
		   let min_bounds = [0,0];
		   let max_bounds = [0,0];
		   let x = "x",
			   z = "y";

		   for(let i = first, j = 0; i < second; i += interval, j++)
		   {
			   trackMapArray[j] = this.#m_jsPosData.getData(i)[this.#m_aFastestLap[0]];
			   min_bounds[0] = Math.min(trackMapArray[j][x], min_bounds[0]);
			   min_bounds[1] = Math.min(trackMapArray[j][z], min_bounds[1]);
			   max_bounds[0] = Math.max(trackMapArray[j][x], max_bounds[0]);
			   max_bounds[1] = Math.max(trackMapArray[j][z], max_bounds[1]);
		   }

		   this.#m_bCircuitMapCreated = true;

		   this.#m_eRenderer.setTrackMap(trackMapArray, min_bounds, max_bounds);
		}

/*
		#getMessageStreamUpdates(p_stream, p_time)
		{
			if( ! p_stream.m_aMessages || ! p_stream.m_aMessages.length)
				return null;

			let output = new Array();
			let id = p_stream.m_iNextMessageID;
			while(p_stream.m_aMessages[id] &&
				p_stream.m_aMessages[id].Utc.m_fTimeInSecs < p_time.m_fTimeInSecs)
			{
				output[output.length] = p_stream.m_fPrintFunction(p_stream.m_aMessages[id]);
				id++;
			}

			p_stream.m_iNextMessageID = id;

			return output;
		}*/

		onTime(p_time)
		{
			let time_secs = p_time.m_fTimeInSecs;
			if(time_secs < this.#m_tCurrentTime.m_fTimeInSecs)
			{
				//backwards time shift - need to reset the message streams. the json streams will be fine.
				//this.#resetMessageStreams();

				this.#m_msTiming.resetIndex();
				this.#m_msTimingApp.resetIndex();
				this.#m_msExtrapolatedClock.resetIndex();
				this.#m_msRaceControlMessages.resetIndex();
				this.#m_msLaps.resetIndex();
				this.#m_msSessionStatus.resetIndex();

				this.#m_eRenderer.resetView();
			}

			let timing = this.#m_msTiming.getUpdates(time_secs);
			let timing_app = this.#m_msTimingApp.getUpdates(time_secs);
			let extrap_clock = this.#m_msExtrapolatedClock.getUpdates(time_secs);
			let race_control = this.#m_msRaceControlMessages.getUpdates(time_secs);
			let laps = this.#m_msLaps.getUpdates(time_secs);
			let session_status = this.#m_msSessionStatus.getUpdates(time_secs);


			//let car_pos = this.#getJSONStreamUpdate(this.#m_jsPosData, p_time);
			let car_pos = this.#m_jsPosData.getData(time_secs);
			let car_stats = this.#m_jsCarData.getData(time_secs);
			//this.#getJSONStreamUpdate(this.#m_jsCarData, p_time);


			if(timing && timing.length)
				this.#m_eRenderer.postTiming(timing);
			if(timing_app && timing_app.length)
				this.#m_eRenderer.postTimingApp(timing_app);
			if(extrap_clock && extrap_clock.length)
				this.#m_eRenderer.postExtrapolatedClock(extrap_clock);
			if(race_control && race_control.length)
				this.#m_eRenderer.postRaceControlMsgs(race_control);
			if(laps && laps.length)
				this.#m_eRenderer.postLapCounter(laps);
			if(session_status && session_status.length)
				this.#m_eRenderer.postSessionStatus(session_status);

			if(car_pos)
				this.#m_eRenderer.postCarPos(car_pos);
			if(car_stats)
				this.#m_eRenderer.postCarData(car_stats);

			this.#m_eRenderer.onTime(p_time);

			this.#m_tCurrentTime = p_time;
		}
	};

	//WeatherDataSeries.json
	class nonlive_timing
	{
		#m_eRenderer;
		#m_sApiRoot = "https://livetiming.formula1.com/static/";

		#m_aJSONSyncData;

		#m_aDriverInfo;

		#m_msTiming;
		#m_msTimingApp;
		#m_msExtrapolatedClock
		#m_msRaceControlMessages;
		#m_msLaps;
		#m_msSessionStatus;
		#m_msTeamRadio;
		#m_msWeatherData;

		#m_sessionInfo;
		//#m_iNextMessageID; //this is the ID of the next message in the queue

		#m_jsCarData;
		#m_jsPosData;

		#m_tRaceStartTime;

		#m_aDriverLapTimes;
		#m_aFastestLap;
		#m_bPosDataLoaded;
		#m_bTimingDataLoaded;

		#m_iLapCount;

		#m_tCurrentTime;

		constructor(p_layout, p_base_url, p_renderer, p_session_name)
		{
			//!!download only what is needed by layout.
			this.#m_eRenderer = p_renderer;
			this.#m_eRenderer.setSessionName(p_session_name);
			//to signify nothing displayed.
			this.#m_tCurrentTime = new date_time(0,0,0,0,0,0);

			//this.#m_aDriverList = new Array();

			this.#m_msTiming = new message_stream();
			this.#m_msTimingApp = new message_stream();
			this.#m_msExtrapolatedClock = new message_stream();

			this.#m_msRaceControlMessages = new message_stream(/*this.#printRaceControlMessage.bind(this)*/);
			this.#m_msLaps = new message_stream(this.#printLapMessage.bind(this));
			this.#m_msSessionStatus = new message_stream(this.#printSessionStatusMessage.bind(this));
			this.#m_msTeamRadio = new message_stream();
			this.#m_msWeatherData = new message_stream();

			this.#m_jsCarData = new json_stream(this.#getInterpolatedCarData.bind(this));
			this.#m_jsPosData = new json_stream(this.#getInterpolatedCarPos.bind(this));

			this.#m_aDriverLapTimes = {};
			this.#m_aFastestLap = new Array(2);

			this.#m_bPosDataLoaded = false;
			this.#m_bTimingDataLoaded = false;
			//get the links for the year,
			//event
			//session type
			//	resultObj.containers[0].metadata.year

			//this.#m_sApiRoot = "https://livetiming.formula1.com/static/2022/2022-07-03_British_Grand_Prix/2022-07-03_Race/";
			this.#m_sApiRoot = p_base_url;//"https://livetiming.formula1.com/static/" + p_year + "/" + p_date + "_" + p_session + "/" + p_date + "_" + p_title + "/";

			fetch(this.#m_sApiRoot + "DriverList.jsonStream").then(this.#onDriverListData.bind(this));
			fetch(this.#m_sApiRoot + "Heartbeat.jsonStream").then(this.#onLoadHeartBeat.bind(this));
			fetch(this.#m_sApiRoot + "SessionInfo.json").then(this.#onLoadSessionInfo.bind(this));
		}

		async #onLoadHeartBeat(p_response)
		{
			let text = await p_response.text();
			let lines = splitByLine(text);
			this.#m_aJSONSyncData = new Array(lines.length - 1);

			for(let i = 0; i < lines.length-1; i++)
			{
				this.#m_aJSONSyncData[i] = { json: parseJSONTimeSinceMidnight/*parseJSONTime*/(lines[i].slice(0, 12)),
											utc: parseTimeSinceMidnight/*parseDateTime*/(JSON.parse(lines[i].slice(12)).Utc)
											};
			}

			//this.#m_tJSONStreamUTCStartTime.subtractJSONTime(jsontime);

			this.#onHeartBeatLoaded();
		}

		#bisect(p_id_min, p_id_max, p_test)
		{
			if(p_id_max - p_id_min <= 1)
			{//we've found our pair.
					return [p_id_min, p_id_max];
			}

			let id = p_id_min + Math.floor((p_id_max - p_id_min)/2);
			if(p_test < this.#m_aJSONSyncData[id].json)//p_test.isLessThan(this.#m_aJSONSyncData[id].json))
			{
				return this.#bisect(p_id_min, id, p_test);
			}
			else
			{
				return this.#bisect(id, p_id_max, p_test);
			}
			//shouldn't reach!
		}

		#convertJSONTimeToUTC(p_json_time)
		{
			let count = this.#m_aJSONSyncData.length;

			let res = this.#bisect(0, count-1, p_json_time);

			//probably will happen if before the start of the data.
			if(res[0] === res[1])
				return this.#m_aJSONSyncData[res[0]].utc;//copyDateTime(this.#m_aJSONSyncData[res[0]].utc);

			let frac = (p_json_time/*.m_fTimeInSecs*/ - this.#m_aJSONSyncData[res[0]].json/*.m_fTimeInSecs*/) /
				(this.#m_aJSONSyncData[res[1]].json/*.m_fTimeInSecs*/ - this.#m_aJSONSyncData[res[0]].json/*.m_fTimeInSecs*/);

			let output = this.#m_aJSONSyncData[res[0]].utc + frac * (this.#m_aJSONSyncData[res[1]].utc - this.#m_aJSONSyncData[res[0]].utc);

			/*let output = copyDateTime(this.#m_aJSONSyncData[res[0]].utc);
			output.lerp(this.#m_aJSONSyncData[res[1]].utc, frac);*/

			//console.log(p_json_time.toTimeString() + "    " + output.toTimeString());

			return output;
		}

		#onHeartBeatLoaded()
		{
			fetch(this.#m_sApiRoot + "RaceControlMessages.json").then(this.#onLoadRaceControlMessages.bind(this));
			fetch(this.#m_sApiRoot + "SessionData.json").then(this.#onLoadSessionData.bind(this));

			fetch(this.#m_sApiRoot + "TimingAppData.jsonStream").then(this.#onTimingAppData.bind(this));
			fetch(this.#m_sApiRoot + "ExtrapolatedClock.jsonStream").then(this.#onExtrapolatedClock.bind(this));

			fetch(this.#m_sApiRoot + "TeamRadio.json").then(this.#onTeamRadioData.bind(this));
			//fetch(this.#m_sApiRoot + "WeatherDate.json").then(this.#onWeatherData.bind(this));

			fetch(this.#m_sApiRoot + "CarData.z.jsonStream").then(this.#onLoadCarData.bind(this));
			fetch(this.#m_sApiRoot + "Position.z.jsonStream").then(this.#onPositionData.bind(this));
		}

		async #onDriverListData(p_response)
		{
			let text = await p_response.text();
			/*
			let line = getFirstLine(text);
			line = line.slice(12)
			*/
			this.#m_aDriverInfo = {};//JSON.parse(line);

		   // let text = await p_response.text();
			let lines = splitByLine(text);

			//this.#m_msDriverOrder.m_aMessages = new Array(lines.length);
			for(let i = 0; i < lines.length - 1; i++)
			{
			   let line = JSON.parse(lines[i].slice(12));
			   for(const id in line)
			   {
				   const obj = line[id];

				   if( ! this.#m_aDriverInfo[id])
					   this.#m_aDriverInfo[id] = {};

				   for(const info in obj)
				   {
					   if(info == "Line" && this.#m_aDriverInfo[id][info])
						   //"line" has already been set, we dont want to overwrite it.
						   continue;

					   this.#m_aDriverInfo[id][info] = obj[info];
				   }
			   }
			}
			this.#onDriverListLoaded();
		}

		#onDriverListLoaded()
		{
			fetch(this.#m_sApiRoot + "TimingData.jsonStream").then(this.#onTimingData.bind(this));
		}

		/*
		#printDriverOrderMessage(p_item)
		{
			return p_item;
		}*/

		async #onTimingData(p_response)
		{
			let text = await p_response.text();
			let lines = splitByLine(text);

			//this.#m_msTiming.m_aMessages = new Array(lines.length + 1);
			//artificially put the driver list first.
			this.#m_msTiming.addData( {"Lines":this.#m_aDriverInfo, "Utc": this.#m_aJSONSyncData[0].utc});

			for(let i = 0; i < lines.length - 1; i++)
			{
				let time = parseJSONTimeSinceMidnight/*parseJSONTime*/(lines[i].slice(0, 12));
				let data = JSON.parse(lines[i].slice(12));
				//set the time stamp.
				data.Utc = this.#convertJSONTimeToUTC(time);

				this.#m_msTiming.addData(data);

				//record the lap times.
			   for(const id in data.Lines)
			   {
				   if(data.Lines[id].LastLapTime && data.Lines[id].LastLapTime.Value && data.Lines[id].LastLapTime.Value.length)
				   {
					   if(!this.#m_aDriverLapTimes[id])
						   this.#m_aDriverLapTimes[id] = new Array();

					   this.#m_aDriverLapTimes[id][this.#m_aDriverLapTimes[id].length] =
					   {
						   "LapTime" : data.Lines[id].LastLapTime.Value,
						   "Utc" : data.Utc
					   }

					   if(data.Lines[id].LastLapTime.OverallFastest)
					   {
						   this.#m_aFastestLap[0] = id;
						   this.#m_aFastestLap[1] = this.#m_aDriverLapTimes[id].length - 1;
					   }
				   }
			   }
			}

			this.#m_bTimingDataLoaded = true;
			if(this.#m_bPosDataLoaded && this.#m_bTimingDataLoaded)
				 this.#createCircuitMap();
		}

		async #onTimingAppData(p_response)
		{
			let text = await p_response.text();
			let lines = splitByLine(text);

			//this.#m_msTimingApp.m_aMessages = new Array(lines.length);
			for(let i = 0; i < lines.length - 1; i++)
			{
				let time = parseJSONTimeSinceMidnight/*parseJSONTime*/(lines[i].slice(0, 12));
				let data = JSON.parse(lines[i].slice(12));
				//set the time stamp.
				data.Utc = this.#convertJSONTimeToUTC(time);

				this.#m_msTimingApp.addData(data);
			}
		}

		async #onExtrapolatedClock(p_response)
		{
			let text = await p_response.text();
			let lines = splitByLine(text);

			//this.#m_msTimingApp.m_aMessages = new Array(lines.length);
			for(let i = 0; i < lines.length - 1; i++)
			{
				//let time = parseJSONTime(lines[i].slice(0, 12));
				let data = JSON.parse(lines[i].slice(12));
				//set the time stamp.
				if(!(data.Utc && data.Remaining && data.Extrapolating))
					continue;

				data.Utc = parseTimeSinceMidnight/*parseDateTime*/(data.Utc);

				this.#m_msExtrapolatedClock.addData(data);
			}
		}

		async #onLoadRaceControlMessages(p_response)
		{
			let json = await p_response.json();
			//this.#m_msRaceControlMessages.m_aMessages = json.Messages;

			for(let i = 0; i < json.Messages.length; i++)
			{
				json.Messages[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(json.Messages[i].Utc);
				this.#m_msRaceControlMessages.addData(json.Messages[i]);
			}

			//console.log(this.#m_msRaceControlMessages);
		}

		/*
		#printRaceControlMessage(p_item)
		{
			//let output;
			let item = p_item.Utc.toTimeString() + ": ";

			switch(p_item.Category)
			{
				case 'Drs':
					item += p_item.Message;
					break;

				case 'Flag':
					item += p_item.Category + " : " + p_item.Message;
					break;

				case 'Other':
				default:
					item += p_item.Message;
					break;
			}
			return item;
		}*/

		async #onLoadSessionData(p_response)
		{
			let json = await p_response.json();
			//this.#m_msLaps.m_aMessages = json.Series
			//this.#m_msSessionStatus.m_aMessages = json.StatusSeries;

			if(json.Series && json.Series.length)
			{
				for(let i = 0; i < json.Series.length; i++)
				{
					json.Series[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(json.Series[i].Utc);
					this.#m_msLaps.addData(json.Series[i]);
				}
				this.#m_iLapCount = json.Series[json.Series.length -1].Lap;
			}

			/*
			//find the status "Started"
			for(let i = 0; i < this.#m_msLaps.m_aMessages.length; i++)
			{
				this.#m_msLaps.m_aMessages[i].Utc = parseDateTime(this.#m_msLaps.m_aMessages[i].Utc);
			}*/

			for(let i = 0; i < json.StatusSeries.length; i++)
			{
				json.StatusSeries[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(json.StatusSeries[i].Utc);
				this.#m_msSessionStatus.addData(json.StatusSeries[i]);

				/*
				if( this.#m_msSessionStatus.m_aMessages[i].SessionStatus &&
					this.#m_msSessionStatus.m_aMessages[i].SessionStatus == "Started" )
					this.#m_tRaceStartTime = this.#m_msSessionStatus.m_aMessages[i].Utc;*/
			}
			/*

			for(let i = 0; i < this.#m_msSessionStatus.m_aMessages.length; i++)
			{
				this.#m_msSessionStatus.m_aMessages[i].Utc = parseDateTime(this.#m_msSessionStatus.m_aMessages[i].Utc);

				if( this.#m_msSessionStatus.m_aMessages[i].SessionStatus &&
					this.#m_msSessionStatus.m_aMessages[i].SessionStatus == "Started" )
					this.#m_tRaceStartTime = this.#m_msSessionStatus.m_aMessages[i].Utc;
			}

			console.log(this.#m_msLaps);
			console.log(this.#m_msSessionStatus);*/
		}

		#printLapMessage(p_item)
		{
			if(p_item.Lap)
				return [p_item.Lap, this.#m_iLapCount];

			if(p_item.QualifyingPart)
				return [p_item.QualifyingPart];
		}

		#printSessionStatusMessage(p_item)
		{
			if(p_item.SessionStatus)
			{
				return {SessionStatus: p_item.SessionStatus}
			}
			else if(p_item.TrackStatus)
			{
				return {TrackStatus: p_item.TrackStatus}
			}
			else
				return {};
		}

		async #onTeamRadioData(p_response)
		{
			let json = await p_response.json();
			//this.#m_msRaceControlMessages.m_aMessages = json.Messages;

			for(let i = 0; i < json.Captures.length; i++)
			{
				json.Captures[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(json.Captures[i].Utc);
				json.Captures[i].Path = this.#m_sApiRoot + json.Captures[i].Path;
				this.#m_msTeamRadio.addData(json.Captures[i]);
			}
		}

		async #onLoadSessionInfo(p_response)
		{
		   let json = await p_response.json();
			this.#m_eRenderer.setSessionInfo(json);
		}

		async #onWeatherData(p_response)
		{
		   let json = await p_response.json();
		   console.log(json);
/*
		   for(let i = 0; i < json.Messages.length; i++)
		   {
			   json.Messages[i].Utc = parseTimeSinceMidnight(json.Messages[i].Utc);
			   this.#m_msRaceControlMessages.addData(json.Messages[i]);
		   }*/
		   //need to add this to the message stream.
		}

		async #onLoadCarData(p_response)
		{
			let text = await p_response.text();
			let data = decodeToArray(text).Entries;

			for( let i = 0; i < data.length; i++)
			{
				data[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(data[i].Utc);
				this.#m_jsCarData.addDataEntry(data[i]);
			}

			//this.#m_jsCarData.m_tStartTime = parseDateTime(this.#m_jsCarData.m_aData[0].Utc);
			//this.#m_jsCarData.m_tEndTime = parseDateTime(this.#m_jsCarData.m_aData[this.#m_jsCarData.m_aData.length - 1].Utc);
		}

		#getInterpolatedCarData(p_low, p_high, p_lerp_amount)
		{
			let output = {};
			//{'0': 'RPM', '2': 'Speed', '3': 'nGear', '4': 'Throttle', '5': 'Brake', '45': 'DRS'}

			for(const id in p_low.Cars)
			{
				output[id] = {};
				output[id].rpm = p_low.Cars[id].Channels[0] + p_lerp_amount *  (p_high.Cars[id].Channels[0] - p_low.Cars[id].Channels[0]);
				output[id].speed = p_low.Cars[id].Channels[2] + p_lerp_amount *  (p_high.Cars[id].Channels[2] - p_low.Cars[id].Channels[2]);
				output[id].gear = p_low.Cars[id].Channels[3];
				output[id].throttle = p_low.Cars[id].Channels[4] + p_lerp_amount *  (p_high.Cars[id].Channels[4] - p_low.Cars[id].Channels[4]);
				output[id].brake = p_low.Cars[id].Channels[5];
				output[id].drs = p_low.Cars[id].Channels[45];
			}
			return output;
		}


		async #onPositionData(p_response)
		{
			let text = await p_response.text();
			let data = decodeToArray(text).Position;

			for( let i = 0; i < data.length; i++)
			{
				data[i].Utc = parseTimeSinceMidnight/*parseDateTime*/(data[i].Timestamp);
				delete data[i].Timestamp;//we don't need this anymore.
				this.#m_jsPosData.addDataEntry(data[i]);
			}


		   this.#m_bPosDataLoaded = true;
		   if(this.#m_bPosDataLoaded && this.#m_bTimingDataLoaded)
				this.#createCircuitMap();

			return;
		}

		#getInterpolatedCarPos(p_low, p_high, p_lerp_amount)
		{
			let output = {};

			for(const id in p_low.Entries)
			{
				output[id] = {};
				output[id].status = p_low.Entries[id].Status;
				output[id].x = p_low.Entries[id].X + p_lerp_amount *  (p_high.Entries[id].X - p_low.Entries[id].X);
				output[id].y = p_low.Entries[id].Y + p_lerp_amount *  (p_high.Entries[id].Y - p_low.Entries[id].Y);
				output[id].z = p_low.Entries[id].Z + p_lerp_amount *  (p_high.Entries[id].Z - p_low.Entries[id].Z);
				if(isNaN(output[id].x))
				{
					let jsdfiou = 1203;
				}
			}
			return output;
		}

		#createCircuitMap()
		{
		   //fastest lap time
		   this.#m_aFastestLap[0]

		   if(this.#m_aFastestLap[1] == 0)
			   return;

		   //1st Utc
		   let first = this.#m_aDriverLapTimes[this.#m_aFastestLap[0]][this.#m_aFastestLap[1]-1].Utc;
		   let second = this.#m_aDriverLapTimes[this.#m_aFastestLap[0]][this.#m_aFastestLap[1]].Utc;

		   let interval = (second - first) / 500;

		   let trackMapArray = new Array();
		   let min_bounds = [0,0];
		   let max_bounds = [0,0];
		   let x = "x",
			   z = "y";

		   for(let i = first, j = 0; i < second; i += interval, j++)
		   {
			   trackMapArray[j] = this.#m_jsPosData.getData(i)[this.#m_aFastestLap[0]];
			   min_bounds[0] = Math.min(trackMapArray[j][x], min_bounds[0]);
			   min_bounds[1] = Math.min(trackMapArray[j][z], min_bounds[1]);
			   max_bounds[0] = Math.max(trackMapArray[j][x], max_bounds[0]);
			   max_bounds[1] = Math.max(trackMapArray[j][z], max_bounds[1]);
		   }

		   this.#m_eRenderer.setTrackMap(trackMapArray, min_bounds, max_bounds);
		}

		onTime(p_time)
		{
			let time_secs = p_time.m_fTimeInSecs;
			if(time_secs < this.#m_tCurrentTime.m_fTimeInSecs)
			{
				//backwards time shift - need to reset the message streams. the json streams will be fine.
				this.#m_msTiming.resetIndex();
				this.#m_msTimingApp.resetIndex();
				this.#m_msExtrapolatedClock.resetIndex();
				this.#m_msRaceControlMessages.resetIndex();
				this.#m_msLaps.resetIndex();
				this.#m_msSessionStatus.resetIndex();
				this.#m_msTeamRadio.resetIndex();

				this.#m_eRenderer.resetView();
			}

			let timing = this.#m_msTiming.getUpdates(time_secs);
			let timing_app = this.#m_msTimingApp.getUpdates(time_secs);
			let extrap_clock = this.#m_msExtrapolatedClock.getUpdates(time_secs);
			let race_control = this.#m_msRaceControlMessages.getUpdates(time_secs);
			let laps = this.#m_msLaps.getUpdates(time_secs);
			let session_status = this.#m_msSessionStatus.getUpdates(time_secs);
			let team_radio = this.#m_msTeamRadio.getUpdates(time_secs);


			//let car_pos = this.#getJSONStreamUpdate(this.#m_jsPosData, p_time);
			let car_pos = this.#m_jsPosData.getData(time_secs);
			let car_stats = this.#m_jsCarData.getData(time_secs);
			//this.#getJSONStreamUpdate(this.#m_jsCarData, p_time);


			if(timing && timing.length)
				this.#m_eRenderer.postTiming(timing);
			if(timing_app && timing_app.length)
				this.#m_eRenderer.postTimingApp(timing_app);
			if(extrap_clock && extrap_clock.length)
				this.#m_eRenderer.postExtrapolatedClock(extrap_clock);
			if(race_control && race_control.length)
				this.#m_eRenderer.postRaceControlMsgs(race_control);
			if(laps && laps.length)
				this.#m_eRenderer.postLapCounter(laps);
			if(session_status && session_status.length)
				this.#m_eRenderer.postSessionStatus(session_status);
			if(team_radio && team_radio.length)
				this.#m_eRenderer.postTeamRadio(team_radio);

			if(car_pos)
				this.#m_eRenderer.postCarPos(car_pos);
			if(car_stats)
				this.#m_eRenderer.postCarData(car_stats);

			this.#m_eRenderer.onTime(p_time);

			this.#m_tCurrentTime = p_time;
		}
	};




	i = 0;
	const DISPLAYED_SECTOR1 = i++,
		DISPLAYED_SECTOR2 = i++,
		DISPLAYED_SECTOR3 = i++,
		DISPLAYED_LAP = i++,
		DISPLAYED_PIT = i++,
		DISPLAYED_RETIRED = i++;

	//https://www.formula1.com/etc/designs/fom-website/images/f1_logo.svg
	//https://www.formula1.com/etc/designs/fom-website/images/fia_logo.png
	//https://www.formula1.com/etc/designs/fom-website/images/LT/img/flags/AUT.png
	//https://www.formula1.com/etc/designs/fom-website/images/LT/img/circuit-maps/Spielberg.png
	//https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/medium-new.png
	//https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/hard-used.png
	//https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/medium-used.png
	//https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/soft-new.png
	class timing_renderer
	{
		#m_pResizeObserver;

		#m_pDocuments;//list of the documents of the resepective windows. use: m_pDocuments[DATA_PANEL_HEADER]

		#m_sSessionName;

		#m_aDriverList;
		//#m_elView;
		#m_elTimingHeader;
		#m_elSessionName;
		#m_elSessionStatus;
		#m_elTrackStatus;
		#m_elLap;
		#m_elSessionTimeRemaining;

		#m_elRaceControl;
		#m_elLeaderBoard;
		#m_iLeaderBoardRowCount;
		#m_aQualifyingLeadboardLayout;
		#m_aRaceLeaderboardLayout;

		#m_sessionInfo;

		#m_bListBuilt;
		#m_bDriverTrackerBuilt;
		#m_aLeaderBoardOrderElement;
		#m_aDriverElement;
		#m_aPositionElement;
		#m_aLeaderGapElement;
		#m_aIntervalElement;
		#m_aSectorTimeElements;
		#m_aCompactSectorTimeElement;
		#m_aLatestTimeElement;
		#m_aBestLapElement;
		#m_aLastLapElement;
		#m_aMiniSectorElement;
		#m_aSectorWidgetElement;
		#m_aTelemetryElement;
		#m_aDRSElement;
		#m_aPitStopCountElement;
		#m_aCurrentTyreElement;
		#m_aCurrentTyreAgeElement;
		#m_aTyreStoryElement;
		#m_aTyreStoryCompactElement;
		#m_aPositionChangeElement;

		#m_aDriverStints;
		#m_aFastestLapDriverID;
		#m_aFastestSectorsDriverID;
		#m_aFastestLapLocationsSet;

		#m_elDriverTracker;
		#m_aDriverTrackerDots;
		#m_bBuiltTrackMap

		#m_elTeamRadioText;
		#m_pTeamRadioAudio;
		#m_aPendingRadioMessages;

		#m_clockState;
		#m_fCurrentTime;

		#m_aLatestTimeCurrentDisplay;
		#m_aCompactSectorTimeCurrentDisplay;

		#m_aDriverOverlays;
		#m_aOverlayDocs;
		#m_aOverlayThrottle;
		#m_aOverlayBrake;
		#m_aOverlaySpeed;
		#m_aOverlayRPM;
		#m_aOverlayGear;
		#m_aOverlayInterval;
		#m_aOverlayLeaderGap;
		#m_aOverlayDRS;

		#m_elWeatherTemp;
		#m_elWeatherHumidity;
		#m_elWeatherPressure;
		#m_elWeatherRainfall;
		#m_elWeatherTrackTemp;
		#m_elWeatherWindDirection;
		#m_elWeatherWindSpeed;

		constructor(p_layout, p_windows)
		{
			this.#m_aDriverList = new Array();
			this.#m_pDocuments = new Array();
			//this.#m_elView = document.getElementById("timing-view");

			//build the layout
			let html = "";
			for(let i = 0; i < p_layout.length; i++)
			{
				let doc = p_windows[p_layout[i][LAYOUT_DATA_WINDOW_ID]].document;
				let style = 'style="left:' + p_layout[i][LAYOUT_DATA_X] + '%; top: ' + p_layout[i][LAYOUT_DATA_Y] + '%; width: ' + p_layout[i][LAYOUT_DATA_W] + '%; height: ' + p_layout[i][LAYOUT_DATA_H] + '%;"';
				switch(p_layout[i][LAYOUT_DATA_FEED])
				{
					case DATA_PANEL_HEADER:
						html = '<div class="timing-header data_panel container-div" id="timing-header"' + style + '>\
									<div class="horizontal timer-header-upper">\
										<img class="timing-f1-logo container-content" src="https://www.formula1.com/etc/designs/fom-website/images/f1_logo.svg">\
										<div id="timing-session-name" class="timing-session-name container-content">Loading...</div>\
										<div class="timing-session-lap-count container-content" id="timer-lap"></div>\
									</div>\
									<div class="horizontal timer-header-lower">\
										<div class="timer-time-remaining container-content" id="timer-time-remaining"></div>\
										<div class="timer-track-status container-content" id="timer-track-status"></div>\
									</div>\
								</div>';
						doc.body.insertAdjacentHTML('beforeend', html);
						this.#m_pDocuments[DATA_PANEL_HEADER] = doc;
						this.#m_elTimingHeader = doc.getElementById("timing-header");
						this.#m_elSessionName = doc.getElementById("timing-session-name");
						this.#m_elSessionStatus = doc.getElementById("timer-session-status");
						this.#m_elTrackStatus = doc.getElementById("timer-track-status");
						this.#m_elLap = doc.getElementById("timer-lap");
						this.#m_elSessionTimeRemaining = doc.getElementById("timer-time-remaining");
						break;
					case DATA_PANEL_LEADERBOARD:
						html = '<div id="timer-leaderboard-background" class="leaderboard_background data_panel" ' + style + '><div id="timer-leaderboard" class="leaderboard"></div></div>';
						this.#m_aQualifyingLeadboardLayout = p_layout[i][LAYOUT_DATA_OPTION1];
						this.#m_aRaceLeaderboardLayout = p_layout[i][LAYOUT_DATA_OPTION2];
						doc.body.insertAdjacentHTML('beforeend', html);
						this.#m_pDocuments[DATA_PANEL_LEADERBOARD] = doc;
						this.#m_elLeaderBoard = doc.getElementById("timer-leaderboard");
						break;
					case DATA_PANEL_RACE_CONTROL:
						html = '<div id="timer-race-control" class="data_panel race_control_messages" ' + style + '></div>';
						doc.body.insertAdjacentHTML('beforeend', html);
						this.#m_pDocuments[DATA_PANEL_RACE_CONTROL] = doc;
						this.#m_elRaceControl = doc.getElementById("timer-race-control");
						break;
					case DATA_PANEL_DRIVER_TRACKER:
						html = '<div class="data_panel timing-driver-tracker" id="timer-driver-tracker" ' + style + '></div>';
						doc.body.insertAdjacentHTML('beforeend', html);
						this.#m_pDocuments[DATA_PANEL_DRIVER_TRACKER] = doc;
						this.#m_elDriverTracker = doc.getElementById("timer-driver-tracker");
						if(p_layout[i][LAYOUT_DATA_OPTION1])
							this.#m_elDriverTracker.style.backgroundColor = "rgba(0,0,0,0.85)";
						break;
					case DATA_PANEL_TEAM_RADIO:
						html = '<div class="data_panel timer-team-radio" id="timer-team-radio" ' + style + '>\
								<div id="timer-team-radio-text" class="timer-team-radio-text" ></div>\
							</div>';
						doc.body.insertAdjacentHTML('beforeend', html);
						this.#m_pDocuments[DATA_PANEL_TEAM_RADIO] = doc;
						this.#m_elTeamRadioText = doc.getElementById("timer-team-radio-text");
						this.#m_pTeamRadioAudio = new Audio();
						this.#m_pTeamRadioAudio.onended = this.#onTeamRadioEnded.bind(this);
						break;
					case DATA_PANEL_WEATHER:
						this.#m_pDocuments[DATA_PANEL_WEATHER] = doc;
						html = '<div class="data_panel"' + style + '>\
								<div id="data_weather_temp">TEMP</div>\
								<div id="data_weather_humiditiy">HUMIDITY</div>\
								<div id="data_weather_pressure">PRESSURE</div>\
								<div id="data_weather_rainfall">RAINFALL</div>\
								<div id="data_weather_tracktemp">TRACK TEMP</div>\
								<div id="data_weather_winddirection">DIR</div>\
								<div id="data_weather_windspeed">W SPEED</div>\
								</div>';
					   doc.body.insertAdjacentHTML('beforeend', html);
					   
					   this.#m_elWeatherTemp = doc.getElementById("data_weather_temp");
					   this.#m_elWeatherHumidity = doc.getElementById("data_weather_humiditiy");
					   this.#m_elWeatherPressure = doc.getElementById("data_weather_pressure");
					   this.#m_elWeatherRainfall = doc.getElementById("data_weather_rainfall");
					   this.#m_elWeatherTrackTemp = doc.getElementById("data_weather_tracktemp");
					   this.#m_elWeatherWindDirection = doc.getElementById("data_weather_winddirection");
					   this.#m_elWeatherWindSpeed = doc.getElementById("data_weather_windspeed");
						break;
				}

			}

			this.#m_pResizeObserver = new ResizeObserver(this.#onDataElementResize.bind(this));

			if(this.#m_elLeaderBoard)
				this.#m_pResizeObserver.observe(this.#m_elLeaderBoard);
			if(this.#m_elTimingHeader)
				this.#m_pResizeObserver.observe(this.#m_elTimingHeader);

			this.#m_bListBuilt = false;
			this.#m_bDriverTrackerBuilt = false;
			this.#m_bBuiltTrackMap = false;
			this.#m_iLeaderBoardRowCount = 20;

			this.#m_aLeaderBoardOrderElement = new Array();
			this.#m_aDriverElement = new Array();
			this.#m_aPositionElement = new Array();
			this.#m_aLeaderGapElement = new Array();
			this.#m_aIntervalElement = new Array();
			this.#m_aSectorTimeElements = new Array();
			this.#m_aCompactSectorTimeElement = new Array();
			this.#m_aLatestTimeElement = new Array();
			this.#m_aBestLapElement = new Array();
			this.#m_aLastLapElement = new Array();
			this.#m_aMiniSectorElement = new Array();
			this.#m_aSectorWidgetElement = new Array();
			this.#m_aTelemetryElement = new Array();
			this.#m_aDRSElement = new Array();
			this.#m_aPitStopCountElement = new Array();
			this.#m_aTyreStoryElement = new Array();
			this.#m_aTyreStoryCompactElement = new Array();
			this.#m_aCurrentTyreElement = new Array();
			this.#m_aCurrentTyreAgeElement = new Array();
			this.#m_aPositionChangeElement = new Array();

			this.#m_aDriverStints = new Array();

			this.#m_aFastestSectorsDriverID = new Array(3);

			this.#m_aLatestTimeCurrentDisplay = new Array();
			this.#m_aCompactSectorTimeCurrentDisplay = new Array();


			this.#m_aDriverTrackerDots = new Array();
			this.#m_aPendingRadioMessages = new Array();

			this.#m_aDriverOverlays = new Array();
			this.#m_aOverlayDocs = new Array();
			this.#m_aOverlayThrottle = new Array();
			this.#m_aOverlayBrake = new Array();
			this.#m_aOverlaySpeed = new Array();
			this.#m_aOverlayRPM = new Array();
			this.#m_aOverlayGear = new Array();
			this.#m_aOverlayInterval = new Array();
			this.#m_aOverlayLeaderGap = new Array();
			this.#m_aOverlayDRS = new Array();

			this.#m_fCurrentTime = 0;
		}

		initOverlay(p_element, p_racing_number, p_document)
		{
		   if(p_racing_number == 0)
			   return; //its not a driver.

		   this.#m_aDriverOverlays[p_racing_number] = p_element;

		   this.#m_aOverlayDocs[p_racing_number] = p_document;
		   this.#buildDriverOverlay(p_racing_number);

		}

		releaseOverlay(p_driver_id)
		{
		   //wipe the element.
		   if(this.#m_aDriverOverlays[p_driver_id])
			   this.#m_aDriverOverlays[p_driver_id].innerHTML = "";

		   this.#m_aOverlayDocs[p_driver_id] = null;
		   //then release all the indidual elements.
		}

		setSessionName(p_name)
		{
			this.#m_sSessionName = p_name;
		}

		#toggleElementClass(p_element, p_class, p_enable)
		{
			if(p_enable)
				p_element.classList.add(p_class);
			else
				p_element.classList.remove(p_class);
		}

		postTiming(p_timing)
		{
			for(let i = 0; i < p_timing.length; i++)
			{
				for(const id in p_timing[i].Lines)
				{
					const obj = p_timing[i].Lines[id];

					if( ! this.#m_aDriverList[id])
						 this.#m_aDriverList[id] = {};

					for(const info in obj)
					{
						switch(info)
						{
							case "RacingNumber":
							case "BroadcastName":
							case "FullName":
							case "Tla":
							case "TeamName":
							case "TeamColour":
							case "FirstName":
							case "LastName":
							case "HeadshotUrl":
							case "CountryCode":
								this.#m_aDriverList[id][info] = obj[info];
								break;

							case "Line":
								if(this.#m_bListBuilt)
								{
									if(this.#m_aPositionElement[id])
										this.#m_aPositionElement[id].innerText = obj[info];

									this.#m_aDriverElement[id].style.top = (obj[info]-1) * 5 + "%";;
									//this.#m_aLeaderBoardOrderElement[obj[info]].insertAdjacentElement('afterbegin', this.#m_aDriverElement[id]);

									let change = obj[info] - this.#m_aDriverList[id].GridPos;
									if(this.#m_aPositionChangeElement[id])
										this.#m_aPositionChangeElement[id].innerText = change > 0 ? "+" : (change < 0 ? "-" : " ") + " " + Math.abs(change);
								}
								else
									this.#m_aDriverList[id][info] = obj[info];
								break;

							case "GapToLeader":
							case "TimeDiffToFastest":
								if(this.#m_aLeaderGapElement[id])
									this.#m_aLeaderGapElement[id].innerText = obj[info];

							   if(this.#m_aOverlayLeaderGap[id])
									this.#m_aOverlayLeaderGap[id].textContent = obj[info];
								break;

							case "IntervalToPositionAhead":
								if(this.#m_aIntervalElement[id])
									this.#m_aIntervalElement[id].innerText = obj[info].Value;

							   if(this.#m_aOverlayInterval[id])
									this.#m_aOverlayInterval[id].textContent = obj[info].Value;
								break;

							case "TimeDiffToPositionAhead":
								if(this.#m_aIntervalElement[id])
									this.#m_aIntervalElement[id].innerText = obj[info];

							   if(this.#m_aOverlayInterval[id])
									this.#m_aOverlayInterval[id].textContent = obj[info];
								break;

							case "Stats":
								if(this.#m_aLeaderGapElement[id] && obj[info][0] && obj[info][0].TimeDiffToFastest)
									this.#m_aLeaderGapElement[id].innerText = obj[info][0].TimeDiffToFastest;

								if(this.#m_aIntervalElement[id] && obj[info][0] && obj[info][0].TimeDiffToPositionAhead)
									this.#m_aIntervalElement[id].innerText = obj[info][0].TimeDiffToPositionAhead;
								break;

							case "Sectors":
								for(const sector_id in obj[info])
								for(const sector_info in obj[info][sector_id])
								switch(sector_info)
								{
									case "Value":
										//if(this.#m_bListBuilt)
										{
											if(this.#m_aSectorTimeElements[id] && this.#m_aSectorTimeElements[id][sector_id])
											{
												this.#m_aSectorTimeElements[id][sector_id].innerText = obj[info][sector_id][sector_info];

												this.#toggleElementClass(this.#m_aSectorTimeElements[id][sector_id], 'leaderboard_pb_text_colour', obj[info][sector_id].PersonalFastest);
												this.#toggleElementClass(this.#m_aSectorTimeElements[id][sector_id], 'leaderboard_fastest_text_colour', obj[info][sector_id].OverallFastest);

												/*
												if(obj[info][sector_id].PersonalFastest)
													this.#m_aSectorTimeElements[id][sector_id].classList.add('leaderboard_pb_text_colour');
												else
													this.#m_aSectorTimeElements[id][sector_id].classList.remove('leaderboard_pb_text_colour');

												if(obj[info][sector_id].OverallFastest)
													this.#m_aSectorTimeElements[id][sector_id].classList.add('leaderboard_fastest_text_colour');
												else
													this.#m_aSectorTimeElements[id][sector_id].classList.remove('leaderboard_fastest_text_colour');*/

											}

											//set the compact sector times if theres some text there (it wipes them at the start of the lap.)
											if(this.#m_aCompactSectorTimeElement[id] && obj[info][sector_id][sector_info].length)
											{
												this.#m_aCompactSectorTimeElement[id].innerText = "S" + (parseInt(sector_id) + 1) + " " + obj[info][sector_id][sector_info];
												this.#m_aCompactSectorTimeCurrentDisplay[id] = sector_id;

												this.#toggleElementClass(this.#m_aCompactSectorTimeElement[id], 'leaderboard_pb_text_colour', obj[info][sector_id].PersonalFastest);
												this.#toggleElementClass(this.#m_aCompactSectorTimeElement[id], 'leaderboard_fastest_text_colour', obj[info][sector_id].OverallFastest);

												/*
												if(obj[info][sector_id].PersonalFastest)
													this.#m_aCompactSectorTimeElement[id].classList.add('leaderboard_pb_text_colour');
												else
													this.#m_aCompactSectorTimeElement[id].classList.remove('leaderboard_pb_text_colour');

												if(obj[info][sector_id].OverallFastest)
													this.#m_aCompactSectorTimeElement[id].classList.add('leaderboard_fastest_text_colour');
												else
													this.#m_aCompactSectorTimeElement[id].classList.remove('leaderboard_fastest_text_colour');	*/
											}
											//dont set the third sector for the latest times, need the actual lap time!
											if(this.#m_aLatestTimeElement[id] && sector_id != 2 && obj[info][sector_id][sector_info].length)
											{
												this.#m_aLatestTimeElement[id].innerText = "S" + (parseInt(sector_id) + 1) + " " + obj[info][sector_id][sector_info];
												this.#m_aLatestTimeCurrentDisplay[id] = sector_id;
												this.#toggleElementClass(this.#m_aLatestTimeElement[id], 'leaderboard_pb_text_colour', obj[info][sector_id].PersonalFastest);
												this.#toggleElementClass(this.#m_aLatestTimeElement[id], 'leaderboard_fastest_text_colour', obj[info][sector_id].OverallFastest);

												/*

												if(obj[info][sector_id].PersonalFastest)
													this.#m_aLatestTimeElement[id].classList.add('leaderboard_pb_text_colour');
												else
													this.#m_aLatestTimeElement[id].classList.remove('leaderboard_pb_text_colour');

												if(obj[info][sector_id].OverallFastest)
													this.#m_aLatestTimeElement[id].classList.add('leaderboard_fastest_text_colour');
												else
													this.#m_aLatestTimeElement[id].classList.remove('leaderboard_fastest_text_colour');	*/
											}

											if(this.#m_aSectorWidgetElement[id] && this.#m_aSectorWidgetElement[id][sector_id])
											{
												this.#toggleElementClass(this.#m_aSectorWidgetElement[id][sector_id], 'leaderboard_bg_pb_text_colour', obj[info][sector_id].PersonalFastest);
												this.#toggleElementClass(this.#m_aSectorWidgetElement[id][sector_id], 'leaderboard_bg_fastest_text_colour', obj[info][sector_id].OverallFastest);
												this.#toggleElementClass(this.#m_aSectorWidgetElement[id][sector_id], 'leaderboard_bg_yellow_text_colour',
													!obj[info][sector_id].OverallFastest && !obj[info][sector_id].PersonalFastest && obj[info][sector_id][sector_info].length);


													/*
												if(obj[info][sector_id].PersonalFastest)
													this.#m_aSectorWidgetElement[id][sector_id].classList.add('leaderboard_bg_pb_text_colour');
												else
													this.#m_aSectorWidgetElement[id][sector_id].classList.remove('leaderboard_bg_pb_text_colour');

												if(obj[info][sector_id].OverallFastest)
													this.#m_aSectorWidgetElement[id][sector_id].classList.add('leaderboard_bg_fastest_text_colour');
												else
													this.#m_aSectorWidgetElement[id][sector_id].classList.remove('leaderboard_bg_fastest_text_colour');

												if(!obj[info][sector_id].OverallFastest && !obj[info][sector_id].PersonalFastest && obj[info][sector_id][sector_info].length)
													this.#m_aSectorWidgetElement[id][sector_id].classList.add('leaderboard_bg_yellow_text_colour');
												else
													this.#m_aSectorWidgetElement[id][sector_id].classList.remove('leaderboard_bg_yellow_text_colour');*/
											}
										}
										break;
									case "Stopped":
										break;
									case "Status":
										break;

									case "OverallFastest":
										if(obj[info][sector_id].OverallFastest === true)
											this.#setFastestSector(sector_id, id);
										break;
									/*case "PersonalFastest":
										break;*/
									case "Segments":
										if(!this.#m_bListBuilt)
										{
											if(!this.#m_aDriverList[id][info])
												this.#m_aDriverList[id][info] = new Array(3);

											if(!this.#m_aDriverList[id][info][sector_id])
												this.#m_aDriverList[id][info][sector_id] = {};

											if(!this.#m_aDriverList[id][info][sector_id][sector_info])
												this.#m_aDriverList[id][info][sector_id][sector_info] = new Array();
										}

										for(const segment_id in obj[info][sector_id][sector_info])
										{
											if(this.#m_bListBuilt)
												this.#setSegment(id, sector_id, segment_id, obj[info][sector_id][sector_info][segment_id].Status);
											else
											{
												this.#m_aDriverList[id][info][sector_id][sector_info][segment_id] = obj[info][sector_id][sector_info][segment_id].Status;
											}
										}
										break;
								}
								break;

							case "BestLapTime":
								if(//this.#m_bListBuilt &&
								this.#m_aBestLapElement[id])
								{
									this.#m_aBestLapElement[id].innerText = obj[info].Value;
								}
								break;

							case "LastLapTime":
								//if(this.#m_bListBuilt)
								{
									if(obj[info].OverallFastest)
									{
										this.#setFastestLap(id);
									   if(this.#m_aBestLapElement[id])
											this.#m_aBestLapElement[id].classList.add('leaderboard_fastest_text_colour');

									   if(this.#m_aPositionElement[id])
											this.#m_aPositionElement[id].classList.add('leaderboard_fastest_text_colour');
									}

									if(this.#m_aLastLapElement[id])
									{
										if(obj[info].Value)
											this.#m_aLastLapElement[id].innerText = obj[info].Value;

										this.#toggleElementClass(this.#m_aLastLapElement[id], 'leaderboard_pb_text_colour', obj[info].PersonalFastest);
										this.#toggleElementClass(this.#m_aLastLapElement[id], 'leaderboard_fastest_text_colour', obj[info].OverallFastest);

/*
										if(obj[info].PersonalFastest)
											this.#m_aLastLapElement[id].classList.add('leaderboard_pb_text_colour');
										else
											this.#m_aLastLapElement[id].classList.remove('leaderboard_pb_text_colour');

										if(obj[info].OverallFastest)
											this.#m_aLastLapElement[id].classList.add('leaderboard_fastest_text_colour');
										else
											this.#m_aLastLapElement[id].classList.remove('leaderboard_fastest_text_colour');*/
									}

									if(this.#m_aLatestTimeElement[id] && this.#m_aLatestTimeCurrentDisplay[id] !== DISPLAYED_PIT)
									{
										if(obj[info].Value)
										{
											this.#m_aLatestTimeElement[id].innerText = "L " + obj[info].Value;
											this.#m_aLatestTimeCurrentDisplay[id] = DISPLAYED_LAP;
										}

										this.#toggleElementClass(this.#m_aLatestTimeElement[id], 'leaderboard_pb_text_colour', obj[info].PersonalFastest);
										this.#toggleElementClass(this.#m_aLatestTimeElement[id], 'leaderboard_fastest_text_colour', obj[info].OverallFastest);

										/*
										if(obj[info].PersonalFastest)
											this.#m_aLatestTimeElement[id].classList.add('leaderboard_pb_text_colour');
										else
											this.#m_aLatestTimeElement[id].classList.remove('leaderboard_pb_text_colour');

										if(obj[info].OverallFastest)
											this.#m_aLatestTimeElement[id].classList.add('leaderboard_fastest_text_colour');
										else
											this.#m_aLatestTimeElement[id].classList.remove('leaderboard_fastest_text_colour');*/
									}
									/*

									for(const last_info in obj[info])
									switch(last_info)
									{
										case "Value":
											this.#m_aLastLapElement[id].innerText = obj[info].Value;
											break;

										case "OverallFastest":
											if(obj[info].OverallFastest)
												this.#m_aLastLapElement[id].style.color = 'rgb(255, 0, 255)';
											else
												this.#m_aLastLapElement[id].style.color = '';
											break;

										case "PersonalFastest":
											if(obj[info].OverallFastest)
												this.#m_aLastLapElement[id].style.color = 'rgb(0, 255, 0)';
											else
												this.#m_aLastLapElement[id].style.color = '';
											break;
									}*/
								}
								break;

							case "InPit":
								if(this.#m_aLatestTimeElement[id] && obj[info])
								{
									this.#m_aLatestTimeElement[id].innerText = "IN PIT";
									this.#m_aLatestTimeCurrentDisplay[id] = DISPLAYED_PIT;
								}

								break;

							case "PitOut":
								if(this.#m_aLatestTimeElement[id] && obj[info])
								{
									this.#m_aLatestTimeElement[id].innerText = "PIT EXIT";
									this.#m_aLatestTimeCurrentDisplay[id] = DISPLAYED_PIT;
								}
								break;

							case "NumberOfPitStops":
								if(this.#m_aPitStopCountElement[id])
								{
									this.#m_aPitStopCountElement[id].innerText = obj[info];
								}
								break;

							case "Retired":
								if(obj[info])
								{
									let value = "OUT";

									if(this.#m_aIntervalElement[id])
									{
										this.#m_aIntervalElement[id].innerText = value;
										value = "";
									}

									if(this.#m_aLeaderGapElement[id])
									{
										this.#m_aLeaderGapElement[id].innerText = value;
										value = "";
									}

									if(this.#m_aLatestTimeElement[id])
									{
										this.#m_aLatestTimeElement[id].innerText = value;
										value = "";
										this.#m_aLatestTimeCurrentDisplay[id] = DISPLAYED_RETIRED;
									}

									if(this.#m_aCompactSectorTimeElement[id])
									{
										this.#m_aCompactSectorTimeElement[id].innerText = value;
										value = "";
										this.#m_aCompactSectorTimeCurrentDisplay[id] = DISPLAYED_RETIRED;
									}
								}
								break;

							case "Stopped":
								if(obj[info])
								{
									let value = "OUT";

									if(this.#m_aIntervalElement[id])
									{
										this.#m_aIntervalElement[id].innerText = value;
										value = "";
									}

									if(this.#m_aLeaderGapElement[id])
									{
										this.#m_aLeaderGapElement[id].innerText = value;
										value = "";
									}

									if(this.#m_aLatestTimeElement[id])
									{
										this.#m_aLatestTimeElement[id].innerText = value;
										value = "";
										this.#m_aLatestTimeCurrentDisplay[id] = DISPLAYED_RETIRED;
									}

									if(this.#m_aCompactSectorTimeElement[id])
									{
										this.#m_aCompactSectorTimeElement[id].innerText = value;
										value = "";
										this.#m_aCompactSectorTimeCurrentDisplay[id] = DISPLAYED_RETIRED;
									}
								}
								break;
						}
					}
				}
			}

			if(!this.#m_bListBuilt)
			{
			   //if(!this.#m_bListBuilt)
			   //this.#m_aDriverList[id][info][sector_id][sector_info]
				this.#buildDriverList();
			}

		   if(!this.#m_bDriverTrackerBuilt)
		   {
			   //check we have the necessary info
			   let driver = Object.values(this.#m_aDriverList)[0];
			   if(driver.Tla && driver.TeamColour)
					this.#buildDriverTracker();
		   }


			//console.log(p_driver_order);
		}

		postTimingApp(p_timing)
		{
			for(let i = 0; i < p_timing.length; i++)
			{
				for(const id in p_timing[i].Lines)
				{
					const obj = p_timing[i].Lines[id];

					if( ! this.#m_aDriverList[id])
						 this.#m_aDriverList[id] = {};

					for(const info in obj)
					switch(info)
					{
						case "GridPos":
							this.#m_aDriverList[id][info] = obj[info];

							if(this.#m_aPositionChangeElement[id])
							{
								let change = obj[info] - this.#m_aDriverList[id].GridPos;
								this.#m_aPositionChangeElement[id].innerText = change > 0 ? "+" : (change < 0 ? "-" : " ") + " " + Math.abs(change);
							}
							break;

						case "Stints":
							if(! this.#m_aDriverStints[id] || Object.keys(obj[info]).length === 0)//wipe it if the length of the array is zero
							{
								this.#m_aDriverStints[id] = new Array();
							}

							for(const stint_num in obj[info])
							for(const stint_inf in obj[info][stint_num])
							switch(stint_inf)
							{
								case "Compound":
								case "New":
								case "TyresNotChanged":
								case "TotalLaps":
								case "StartLaps":
									if(!this.#m_aDriverStints[id][stint_num])
										this.#m_aDriverStints[id][stint_num] = {};

									this.#m_aDriverStints[id][stint_num][stint_inf] = obj[info][stint_num][stint_inf];
									break;
							}

							this.#updateStintInfo(id);
							break;
					}
				}
			}
		}

		postExtrapolatedClock(p_clock)
		{
			if(!this.#m_elSessionTimeRemaining)
				return;

			let clock = p_clock[p_clock.length-1];
			if(clock.Extrapolating)
			{
				this.#m_clockState = clock;
			}
			else
			{
				this.#m_clockState = null;
				this.#m_elSessionTimeRemaining.innerText = "Remaining: " + clock.Remaining;
			}
		}

		postRaceControlMsgs(p_race_control)
		{
			if(!this.#m_elRaceControl)
				return;

			for(let i = 0; i < p_race_control.length; i++)
			{
				let string = timeInSecondsToString(p_race_control[i].Utc)/*.toTimeString() */ + ": ";

				switch(p_race_control[i].Category)
				{
					case 'Drs':
						string += p_race_control[i].Message;
						break;

					case 'Flag':
						string += p_race_control[i].Category + " : " + p_race_control[i].Message;

						//if(p_race_control[i].Flag)
						//{

						//}
						break;

					case 'Other':
					default:
						string += p_race_control[i].Message;
						break;
				}

				this.#m_elRaceControl.insertAdjacentHTML('afterbegin', '<div class="race_control_individual_message">' + string + "</div>");
			}
			//console.log(p_race_control);
		}

		postLapCounter(p_laps)
		{
			if(!this.#m_elLap)
				return;

			if(p_laps[p_laps.length-1].length > 1)
				this.#m_elLap.innerHTML = "LAP " + p_laps[p_laps.length-1][0] + " / " + p_laps[p_laps.length-1][1];
			else
				this.#m_elLap.innerHTML = "Q" + p_laps[p_laps.length-1][0];
			//console.log(p_laps);
		}

		postSessionStatus(p_session_status)
		{
			let sessionstatus, trackstatus;
			for(let i = 0; i < p_session_status.length; i++)
			{
				if(p_session_status[i].TrackStatus)
					trackstatus = p_session_status[i].TrackStatus;

				if(p_session_status[i].SessionStatus)
					sessionstatus = p_session_status[i].SessionStatus;
			}

			if(sessionstatus && this.#m_elSessionStatus)
				this.#m_elSessionStatus.innerHTML = sessionstatus;

			if(trackstatus)
			{
				if(this.#m_elTimingHeader)
				{
					switch(trackstatus)
					{
						case "AllClear":
							trackstatus = "";
							this.#m_elTimingHeader.style.backgroundColor = 'green';
							//set it in a delayed time
							unsafeWindow.setTimeout(() => {this.#m_elTimingHeader.style.backgroundColor = 'rgba(0,0,0,0.8)'}, 3000);
							break;
						case "SCDeployed":
							trackstatus = "SAFETY CAR";
							this.#m_elTimingHeader.style.backgroundColor = 'rgb(255, 212, 0)';
							break;
						case "VSCDeployed":
							trackstatus = "VIRTUAL SAFETY CAR";
							this.#m_elTimingHeader.style.backgroundColor = 'rgb(255, 212, 0)';
							break;
						case "VSCEnding":
							trackstatus = "VSC ENDING";
							this.#m_elTimingHeader.style.backgroundColor = 'rgb(255, 212, 0)';
							break;
						case "Yellow":
							trackstatus = "YELLOW FLAG";
							this.#m_elTimingHeader.style.backgroundColor = 'rgb(255, 212, 0)';
							break;
						case "Red":
							trackstatus = "RED FLAG";
							this.#m_elTimingHeader.style.backgroundColor = 'rgb(200,0,20)';
							break;
					}
				}

				if(this.#m_elTrackStatus)
					this.#m_elTrackStatus.innerHTML = trackstatus;
			}


			//console.log(p_session_status);
		}

		postTeamRadio(p_radio)
		{
			if(!this.#m_elTeamRadioText)
				return;

			//check if its already playing.
			//if its playing, add it to the queue
			//otherwise play now, then add the rest to the queue
			//need to add a filter.
			let i = 0;
			if(this.#m_pTeamRadioAudio.paused || this.#m_pTeamRadioAudio.ended)
			{//its not playing at the moment, add the next audio element.
				while(i < p_radio.length && p_radio[i].Utc < this.#m_fCurrentTime - 300)
					i++;

				if(i < p_radio.length)
				{
					this.#m_pTeamRadioAudio.src = p_radio[i].Path;
					this.#m_pTeamRadioAudio.play();
					this.#m_elTeamRadioText.innerText = "RADIO: " + p_radio[i].RacingNumber + " " + this.#m_aDriverList[p_radio[i].RacingNumber].BroadcastName;

					i++;
				}
			}

			for(; i < p_radio.length; i++)
			{
				this.#m_aPendingRadioMessages[this.#m_aPendingRadioMessages.length] = p_radio[i];
			}
		}

		#minpos = [0,0];
		#widthpos = [0,0];
		#trackerDotSize = 0;
		#carPosToCartesian(x, y)
		{
		   return [x - this.#minpos[0],
				   this.#widthpos[1] - (y - this.#minpos[1])];
		}

		postCarPos(p_car_pos)
		{
			let x = "x",
				z = "y";

			if(! this.#m_elDriverTracker)
				return;

			for(const id in p_car_pos)
			{
				if(! p_car_pos[id][x] || ! p_car_pos[id][z] || ! this.#m_aDriverTrackerDots[id])
			   {
				   //console.log("unrecognised car ID for tracked - this may be SC or medical car. ID IS: " + id);
				   continue;
			   }
/*
				this.#minpos[0] = Math.min(p_car_pos[id][x] * 1.1, this.#minpos[0]);
				this.#minpos[1] = Math.min(p_car_pos[id][z] * 1.1, this.#minpos[1]);
				this.#maxpos[0] = Math.max(p_car_pos[id][x] * 1.1, this.#maxpos[0]);
				this.#maxpos[1] = Math.max(p_car_pos[id][z] * 1.1, this.#maxpos[1]);

				this.#m_aDriverTrackerDots[id].style.left = 100 * (p_car_pos[id][x] - this.#minpos[0]) / (this.#maxpos[0] - this.#minpos[0]) + "%";
				this.#m_aDriverTrackerDots[id].style.bottom = 100 * (p_car_pos[id][z] - this.#minpos[1]) / (this.#maxpos[1] - this.#minpos[1]) + "%";*/

				//this.#m_aDriverTrackerDots[id].setAttribute("cx", p_car_pos[id][x]);
				//this.#m_aDriverTrackerDots[id].setAttribute("cy", p_car_pos[id][z]);
				//this.#m_aDriverTrackerDots[id].style.transform = "translate(" + p_car_pos[id][x] + ", " + p_car_pos[id][z] + ");";
			   let pos = this.#carPosToCartesian(p_car_pos[id][x], p_car_pos[id][z]);
			   //this.#m_aDriverTrackerDots[id].setAttribute("x", pos[0]);
			   //this.#m_aDriverTrackerDots[id].setAttribute("y", pos[1]);
				this.#m_aDriverTrackerDots[id].style.x = pos[0] - this.#trackerDotSize/2;//p_car_pos[id][x];
			   this.#m_aDriverTrackerDots[id].style.y = pos[1] - this.#trackerDotSize/2;//p_car_pos[id][z];
			}
		}

		setTrackMap(p_route, p_min, p_max)
		{
		   if(!this.#m_elDriverTracker)
			   return;

		   this.#trackerDotSize = (p_max[1] - p_min[1]) / 15;
		   this.#minpos = [p_min[0] - this.#trackerDotSize/2, p_min[1] - this.#trackerDotSize/2];
		   this.#widthpos = [(p_max[0] - p_min[0] + this.#trackerDotSize), (p_max[1] - p_min[1] + this.#trackerDotSize)];

		   //create an SVG on the route.
		   let html = '<svg id="driver-tracker-svg" width="100%" height="100%" viewBox="0 0 ' + this.#widthpos[0] + ' ' + this.#widthpos[1] + '">\
			   <path fill="none" stroke="white" stroke-width="100" d="M';

		   for(let i = 0; i < p_route.length; i++)
		   {
			   let p = this.#carPosToCartesian(p_route[i].x, p_route[i].y);
			   html += p[0] + ' ' + p[1] + 'L';
		   }

		   let p = this.#carPosToCartesian(p_route[0].x, p_route[0].y);
		   html += p[0] + ' ' + p[1] + 'Z"';

		   html += '/></svg>';

		   this.#m_elDriverTracker.insertAdjacentHTML('afterbegin', html);
		   this.#m_bBuiltTrackMap = true;

		   this.#buildDriverTracker();
		}

		#setDialProgress(p_element, p_fraction)
		{
		   p_element.style.strokeDashoffset = p_element.style.strokeDasharray - Math.min(Math.max(p_fraction,0.0), 1.0) * p_element.dialRange;
		}

		postCarData(car_stats)
		{
			for(const id in car_stats)
			{
				if(this.#m_aDRSElement[id])
				{
					//this.#m_aDRSElement[id].innerText = 'DRS' + car_stats[id].drs;
					switch(car_stats[id].drs)
					{
						case 0:
						case 1:
						default:
							this.#m_aDRSElement[id].style.backgroundColor = 'rgba(0,0,0,0)';
							break;

						case 8:
							this.#m_aDRSElement[id].style.backgroundColor = 'rgba(0,155,0,0.5)';
							break;

						case 10:
						case 12:
						case 14:
							this.#m_aDRSElement[id].style.backgroundColor = 'rgba(0,155,0,1.0)';
							break;
					}

				}

				if(this.#m_aOverlayDRS[id])
				{
					//this.#m_aDRSElement[id].innerText = 'DRS' + car_stats[id].drs;
					switch(car_stats[id].drs)
					{
						case 0:
						case 1:
						default:
							this.#m_aOverlayDRS[id].style.fill = 'rgba(0,0,0,0)';
							break;

						case 8:
							this.#m_aOverlayDRS[id].style.fill = 'rgba(0,155,0,0.5)';
							break;

						case 10:
						case 12:
						case 14:
							this.#m_aOverlayDRS[id].style.fill = 'rgba(0,155,0,1.0)';
							break;
					}
				}

				if(this.#m_aTelemetryElement[id])
				{
					this.#m_aTelemetryElement[id][0].style.width = car_stats[id].throttle + '%';
					this.#m_aTelemetryElement[id][1].style.width = car_stats[id].brake + '%';
					this.#m_aTelemetryElement[id][2].innerText = Math.round(car_stats[id].speed) + 'kph ';
					//this.#m_aTelemetryElement[id][3].innerText = ' @ ' + car_stats[id].gear;
				}

				if(this.#m_aOverlayThrottle[id])
					this.#setDialProgress(this.#m_aOverlayThrottle[id], car_stats[id].throttle/100);
				//this.#m_aOverlayThrottle[id].style.strokeDashoffset = 314.16 - (car_stats[id].throttle / 100) * (314.16 * 1/3);
				//	this.#m_aOverlayThrottle[id].style.width = car_stats[id].throttle + '';

			   if(this.#m_aOverlayBrake[id])
				   this.#setDialProgress(this.#m_aOverlayBrake[id], car_stats[id].brake/100);

				   //this.#m_aOverlayBrake[id].style.strokeDashoffset = 314.16 -  (car_stats[id].brake / 100) * (314.16 * 1/6);
				//	this.#m_aOverlayBrake[id].style.width = car_stats[id].brake + '';

			   if(this.#m_aOverlaySpeed[id])
				   this.#setDialProgress(this.#m_aOverlaySpeed[id], car_stats[id].speed/350);

				//	this.#m_aOverlaySpeed[id].textContent = Math.round(car_stats[id].speed) + ' kph';

			   if(this.#m_aOverlayGear[id])
					this.#m_aOverlayGear[id].textContent = car_stats[id].gear;
			}


			//console.log(car_stats);
		}

		setSessionInfo(p_info)
		{
			this.#m_sessionInfo = p_info;
			if(this.#m_elSessionName)
				this.#m_elSessionName.innerText = p_info.Name.toUpperCase();
		}

		resetView()
		{
		}

		onTime(p_time)
		{
			this.#m_fCurrentTime = p_time.m_fTimeInSecs;
			if(this.#m_clockState && this.#m_elSessionTimeRemaining)
			{
				if(this.#m_clockState.Extrapolating)
				{
					let add_time = p_time.m_fTimeInSecs - this.#m_clockState.Utc;

					let new_time = parseJSONTime(this.#m_clockState.Remaining)
					new_time.subtractSeconds(add_time);
					this.#m_elSessionTimeRemaining.innerText = "Remaining: " + new_time.toTimeString();
				}
				else
				{
					this.#m_elSessionTimeRemaining.innerText = "Remaining: " + this.#m_clockState.Remaining;
				}
			}
		}


		#buildDriverList()
		{
			let leaderboard = this.#m_elLeaderBoard;
			if(!leaderboard)
				return;

			let lower_session_name = this.#m_sSessionName.toLowerCase();
			let columns;

			if(lower_session_name == "qualifying" || lower_session_name.indexOf("practice") != -1)
				columns = this.#m_aQualifyingLeadboardLayout;
			else
				columns = this.#m_aRaceLeaderboardLayout;


			//console.log("driver length " + );
			/*
			let driver_count = Object.keys(this.#m_aDriverList).length;
			for(let i = 1; i <= driver_count; i++)
			{
				let isEven = i / 2 == Math.floor(i/2);
				let html;
				if(isEven)
					html = '<div style="background-color: rgba(255, 255, 255, 0.1); height: ' + 100 / driver_count + '%;" id="leader-board-id-' + i + '"></div>';
				else
					html = '<div style="background-color: rgba(255, 255, 255, 0.0); height: ' + 100 / driver_count + '%;" id="leader-board-id-' + i + '"></div>';

				leaderboard.insertAdjacentHTML('beforeend', html);
				this.#m_aLeaderBoardOrderElement[i] = document.getElementById('leader-board-id-' + i);
			}*/

			for(const id in this.#m_aDriverList)
			{
				let html = '<div class="leaderboard_row" id="driver-' + id + '">';
				for(let i = 0; i < columns.length; i++)
				switch(columns[i])
				{
					case LEADERBOARD_DRIVER_POSITION:
						html += '<div class="leaderboard_id leaderboard_text leaderboard-content" id="driver-' + id + '-position">' + this.#m_aDriverList[id].Line + '</div>';
						break;
					case LEADERBOARD_TEAM_COLOUR:
						html += '<div class="leaderboard_team_colour" style="background-color: #'+ this.#m_aDriverList[id].TeamColour +';"></div>';
						break;
					case LEADERBOARD_DRIVER_NUMBER:
						html += '<div class="leaderboard_driver_number leaderboard_text leaderboard-content">' + this.#m_aDriverList[id].RacingNumber + '</div>';
						break;
					case LEADERBOARD_DRIVER_SHORTNAME:
						html += '<div class="leaderboard_shortname leaderboard_text leaderboard-content">' + this.#m_aDriverList[id].Tla + '</div>';
						break;
					case LEADERBOARD_DRIVER_SURNAME:
						html += '<div class="leaderboard_name leaderboard_text leaderboard-content">' + this.#m_aDriverList[id].LastName + '</div>';
						break;
					case LEADERBOARD_DRIVER_SHORT_FULLNAME:
						html += '<div class="leaderboard_truncated_fullname leaderboard_text leaderboard-content">' + this.#m_aDriverList[id].BroadcastName + '</div>';
						break;
					case LEADERBOARD_DRIVER_FULLNAME:
						html += '<div class="leaderboard_fullname leaderboard_text leaderboard-content">' + this.#m_aDriverList[id].FullName + '</div>';
						break;
					case LEADERBOARD_INTERVAL:
						html += '<div class="leaderboard_time leaderboard_text leaderboard-content" id="driver-' + id + '-interval">-</div>';
						break;
					case LEADERBOARD_GAP_TO_LEADER:
						html += '<div class="leaderboard_time leaderboard_text leaderboard-content" id="driver-' + id + '-leader-gap">-</div>';
						break;
					case LEADERBOARD_FASTEST_LAP_TIME:
						html += '<div class="leaderboard_time_midlong leaderboard_text leaderboard-content" id="driver-' + id + '-best-lap">-</div>';
						break;
					case LEADERBOARD_LAST_LAP_TIME:
						html += '<div class="leaderboard_time_midlong leaderboard_text leaderboard-content" id="driver-' + id + '-last-lap">-</div>';
						break;
					case LEADERBOARD_SECTOR_TIMES_ALL:
						html += '<div class="leaderboard_time leaderboard_text leaderboard-content" id="driver-' + id + '-sector0-time">-</div>' +
							'<div class="leaderboard_time leaderboard_text leaderboard-content" id="driver-' + id + '-sector1-time">-</div>' +
							'<div class="leaderboard_time leaderboard_text leaderboard-content" id="driver-' + id + '-sector2-time">-</div>';
						break;
					case LEADERBOARD_SECTOR_TIMES_COMPACT:
						html += '<div class="leaderboard_time_long leaderboard_text leaderboard-content" id="driver-' + id + '-last-sector-time">-</div>';
						break;
					case LEADERBOARD_LATEST_TIME:
						html += '<div class="leaderboard_time_long leaderboard_text leaderboard-content" id="driver-' + id + '-latest-time">-</div>';
						break;
					case LEADERBOARD_SECTOR_WIDGET:
						for(let j = 0; j < 3; j++)
						{
							html += '<div class="leaderboard_sub_row">';
							html += '<div class="leaderboard_minisector_row" >';
							let sector = this.#m_aDriverList[id]["Sectors"][j]["Segments"];

							for( let k = 0; k < sector.length; k++)
							{
								let div_id = 'mini-sector-' + id + '-' + j + '-' + k;
								html += '<div class="leaderboard_minisector_widget" id="' + div_id + '"  style="background-color: ';
								html += this.#getSegmentColour(sector[k]);
								html += ';"></div>';
							}
							html += '</div>';
							let div_id = 'sector-' + id + '-' + j;
							html += '<div class="leaderboard_sector_widget" id="' + div_id + '"></div>';
							html += '</div>';
						}
						break;
					case LEADERBOARD_TELEMETRY_WIDGET:
						html += '<div class="leaderboard_sub_row">'+
									'<div class="leaderboard_telemetry_widget_pedal">'+
										'<div class="leaderboard_throttle_widget" id="driver-' + id + '-throttle"></div>'+
									'</div>'+
									'<div class="leaderboard_telemetry_widget_pedal">'+
										'<div class="leaderboard_brake_widget" id="driver-' + id + '-brake"></div>'+
									'</div>'+
								'</div>'+
								'<div class="leaderboard_speed leaderboard_text leaderboard-content" id="driver-' + id + '-speed">-</div>'
								;
								//'<div class="leaderboard_gear leaderboard_text leaderboard-content" id="driver-' + id + '-gear">-</div>';
						break;
					case LEADERBOARD_DRS:
						html += '<div class="leaderboard_drs leaderboard_text leaderboard-content" id="driver-' + id + '-drs">DRS</div>';
						break;
					case LEADERBOARD_PITSTOP_COUNT:
						html += '<div class="leaderboard_driver_number leaderboard_text leaderboard-content" id="driver-' + id + '-pitstop-count">-</div>';
						break;
					case LEADERBOARD_TYRE_STORY:
						html += '<div class="leaderboard_tyre_story leaderboard_text leaderboard-content" id="driver-' + id + '-tyre-story">-</div>';
						break;
					case LEADERBOARD_TYRE_STORY_COMPACT:
						html += '<div class="leaderboard_tyre_story leaderboard_text leaderboard-content" id="driver-' + id + '-tyre-story-compact">-</div>';
						break;
					case LEADERBOARD_CURRENT_TYRE:
						html += '<div class="leaderboard_tyre_current leaderboard_text leaderboard-content" id="driver-' + id + '-tyre-current">-</div>';
						break;
					case LEADERBOARD_CURRENT_TYRE_AND_AGE:
						html += '<div class="leaderboard_tyre_current leaderboard_text leaderboard-content" id="driver-' + id + '-tyre-current-age">-</div>';
						break;
					case LEADERBOARD_POSITION_CHANGE:
						let text = "-";
						if(this.#m_aDriverList[id].GridPos)
						{
							let change = this.#m_aDriverList[id].Line - this.#m_aDriverList[id].GridPos;
							text = change > 0 ? "+" : (change < 0 ? "-" : " ") + " " + Math.abs(change);
						}
						html += '<div class="leaderboard_driver_number leaderboard_text leaderboard-content" id="driver-' + id + '-position-change">' + text +'</div>';
						break;
				}
				html += '</div>';


				leaderboard.insertAdjacentHTML('beforeend', html);
				//this.#m_aLeaderBoardOrderElement[this.#m_aDriverList[id].Line].insertAdjacentHTML('beforeend', html);
				let doc = this.#m_pDocuments[DATA_PANEL_LEADERBOARD];

				this.#m_aDriverElement[id] = doc.getElementById('driver-' + id);
				this.#m_aDriverElement[id].style.top = (this.#m_aDriverList[id].Line -1) * 5 + "%";

				for(let i = 0; i < columns.length; i++)
				switch(columns[i])
				{
					case LEADERBOARD_DRIVER_POSITION:
						this.#m_aPositionElement[id] = doc.getElementById('driver-' + id + '-position');
						break;
					case LEADERBOARD_INTERVAL:
						this.#m_aIntervalElement[id] = doc.getElementById('driver-' + id + '-interval');
						break;
					case LEADERBOARD_GAP_TO_LEADER:
						this.#m_aLeaderGapElement[id] = doc.getElementById('driver-' + id + '-leader-gap');
						break;
					case LEADERBOARD_FASTEST_LAP_TIME:
						this.#m_aBestLapElement[id] = doc.getElementById('driver-' + id + '-best-lap');
						break;
					case LEADERBOARD_LAST_LAP_TIME:
						this.#m_aLastLapElement[id] = doc.getElementById('driver-' + id + '-last-lap');
						break;
					case LEADERBOARD_SECTOR_TIMES_ALL:
						this.#m_aSectorTimeElements[id] = [ doc.getElementById('driver-' + id + '-sector0-time'),
												doc.getElementById('driver-' + id + '-sector1-time'),
												doc.getElementById('driver-' + id + '-sector2-time')];
						break;
					case LEADERBOARD_SECTOR_TIMES_COMPACT:
						this.#m_aCompactSectorTimeElement[id] = doc.getElementById('driver-' + id + '-last-sector-time');
						break;
					case LEADERBOARD_LATEST_TIME:
						this.#m_aLatestTimeElement[id] = doc.getElementById('driver-' + id + '-latest-time');
						break;
					case LEADERBOARD_SECTOR_WIDGET:
						this.#m_aMiniSectorElement[id] = new Array(3);
						this.#m_aSectorWidgetElement[id] = new Array(3);
						for(let j = 0; j < 3; j++)
						{
							let sect = this.#m_aDriverList[id]["Sectors"][j]["Segments"];
							this.#m_aMiniSectorElement[id][j] = new Array();
							for( let k = 0; k < sect.length; k++)
							{
								let div_id = 'mini-sector-' + id + '-' + j + '-' + k;
								this.#m_aMiniSectorElement[id][j][k] = doc.getElementById(div_id);
							}
							let div_id = 'sector-' + id + '-' + j;
							this.#m_aSectorWidgetElement[id][j] = doc.getElementById(div_id);
						}
						break;
					case LEADERBOARD_TELEMETRY_WIDGET:
						this.#m_aTelemetryElement[id]=  [doc.getElementById('driver-' + id + '-throttle'),
						doc.getElementById('driver-' + id + '-brake'),
						doc.getElementById('driver-' + id + '-speed')
															//,
															//document.getElementById('driver-' + id + '-gear'),
															];
						break;
					case LEADERBOARD_DRS:
						this.#m_aDRSElement[id] = doc.getElementById('driver-' + id + '-drs');
						break;
					case LEADERBOARD_PITSTOP_COUNT:
						this.#m_aPitStopCountElement[id] = doc.getElementById('driver-' + id + '-pitstop-count');
						break;
					case LEADERBOARD_TYRE_STORY:
						this.#m_aTyreStoryElement[id] = doc.getElementById('driver-' + id + '-tyre-story');
						break;
					case LEADERBOARD_TYRE_STORY_COMPACT:
						this.#m_aTyreStoryCompactElement[id] = doc.getElementById('driver-' + id + '-tyre-story-compact');
						break;
					case LEADERBOARD_CURRENT_TYRE:
						this.#m_aCurrentTyreElement[id] = doc.getElementById('driver-' + id + '-tyre-current');
						break;
					case LEADERBOARD_CURRENT_TYRE_AND_AGE:
						this.#m_aCurrentTyreAgeElement[id] = doc.getElementById('driver-' + id + '-tyre-current-age');
						break;
					case LEADERBOARD_POSITION_CHANGE:
						this.#m_aPositionChangeElement[id] = doc.getElementById('driver-' + id + '-position-change');
						break;
				}

				/*
				//add the driver track dots here.
				if(this.#m_elDriverTracker)
				{
					if(! this.#m_aDriverTrackerDots[id])
					{
						let html = '<div id="driver-tracker-dot-' + id + '" class="driver_tracker_dot" style="background-color: #'+ this.#m_aDriverList[id].TeamColour +';">' + this.#m_aDriverList[id].Tla.slice(0,1) + '</div>';
						this.#m_elDriverTracker.insertAdjacentHTML('beforeend', html);
						this.#m_aDriverTrackerDots[id] = document.getElementById('driver-tracker-dot-' + id);
					}
				}*/
			}

			this.#m_iLeaderBoardRowCount = Object.keys(this.#m_aDriverElement).length;

			this.#m_bListBuilt = true;
		}

		#buildDriverTracker()
		{
			if(!this.#m_elDriverTracker || this.#m_bDriverTrackerBuilt || ! this.#m_bBuiltTrackMap)
			   return;

		   let html, count = 0;
		   let w =	this.#trackerDotSize;

			for(const id in this.#m_aDriverList)
			{
				//add the driver track dots here.
				if(! this.#m_aDriverTrackerDots[id])
				{
			   //add the driver track dots here.
				   html += '<symbol class="driver_tracker_dot" viewBox="0 0 10 10" id="symbol-driver-tracker-dot-' + id + '">\
							   <circle cx="5" cy="5" r="5" stroke="black" stroke-width="0.1" fill="#'+ this.#m_aDriverList[id].TeamColour +'"></circle>\
							   <text fill="white" stroke="black" x="50%" y="50%" stroke-width="0.05" dominant-baseline="middle" text-anchor="middle" font-size="7">' + this.#m_aDriverList[id].Tla.slice(0,1) + '</text>\
						   </symbol>\
						   <use class="driver_tracker_dot" href="#symbol-driver-tracker-dot-' + id + '" id="driver-tracker-dot-' + id + '" width="'+ w + '" height="'+ w + '"/>';
/*
					let html = '<div id="driver-tracker-dot-' + id + '" class="driver_tracker_dot" style="background-color: #'+ this.#m_aDriverList[id].TeamColour +';">' + this.#m_aDriverList[id].Tla.slice(0,1) + '</div>';*/
				}
				count++;
			}

			let doc = this.#m_pDocuments[DATA_PANEL_DRIVER_TRACKER];
			doc.getElementById('driver-tracker-svg').insertAdjacentHTML('beforeend', html);

			for(const id in this.#m_aDriverList)
				this.#m_aDriverTrackerDots[id] = doc.getElementById('driver-tracker-dot-' + id);

		   if(count)
				this.#m_bDriverTrackerBuilt = true;
		}

		#buildDriverOverlay(p_id)
		{
		   let p_el = this.#m_aDriverOverlays[p_id];
		   /*<svg width="100%" height="100%" viewBox="0 0 100 100">
		   /*x="5%" y="80%" width="90%" height="8%"
</svg>
		   */

		   let throttle_size = Math.PI * 1/3
		   let html =/*'\
			   <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="overlay_telemetry_widget_throttle">\
				   <rect class="overlay_telemetry_widget_pedal_rect overlay_telemetry_widget_pedal_rect_bg" />\
				   <rect id="overlay-throXXXttle-'+ p_id +'" class="overlay_telemetry_widget_pedal_rect overlay_telemetry_widget_pedal_rect_throttle" />\
			   </svg>\
			   <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="overlay_telemetry_widget_brake">\
				   <rect class="overlay_telemetry_widget_pedal_rect overlay_telemetry_widget_pedal_rect_bg" />\
				   <rect id="overlay-brXXXXXake-'+ p_id +'" class="overlay_telemetry_widget_pedal_rect overlay_telemetry_widget_pedal_rect_brake" />\
			   </svg>\
							   <svg viewBox="0 0 100 100" class="overlay_telemetry_widget_gear">\
				   <rect x ="0" y ="0" height ="100" width ="100" rx ="10" ry ="10" fill="rgba(0,0,0,0.75)" />\
				   <text id="overlay-gear-'+ p_id +'" x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="90" fill="white"></text>\
			   </svg>\

				r="50" cx="50" cy="95" fill="transparent" stroke="blue" stroke-width="5" stroke-dasharray="314.16" stroke-dashoffset="100" stroke-linecap="round" style="transform: rotate(180deg);transform-origin: 50px 95px;"

				r="50" cx="50" cy="95" fill="transparent" stroke="blue" stroke-width="5" stroke-dasharray="314.16" stroke-dashoffset="100" stroke-linecap="round" style="transform: scaleY(-1.0);transform-origin: 50px 95px;"
							   <svg viewBox="0 0 100 100" class="overlay_telemetry_widget_interval">\
				   
			   </svg>\
			   <svg viewBox="0 0 100 100" class="overlay_telemetry_widget_leader">\
				   
			   </svg>\
				*/
			   '\
			   <svg viewBox="0 0 400 100" preserveAspectRatio="xMidYMid" class="overlay_telemetry_widget">\
				   <circle id="overlay-throttlebg-'+ p_id +'" class="overlay_telemetry_widget_circle_progress overlay_telemetry_widget_throttle" style="stroke:rgba(0,0,0,0.5);"></circle>\
				   <circle id="overlay-throttle-'+ p_id +'" class="overlay_telemetry_widget_circle_progress overlay_telemetry_widget_throttle"></circle>\
				   <circle id="overlay-brakebg-'+ p_id +'" class="overlay_telemetry_widget_circle_progress overlay_telemetry_widget_brake" style="stroke:rgba(0,0,0,0.5);"></circle>\
				   <circle id="overlay-brake-'+ p_id +'" class="overlay_telemetry_widget_circle_progress overlay_telemetry_widget_brake"></circle>\
				   <circle id="overlay-speedbg-'+ p_id +'" class="overlay_telemetry_widget_circle_progress overlay_telemetry_widget_speedometer" style="stroke:rgba(0,0,0,0.5);"></circle>\
				   <circle id="overlay-speed-'+ p_id +'" class="overlay_telemetry_widget_circle_progress overlay_telemetry_widget_speedometer"></circle>\
				   <rect class="overlay_telemetry_widget_gear_bg" />\
				   <text id="overlay-gear-'+ p_id +'" x="200" y="60" class="overlay_telemetry_widget_gear" dominant-baseline="middle" text-anchor="middle" font-size="25" fill="white"></text>\
				   <rect id="overlay-drs-'+ p_id +'" class="overlay_telemetry_widget_drs_bg" />\
				   <text x="200" y="84" class="overlay_telemetry_widget_drs" dominant-baseline="middle" text-anchor="middle" font-size="15" fill="green">DRS</text>\
				   <text id="overlay-interval-'+ p_id +'" x="5" y="70" dominant-baseline="middle" text-anchor="left" font-size="18" fill="white"></text>\
				   <text id="overlay-leader-'+ p_id +'" x="5" y="90" dominant-baseline="middle" text-anchor="left" font-size="18" fill="white"></text>\
			   </svg>\
		   ';

		   p_el.innerHTML = html;

		   this.#m_aOverlayThrottle[p_id] = this.#m_aOverlayDocs[p_id].getElementById("overlay-throttle-"+ p_id);
		   this.#m_aOverlayBrake[p_id] = this.#m_aOverlayDocs[p_id].getElementById("overlay-brake-"+ p_id);
		   this.#m_aOverlaySpeed[p_id] = this.#m_aOverlayDocs[p_id].getElementById("overlay-speed-"+ p_id);
		   this.#m_aOverlayGear[p_id] = this.#m_aOverlayDocs[p_id].getElementById("overlay-gear-"+ p_id);
		   this.#m_aOverlayInterval[p_id] = this.#m_aOverlayDocs[p_id].getElementById("overlay-interval-"+ p_id);
		   this.#m_aOverlayLeaderGap[p_id] = this.#m_aOverlayDocs[p_id].getElementById("overlay-leader-"+ p_id);
		   this.#m_aOverlayDRS[p_id] = this.#m_aOverlayDocs[p_id].getElementById("overlay-drs-"+ p_id);

		   this.#m_aOverlayThrottle[p_id].style.strokeDasharray = 408.407;
		   this.#m_aOverlayBrake[p_id].style.strokeDasharray = 408.407;
		   this.#m_aOverlaySpeed[p_id].style.strokeDasharray = 502.655;

		   this.#m_aOverlayThrottle[p_id].dialRange = this.#m_aOverlayThrottle[p_id].style.strokeDasharray * (1/3 * 0.9);
		   this.#m_aOverlayDocs[p_id].getElementById("overlay-throttlebg-"+ p_id).style.strokeDashoffset = this.#m_aOverlayThrottle[p_id].style.strokeDasharray - this.#m_aOverlayThrottle[p_id].dialRange;

		   this.#m_aOverlayBrake[p_id].dialRange = this.#m_aOverlayBrake[p_id].style.strokeDasharray * (1/6 * 0.9);
		   this.#m_aOverlayDocs[p_id].getElementById("overlay-brakebg-"+ p_id).style.strokeDashoffset = this.#m_aOverlayBrake[p_id].style.strokeDasharray - this.#m_aOverlayBrake[p_id].dialRange;

		   this.#m_aOverlaySpeed[p_id].dialRange = this.#m_aOverlaySpeed[p_id].style.strokeDasharray * 0.5;
		   this.#m_aOverlayDocs[p_id].getElementById("overlay-speedbg-"+ p_id).style.strokeDashoffset = this.#m_aOverlaySpeed[p_id].style.strokeDasharray - this.#m_aOverlaySpeed[p_id].dialRange;

	   }

		#getSegmentColour(p_value)
		{
			switch(p_value)
			{
				case 0://delete
					return 'rgba(0,0,0, 0.5)';
				case 2048://yellow
					return 'yellow';
					//'rgb(0,255,0)';
				case 2049://green
					return 'green';
					//'rgb(255,255,0)';
				case 2051://fastest
					return 'purple';//rgb(255,0,255)';
				case 2052://retired?
					return 'rgb(0,155,155)';
				case 2064://pit
					return 'rgb(155,0,0)';

				default:
					console.log("unrecognised sector colour  " + p_value);
					return 'rgb(255,255,255)';
			}
		}

		#setSegment(p_driver_id, p_sector_id, p_segment_id, p_value)
		{
			if(this.#m_aMiniSectorElement[p_driver_id] &&
				this.#m_aMiniSectorElement[p_driver_id][p_sector_id] &&
				this.#m_aMiniSectorElement[p_driver_id][p_sector_id][p_segment_id])
					this.#m_aMiniSectorElement[p_driver_id][p_sector_id][p_segment_id].style.backgroundColor = this.#getSegmentColour(p_value);
		}

		//if appropriate, this removes the purple colour from the previous fastest lap
		#setFastestLap(p_id)
		{
			if(this.#m_aFastestLapDriverID && this.#m_aFastestLapDriverID != p_id)
			{
				let id = this.#m_aFastestLapDriverID;
				if(this.#m_aBestLapElement[id])
					this.#m_aBestLapElement[id].classList.remove('leaderboard_fastest_text_colour');

				if(this.#m_aLastLapElement[id])
					this.#m_aLastLapElement[id].classList.remove('leaderboard_fastest_text_colour');

				if(this.#m_aLatestTimeElement[id])
					this.#m_aLatestTimeElement[id].classList.remove('leaderboard_fastest_text_colour');

			   if(this.#m_aPositionElement[id])
				   this.#m_aPositionElement[id].classList.remove('leaderboard_fastest_text_colour');
			}

			this.#m_aFastestLapDriverID = p_id;
			console.log("Fastest lap driver: " + p_id);
		}

		//if appropriate, this removes the purple colour from the previous fastest sector
		#setFastestSector(p_sector, p_id)
		{
			if(this.#m_aFastestSectorsDriverID[p_sector] && this.#m_aFastestSectorsDriverID[p_sector] != p_id)
			{
				let id = this.#m_aFastestSectorsDriverID[p_sector];

				if(this.#m_aSectorTimeElements[id] && this.#m_aSectorTimeElements[id][p_sector])
					this.#m_aSectorTimeElements[id][p_sector].classList.remove('leaderboard_fastest_text_colour');

				if(this.#m_aCompactSectorTimeElement[id] && this.#m_aCompactSectorTimeCurrentDisplay[id] === p_sector)
				{//needs to check that this is still the sector time displayed.
					this.#m_aCompactSectorTimeElement[id].classList.remove('leaderboard_fastest_text_colour');
				}

				if(this.#m_aSectorWidgetElement[id] && this.#m_aSectorWidgetElement[id][p_sector])
				{
					this.#m_aSectorWidgetElement[id][p_sector].classList.remove('leaderboard_bg_fastest_text_colour');
				}

				if(this.#m_aLatestTimeElement[id] && this.#m_aLatestTimeCurrentDisplay[id] === p_sector)
				{//needs to check that this is still the sector time displayed.
					this.#m_aLatestTimeElement[id].classList.remove('leaderboard_fastest_text_colour');
				}
			}

			this.#m_aFastestSectorsDriverID[p_sector] = p_id;
		}

		#onDataElementResize(p_entry)
		{
			for(let i = 0; i < p_entry.length; i++)
			switch(p_entry[i].target.id)
			{
				case "timer-leaderboard":
					let new_size = p_entry[i].contentRect.height * 2/3 / this.#m_iLeaderBoardRowCount + "px";
					this.#m_elLeaderBoard.style.fontSize = new_size;

					//race control font is set to the same as the leaderboard
					if(this.#m_elRaceControl)
						this.#m_elRaceControl.style.fontSize = new_size;

					//check if we need to squeeze the width.
					let el = this.#m_elLeaderBoard;
					let frac = el.clientWidth / el.scrollWidth;
					//if(frac < 1.0)
					{
						el.style.transformOrigin = "top left";
						el.style.transform = "scale(" + frac + ",1.0)";
						console.log("Sqaushed : " + frac);
					}
					break;

				case "timing-header": //the 0.34 is the 34% height of the lower row of the header - this sets the 100% font size.
					this.#m_elTimingHeader.style.fontSize = p_entry[i].contentRect.height * 2/3  * 0.40 + "px";
					break;
			}
		}

		#updateStintInfo(p_id)
		{
			if(this.#m_aTyreStoryElement[p_id])
			{
				let html = "";
				for(let i = 0; i < this.#m_aDriverStints[p_id].length; i++)
				{
					if(this.#m_aDriverStints[p_id][i].Compound.toLowerCase() === "unknown")
						continue;

					html += "<img class='timing_tyre_image' src='https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/" + this.#m_aDriverStints[p_id][i].Compound.toLowerCase() + "-" + (this.#m_aDriverStints[p_id][i].New ? "new" : "used") + ".png' />";

					html += this.#m_aDriverStints[p_id][i].TotalLaps + " ";
				}

				this.#m_aTyreStoryElement[p_id].innerHTML = html;
			}

			if(this.#m_aTyreStoryCompactElement[p_id])
			{
				let html = "";
				for(let i = 0; i < this.#m_aDriverStints[p_id].length; i++)
				{
					if(this.#m_aDriverStints[p_id][i].Compound.toLowerCase() === "unknown")
						continue;

					html += "<img class='timing_tyre_image' src='https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/" + this.#m_aDriverStints[p_id][i].Compound.toLowerCase() + "-" + (this.#m_aDriverStints[p_id][i].New ? "new" : "used") + ".png' />";

					if(i ===  this.#m_aDriverStints[p_id].length -1)
						html += this.#m_aDriverStints[p_id][i].TotalLaps + " ";
				}

				this.#m_aTyreStoryCompactElement[p_id].innerHTML = html;
			}

			if(this.#m_aCurrentTyreElement[p_id] && this.#m_aDriverStints[p_id].length)
			{
				let html = "";
				let i = this.#m_aDriverStints[p_id].length - 1;
				html += "<img class='timing_tyre_image' src='https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/" + this.#m_aDriverStints[p_id][i].Compound.toLowerCase() + "-" + (this.#m_aDriverStints[p_id][i].New ? "new" : "used") + ".png' />";

				this.#m_aCurrentTyreElement[p_id].innerHTML = html;
			}

			if(this.#m_aCurrentTyreAgeElement[p_id] && this.#m_aDriverStints[p_id].length)
			{
				let html = "";
				let i = this.#m_aDriverStints[p_id].length - 1;
				html += "<img class='timing_tyre_image' src='https://www.formula1.com/etc/designs/fom-website/images/LT/img/tyres/" + this.#m_aDriverStints[p_id][i].Compound.toLowerCase() + "-" + (this.#m_aDriverStints[p_id][i].New ? "new" : "used") + ".png' />";

				html += this.#m_aDriverStints[p_id][i].TotalLaps;

				this.#m_aCurrentTyreAgeElement[p_id].innerHTML = html;
			}
		}

		#onTeamRadioEnded()
		{
			this.#m_elTeamRadioText.innerText = "";

			if(!this.#m_aPendingRadioMessages.length)
				return; //there aren't any pending messages.

			let i = 0;
			while(i < this.#m_aPendingRadioMessages.length && this.#m_aPendingRadioMessages[i].Utc < this.#m_fCurrentTime - 300)
				i++;

			if(i < this.#m_aPendingRadioMessages.length)
			{
				this.#m_pTeamRadioAudio.src = this.#m_aPendingRadioMessages[i].Path;
				this.#m_pTeamRadioAudio.play();
				this.#m_elTeamRadioText.innerText = "RADIO: " + this.#m_aPendingRadioMessages[i].RacingNumber + " " + this.#m_aDriverList[this.#m_aPendingRadioMessages[i].RacingNumber].BroadcastName;
			}
			//delete this item.
			this.#m_aPendingRadioMessages.splice(0,i+1);
		}
	};

	class audio_filter
	{
		#m_pVideo;
		#m_pAudioContext;
		#m_pSource;
		#m_pSplitter;
		#m_pLeft;
		#m_pRight;
		#m_pMerger;
		#m_fMixRatio;
		#m_bConnected;

		constructor(p_video, p_mix_ratio)
		{
			this.#m_pVideo = p_video;
			this.#init();
			this.setMix(p_mix_ratio);
		}

		#init()
		{
		   console.log("init");
			this.#m_pAudioContext = new window.AudioContext();
			this.#m_pSource = this.#m_pAudioContext.createMediaElementSource(this.#m_pVideo.getVideoElement());

			//don't need to preserve it as stereo.
			this.#m_pSplitter = this.#m_pAudioContext.createChannelSplitter(2);

			this.#m_pLeft = this.#m_pAudioContext.createGain();
			this.#m_pRight = this.#m_pAudioContext.createGain();
			this.#m_pMerger = this.#m_pAudioContext.createChannelMerger(1);

			this.#m_pSplitter.connect(this.#m_pLeft, 0);
			this.#m_pSplitter.connect(this.#m_pRight, 1);
			this.#m_pLeft.connect(this.#m_pMerger, 0, 0);
			this.#m_pRight.connect(this.#m_pMerger, 0, 0);

			this.#disconnect();
		}

	   #connect()
	   {
		   console.log("connect");
		   this.#m_pSource.disconnect();
			this.#m_pSource.connect(this.#m_pSplitter);
			this.#m_pMerger.connect(this.#m_pAudioContext.destination);
			this.#m_bConnected = true;
		}

		#disconnect()
		{
		   console.log("disconnect");
		   this.#m_pSource.disconnect();
		   this.#m_pMerger.disconnect();
		   this.#m_pSource.connect(this.#m_pAudioContext.destination);
		   this.#m_bConnected = false;
		}

		setMix(p_mix_ratio)
		{
		   console.log("set mix : " + p_mix_ratio);
		   this.#m_fMixRatio = p_mix_ratio;

		   if(p_mix_ratio == 0.5)
		   {
			   if(this.#m_bConnected)
				   this.#disconnect();
		   }
		   else
		   {
			   if(!this.#m_bConnected)
				   this.#connect();

			   this.#m_pLeft.gain.value = 1.0 - this.#m_fMixRatio;
			   this.#m_pRight.gain.value = this.#m_fMixRatio;
		   }
		}

		#close()
		{
		   console.log("close");
		   this.#m_pAudioContext.close();
		   this.#m_pAudioContext = null;
		   this.#m_pLeft = null;
		   this.#m_pRight = null;
		}


/*


			var leftToLeft = this.#m_pAudioContext.createGain()
			var leftToRight = this.#m_pAudioContext.createGain()
			var rightToLeft = this.#m_pAudioContext.createGain()
			var rightToRight = this.#m_pAudioContext.createGain()

			left.connect(leftToLeft)
			left.connect(leftToRight)
			right.connect(rightToLeft)
			right.connect(rightToRight)

			function setVolume(ll, lr, rl, rr) {
			  leftToLeft.gain.value = ll
			  leftToRight.gain.value = lr
			  rightToLeft.gain.value = rl
			  rightToRight.gain.value = rr
			}

			var merger = this.#m_pAudioContext.createChannelMerger(2)
			leftToLeft.connect(merger, 0, 0)
			leftToRight.connect(merger, 0, 1)
			rightToLeft.connect(merger, 0, 0)
			rightToRight.connect(merger, 0, 1)

			merger.connect(this.#m_pAudioContext.destination)

			setVolume(0.0, 0.0, 1.0, 1.0)*/



			/*

			//let gainNode = this.#m_pAudioContext.createGain();
			//let lowpass = this.#m_pAudioContext.createBiquadFilter();
			let highpass = this.#m_pAudioContext.createBiquadFilter();


			source.connect(highpass);
			//lowpass.connect(highpass);
			highpass.connect(this.#m_pAudioContext.destination);

			//lowpass.type = "bandpass";
			//lowpass.frequency.value = 350;
			//lowpass.Q.value = 1.05;
			highpass.type = "bandpass";
			highpass.frequency.value = 500;
			highpass.Q.value = 10.0;
			highpass.gain.value = 15;*/
	}

	function setupMultiview()
	{
		//overwrite the document.
		function addBitmovin()
		{
			GM_addElement('script', {
				textContent: bitmvin
			});

			waitForBitmovin();
		}

		function waitForBitmovin()
		{
		   //addBitmovin();
			if(!unsafeWindow.bitmovin)
			{
				unsafeWindow.setTimeout(waitForBitmovin, 1000);
				return;
			}
			else if(!unsafeWindow.bitmovin.player)
			{
				unsafeWindow.bitmovin = null;
				addBitmovin();
				return;
			}

			document.open();
			document.write(g_sMutliviewHeaderHTML + g_sMutliviewMainBodyHTML);
			window.stop();

			document.body.onclick = clickToStart;
		}

		function clickToStart()
		{
		   document.body.onclick = null;
		   document.getElementById("click_to_start").style.display = "none";
		   onBitmovinLoaded();
		}
		//addBitmovin();
		//waitForBitmovin();
		unsafeWindow.setTimeout(addBitmovin, 10);

		//var smWindow = new Array(gMultiviewLayout.length);
		let g_iVideoCount = gMultiviewLayout.video.length;
		let g_aWindows = new Array(gMultiviewLayout.window_count);
		let g_iWindowBuiltCount = 0;
		let smPlayers = new Array(g_iVideoCount);//array of the bitmovin players.
		let smElements = new Array(g_iVideoCount);//2d array, [parent_element, element] for each video. (allows the transformation crop).
		let sF1SubscriptionToken = "";
		let listAvailableF1Streams = {};
		let listDriverIDByStreamName = {};
		let g_aAudioFilters = new Array(g_iVideoCount);

		//control bar elements
		let elControlBar;
		let elLeftTime;
		let elRightTime;
		let elSeebar;
		let updateIntervalTimer = null;

		//synchronisation data
		let videoProgrammeStartTime = new Array(g_iVideoCount);
		let videoOverideOffsets = new Array(g_iVideoCount);
		let liveVideoOffset = new Array(g_iVideoCount);
		let elLiveOffsets = new Array(g_iVideoCount);
		let synchronisationTimer = null;

		let g_aAutoQualityBySize = new Array(gMultiviewLayout.video.length);

		let timing_vewer;
		let timer;
		//let other_timer;

		let isLiveStream = false;

		function onResize(p_window_id)
		{
			var ww = g_aWindows[p_window_id].innerWidth;
			var wh = g_aWindows[p_window_id].innerHeight;
			var x, y , w, h, smWindowOffsetX, smWindowOffsetY, smWindowWidth, smWindowHeight;
			var r16b9 = 16/9;

			for (let i = 0; i < g_iVideoCount; i++)
			{
				if(gMultiviewLayout.video[i][LAYOUT_VIDEO_WINDOW_ID] != p_window_id)
					continue;

				smWindowOffsetX = gMultiviewLayout.video[i][LAYOUT_VIDEO_X] / 100 * ww;
				smWindowOffsetY = gMultiviewLayout.video[i][LAYOUT_VIDEO_Y] / 100 * wh;
				smWindowWidth = gMultiviewLayout.video[i][LAYOUT_VIDEO_W] / 100 * ww;
				smWindowHeight = gMultiviewLayout.video[i][LAYOUT_VIDEO_H] / 100 * wh;

				var element = smElements[i][0];

				/*
				if(i === 0)
					element = smWindow[i].document.querySelector(".inset-video-item-image-container");
				else
					element = document.getElementById("sm-frame-" + i);

				if(!element)
				{
					console.log("no element found in resize");
					continue;
				}*/

				if(gMultiviewLayout.video[i][LAYOUT_VIDEO_MAINTAIN_ASPECT])
				{//fill to 16/9 confined to the area above.
					w = Math.min(smWindowHeight * r16b9, smWindowWidth);
					h = Math.min(smWindowWidth * 1/r16b9, smWindowHeight);
					x = smWindowOffsetX + (smWindowWidth - w)/2;
					y = smWindowOffsetY + (smWindowHeight - h)/2;

					element.style.left = Math.floor(x) + 'px';
					element.style.top = Math.floor(y) + 'px';
					element.style.width = Math.floor(w) +'px';
					element.style.height = Math.floor(h) +'px';
				}
				else
				{
					//not maintaining aspect ratio - fills to the biggest 16/9 i.e. may overflow, then squash the desired part into smWindowXXX above using the transformation.
					w = Math.max(smWindowHeight * r16b9, smWindowWidth);
					h = Math.max(smWindowWidth * 1/r16b9, smWindowHeight);
					x = "-" + gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_X] / 100 * w + "px";
					y = "-" + gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_Y] / 100 * h + "px";

					element.style.left = smWindowOffsetX + 'px';
					element.style.top = smWindowOffsetY + 'px';
					element.style.width = smWindowWidth + 'px';
					element.style.height = smWindowHeight + 'px';

					var vid = smElements[i][1];//smWindow[i].document.querySelector(".embedded-player-container");//".inset-video-item-image-container");

					if(vid)
					{
						//vid.style.left = x;
						//vid.style.top = y;
						vid.style.width = Math.floor(w) +'px';
						vid.style.height = Math.floor(h) +'px';

						var x_scale = smWindowWidth / (gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_W]/100 * w);
						var y_scale = smWindowHeight / (gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_H]/100 * h);
						var transform = "scale(" + x_scale + "," + y_scale + ") translate(-" + gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_X] + "% ,-" + gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_Y] + "%)";// translate(" +x + " ," + y/* gMultiviewLayout[i][8] + "%*/ + ");";
						vid.style.transformOrigin = "top left";
						vid.style.transform = transform
						// + "," +  + ")";
						//vid.style.transform.
					}
				}

				updateVideoQuality(i, w, h);
			}
		}

		/*function updateSquashedVideos()
		{
			var p_v = smWindow[gDataSquashedWindowID].document.getElementsByTagName("video")[0];
			var vh = p_v.videoHeight;
			var vw = p_v.videoWidth;
			var sx, sy, sw, sh,
				dx, dy, dw, dh;

			for(var i = 0; i < canvas.length; i++)//for each canvas
			{
				for( var j = 0; j < aCanvasDrawInstructions[i].length; j++)//for each column
				{
					for( var k = 0; k < aCanvasDrawInstructions[i][j][0]; k++)//for the number of rows
					{
						sx = /*Math.floor*(vw * (aCanvasDrawInstructions[i][j][1] + k * aCanvasDrawInstructions[i][j][2])/ 100);
						sy = (vh * (aCanvasDrawInstructions[i][j][3] + k * aCanvasDrawInstructions[i][j][4])/ 100);
						sw = (vw * aCanvasDrawInstructions[i][j][5] / 100);
						sh = (vh * aCanvasDrawInstructions[i][j][6] / 100);
						dx = (canvasDims[i][0] * (aCanvasDrawInstructions[i][j][7] + k * aCanvasDrawInstructions[i][j][8])/ 100);
						dy = (canvasDims[i][1] * (aCanvasDrawInstructions[i][j][9] + k * aCanvasDrawInstructions[i][j][10])/ 100);
						dw = (canvasDims[i][0] * aCanvasDrawInstructions[i][j][11] / 100);
						dh = (canvasDims[i][1] * aCanvasDrawInstructions[i][j][12] / 100);
						canvasContext[i].drawImage(p_v,
												   sx, sy, sw, sh,
												   dx, dy, dw, dh);
					}
				}
			}
			setTimeout(updateSquashedVideos, 100);
		}

		function setupSquashedDataVideo(p_id)
		{
			gDataSquashedWindowID = p_id;

			if(canvas[0])
				return;

			var sExtra = "<div>";
			for( var i = 0; i < canvasViewDims.length; i++)
				sExtra += '<canvas style="background-color: coral; position: absolute; z-index: 1000; border: 0; left: ' + gMultiviewLayout[p_id][11][i][0] + '%; top: ' + gMultiviewLayout[p_id][11][i][1] + '%; width: ' + gMultiviewLayout[p_id][11][i][2] + '%; height: ' + gMultiviewLayout[p_id][11][i][3] + '%" id="dataCanvas' + i + '"></canvas>';
			sExtra += "/<div>";
			document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", sExtra);

			for( var i = 0; i < gMultiviewLayout[p_id][11].length; i++)
			{
				canvas[i] = document.getElementById('dataCanvas' + i);
				canvasContext[i] = canvas[i].getContext('2d', {alpha:false});

				canvas[i].width = canvasDims[i][0] = Math.floor(canvas[i].clientWidth) * 2;
				canvas[i].height = canvasDims[i][1] = Math.floor(canvas[i].clientHeight) * 2;

				//mouse interaction
				canvas[i].addEventListener('mouseup',(event) => {
					//this deliberately pauses the main video.
					var p_v = document.getElementsByTagName("video")[0];
					if(p_v.paused)
						p_v.play();
					else
						p_v.pause();

					event.preventDefault();
					event.stopImmediatePropagation();
				}
										  );

				canvas[i].addEventListener('dblclick',(event) => {
					var element = document.querySelector('[aria-label=Fullscreen]');
					if(element)
					{
						smWindow[p_id].document.querySelector(".player-container").requestFullscreen();
						//document.exitFullscreen();document.querySelector(".player-container");
						//document.querySelector(".inset-video-item-image-container").requestFullscreen();
						//element.click(event);
					}
					event.stopImmediatePropagation();
					event.preventDefault();
				}
										  );
			}
			updateSquashedVideos();
		}*/

		function updateVideoQuality(p_i, p_w, p_h)
		{
			if(!g_aAutoQualityBySize[p_i] || ! smPlayers[p_i])
				return;

			let approx_width_pixels = p_w * gMultiviewLayout.video[p_i][LAYOUT_VIDEO_W] / gMultiviewLayout.video[p_i][LAYOUT_VIDEO_CROP_W];
			let approx_height_pixels = p_h * gMultiviewLayout.video[p_i][LAYOUT_VIDEO_H] / gMultiviewLayout.video[p_i][LAYOUT_VIDEO_CROP_H];

			let qualities = smPlayers[p_i].getAvailableVideoQualities();

			let j = 0;
			while(j < qualities.length && (approx_width_pixels > qualities[j].width || approx_height_pixels > qualities[j].width))
				j++;

			if(j > 3 || j >= qualities.length)
			{
				smPlayers[p_i].setVideoQuality("auto");
				document.getElementById("select-quality-" + p_i).selectedIndex = 0;
				return;
			}

			smPlayers[p_i].setVideoQuality(qualities[j].id);
			document.getElementById("select-quality-" + p_i).selectedIndex = j+1;
		}
		/*
		function selectVideoQuality(i)
		{
			var approx_width_pixels = window.innerWidth * gMultiviewLayout.video[i][LAYOUT_VIDEO_W] / gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_W];
			var approx_height_pixels = window.innerHeight * gMultiviewLayout.video[i][LAYOUT_VIDEO_H] / gMultiviewLayout.video[i][LAYOUT_VIDEO_CROP_H];
			var id = 0;//auto
			if(approx_width_pixels < 480 && approx_height_pixels < 270)
				id = 1;
			else if(approx_width_pixels < 512 && approx_height_pixels < 288)
				id = 2;
			else if(approx_width_pixels < 640 && approx_height_pixels < 360)
				id = 3;
			else if(approx_width_pixels < 960 && approx_height_pixels < 540)
				id = 4;

			/////////
			return;

			var quality_selector = smWindow[i].document.querySelector('.bmpui-ui-videoqualityselectbox');

			if(!quality_selector)
				return;

			if(quality_selector.selectedIndex === id)
				return;

			quality_selector.selectedIndex = id;

			if ("createEvent" in document)
			{
				var evt = document.createEvent("HTMLEvents");
				evt.initEvent("change", false, true);
				quality_selector.dispatchEvent(evt);
			}
			else
				quality_selector.fireEvent("onchange");

			//this is to check its actually happened.
			//setTimeout(() => {selectVideoQuality(i)}, 5000);
		}

		function updateAllVideoQuality()
		{
			var i = g_iVideoCount;//gMultiviewLayout.length;
			while(i--)
				selectVideoQuality(i);
		}*/

		function getCookie(cname)
		{
			let name = cname + "=";
			let decodedCookie = decodeURIComponent(document.cookie);
			let ca = decodedCookie.split(';');
			for(let i = 0; i <ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		}

		async function playStream(p_id, p_playback_url)
		{
			var response = await fetch(p_playback_url, {
				method: 'GET',
				headers: {
					'ascendontoken': sF1SubscriptionToken,
				}
			});

			if(response.status !== 200)
			{
				console.log("playbackURL: resposne status not 200: " +  response.statusText);
				return;
			}

			let jsonResp = await response.json();

			let sourceConfig = {
					"title": "F1TV++",
					"description": "One of the videos on display!",
					options: {
						manifestWithCredentials: true,
						dashManifestWithCredentials: true,
						dashWithCredentials: true,
						withCredentials: true
					}
			};

			switch(jsonResp.resultObj.streamType)
			{
				case 'HLS':
					sourceConfig.hls = jsonResp.resultObj.url;
					break;

				case 'HLSWV':
					sourceConfig.hls = jsonResp.resultObj.url;
					sourceConfig.drm = {
						widevine :
						{
							LA_URL: jsonResp.resultObj.laURL ,
							headers : {'entitlementToken' : jsonResp.resultObj.entitlementToken}
						}
					};
					break;

				case 'HLSPR':
					sourceConfig.hls = jsonResp.resultObj.url;
					sourceConfig.drm = {
						playready :
						{
							LA_URL: jsonResp.resultObj.laURL ,
							headers : {'entitlementToken' : jsonResp.resultObj.entitlementToken}
						}
					};
					break;

				case 'DASHWV':
					sourceConfig.dash = jsonResp.resultObj.url;
					sourceConfig.drm = {
						widevine :
						{
							LA_URL: jsonResp.resultObj.laURL ,
							headers : {'entitlementToken' : jsonResp.resultObj.entitlementToken}
						}
					};
					break;

				case 'DASHPR':
					sourceConfig.dash = jsonResp.resultObj.url;
					sourceConfig.drm = {
						playready :
						{
							LA_URL: jsonResp.resultObj.laURL ,
							headers : {'entitlementToken' : jsonResp.resultObj.entitlementToken}
						}
					};
					break;

				default:
					console.log("Unrecognised Stream Type.");
					break;
			}

			smPlayers[p_id].load(sourceConfig).then(onVideoLoaded.bind(null, p_id, jsonResp.resultObj.url)).catch((e) => {console.log("Video Load Error: " + e)});
		}

		async function setupF1Streams()
		{
			//Get login token
			var cookie = getCookie("login-session");
			if(!cookie.length)
			{
				alert("ERROR: You don't seem to be logged in....");
				return;
			}
			var cookie2 = JSON.parse(decodeURIComponent(cookie));
			sF1SubscriptionToken = cookie2.data.subscriptionToken;

			//get the list of stream links.
			var streamListURL = "https://f1tv.formula1.com/3.0/R/ENG/WEB_HLS/ALL/CONTENT/VIDEO/" + gContentID + "/F1_TV_Pro_Annual/14";
			var response = await fetch(streamListURL);
			if(response.status !== 200)
			{
				console.log("ERROR: streamListURL: resposne status not 200: " +  response.statusText);
				return;
			}
			var jsonResp = await response.json();

			var html_select_opts = "";
			//select the streams according to the multiview.
			//cache the stream links.
			var j = jsonResp.resultObj.containers[0].metadata.additionalStreams.length;
			while(j--)
			{
				var str = jsonResp.resultObj.containers[0].metadata.additionalStreams[j].title.toLowerCase();
				listDriverIDByStreamName[str] = jsonResp.resultObj.containers[0].metadata.additionalStreams[j].racingNumber;
				listAvailableF1Streams[str] = "https://f1tv.formula1.com/2.0/R/ENG/WEB_HLS/ALL/" + jsonResp.resultObj.containers[0].metadata.additionalStreams[j].playbackUrl;
				html_select_opts += '<option value="' + str + '">' + jsonResp.resultObj.containers[0].metadata.additionalStreams[j].title + '</option>';
			}

			//setup the timing view now that we have the parameters.
			if(true)
			{
				//jsonResp.resultObj.containers[0].metadata.emfAttributes.Meeting_Name

				//2022-07-03T17:00:00+01:00
				let date = jsonResp.resultObj.containers[0].metadata.emfAttributes.sessionEndTime.slice(0,10);
				let year = jsonResp.resultObj.containers[0].metadata.emfAttributes.sessionEndTime.slice(0,4);
				let session_name = jsonResp.resultObj.containers[0].metadata.longDescription;

				if(session_name =="F1 Sprint")
					session_name = "Sprint";//the timing needs it to be called this.

				initialiseTimerView(year, date, session_name, jsonResp.resultObj.containers[0].metadata.emfAttributes.Meeting_Name.replaceAll(" ", "_"));
			}

			//setup the video settings dialogue.
			var i = gMultiviewLayout.video.length;
			while(i--)
			{
				if(!smPlayers[i])
					smPlayers[i]  = new unsafeWindow.bitmovin.player.Player(smElements[i][1], playerConfig);

				var playbackURL = listAvailableF1Streams[gMultiviewLayout.video[i][LAYOUT_VIDEO_FEED]];
				if(playbackURL)
					playStream(i, playbackURL);

				//setup the display for changing the streams.
				var el = document.getElementById("select-stream-" + i);
				if(el)
				{
					el.innerHTML = html_select_opts;
					el.value = gMultiviewLayout.video[i][LAYOUT_VIDEO_FEED];
					el.addEventListener("change", onStreamSelectChange.bind(null,i));
				}

				el = document.getElementById("video-volume-" + i);
				if(el)
				{
					smPlayers[i].setVolume(gMultiviewLayout.video[i][LAYOUT_VIDEO_VOLUME]*100);
					el.value = gMultiviewLayout.video[i][LAYOUT_VIDEO_VOLUME]*100;
					el.addEventListener("input", onVolumeChange.bind(null,i));
				}

				el = document.getElementById("video-auto-quality-" + i);
				if(el)
				{
					el.addEventListener("change", onAutoQualityChange.bind(null,i));
				}
			}
		}

		function onStreamSelectChange(p_id)
		{
			var el = document.getElementById("select-stream-" + p_id);
			timing_vewer.releaseOverlay(listDriverIDByStreamName[ gMultiviewLayout.video[p_id][LAYOUT_VIDEO_FEED] ]);
			gMultiviewLayout.video[p_id][LAYOUT_VIDEO_FEED] = el.options[el.selectedIndex].text.toLowerCase();
			playStream(p_id, listAvailableF1Streams[el.value]);
		}

		function onVolumeChange(p_id)
		{
			var el = document.getElementById("video-volume-" + p_id);
			smPlayers[p_id].setVolume(el.value);
		}

		function onAutoQualityChange(p_id)
		{
			g_aAutoQualityBySize[p_id] = document.getElementById("video-auto-quality-" + p_id).checked;
			//Resize the window that this video is in
			onResize(gMultiviewLayout.video[p_id][LAYOUT_DATA_WINDOW_ID]);

			let el = document.getElementById("select-quality-" + p_id);
			if(el)
			{
				if(g_aAutoQualityBySize[p_id])
					el.disabled = true;
				else
					el.disabled = false;
			}
		}

		function onStreamQualityChange(p_id)
		{
			var el = document.getElementById("select-quality-" + p_id);
			smPlayers[p_id].setVideoQuality(el.value);
		}

		function onStreamAudioChange(p_id)
		{
			var el = document.getElementById("select-audio-" + p_id);
			smPlayers[p_id].setAudio(el.value);
		}

		function onAudioMixChange(p_id)
		{
		   var el = document.getElementById("video-audio-mix-" + p_id);
		   g_aAudioFilters[p_id].setMix(el.value / 100);
		}

		function onVideoLoaded(p_id, p_url)
		{
			//set up video qualities.
			let qualities = smPlayers[p_id].getAvailableVideoQualities();
			let html_opts = '<option value="auto">Auto (bandwidth)</option>';

			for( let i = 0; i < qualities.length; i++)
				html_opts += '<option value="' + qualities[i].id + '">' + qualities[i].width + 'x' + qualities[i].height + ', ' + Math.floor(qualities[i].bitrate / 1000) + ' kbps</option>';

			let el = document.getElementById("select-quality-" + p_id);
			if(el)
			{
				el.innerHTML = html_opts;
				el.value = smPlayers[p_id].getVideoQuality().id;
				el.addEventListener("change", onStreamQualityChange.bind(null,p_id));

				if(g_aAutoQualityBySize[p_id])
					el.disabled = true;
				else
					el.disabled = false;
			}

			//set up audio options
			let audio = smPlayers[p_id].getAvailableAudio();
			html_opts = "";
			for(i = 0; i < audio.length; i++)
				html_opts += '<option value="' + audio[i].id + '">' + audio[i].label + '</option>';

			el = document.getElementById("select-audio-" + p_id);

			if(el)
			{
				el.innerHTML = html_opts;
				el.value = smPlayers[p_id].getAudio().id;
				el.addEventListener("change", onStreamAudioChange.bind(null,p_id));
			}

			smPlayers[p_id].play();

			//need to call a resize of the window so the auto quality gets applied
			if(g_aAutoQualityBySize[p_id])
				onResize(gMultiviewLayout.video[p_id][LAYOUT_DATA_WINDOW_ID]);

			if(p_id == 0)
			{
				isLiveStream = smPlayers[0].isLive();
				initSynchronisation();

				//initTimingLoop();
			}

			if(!g_aAudioFilters[p_id])
				g_aAudioFilters[p_id] = new audio_filter(smPlayers[p_id], gMultiviewLayout.video[p_id][LAYOUT_AUDIO_MIX]);
		   else
			   g_aAudioFilters[p_id].setMix(gMultiviewLayout.video[p_id][LAYOUT_AUDIO_MIX]);
			el = document.getElementById("video-audio-mix-" + p_id);

			if(el)
			{
				el.value = gMultiviewLayout.video[p_id][LAYOUT_AUDIO_MIX] * 100;
				el.addEventListener("input", onAudioMixChange.bind(null,p_id));
			}

			//set the forced video offset to the default for this video
			videoOverideOffsets[p_id] = getDefaultVideoOffset(gMultiviewLayout.video[p_id][LAYOUT_VIDEO_FEED], smPlayers[p_id].isLive()) / 1000;
			document.getElementById("video-forced-offset-" + p_id).value = videoOverideOffsets[p_id] * 1000;

			loadVideoStartTime(p_id, p_url);

			let doc = g_aWindows[gMultiviewLayout.video[p_id][LAYOUT_VIDEO_WINDOW_ID]].document;
			timing_vewer.initOverlay(doc.getElementById('video-overlay-' + p_id), listDriverIDByStreamName[ gMultiviewLayout.video[p_id][LAYOUT_VIDEO_FEED] ], doc);
		}

		async function loadVideoStartTime(p_id, p_url)
		{
			//load the programme start times in UTC time;
			if(smPlayers[p_id].manifest.hls)
			{
				let last_slash = p_url.lastIndexOf("/");
				let new_url = p_url.slice(0,last_slash) + "/";
				let obj = smPlayers[p_id].manifest.hls.properties[smPlayers[p_id].manifest.hls.properties.length-1];
				if(obj.name == "stream-inf")
				{
					new_url += obj.value;
				}

				//fetch
				let response = await fetch(new_url, {credentials: "include"});

				if(response.status !== 200)
				{
					console.log("ERROR: loadVideoStartTime: response status not 200: " +  response.statusText);
					return;
				}

				var text = await response.text();
				let start = "#EXT-X-PROGRAM-DATE-TIME:"
				let end = "#";
				let start_id = text.indexOf(start) + start.length;
				let end_id = text.indexOf(end, start_id);
				let time = text.slice(start_id, end_id);

				videoProgrammeStartTime[p_id] = parseDateTime(time);
				return;
			}
			else if(smPlayers[p_id].manifest.dash)
			{
				let start = "start="
				let end = "&";
				let start_id = p_url.indexOf(start) + start.length;
				let end_id = p_url.indexOf(end, start_id);
				let time = parseInt(p_url.slice(start_id, end_id)) * 1000;
				let d = new Date(time);
				videoProgrammeStartTime[p_id] = parseDateTime(d.toISOString());
				return;
			}
		}

		function playOrPauseAll()
		{
			let isPaused = smPlayers[0].isPaused();

			if(isPaused)
				playAll();
			else
				pauseAll();
		}

		function pauseAll()
		{
			let i = g_iVideoCount;
			while(i--)
				smPlayers[i].pause();

			synchroniseAll();
		}

		function playAll()
		{
			let i = g_iVideoCount;
			while(i--)
					smPlayers[i].play();
		}

		let isFullscreen = false;
		function enterFullscreen()
		{
			document.body.requestFullscreen();
		}

		function exitFullscreen()
		{
			document.exitFullscreen();
		}

		function toggleFullscreen(p_window_id)
		{
			let doc = g_aWindows[p_window_id].document;
			if(doc.fullscreenElement !== doc.body)
				doc.body.requestFullscreen();
			else
				doc.exitFullscreen();

			//	document.documentElement.requestFullscreen();
			return;
			if(isFullscreen)
			{
				exitFullscreen();
				isFullscreen = false;
			}/*
			else
			{
				enterFullscreen();
				isFullscreen = true;
			}
			console.log("fullscreen request");*/

		}

		function toHHMMSS(n)
		{
			var sec_num = parseInt(n, 10); // don't forget the second param
			var hours   = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);

			if (hours   < 10) {hours   = "0"+hours;}
			if (minutes < 10) {minutes = "0"+minutes;}
			if (seconds < 10) {seconds = "0"+seconds;}
			return hours+':'+minutes+':'+seconds;
		}

		function updateControlBar()
		{
			var curTime, duration
			if(isLiveStream)
			{
				let maxTime = smPlayers[0].getMaxTimeShift()
				elSeebar.min = maxTime;
				elSeebar.max = 0;
				elSeebar.value = smPlayers[0].getTimeShift();

				elLeftTime.innerHTML = toHHMMSS(maxTime);
				elRightTime.innerHTML = "LIVE";
			}
			else
			{
				curTime = smPlayers[0].getCurrentTime();
				duration = smPlayers[0].getDuration();

				elSeebar.max = duration;
				elSeebar.value = curTime;
				elLeftTime.innerHTML = toHHMMSS(curTime);
				elRightTime.innerHTML = toHHMMSS(duration);
			}


			let i = g_iVideoCount;
			while(i--)
				elLiveOffsets[i].innerHTML = Math.floor(liveVideoOffset[i] * 1000) + "ms";
		}

		function displayControlBar()
		{
			elControlBar.style.display = "block";
			updateControlBar();
			updateIntervalTimer = unsafeWindow.setInterval(updateControlBar, 1000);
		}

		function hideControlBar()
		{
			elControlBar.style.display = "none";
			clearInterval(updateIntervalTimer);
			updateIntervalTimer = null;
		}

		function seek()
		{
			var new_time = elSeebar.value * 1;

			if(isLiveStream)
			{
				var i = g_iVideoCount;
				while(i--)
						smPlayers[i].timeShift(new_time);
			}
			else
			{
				var i = g_iVideoCount;
				while(i--)
				{
				   let offset = 0;
				   if(i != 0)
					   offset = videoOverideOffsets[0] - videoOverideOffsets[i];
				   smPlayers[i].seek(new_time + offset);
				}
					   
			}
		}

		function checkSynchronisation()
		{
			//update the offsets
			let i = g_iVideoCount;
			 //   console.log("player0 :" + smPlayers[0].getCurrentTime("absolutetime"));
			//let d = Date.now();

			//console.log("Time MS: " + Date.now());
			while(--i)
			{
				if(!isLiveStream)
				{
					//this can be improved with the absolute time - see code below - do somehting similar. add an offset to the videos own current time rather than video 0.
					liveVideoOffset[i] = (smPlayers[i].getCurrentTime() + videoOverideOffsets[i]) - (smPlayers[0].getCurrentTime() + videoOverideOffsets[0]);
					if(Math.abs(liveVideoOffset[i]) > 0.5)
					{
						smPlayers[i].seek(smPlayers[0].getCurrentTime() + videoOverideOffsets[0] - videoOverideOffsets[i]);
						//need to check if this is buffered, if its not ?pause then play when ready
					}
				}
				else
				{
					//console.log("player" + i + " :" + smPlayers[i].getCurrentTime("absolutetime"));



					liveVideoOffset[i] = smPlayers[i].getTimeShift() - (smPlayers[0].getTimeShift() + videoOverideOffsets[i]);
					if(Math.abs(liveVideoOffset[i]) > 0.5)
					{
						liveVideoOffset[i] = smPlayers[i].getCurrentTime("relativetime") - (smPlayers[0].getCurrentTime("relativetime") + videoOverideOffsets[i]);
						//console.log("current offset for video 0 : " + smPlayers[0].getTimeShift());
						//console.log("current offset for video " + i + " : " + smPlayers[i].getTimeShift());
						//let new_tme_offset = Math.min(smPlayers[i].getTimeShift() - liveVideoOffset[i],-0.01);
						//console.log("new_offset for video " + i + " : " + new_tme_offset);
						smPlayers[i].timeShift(smPlayers[0].getTimeShift() + videoOverideOffsets[i]);//new_tme_offset);
						//need to check if this is buffered, if its not ?pause then play when ready
					}
				}
				//console.log("time " + i + " : " + smPlayers[i].getCurrentTime("absolutetime"));
			}
		}

		function synchroniseAll()
		{
			let i = g_iVideoCount;
			let player0time = smPlayers[0].getCurrentTime();
			console.log("current offset for video 0 : " + smPlayers[0].getTimeShift());
			while(i-- > 1)
			{
				if(isLiveStream)
				{
					liveVideoOffset[i] = smPlayers[i].getCurrentTime("absolutetime") - (smPlayers[0].getCurrentTime("absolutetime") + videoOverideOffsets[i]);

					console.log("current offset for video " + i + " : " + smPlayers[i].getTimeShift());
					let new_tme_offset = Math.min(smPlayers[i].getTimeShift() - liveVideoOffset[i],-0.01);
					console.log("new_offset video " + i + " : " +  new_tme_offset);
					smPlayers[i].timeShift(new_tme_offset);

				}
				else
					smPlayers[i].seek(player0time + videoOverideOffsets[0] - videoOverideOffsets[i]);
			}
		}

		function initSynchronisation()
		{
			if(synchronisationTimer != null)
				return; //we've already initialised.

			checkSynchronisation();
			synchronisationTimer = unsafeWindow.setInterval(checkSynchronisation, 5000);
		}

		function setOverideOffset(p_id, p_element)
		{
			videoOverideOffsets[p_id] = parseInt(p_element.value, 10) / 1000;
		}

		//resultObj.containers[0].metadata.emfAttributes.Meeting_Name
		//resultObj.containers[0].metadata.year
		//resultObj.containers[0].metadata.emfAttributes.sessionEndTime
		//resultObj.containers[0].metadata.longDescription
		async function initialiseTimerView(p_year, p_date, p_title, p_session)
		{
			if( ! gMultiviewLayout.data || !gMultiviewLayout.data.length)
				return; //theres no data layout so skip all of this.

			//return;
			//convert session date to the sunday for the weekend date.
			let w_date = new Date(p_date);
			let sunday_date;
			let weekday = w_date.getUTCDay();//this needs to just be UTC timezone.
			if( weekday !== 0)//sunday
			{
				w_date.setUTCDate(w_date.getUTCDate() + (7 - weekday));
				sunday_date = w_date.toISOString().slice(0,10);
			}
			else
				sunday_date = p_date;
//sunday_date = "2022-11-13";
//p_title = "Sprint";
			let base_url = "https://livetiming.formula1.com/static/" + p_year + "/" + sunday_date + "_" + p_session + "/" + p_date + "_" + p_title + "/";
			base_url = base_url.replaceAll(" ", "_");
			let link = base_url + "ArchiveStatus.json";

			let response = await fetch(link);
			response = await response.json();

			timing_vewer = new timing_renderer(gMultiviewLayout.data, g_aWindows);

			if(response.Status === "Complete")
				timer = new nonlive_timing(gMultiviewLayout.data, base_url, timing_vewer, p_title);
			else
				timer = new live_timing(gMultiviewLayout.data, timing_vewer, p_title);

			initTimingLoop();
		}

		//Season events.
		//https://livetiming.formula1.com/static/2022/Index.json



//https://livetiming.formula1.com/static/2022/2022-07-24_French_Grand_Prix/2022-07-24_Race/ArchiveStatus.json
		//https://livetiming.formula1.com/static/2022/2022-07-03_British_Grand_Prix/2022-07-03_Race/ArchiveStatus.json

		function initTimingLoop()
		{
			unsafeWindow.setInterval(onTimingLoop, 100);
		}

		//let silver_stone_programme_start_time = parseDateTime("2022-07-03T13:55:03.045Z");
		//let fudge_start_time = parseDateTime("2022-07-10T12:55:00.737Z");
		function onTimingLoop()
		{
			let time;
			if(isLiveStream)
			{/*

				if(!videoProgrammeStartTime[0])
				return;//no point doing anything here.

			time = copyDateTime(videoProgrammeStartTime[0]);
			time.addSeconds(smPlayers[0].getCurrentTime("relativetime") - 10);*/

				time = smPlayers[0].getCurrentTime("absolutetime") * 1000;
				time = parseDateTime(new Date(time).toISOString());
				time.addSeconds(videoOverideOffsets[0]);
			}
			else
			{
				if(!videoProgrammeStartTime[0])
					return;//no point doing anything here.

				time = copyDateTime(videoProgrammeStartTime[0]);
				time.addSeconds(smPlayers[0].getCurrentTime() + videoOverideOffsets[0]);
			}

			//let t_start = copyDateTime(silver_stone_programme_start_time);
			//t_start.addJSONTime(new date_time(0,0,0,0,0, smPlayers[0].getCurrentTime() - 10.0));

			timer.onTime(time);
		}

		/*
		function buildVideoLayout (p_window_id, p_vid_id)
		{
			if(p_window_id != 0)
				smPlayers[i] = g_aWindows[p_window_id].players[p_vid_id];

			for (let i = 0; i < g_iVideoCount; i++)
			{
				if(gMultiviewLayout.video[i][LAYOUT_DATA_WINDOW_ID] != p_window_id)
					continue;

				let doc= g_aWindows[p_window_id].document;


				/*
				if(p_window)
					doc = p_window.document;
				else
					doc
	*
				//let frameHtml = '<div id="video-parent-div-' + i + '" style="opacity: 1.0; position: absolute; z-index: 1000; border: 0; left: 0%;\
				//top: 0%; width: 100%; height: 100%; overflow:hidden;"><div id="video-child-div-' + i + '"></div></div>';
				//doc.getElementById("videos").insertAdjacentHTML("beforeend", frameHtml);

				smElements[i] = [doc.getElementById("video-parent-div-" + i), doc.getElementById("video-child-div-" + i)];
				console.log(smElements[i][1] instanceof HTMLElement);
				smPlayers[i] = new bitmovin.player.Player(smElements[i][1], playerConfig);
			}

			onResize(p_window_id);
			g_iWindowBuiltCount++;
		}
		*/
		function onVideoAdded()
		{
			g_iWindowBuiltCount++;
			if(g_iWindowBuiltCount == g_iVideoCount)//gMultiviewLayout.window_count)
			{
				window.removeEventListener("message", onMessage);
				//now we have everything set up, we can start loading the videos.
				setupF1Streams();

				let i = gMultiviewLayout.window_count;
				while(i--)
					onResize(i);
			}
		}

		function onMessage(e)
		{
			if(e.data.windowID)
			{
				//(e instanceof HTMLElement
				// g_aWindows[e.data.windowID].players[e.data.videoID];
				smElements[e.data.videoID] = g_aWindows[e.data.windowID].elements[e.data.videoID];
				//smPlayers[e.data.videoID] = new bitmovin.player.Player(smElements[e.data.videoID][1], playerConfig);
				onVideoAdded();
				/*
				let doc = g_aWindows[e.data.window_id].document;
				smElements[e.data.id] = [doc.getElementById("video-parent-div-" + i), doc.getElementById("video-child-div-" + i)]
				smPlayers[e.data.id] = e.data.player;
				g_iWindowBuiltCount++;
*/
				//buildVideoLayout(e.data.windowID, e.data.id);

				//check if all the windows have been created

			}
		}

/*
		function selectVideo(i, e)
		{
			//Check if we're on the correct video;
			var video_title = smWindow[i].document.querySelector('.bmpui-label-metadata-title');
			if(video_title && (video_title.innerHTML.toLowerCase() == gMultiviewLayout[i][4] ||
							   (gMultiviewLayout[i][4] == "data-squashed" && video_title.innerHTML.toLowerCase() == "data")))
				return;

			var element = null;
			var vid = smWindow[i].document.getElementsByTagName("video")[0];

			//Selecting videos only works once the video has started playing
			if(!vid || vid.readyState != 4)
			{
				setTimeout(() => {selectVideo(i,e)}, 1000);
				return;
			}

			vid.muted = false;
			vid.volume = gMultiviewLayout[i][5];

			if(gMultiviewLayout[i][4].length != 3)
			{//normal video
				if( gMultiviewLayout[i][4] == "data-squashed")
					element = smWindow[i].document.querySelector('[aria-label=data]');

				else
					element = smWindow[i].document.querySelector('[aria-label="' + gMultiviewLayout[i][4] + '"]');
			}
			else
			{//driver video
				var els = smWindow[i].document.querySelectorAll('.driver-title');
				for(var j = 0; j < els.length; j++)
					if( els[j].innerHTML == gMultiviewLayout[i][4])
						element = els[j];
			}

			if(!element)
			{//no element found, try again later (probably still loading)
				setTimeout(() => {selectVideo(i,e)}, 1000);
				return;
			}

			element.click(e);

			if( gMultiviewLayout[i][4] == "data-squashed")
				setupSquashedDataVideo(i);

			//we've clicked - check in few seconds to see if its changed.
			setTimeout(() => {selectVideo(i,e)}, 3000);
		}*/
/*
		document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smHtml);
		document.getElementById("sm-popup-id").innerHTML = 0;
		document.title = "(#0)";

		document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smAllWindowExtraHtml + smMainWindowExtraHtml);
		var smHtmlExtra = "<style>" +
			".inset-video-item-image-container {z-index: 1000; top: 0%; left: 0%; height: 100%; width: 100%; background-color: #000;}" +
			"</style>";
		document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smHtmlExtra);

		smWindow[0] = window;

		var videohtml = '<div id="my-new-player" style="position: fixed; top: 0%; left: 0; width: 100%; height: 100%;"></div>';
		//document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", videohtml);

		/*
		var script = document.createElement( "script" )
		script.src = "https://cdn.bitmovin.com/player/web/8/bitmovinplayer.js";
		script.type = "text/javascript";
		*/
		//script.onload = function()
		//{

		//};


		//document.getElementsByTagName( "head" )[0].appendChild( script );
		/*
		var video = document.getElementsByTagName("video")[0];
		var videohtml = '<div id="my-new-player"></div>';
		//style="opacity: 1.0; position: absolute; z-index: 1100;" id="bitmovinplayer-video-player" src="' + video.src +'" webkit-playsinline="" playsinline=""></video>';
document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", videohtml);
*/
		//		//
		//add the divs for the videos


		//set up the view
		function onBitmovinLoaded()
		{
		   elControlBar = document.getElementById("control-bar-viewer");
		   elLeftTime = document.getElementById("current-played-time");
		   elRightTime = document.getElementById("total-time");
		   elSeebar = document.getElementById("seekbar");

			g_aWindows[0] = window;
			window.addEventListener("message", onMessage);
			window.onresize = onResize.bind(this, 0);
			//if(gMultiviewLayout.window_count)

			unsafeWindow.onSubWindowResize = onResize;
			unsafeWindow.playOrPauseAll = playOrPauseAll;
			unsafeWindow.toggleFullscreen = toggleFullscreen;
			for(let i = 1; i < gMultiviewLayout.window_count; i++)
			{
				let url = "https://f1tv.formula1.com/#f1tvplus:" + gContentID + ":submultipopout:" + gLayoutSubType + ":" + gLayoutViewType + ":" + gLayoutID + ":" + i;
				g_aWindows[i] = window.open(url, "submultipopout" + i, "popup");
			}


			for (let i = 0; i < g_iVideoCount; i++)
			{
				/*
				if(gMultiviewLayout.video[i][LAYOUT_DATA_WINDOW_ID] === 0)
				{
					let frameHtml = '<div id="video-parent-div-' + i + '" style="opacity: 1.0; position: absolute; z-index: 1000; border: 0; left: 0%;\
					top: 0%; width: 100%; height: 100%; overflow:hidden;"><div id="video-child-div-' + i + '"></div></div>';
					document.getElementById("videos").insertAdjacentHTML("beforeend", frameHtml);

					smElements[i] = [document.getElementById("video-parent-div-" + i), document.getElementById("video-child-div-" + i)];
					smPlayers[i] = new bitmovin.player.Player(smElements[i][1], playerConfig);
					g_iWindowBuiltCount++;
				}*/

				/*
				var smWindowOffsetX = 0, smWindowOffsetY = 0,
					smWindowWidth = 100, smWindowHeight = 100;

				var frameHtml = '<div id="video-parent-div-' + i + '" style="opacity: 1.0; position: absolute; z-index: 1000; border: 0; left: ' + smWindowOffsetX + '%;\
				top: ' + smWindowOffsetY + '%; width: ' + smWindowWidth + '%; height: ' + smWindowHeight + '%; overflow:hidden;">\
				<div id="video-child-div-' + i + '"></div></div>';
				document.getElementById("videos").insertAdjacentHTML("beforeend", frameHtml);

				smElements[i] = [document.getElementById("video-parent-div-" + i), document.getElementById("video-child-div-" + i)];
				smPlayers[i] = new bitmovin.player.Player(smElements[i][1], playerConfig);*/

				if(gMultiviewLayout.video[i][LAYOUT_DATA_WINDOW_ID] == 0)
				{
					let frameHtml = '<div id="video-parent-div-' + i + '" style="opacity: 1.0; position: absolute; z-index: 1000; border: 0; left: 0%;\
					top: 0%; width: 100%; height: 100%; overflow:hidden;"><div id="video-child-div-' + i + '"></div><div class="video_overlay" id="video-overlay-' + i + '"></div></div>';
					document.getElementById("videos").insertAdjacentHTML("beforeend", frameHtml);

					smElements[i] = [document.getElementById("video-parent-div-" + i), document.getElementById("video-child-div-" + i)];
					//smPlayers[i] = new bitmovin.player.Player(smElements[i][1], playerConfig);
					onVideoAdded();
				}

				g_aAutoQualityBySize[i] = gMultiviewLayout.video[i][LAYOUT_VIDEO_AUTO_QUALITY];
				videoOverideOffsets[i] = 0;

				var table = document.getElementById("video-settings-table");
				var row = '<tr>\
							<td>#' + i + '</td>\
							<td><select name="Choose Stream" id="select-stream-' + i + '"></td>\
							<td><select name="Choose Audio" id="select-audio-' + i + '"></td>\
							<td><input class="slider" id="video-volume-' + i + '" type="range" min="0" max="100" value="0"></td>\
							<td>L<input class="slider" id="video-audio-mix-' + i + '" type="range" min="0" max="100" value="50">R</td>\
							<td><select name="Choose Quality" id="select-quality-' + i + '"><input type="checkbox" id="video-auto-quality-' + i + '" name="video-auto-quality-' + i + '" value="auto" checked="' + (g_aAutoQualityBySize[i] ? 'true': 'false') + '"><label for="video-auto-quality-' + i + '">Auto (size)</label></td>\
							<td id="video-live-offset-' + i + '">0ms</td>\
							<td><input id="video-forced-offset-' + i + '" type="number" step="250" value="" style="width: 80px;"></td>\
						</tr>';
				table.insertAdjacentHTML("beforeend", row);

				elLiveOffsets[i] = document.getElementById("video-live-offset-" + i);
				var el = document.getElementById("video-forced-offset-" + i);
				//if(i == 0)
			   //	 el.disabled = true;
			   // else
					el.oninput = setOverideOffset.bind(null, i, el);
			}

			//buildVideoLayout(0);
			//var control_view = document.getElementById("control-bar-viewer");
			document.getElementById("control-bar").onmouseenter = displayControlBar;
			document.getElementById("control-bar").onmouseleave = hideControlBar;

			document.getElementById("videos").onclick = playOrPauseAll;
			document.getElementById("videos").ondblclick = toggleFullscreen.bind(null, gLayoutSubWindowID);
			document.getElementById("play-video").onclick = playOrPauseAll;
			document.getElementById("fullscreen").onclick = toggleFullscreen.bind(null, gLayoutSubWindowID);
			elSeebar.oninput = seek;
		}

		//timing_vewer = new timing_renderer();
		//other_timer = new nonlive_timing("", "", "", timing_vewer);

		//timer = new live_timing("", "", "", timing_vewer);


/*
		for (let i = 0; i < smWindow.length; i++)
		{
			var options = {
				screenX: 0,
				screenY: 0
			};
			var e = new MouseEvent( "click", options );
			selectVideo(i, e);
		}

		document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smSettingsFrameHtml);

		document.getElementById("sm-offset-settings-btn").addEventListener("click", function() {
			document.getElementById("sm-offset-settings").style.display = "block";
		});

		document.getElementById("sm-offset-settings-close-btn").addEventListener("click", function() {
			document.getElementById("sm-offset-settings").style.display = "none";
		});

		window.addEventListener('resize', onResize);

		//document.getElementsByTagName("body")[0].requestFullscreen();
		document.documentElement.requestFullscreen();

		//setInterval(updateAllVideoQuality, 10000);


		//insertAdjacentHTML("beforeend", videohtml);

	   */
		return;
	}

	function setupSubMultiview()
	{
		document.open();
		document.write(g_sMutliviewHeaderHTML + g_sMutliviewSubBodyHTML);
		window.stop();

		document.body.onclick = clickToStart;
	

		function clickToStart()
		{
			document.body.onclick = null;
			document.getElementById("click_to_start").style.display = "none";
		
			unsafeWindow.elements = new Array();
			unsafeWindow.players = new Array();

			for (let i = 0; i < gMultiviewLayout.video.length; i++)
			{
				if(gMultiviewLayout.video[i][LAYOUT_DATA_WINDOW_ID] != gLayoutSubWindowID)
					continue;

				let frameHtml = '<div id="video-parent-div-' + i + '" style="opacity: 1.0; position: absolute; z-index: 1000; border: 0; left: 0%;\
					top: 0%; width: 100%; height: 100%; overflow:hidden;"><div id="video-child-div-' + i + '"></div><div class="video_overlay" id="video-overlay-' + i + '"></div></div>';
				document.getElementById("videos").insertAdjacentHTML("beforeend", frameHtml);

				unsafeWindow.elements[i] = [document.getElementById("video-parent-div-" + i), document.getElementById("video-child-div-" + i)];
				//unsafeWindow.players[i] = new bitmovin.player.Player(unsafeWindow.elements[i][1], playerConfig);

				let data = {
					windowID: gLayoutSubWindowID,
					videoID: i,
				}

				window.opener.postMessage(data, "*");
			}

			document.getElementById("videos").onclick = window.opener.playOrPauseAll;
			document.getElementById("videos").ondblclick = window.opener.toggleFullscreen.bind(null, gLayoutSubWindowID);

			window.onresize = window.opener.onSubWindowResize.bind(null, gLayoutSubWindowID);
		}

	}

	function loadHackedView()
	{//document.body.innerHTML =

		function addElements()
		{
			GM_addElement('script', {
				/*src: 'https://cdn.bitmovin.com/player/web/8/bitmovinplayer.js',
				type: 'text/javascript'*/
				textContent: bitmvin
			});
			initVideo();

			/*

			GM_addElement('script', {
				textContent: 'window.createBitmovinVideo = function(p_element, p_config){\
					return new window.bitmovin.player.Player(p_element, p_config);\
				};\
				window.loadVideo = function(p_video, p_config, p_loaded)\
				{\
					p_video.load(p_config).then(p_loaded).catch((e) => {console.log("Video Load Error: " + e)});\
				}\
				\
				'
			});*/



			/*
			GM_addElement('script', {
				textContent: 'var playerConfig={key:\"f142443f-c4c6-4b76-852f-bd1962c06732\",playback:{muted:!1,autoplay:!0},ui:false};function load(){alert("hello");if(window.bitmovin){var e=document.getElementById(\"my-new-player\"),t=new bitmovin.player.Player(e,playerConfig),o={title:\"Default Demo Source Config\",description:\'Select another example in \"Step 4 - Load a Source\" to test it here\',hls:\"https://ott-video-fer-cf.formula1.com/hls/F1_SUT_1663089173354_1663089733775/index.m3u8?kid=1042&exp=1663236584&ttl=1440&token=9nTvQI1BI5QGJ9xGv5t9txdu1-V1EgftRlBwnDHRYEQ_\",options:{manifestWithCredentials:!0,withCredentials:!0}};t.load(o),e=document.getElementById(\"my-new-player1\"),(t=new bitmovin.player.Player(e,playerConfig)).load(o),e=document.getElementById(\"my-new-player2\"),(t=new bitmovin.player.Player(e,playerConfig)).load(o)}else window.setTimeout(load,1e3)}load();'
			});*/
		}

		//addElements();
		unsafeWindow.setTimeout(addElements, 50);


		function initVideo()
		{
			if(!unsafeWindow.bitmovin)
			{
				unsafeWindow.setTimeout(initVideo, 1000);
				return;
			}
			else if(!unsafeWindow.bitmovin.player)
			{
				unsafeWindow.bitmovin = null;
				addElements();
				return;
			}

			document.open();
			document.write(
				'<html><head><title>F1TV | 2022 Canadian Grand Prix</title>\
			</head>\
			<body>\
			<div id="my-new-player" style="position: fixed; top: 0%; left: 0%; width: 33vw; height: 100vh;"></div>\
			<div id="my-new-player1" style="position: fixed; top: 0%; left: 33%; width: 33vw; height: 100vh;"></div>\
			<div id="my-new-player2" style="position: fixed; top: 0%; left: 66%; width: 33vw; height: 100vh;"></div>\
			</body>\
			\
			</html>');
			window.stop();

			var playerConfig = {
				"key": "f142443f-c4c6-4b76-852f-bd1962c06732",
				"playback": {
					"muted": false,
					"autoplay": true
				},
				ui:false
			};

			var container = document.getElementById('my-new-player');
			var player = new unsafeWindow.bitmovin.player.Player(container, playerConfig);
			var source =
			"https://ott-video-fer-cf.formula1.com/hls/F1_SUT_1663089173354_1663089733775/index.m3u8?kid=1042&exp=1663236584&ttl=1440&token=9nTvQI1BI5QGJ9xGv5t9txdu1-V1EgftRlBwnDHRYEQ_";
			//"https://ott-video-fer-cf.formula1.com/hls/F1_SUT_1663089173354_1663089733775/index.m3u8?kid=1042&exp=1663190856&ttl=1440&token=bRb1T8gNThWcAVrZfcADYh57EHylijtm7E20WWCYq4Q_"

			var sourceConfig = {
				"title": "Default Demo Source Config",
				"description": "Select another example in \"Step 4 - Load a Source\" to test it here",
				"hls": source,
				options: {
					manifestWithCredentials: true,
					withCredentials: true
				}
			}
			player.load(sourceConfig);
			player.play();

			container = document.getElementById('my-new-player1');
			player = new unsafeWindow.bitmovin.player.Player(container, playerConfig);
			player.load(sourceConfig);
			player.play();

			container = document.getElementById('my-new-player2');
			player = new unsafeWindow.bitmovin.player.Player(container, playerConfig);
			player.load(sourceConfig);
			player.play();
		}

		/*
		var playerConfig = {
			"key": "f142443f-c4c6-4b76-852f-bd1962c06732",
			"playback": {
				"muted": false,
				"autoplay": true
			},
			//ui:false
		};

		function load()
		{

			if(!window.bitmovin)
			{
				window.setTimeout(load, 1000);
				return;
			}

			var container = document.getElementById('my-new-player');
			var player = new bitmovin.player.Player(container, playerConfig);
			var source =
			"https://ott-video-fer-cf.formula1.com/hls/F1_SUT_1663089173354_1663089733775/index.m3u8?kid=1042&exp=1663236584&ttl=1440&token=9nTvQI1BI5QGJ9xGv5t9txdu1-V1EgftRlBwnDHRYEQ_";
			//"https://ott-video-fer-cf.formula1.com/hls/F1_SUT_1663089173354_1663089733775/index.m3u8?kid=1042&exp=1663190856&ttl=1440&token=bRb1T8gNThWcAVrZfcADYh57EHylijtm7E20WWCYq4Q_"

			var sourceConfig = {
				"title": "Default Demo Source Config",
				"description": "Select another example in \"Step 4 - Load a Source\" to test it here",
				"hls": source,
				options: {
					manifestWithCredentials: true,
					withCredentials: true
				}
			}
			player.load(sourceConfig);
			player.play();

			container = document.getElementById('my-new-player1');
			player = new bitmovin.player.Player(container, playerConfig);
			player.load(sourceConfig);
			player.play();

			container = document.getElementById('my-new-player2');
			player = new bitmovin.player.Player(container, playerConfig);
			player.load(sourceConfig);
			player.play();
		}

		window.onload = load;


		document.open();
		document.write(
			'<html><head><title>F1TV | 2022 Canadian Grand Prix</title>\
			<style>' + bitmovin_css + '</style>\
		</head>\
		<body>\
		<div id="my-new-player" style="position: fixed; top: 0%; left: 0%; width: 33vw; height: 100vh;"></div>\
		<div id="my-new-player1" style="position: fixed; top: 0%; left: 33%; width: 33vw; height: 100vh;"></div>\
		<div id="my-new-player2" style="position: fixed; top: 0%; left: 66%; width: 33vw; height: 100vh;"></div>\
		</body>\
		\
		</html>');
		window.stop();

		load();*/
	}

	var bLayoutButtonsPresent = false;
	function setupLayoutButtons()
	{
		if(bLayoutButtonsPresent)
			return;

		bLayoutButtonsPresent = true;

		var smBtnHtml = "<div id='sm-menu' style='display: none;'>" +
			"<a id='sm-btn-popup' role='button' class='btn btn--transparent' style='color: #000; margin: 6px;' title='Open popout'>" +
			"<span style='display: inline-block; font-size: 12px;'>POPOUT</span></a>" +
			"<a id='sm-btn-popups' role='button' class='btn btn--transparent' style='color: #000; margin: 6px;' title='Open multiple synchronized popout videos'>" +
			"<span style='display: inline-block; font-size: 12px;'>MULTI-VIEW</span></a>" +
			"<a id='sm-btn-theater' role='button' class='btn btn--transparent' style='color: #000; margin: 6px;' title='Toggle theater mode'>" +
			"<span style='display: inline-block; font-size: 12px;'>THEATER</span></a>" +
			"</div>" +
			"<style>.global-header-nav .global-header-links ul { display: none; }" +
			".global-header { display: block !important; }" +
			".navbar button.navbar-toggler { position: fixed; top: 8px; color: #000 !important; background-color: #fff; }" +
			"@media (max-width: 991.98px) {" +
			".header .navbar { padding: 0; }" +
			".header .navbar .navbar-brand { display: none !important; }" +
			".global-header-f1tvicon { display: none; }" +
			".global-header-f-links { display: none; }" +
			".global-header .global-header-actions { display: none; }" +
			"}" +
			"</style>";
		var smFooterHtml = "<div style='width: 100%; background-color: #18485f; font-size: 16px; color: #fff; padding: 20px; margin-top: 20px; text-align: center;'>" +
			"F1TV+ v" + smVersion + "<a style='margin-left: 20px; color: #d3dfff;' href='https://github.com/najdek/f1tv_plus' target='_blank'>" +
			"<svg style='padding: 4px 0px 6px 0px;' xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/></svg>" +
			"Source code</a>" +
			"<div id='btn-checkupdates' style='display: inline-block; margin-left: 16px; cursor: pointer; text-decoration: underline;'>CHECK FOR UPDATES</div>" +
			"</div>" +
			"<style> .full-footer { padding-bottom: 0 !important; } </style>";

	   //Build the layouts.
	   let titles = new Array();
	   titles[0] = "";
	   for(let i = 0; i < gLayoutTitles[0].length; i++)
	   {
		   let radius;
		   if(i == 0)
			   radius = "20px 0px 0px 20px";
		   else if( i == gLayoutTitles[0].length - 1)
			   radius = "0px 20px 20px 0px";
		   else
			   radius = "0px 0px 0px 0px";

		   titles[0] += "<div id='sm-popout-menu-0-" + i + "' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius:" + radius + "; background-color: #9a0000; cursor: pointer;'>" + gLayoutTitles[0][i] + "</div>";
	   }

	   titles[1] = "";
	   for(let j = 0; j < gLayoutTitles[1].length; j++)
	   {
		   let radius;
		   if(j == 0)
			   radius = "20px 0px 0px 20px";
		   else if( j == gLayoutTitles[1].length - 1)
			   radius = "0px 20px 20px 0px";
		   else
			   radius = "0px 0px 0px 0px";

		   titles[1] += "<div id='sm-popout-menu-1-" + j + "' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius:" + radius + "; background-color: #9a0000; cursor: pointer;'>" + gLayoutTitles[1][j] + "</div>";
	   }
	   
	   let layouts_html = "";
	   for(let i = 0; i < gLayouts.length; i++)
	   {
		   for(let j = 0; j < gLayouts[i].length; j++)
		   {
			   layouts_html += "<div id='sm-popout-options-frame-" + i + "-" + j + "' style='display: none;'>";
			   for(let k = 0; k < gLayouts[i][j].length; k++)
			   {

					
				   var btnWidth = 112;
				   var btnHeight = 63;
				   layouts_html += "<div id='sm-popout-menu-option-frame-" + i + "-" + j + "-" + k + "' style='display: inline-block; margin: 6px; padding: 10px; border-radius: 6px; border: 1px solid #ffc0c0; background-color: #af2020; cursor: pointer;'>" +
					   "<div id='frame-icon-" + i + "-" + j + "-" + k + "' style='width: " + btnWidth + "px; height: " + btnHeight + "px; position: relative;'>";
					   
				   for (var id in gLayouts[i][j][k].video) {
						console.log("Layout built: " + i + ", " + j + ", " + k + ", " + id);
					   layouts_html += "<div style='position: absolute; left: " + gLayouts[i][j][k].video[id][LAYOUT_VIDEO_X] * btnWidth / 100 + "px; top: " + gLayouts[i][j][k].video[id][LAYOUT_VIDEO_Y] * btnHeight / 100 + "px; width: " + gLayouts[i][j][k].video[id][LAYOUT_VIDEO_W] * btnWidth / 100 + "px; height: " + gLayouts[i][j][k].video[id][LAYOUT_VIDEO_H] * btnHeight / 100 + "px; background-color: rgba(50,50,50,0.1); border: 1px solid #000; border-radius: 2px;'></div>";
				   }

				   for (var id in gLayouts[i][j][k].data) {
					   layouts_html += "<div style='position: absolute; left: " + gLayouts[i][j][k].data[id][LAYOUT_DATA_X] * btnWidth / 100 + "px; top: " + gLayouts[i][j][k].data[id][LAYOUT_DATA_Y] * btnHeight / 100 + "px; width: " + gLayouts[i][j][k].data[id][LAYOUT_DATA_W] * btnWidth / 100 + "px; height: " + gLayouts[i][j][k].data[id][LAYOUT_DATA_H] * btnHeight / 100 + "px; background-color: rgba(50,50,50,0.1); border: 1px solid #000; border-radius: 2px;'></div>";
				   }

				   layouts_html += "</div>" +
					   "<div style='font-size: 20px; margin-top: 10px;'>" + gLayouts[i][j][k].name + "</div>";

				   //layouts_html += "</div>";//id='frame-icon-"
				   layouts_html += "</div>";//id='sm-popout-menu-option-frame-
			   }

			   layouts_html += "</div>";
		   }
	   }					
	   
	   var smPopoutMenuHtml = "<div id='sm-popout-menu' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1001; text-align: center;'>" +
	   "<div id='sm-popout-menu-bg' style='background-color: #0000008f; width: 100%; height: 100%; top: 0; left: 0; position: absolute;'></div>" +
	   "<div style='background-color: #c70000; color: #fff; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; border-radius: 10px; position: absolute;'>" +
	   "<div style='font-size: 20px; font-weight: bold;'>F1TV+ MULTI-VIEW</div>" +
	   "<div id='sm-popout-menu-mode-selection' style='margin-top: 10px;'>" +
	   "<div style='font-size: 12px; margin: 4px;'>Select mode:</div>" +
	   titles[1] +
	   /*
	   "<div id='sm-popout-menu-mode-multipopout' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 20px 0px 0px 20px; background-color: #9a0000; cursor: pointer;'>Popouts</div>" +
	   "<div id='sm-popout-menu-mode-onewindow' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 0px 20px 20px 0px; background-color: #c13636; cursor: pointer;'>Frames</div>" +*/
	   "</div>" +
	   "<div id='sm-popout-menu-frame-selection' style='display: inline-block; margin-top: 10px;'>" +
	   "<div style='font-size: 12px; margin: 4px;'>Display aspect ratio:</div>" +
	   titles[0] +
	   /*"<div id='sm-popout-menu-frame-16by9' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 20px 0px 0px 20px; background-color: #9a0000; cursor: pointer;'>16:9</div>" +
	   "<div id='sm-popout-menu-frame-21by9' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 0px 20px 20px 0px; background-color: #c13636; cursor: pointer;'>21:9</div>" +*/
	   "</div>" +
	   "<div id='sm-popout-menu-options' style='text-align: center; margin-top: 16px;'>" +
	   "<div id='sm-popout-options-list'></div>" +
	   "<div id='sm-popout-options-frames' style='display: inline-block;'>" +
	   layouts_html + 
	   /*"<div id='sm-popout-options-frame-16by9-list'></div>" +
	   "<div id='sm-popout-options-frame-21by9-list' style='display: none;'></div>" +*/
	   "</div>" +
	   "</div>" +
	   "</div>" +
	   "</div>";

	   let selectedOptions = [0,0];

	   function updateOptions()
	   {
		   for(let i = 0; i < gLayoutTitles.length; i++)
		   {
			  for(let j = 0; j < gLayoutTitles[i].length; j++)
			  {
			   document.getElementById("sm-popout-menu-" + i + "-" + j).style.backgroundColor = "#9a0000";
			  }
		   }

		   document.getElementById("sm-popout-menu-" + 0 + "-" + selectedOptions[0]).style.backgroundColor = "#c13636";
		   document.getElementById("sm-popout-menu-" + 1 + "-" + selectedOptions[1]).style.backgroundColor = "#c13636";

		   for(let i = 0; i < gLayouts.length; i++)
		   {
			  for(let j = 0; j < gLayouts[i].length; j++)
			  {
				   $("#sm-popout-options-frame-" + i + "-" + j).hide();
			  }
		   }

		   $("#sm-popout-options-frame-" + selectedOptions[0] + "-" + selectedOptions[1]).show();
	   }


		function smLoad()
		{
   

			document.getElementsByClassName("global-header-nav")[0].insertAdjacentHTML("beforeend", smBtnHtml);

			document.getElementsByClassName("full-footer")[0].insertAdjacentHTML("beforeend", smFooterHtml);
			/*
			document.getElementById("btn-checkupdates").addEventListener("click", function() {
				GM.xmlHttpRequest({
					method: "GET",
					url: smUpdateUrl,
					onload: function(response) {
						var smNewVersion = response.responseText.split("@version")[1].split("\n")[0].replace(/\s/g, "");
						var smNewVersionDesc = response.responseText.split("<updateDescription>")[1].split("</updateDescription>")[0];
						if (smNewVersion != smVersion) {
							var smUpdateHtml = "<div id='sm-update' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1001; text-align: center;'>" +
								"<div id='sm-update-bg' style='background-color: #0000008f; width: 100%; height: 100%; top: 0; left: 0; position: absolute;'></div>" +
								"<div style='background-color: #c70000; color: #fff; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; border-radius: 10px; position: absolute;'>" +
								"<h3>F1TV+ update is available!</h3>" +
								"<p>Installed version: " + smVersion + "<br>" +
								"New version: " + smNewVersion + "</p>" +
								"<p>" + smNewVersionDesc + "</p>" +
								"<a href='" + smUpdateUrl + "' target='_blank' style='color: #ff0;'>[Click here to get the new version]</a>" +
								"</div>" +
								"</div>";
							document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smUpdateHtml);
							document.getElementById("sm-update-bg").addEventListener("click", function() {
								$("#sm-update").remove();
							});
						} else {
							var smUpdateHtml = "<div id='sm-update' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1001; text-align: center;'>" +
								"<div id='sm-update-bg' style='background-color: #0000008f; width: 100%; height: 100%; top: 0; left: 0; position: absolute;'></div>" +
								"<div style='background-color: #c70000; color: #fff; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; border-radius: 10px; position: absolute;'>" +
								"<div style='font-weight: bold; font-size: 20px;'>F1TV+ v" + smVersion + "</div>" +
								"<p>Your version is up to date!</p>" +
								"</div>" +
								"</div>";
							document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smUpdateHtml);
							document.getElementById("sm-update-bg").addEventListener("click", function() {
								$("#sm-update").hide();
							});
							setTimeout(function() {
								$("#sm-update").remove();
							}, 3000);
						}
					}
				});
			});*/

			document.getElementById("sm-btn-popup").addEventListener("click", function()
																	 {
				gLayoutType = LAYOUT_POPOUT;
				setupLayout();
				//window.open(document.location.href.replace("action=play", "") + "#f1tvplus:popout", Date.now(), "width=1280,height=720");
				//$("video").trigger("pause");
			});

			document.getElementById("sm-btn-popups").addEventListener("click", function()
																	  {
				document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", smPopoutMenuHtml);
				document.getElementById("sm-popout-menu-bg").addEventListener("click", function() {
					$("#sm-popout-menu").remove();
				});
				//$("#sm-popout-options-frame-0-0").show();

				updateOptions();

				for(let i = 0; i < gLayoutTitles.length; i++)
				{
				   for(let j = 0; j < gLayoutTitles[i].length; j++)
				   {
					   let id = "sm-popout-menu-" + i + "-" + j;
					   document.getElementById(id).addEventListener("click", function() {
						   selectedOptions[i] = j;
						   updateOptions();
						   
						   /*
						   document.getElementById(id).style.backgroundColor = "#c13636";
						   //$(id).css("background-color", "#c13636");
						   $("#sm-popout-options-frame-" + selectedOptions[0] + "-" + selectedOptions[1]).show();*/
					   });
				   }
			   }

				for(let i = 0; i < gLayouts.length; i++)
				{
				   for(let j = 0; j < gLayouts[i].length; j++)
				   {
					   for(let k = 0; k < gLayouts[i][j].length; k++)
					   {
						   let id = "sm-popout-menu-option-frame-" + i + "-" + j + "-" + k;
						   document.getElementById(id).addEventListener("click", function() {
							   //get the content ID
							   let str = "detail/";
							   let id1 = window.location.href.indexOf(str);
							   id1+= str.length;
							   let id2 = window.location.href.indexOf("/", id1);
							   let contentID = window.location.href.slice(id1, id2);
							   window.location.href = "https://f1tv.formula1.com/#f1tvplus:" + contentID + ":multipopout:" + i +":" + j + ":" + k;
						   });
					   }
				   }
				}


				/*
				document.getElementById("sm-popout-menu-mode-multipopout").addEventListener("click", function() {
					$("#sm-popout-menu-mode-multipopout").css("background-color", "#9a0000");
					$("#sm-popout-menu-mode-onewindow").css("background-color", "#c13636");
					$("#sm-popout-menu-frame-selection").hide();
					$("#sm-popout-options-list").show();
					$("#sm-popout-options-frames").hide();
				});
				document.getElementById("sm-popout-menu-mode-onewindow").addEventListener("click", function() {
					$("#sm-popout-menu-mode-multipopout").css("background-color", "#c13636");
					$("#sm-popout-menu-mode-onewindow").css("background-color", "#9a0000");
					$("#sm-popout-menu-frame-selection").show();
					$("#sm-popout-options-list").hide();
					$("#sm-popout-options-frames").show();
				});*
				document.getElementById("sm-popout-menu-frame-16by9").addEventListener("click", function() {
					$("#sm-popout-menu-frame-16by9").css("background-color", "#9a0000");
					$("#sm-popout-menu-frame-21by9").css("background-color", "#c13636");
					$("#sm-popout-options-frame-16by9-list").show();
					$("#sm-popout-options-frame-21by9-list").hide();
				});
				document.getElementById("sm-popout-menu-frame-21by9").addEventListener("click", function() {
					$("#sm-popout-menu-frame-16by9").css("background-color", "#c13636");
					$("#sm-popout-menu-frame-21by9").css("background-color", "#9a0000");
					$("#sm-popout-options-frame-16by9-list").hide();
					$("#sm-popout-options-frame-21by9-list").show();
				});
*/
				/*
				// popout list
				for (var i in smPopupPositions) {
					if (i < 2) {
						continue;
					}
					var btnWidth = 112;
					var btnHeight = 63;
					var smUrl_contentId = window.location.href.split("/")[4];
					var btnHtml = "<div id='sm-popout-menu-option-" + i + "' data-i='" + i + "' data-contentid='" + smUrl_contentId + "' style='display: inline-block; margin: 6px; padding: 10px; border-radius: 6px; border: 1px solid #ffc0c0; background-color: #af2020; cursor: pointer;'>" +
						"<div id='popout-icon-" + i + "' style='width: " + btnWidth + "px; height: " + btnHeight + "px; position: relative;'></div>" +
						"<div style='font-size: 20px; margin-top: 10px;'>" + i + "</div>" +
						"</div>";
					document.getElementById("sm-popout-options-list").insertAdjacentHTML("beforeend", btnHtml);
					document.getElementById("sm-popout-menu-option-" + i).addEventListener("click", function() {
						var smWindowOffsetX = Math.round(smPopupPositions[$(this).data("i")][0][0] * screen.availWidth / 100);
						var smWindowOffsetY = Math.round(smPopupPositions[$(this).data("i")][0][1] * screen.availHeight / 100);
						var smWindowWidth = Math.round(smPopupPositions[$(this).data("i")][0][2] * screen.availWidth / 100) - BROWSER_USED_WIDTH;
						var smWindowHeight = Math.round(smPopupPositions[$(this).data("i")][0][3] * screen.availHeight / 100) - BROWSER_USED_HEIGHT;
						window.open(window.location.href.split("#")[0] + "#f1tvplus_multipopout:" + $(this).data("i") + "=" + $(this).data("contentid"), Date.now(), "left=" + smWindowOffsetX + ",top=" + smWindowOffsetY + ",width=" + smWindowWidth + ",height=" + smWindowHeight);
						$("video").trigger("pause");
						var smHtml = "<div style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; text-align: center; background-color: #000; font-family: Arial;'>" +
							"<div style='color: #ccc; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; border-radius: 10px; position: absolute;'>" +
							"<h3>Opened in popout...</h3>" +
							"</div>" +
							"</div>";
						document.getElementsByTagName("body")[0].innerHTML = smHtml;
					});
					for (var popoutAmount in smPopupPositions[i]) {
						var smPopoutIconHtml = "<div style='position: absolute; left: " + smPopupPositions[i][popoutAmount][0] * btnWidth / 100 + "px; top: " + smPopupPositions[i][popoutAmount][1] * btnHeight / 100 + "px; width: " + smPopupPositions[i][popoutAmount][2] * btnWidth / 100 + "px; height: " + smPopupPositions[i][popoutAmount][3] * btnHeight / 100 + "px; background-color: #fff; border: 1px solid #000; border-radius: 2px;'></div>";
						document.getElementById("popout-icon-" + i).insertAdjacentHTML("beforeend", smPopoutIconHtml);
					}
				}*/

				// frame 16by9 list
				if(false)
				{
				for (let i in smFramePositions16by9) {
					//if (smFramePositions16by9[i].length < 2) {
					//    continue;
					//}
					var btnWidth = 112;
					var btnHeight = 63;
					var smUrl_contentId = window.location.href.split("/")[4];
					var btnHtml = "<div id='sm-popout-menu-option-frame-16by9-" + i + "' data-i='" + i + "' data-contentid='" + smUrl_contentId + "' style='display: inline-block; margin: 6px; padding: 10px; border-radius: 6px; border: 1px solid #ffc0c0; background-color: #af2020; cursor: pointer;'>" +
						"<div id='frame-16by9-icon-" + i + "' style='width: " + btnWidth + "px; height: " + btnHeight + "px; position: relative;'></div>" +
						"<div style='font-size: 20px; margin-top: 10px;'>" + i + "</div>" +
						"</div>";
					document.getElementById("sm-popout-options-frame-16by9-list").insertAdjacentHTML("beforeend", btnHtml);
					document.getElementById("sm-popout-menu-option-frame-16by9-" + i).addEventListener("click", function()
																									   {
						//get the content ID
						let str = "detail/";
						let id1 = window.location.href.indexOf(str);
						id1+= str.length;
						let id2 = window.location.href.indexOf("/", id1);
						let contentID = window.location.href.slice(id1, id2);
						window.location.href = "https://f1tv.formula1.com/#f1tvplus:" + contentID + ":multipopout:16by9:"  + i;
						/*
						gLayoutType = LAYOUT_MULTIVIEW;
						gMultiviewLayout = smFramePositions16by9[$(this).data("i")];
						setupLayout();
						/*
						window.open(window.location.href.split("#")[0] + "#f1tvplus_multipopout:" + $(this).data("i") + ":onewindow:16by9=" + $(this).data("contentid"), Date.now(), "width=1280,height=720");
						$("video").trigger("pause");
						var smHtml = "<div style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; text-align: center; background-color: #000; font-family: Arial;'>" +
							"<div style='color: #ccc; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; border-radius: 10px; position: absolute;'>" +
							"<h3>Opened in popout...</h3>" +
							"</div>" +
							"</div>";
						document.getElementsByTagName("body")[0].innerHTML = smHtml;*/
					});
					for (var popoutAmount in smFramePositions16by9[i]) {
						var smPopoutIconHtml = "<div style='position: absolute; left: " + smFramePositions16by9[i][popoutAmount][0] * btnWidth / 100 + "px; top: " + smFramePositions16by9[i][popoutAmount][1] * btnHeight / 100 + "px; width: " + smFramePositions16by9[i][popoutAmount][2] * btnWidth / 100 + "px; height: " + smFramePositions16by9[i][popoutAmount][3] * btnHeight / 100 + "px; background-color: #fff; border: 1px solid #000; border-radius: 2px;'></div>";
						document.getElementById("frame-16by9-icon-" + i).insertAdjacentHTML("beforeend", smPopoutIconHtml);
					}
				}

				// frame 21by9 list
				for (var i in smFramePositions21by9) {
					//if (smFramePositions21by9[i].length < 2) {
					//    continue;
					//}
					var btnWidth = 147;
					var btnHeight = 63;
					var smUrl_contentId = window.location.href.split("/")[4];
					var btnHtml = "<div id='sm-popout-menu-option-frame-21by9-" + i + "' data-i='" + i + "' data-contentid='" + smUrl_contentId + "' style='display: inline-block; margin: 6px; padding: 10px; border-radius: 6px; border: 1px solid #ffc0c0; background-color: #af2020; cursor: pointer;'>" +
						"<div id='frame-21by9-icon-" + i + "' style='width: " + btnWidth + "px; height: " + btnHeight + "px; position: relative;'></div>" +
						"<div style='font-size: 20px; margin-top: 10px;'>" + i + "</div>" +
						"</div>";
					document.getElementById("sm-popout-options-frame-21by9-list").insertAdjacentHTML("beforeend", btnHtml);
					document.getElementById("sm-popout-menu-option-frame-21by9-" + i).addEventListener("click", function()
																									   {
						gLayoutType = LAYOUT_MULTIVIEW;
						gMultiviewLayout = smFramePositions21by9[i];
						setupLayout();
						/*
						window.open(window.location.href.split("#")[0] + "#f1tvplus_multipopout:" + $(this).data("i") + ":onewindow:21by9=" + $(this).data("contentid"), Date.now(), "width=1280,height=720");
						$("video").trigger("pause");
						var smHtml = "<div style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; text-align: center; background-color: #000; font-family: Arial;'>" +
							"<div style='color: #ccc; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; border-radius: 10px; position: absolute;'>" +
							"<h3>Opened in popout...</h3>" +
							"</div>" +
							"</div>";
						document.getElementsByTagName("body")[0].innerHTML = smHtml;*/
					});
					for (var popoutAmount in smFramePositions21by9[i]) {
						var smPopoutIconHtml = "<div style='position: absolute; left: " + smFramePositions21by9[i][popoutAmount][0] * btnWidth / 100 + "px; top: " + smFramePositions21by9[i][popoutAmount][1] * btnHeight / 100 + "px; width: " + smFramePositions21by9[i][popoutAmount][2] * btnWidth / 100 + "px; height: " + smFramePositions21by9[i][popoutAmount][3] * btnHeight / 100 + "px; background-color: #fff; border: 1px solid #000; border-radius: 2px;'></div>";
						document.getElementById("frame-21by9-icon-" + i).insertAdjacentHTML("beforeend", smPopoutIconHtml);
					}
				}
			   }
			});

			setInterval(function() {
				if (window.location.href.includes("detail/")) {
					document.getElementById("sm-menu").style.display = "inline-block";
				} else {
					document.getElementById("sm-menu").style.display = "none";
				}
			}, 1000);
		}

		var smInitRetryCount = 0;

		(function smInit() {
			setTimeout(function() {
				if ((document.getElementsByClassName("global-header-nav").length > 0) && (document.getElementsByClassName("full-footer").length > 0)) {
					smLoad();
				} else {
					if (smInitRetryCount < 60) {
						smInitRetryCount++;
						smInit();
					} else {
						smLoad();
					}
				}
			}, 500);
		}());
	}

	function setupLayout()
	{
	   //loadHackedView();
		//return;

		switch(gLayoutType)
		{
			case LAYOUT_THEATRE:
				setupTheatre();
				setupLayoutButtons();
				break;
			case LAYOUT_POPOUT:
				destroyTheatre();
				setupPopout();
				break;
			case LAYOUT_MULTIVIEW:
			   //alert("Click OK to start");
				destroyTheatre();
				setupMultiview();
				break;

			case LAYOUT_SUBMULTIVIEW:
			   alert("Click OK to start");
				destroyTheatre();
				setupSubMultiview();
				break;
		}
	}

	setupLayout();
})();