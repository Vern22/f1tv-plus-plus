// ==UserScript==
// @name         F1TV+
// @namespace    https://najdek.github.io/f1tv_plus/
// @version      1.0
// @description  A few improvements to F1TV
// @author       Adrian Sale
// @match        https://f1tv.formula1.com/*
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @require 	 https://code.jquery.com/jquery-3.6.0.min.js
// @require 	 https://cdn.jsdelivr.net/npm/signalr@2.4.3/jquery.signalR.js
// @require 	 https://cdn.bitmovin.com/player/web/8/bitmovinplayer.js
// @require 	 https://cdn.jsdelivr.net/npm/pako@2.0.4/dist/pako_inflate.min.js
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==
// https://cdn.bitmovin.com/player/web/8/bitmovinplayer.js
//https://code.jquery.com/jquery-3.6.0.min.js
//https://cdn.jsdelivr.net/npm/signalr@2.4.3/jquery.signalR.min.js
//https://cdn.bitmovin.com/player/web/8/bitmovinplayer.js
/* TODO
multiwindow.
speed up json stream processing - ?just time in seconds.
current tyre width wrong + centre elements - change this element to two - the image (then only change the src when needed) and the text.
filter out car noise - webaudio api
add fullscreen button to sub window
check if additional streams are available and if not just load the single video as a backup (otherwise it just fails)
option to load live streams from start or live.
add weather panel
layout editor
default layouts.
clear up old code
Team Symbol.
fix timezone difference
forced time delta for separate feeds, e.g. sky stream 25s, f1 live 10 etc
audio quality
live timing - FIX
auto select quality - by window size.
UI
custom driver view - i.e. click on driver to see data.
stretched layout
allow aspect ratio true to crop video view
?last lap delta to driver ahead.

//bitmovin key.
//f142443f-c4c6-4b76-852f-bd1962c06732

*/

(function() {
	'use strict';

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
		},
		ui:false,
	};	

	let i = 0;
	const DATA_PANEL_HEADER = i++,
		DATA_PANEL_LEADERBOARD = i++,
		DATA_PANEL_RACE_CONTROL = i++,
		DATA_PANEL_DRIVER_TRACKER = i++,
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

	i = 0;
	const LAYOUT_VIDEO_WINDOW_ID = i++,
		LAYOUT_VIDEO_X = i++,
		LAYOUT_VIDEO_Y = i++,
		LAYOUT_VIDEO_W = i++,
		LAYOUT_VIDEO_H = i++,
		LAYOUT_VIDEO_FEED = i++,
		LAYOUT_VIDEO_VOLUME = i++,
		LAYOUT_VIDEO_MAINTAIN_ASPECT = i++,
		LAYOUT_VIDEO_CROP_X = i++,
		LAYOUT_VIDEO_CROP_Y = i++,
		LAYOUT_VIDEO_CROP_W = i++,
		LAYOUT_VIDEO_CROP_H = i++;

	i = 0;
	const LAYOUT_DATA_WINDOW_ID = i++,
		LAYOUT_DATA_FEED = i++,
		LAYOUT_DATA_X = i++,
		LAYOUT_DATA_Y = i++,
		LAYOUT_DATA_W = i++,
		LAYOUT_DATA_H = i++,
		LAYOUT_DATA_OPTION1 = i++,
		LAYOUT_DATA_OPTION2 = i++;

	const gLayout16by9 = [
		{
			window_count: 1,
			video: [
				[0, 0, 0, 100, 100, "f1 live", 0.7, true, 0,0,100,100],
				[0, 0,75,25,25, "ham",1.0, false, 0,0,100,100],
				],
			data: [	[0, DATA_PANEL_HEADER, 0, 0, 20, 7],
				[0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50, 
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_INTERVAL, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE], 
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_DRS, LEADERBOARD_TELEMETRY_WIDGET]
				],
				[0, DATA_PANEL_RACE_CONTROL, 0, 57, 20, 18],
				[0, DATA_PANEL_DRIVER_TRACKER, 80, 15, 20, 20]
		]
		}
		,
		{
			window_count: 1,
			video: [
				[0, 0, 0, 100, 100, "f1 live", 0.7, true, 0,0,100,100],
				[0, 0,77,25,23, "ham",1.0, false, 0,0,100,100],
				[0, 0,0,25,25, "rus",1.0, false, 0,0,100,100],
				],
			data: [
				[0, DATA_PANEL_HEADER, 0, 0, 20, 7],
				[0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50, 
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET], 
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_DRS, LEADERBOARD_TELEMETRY_WIDGET]
				],
				[0, DATA_PANEL_RACE_CONTROL, 0, 57, 20, 20],
				[0, DATA_PANEL_DRIVER_TRACKER, 80, 15, 20, 20]
			]
		}
		,
		{
			window_count: 1,
			video: [
				[0, 0, 0, 100, 100, "f1 live", 0.7, true, 0,0,100,100],
				[0, 0,77,25,23, "ham",1.0, false, 0,0,100,100],
				],
			data:[]
		}
		,
		{
			window_count: 1,
			video: [
				[0, 80,80,20,20, "tracker", 0.0, true, 0, 0, 100, 100],
				[0, 10, 0, 90, 90, "f1 live", 0.7, false, 4.5,5,91.5,91],
				[0, 0,73,23,27, "ham",1.0, false, 0,0,100,100],
				[0, 0,0,10,13, "rus", 0, false, 0,0,100,100]
				],
			data:[
				[0, DATA_PANEL_LEADERBOARD, 0, 7, 20, 50, 
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_FASTEST_LAP_TIME, LEADERBOARD_LATEST_TIME, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_SECTOR_WIDGET], 
					[LEADERBOARD_DRIVER_POSITION, LEADERBOARD_TEAM_COLOUR, LEADERBOARD_DRIVER_SHORTNAME, LEADERBOARD_INTERVAL, LEADERBOARD_GAP_TO_LEADER, LEADERBOARD_CURRENT_TYRE_AND_AGE, LEADERBOARD_LATEST_TIME, LEADERBOARD_DRS]
			]]
		}	

	];

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
			[66.667, 50, 33.333, 33.333]*/
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
			[50, 50, 50, 50]*/
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
	];
	////////////////////////////////////////

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
			background-color: black;\
			background-image: url("https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Hungar%20carbon.png");\
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
			transition: left 0.1s, bottom 0.1s;\
			position: absolute;\
			border-radius: 50%;\
			min-width:1.6em;\
			max-width:1.6em;\
			min-height:1.6em;\
			max-height:1.6em;\
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
		</style>\
		<meta name="description" content="An F1 video application" data-react-helmet="true">\
		<meta charset="UTF-8" data-react-helmet="true">\
		<link href="https://fonts.googleapis.com/css?family=Titillium+Web:400,600,600i" rel="stylesheet" type="text/css">\
		</head>';

	const g_sMutliviewMainBodyHTML = '<body>\
		<div id="videos"></div>\
		<div id="control-bar" style="min-height: 25%; position: absolute; z-index: 1100; left: 0px; bottom: 0px; width: 100%">\
		<div id="control-bar-viewer" class="container-div" style="position: absolute;  bottom: 0px; width: 100%; background-color: rgba(0, 0, 0, 0.750);">\
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
					<th>Quality</th>\
					<th>Live Synch</th>\
					<th>Time Offset</th>\
				</tr>\
			</table>\
		</div>\
		</div></div>\
		</body></html>';

	const g_sMutliviewSubBodyHTML = '<body>\
			<div id="videos"></div>\
		</body></html>';

	var gLayoutType = LAYOUT_THEATRE;
	var gDataSquashedWindowID = -1;
	let gLayoutSubType = "16by9";
	let gLayoutID = 0;
	let gLayoutSubWindowID = 0;
	var gMultiviewLayout; //ultimately a copy of smFramePositionsXXbyXX[xx]

	var location_hash_split = window.location.hash.split(":");

	if (location_hash_split[0] == "#f1tvplus")
	{
		switch(location_hash_split[1])
		{
			case "theatre":
				gLayoutType = LAYOUT_THEATRE;
				break;

			case "popout":
				gLayoutType = LAYOUT_POPOUT;
				break;

			case "multipopout":
				gLayoutType = LAYOUT_MULTIVIEW;
				gLayoutSubType = location_hash_split[2];
				gLayoutID = location_hash_split[3];
				switch(location_hash_split[2])
				{
					case "16by9":
						gMultiviewLayout = gLayout16by9[location_hash_split[3]];
						break;

					case "21by9":
						gMultiviewLayout = gLayout21by9[location_hash_split[3]];
						break;
				}
				break;

			case "submultipopout":
				gLayoutType = LAYOUT_SUBMULTIVIEW;
				gLayoutSubType = location_hash_split[2];
				gLayoutID = location_hash_split[3];
				gLayoutSubWindowID = location_hash_split[4];
				switch(location_hash_split[2])
				{
					case "16by9":
						gMultiviewLayout = gLayout16by9[location_hash_split[3]];
						break;

					case "21by9":
						gMultiviewLayout = gLayout21by9[location_hash_split[3]];
						break;
				}
				break;
		}
	}

	function setupTheatre()
	{
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
				this.#m_aMessages[id].Utc.m_fTimeInSecs < p_time.m_fTimeInSecs)
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
				this.#m_tStartTime = copyDateTime(p_data.Utc);

			let id = Math.floor(p_data.Utc.m_fTimeInSecs - this.#m_tStartTime.m_fTimeInSecs);

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

			let id = Math.floor(p_time.m_fTimeInSecs - this.#m_tStartTime.m_fTimeInSecs);
			id = Math.min(Math.max(id, 0), this.#m_aData.length - 1); //clamp

			let i = 0,
				count = this.#m_aData[id].length;

			while( i < count &&
					p_time.m_fTimeInSecs > this.#m_aData[id][i].Utc.m_fTimeInSecs)
				i++;

			let high;
			let low;

			if(i === count)
			{
				if(id === this.#m_aData.length - 1)//this is the very last data entry, doesn't need interpolating
					return this.#m_aData[id][i];
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
					return this.#m_aData[id][i];
				else//use the last item in previous seconds' data.
					low = this.#m_aData[id-1][this.#m_aData[id-1].length - 1];
			}
			else
			{
				low = this.#m_aData[id][i-1];
			}

			let frac = (p_time.m_fTimeInSecs - low.Utc.m_fTimeInSecs) / (high.Utc.m_fTimeInSecs - low.Utc.m_fTimeInSecs);

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

		#m_iLapCount

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
			//console.log(p_category + " :  " + p_data);
			let time = parseDateTime(p_date);

			switch(p_category)
			{
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
					break;
				case "TrackStatus":
					break;
				case "DriverList":
					if(! this.#m_aDriverInfo)
						this.#onDriverListData(p_data);
					break;
				case "RaceControlMessages":
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
											"Utc": new date_time()});
			}

			let data = p_data;
			data.Utc = p_time;
			this.#m_msTiming.addData(data);
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
			for(let i = 0; i < p_data.Messages.length; i++)
			{
				let data = p_data.Messages[i];
				data.Utc = parseDateTime(p_data.Messages[i].Utc);
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
				for(let i = 0; i < p_data.Series.length; i++)
				{
					let data = p_data.Series[i];
					data.Utc = parseDateTime(p_data.Series[i].Utc);
					this.#m_msLaps.addData(data);
				}
			}

			if(p_data.StatusSeries)
			{
				for(let i = 0; i < p_data.StatusSeries.length; i++)
				{
					let data = p_data.StatusSeries[i];
					data.Utc = parseDateTime(p_data.StatusSeries[i].Utc);
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
			let data = decodeToJSON(p_data);

			for( let i = 0; i < data.length; i++)
			{
				data[i].Utc = parseDateTime(data[i].Utc);
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
			let data = decodeToJSON(p_data);

			for( let i = 0; i < data.length; i++)
			{
				data[i].Utc = parseDateTime(data[i].Timestamp);
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
			if(p_time.m_fTimeInSecs < this.#m_tCurrentTime.m_fTimeInSecs)
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

			let timing = this.#m_msTiming.getUpdates(p_time);
			let timing_app = this.#m_msTimingApp.getUpdates(p_time);
			let extrap_clock = this.#m_msExtrapolatedClock.getUpdates(p_time);
			let race_control = this.#m_msRaceControlMessages.getUpdates(p_time);
			let laps = this.#m_msLaps.getUpdates(p_time);
			let session_status = this.#m_msSessionStatus.getUpdates(p_time);


			//let car_pos = this.#getJSONStreamUpdate(this.#m_jsPosData, p_time);
			let car_pos = this.#m_jsPosData.getData(p_time);
			let car_stats = this.#m_jsCarData.getData(p_time);
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

	class nonlive_timing
	{
		#m_eRenderer;
		#m_sApiRoot = "https://livetiming.formula1.com/static/";

		#m_aJSONSyncData;
		#m_tJSONStreamUTCStartTime; //this is the UTC time when the json stream entries are 0.000

		//#m_aDriverIDs;
		//#m_aSessionData;//.Series for lap change times;  .StatusSeries: sessions status.


		#m_aDriverInfo;

		#m_msTiming;
		#m_msTimingApp;
		#m_msExtrapolatedClock
		#m_msRaceControlMessages;
		#m_msLaps;
		#m_msSessionStatus;

		#m_sessionInfo;
		//#m_iNextMessageID; //this is the ID of the next message in the queue

		#m_jsCarData;
		#m_jsPosData;

		#m_tRaceStartTime;

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

			this.#m_jsCarData = new json_stream(this.#getInterpolatedCarData.bind(this));
			this.#m_jsPosData = new json_stream(this.#getInterpolatedCarPos.bind(this));
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
				this.#m_aJSONSyncData[i] = { json: parseJSONTime(lines[i].slice(0, 12)),
											utc: parseDateTime(JSON.parse(lines[i].slice(12)).Utc)
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
			if(p_test.isLessThan(this.#m_aJSONSyncData[id].json))
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
				return copyDateTime(this.#m_aJSONSyncData[res[0]].utc);

			let frac = (p_json_time.m_fTimeInSecs - this.#m_aJSONSyncData[res[0]].json.m_fTimeInSecs) /
				(this.#m_aJSONSyncData[res[1]].json.m_fTimeInSecs - this.#m_aJSONSyncData[res[0]].json.m_fTimeInSecs);

			let output = copyDateTime(this.#m_aJSONSyncData[res[0]].utc);
			output.lerp(this.#m_aJSONSyncData[res[1]].utc, frac);

			//console.log(p_json_time.toTimeString() + "    " + output.toTimeString());

			return output;
		}

		#onHeartBeatLoaded()
		{
			fetch(this.#m_sApiRoot + "RaceControlMessages.json").then(this.#onLoadRaceControlMessages.bind(this));
			fetch(this.#m_sApiRoot + "SessionData.json").then(this.#onLoadSessionData.bind(this));

			fetch(this.#m_sApiRoot + "TimingAppData.jsonStream").then(this.#onTimingAppData.bind(this));
			fetch(this.#m_sApiRoot + "ExtrapolatedClock.jsonStream").then(this.#onExtrapolatedClock.bind(this));

			fetch(this.#m_sApiRoot + "CarData.z.jsonStream").then(this.#onLoadCarData.bind(this));
			fetch(this.#m_sApiRoot + "Position.z.jsonStream").then(this.#onPositionData.bind(this));
		}

		async #onDriverListData(p_response)
		{
			let text = await p_response.text();
			let line = getFirstLine(text);
			line = line.slice(12)
			this.#m_aDriverInfo = JSON.parse(line);
			this.#onDriverListLoaded();

			//this.#m_eRenderer.setDriverList(this.#m_aDriverInfo);

			/*
			let text = await p_response.text();
			let lines = splitByLine(text);

			this.#m_msDriverOrder.m_aMessages = new Array(lines.length);
			for(let i = 0; i < lines.length - 1; i++)
			{

				//set the time stamp.
				data.Utc = this.#convertJSONTimeToUTC(time);
				/*
				data.Utc = copyDateTime(this.#m_tJSONStreamUTCStartTime);
				data.Utc.addJSONTime(time);*

				this.#m_msDriverOrder.m_aMessages[i] = data;
			}	*/
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
				let time = parseJSONTime(lines[i].slice(0, 12));
				let data = JSON.parse(lines[i].slice(12));
				//set the time stamp.
				data.Utc = this.#convertJSONTimeToUTC(time);

				this.#m_msTiming.addData(data);
			}
		}

		async #onTimingAppData(p_response)
		{
			let text = await p_response.text();
			let lines = splitByLine(text);

			//this.#m_msTimingApp.m_aMessages = new Array(lines.length);
			for(let i = 0; i < lines.length - 1; i++)
			{
				let time = parseJSONTime(lines[i].slice(0, 12));
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
				data.Utc = parseDateTime(data.Utc);

				this.#m_msExtrapolatedClock.addData(data);
			}
		}

		async #onLoadRaceControlMessages(p_response)
		{
			let json = await p_response.json();
			//this.#m_msRaceControlMessages.m_aMessages = json.Messages;

			for(let i = 0; i < json.Messages.length; i++)
			{
				json.Messages[i].Utc = parseDateTime(json.Messages[i].Utc);
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
					json.Series[i].Utc = parseDateTime(json.Series[i].Utc);
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
				json.StatusSeries[i].Utc = parseDateTime(json.StatusSeries[i].Utc);
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

		async #onLoadSessionInfo(p_response)
		{
			let json = await p_response.json();
			this.#m_eRenderer.setSessionInfo(json);
		}

		async #onLoadCarData(p_response)
		{
			let text = await p_response.text();
			let data = decodeToArray(text).Entries;

			for( let i = 0; i < data.length; i++)
			{
				data[i].Utc = parseDateTime(data[i].Utc);
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
				data[i].Utc = parseDateTime(data[i].Timestamp);
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

		onTime(p_time)
		{
			if(p_time.m_fTimeInSecs < this.#m_tCurrentTime.m_fTimeInSecs)
			{
				//backwards time shift - need to reset the message streams. the json streams will be fine.
				this.#m_msTiming.resetIndex();
				this.#m_msTimingApp.resetIndex();
				this.#m_msExtrapolatedClock.resetIndex();
				this.#m_msRaceControlMessages.resetIndex();
				this.#m_msLaps.resetIndex();
				this.#m_msSessionStatus.resetIndex();

				this.#m_eRenderer.resetView();
			}

			let timing = this.#m_msTiming.getUpdates(p_time);
			let timing_app = this.#m_msTimingApp.getUpdates(p_time);
			let extrap_clock = this.#m_msExtrapolatedClock.getUpdates(p_time);
			let race_control = this.#m_msRaceControlMessages.getUpdates(p_time);
			let laps = this.#m_msLaps.getUpdates(p_time);
			let session_status = this.#m_msSessionStatus.getUpdates(p_time);


			//let car_pos = this.#getJSONStreamUpdate(this.#m_jsPosData, p_time);
			let car_pos = this.#m_jsPosData.getData(p_time);
			let car_stats = this.#m_jsCarData.getData(p_time);
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

		#m_clockState;
		
		#m_aLatestTimeCurrentDisplay;
		#m_aCompactSectorTimeCurrentDisplay;


		constructor(p_layout)
		{
			this.#m_aDriverList = new Array();
			//this.#m_elView = document.getElementById("timing-view");

			//build the layout
			let html = "";
			for(let i = 0; i < p_layout.length; i++)
			{
				let style = 'style="left:' + p_layout[i][LAYOUT_DATA_X] + '%; top: ' + p_layout[i][LAYOUT_DATA_Y] + '%; width: ' + p_layout[i][LAYOUT_DATA_W] + '%; height: ' + p_layout[i][LAYOUT_DATA_H] + '%;"';
				switch(p_layout[i][LAYOUT_DATA_FEED])
				{
					case DATA_PANEL_HEADER:
						html += '<div class="timing-header data_panel container-div" id="timing-header"' + style + '>\
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
						break;
					case DATA_PANEL_LEADERBOARD:
						html += '<div id="timer-leaderboard-background" class="leaderboard_background data_panel" ' + style + '><div id="timer-leaderboard" class="leaderboard"></div></div>';
						this.#m_aQualifyingLeadboardLayout = p_layout[i][LAYOUT_DATA_OPTION1];
						this.#m_aRaceLeaderboardLayout = p_layout[i][LAYOUT_DATA_OPTION2];
						break;
					case DATA_PANEL_RACE_CONTROL:
						html += '<div id="timer-race-control" class="data_panel race_control_messages" ' + style + '></div>';
						break;
					case DATA_PANEL_DRIVER_TRACKER:
						html += '<div class="data_panel timing-driver-tracker" id="timer-driver-tracker" ' + style + '></div>';
						break;
					case DATA_PANEL_WEATHER:
						break;
				}
			}
			document.body.insertAdjacentHTML('beforeend', html);

			this.#m_elTimingHeader = document.getElementById("timing-header");
			this.#m_elSessionName = document.getElementById("timing-session-name");
			this.#m_elSessionStatus = document.getElementById("timer-session-status");
			this.#m_elTrackStatus = document.getElementById("timer-track-status");
			this.#m_elLap = document.getElementById("timer-lap");
			this.#m_elSessionTimeRemaining = document.getElementById("timer-time-remaining");
			this.#m_elRaceControl = document.getElementById("timer-race-control");
			this.#m_elLeaderBoard = document.getElementById("timer-leaderboard");

			this.#m_pResizeObserver = new ResizeObserver(this.#onDataElementResize.bind(this));

			if(this.#m_elLeaderBoard)
				this.#m_pResizeObserver.observe(this.#m_elLeaderBoard);
			if(this.#m_elTimingHeader)
				this.#m_pResizeObserver.observe(this.#m_elTimingHeader);
			
			this.#m_bListBuilt = false;
			this.#m_bDriverTrackerBuilt = false;
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

			this.#m_elDriverTracker = document.getElementById("timer-driver-tracker");
			this.#m_aDriverTrackerDots = new Array();
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
								break;

							case "IntervalToPositionAhead":
								if(this.#m_aIntervalElement[id])
									this.#m_aIntervalElement[id].innerText = obj[info].Value;
								break;
							
							case "TimeDiffToPositionAhead":
								if(this.#m_aIntervalElement[id])
									this.#m_aIntervalElement[id].innerText = obj[info];
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
				this.#buildDriverList();

			if(!this.#m_bDriverTrackerBuilt)
				this.#buildDriverTracker();			

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
				let string = p_race_control[i].Utc.toTimeString() + ": ";

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
							window.setTimeout(() => {this.#m_elTimingHeader.style.backgroundColor = 'rgba(0,0,0,0.8)'}, 3000);
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

		#minpos = [0,0];
		#maxpos = [0,0];
		postCarPos(p_car_pos)
		{
			let x = "x",
				z = "y";

			if(! this.#m_elDriverTracker)
				return;

			for(const id in p_car_pos)
			{
				if(! p_car_pos[id][x] || ! p_car_pos[id][z])
					continue;

				this.#minpos[0] = Math.min(p_car_pos[id][x] * 1.1, this.#minpos[0]);
				this.#minpos[1] = Math.min(p_car_pos[id][z] * 1.1, this.#minpos[1]);
				this.#maxpos[0] = Math.max(p_car_pos[id][x] * 1.1, this.#maxpos[0]);
				this.#maxpos[1] = Math.max(p_car_pos[id][z] * 1.1, this.#maxpos[1]);

				this.#m_aDriverTrackerDots[id].style.left = 100 * (p_car_pos[id][x] - this.#minpos[0]) / (this.#maxpos[0] - this.#minpos[0]) + "%";
				this.#m_aDriverTrackerDots[id].style.bottom = 100 * (p_car_pos[id][z] - this.#minpos[1]) / (this.#maxpos[1] - this.#minpos[1]) + "%";
			}
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

				if(this.#m_aTelemetryElement[id])
				{
					this.#m_aTelemetryElement[id][0].style.width = car_stats[id].throttle + '%';
					this.#m_aTelemetryElement[id][1].style.width = car_stats[id].brake + '%';
					this.#m_aTelemetryElement[id][2].innerText = Math.round(car_stats[id].speed) + 'kph ';
					//this.#m_aTelemetryElement[id][3].innerText = ' @ ' + car_stats[id].gear;
				}
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
			/*
			this.#m_aDriverList = new Array();
			this.#m_bListBuilt = false;
			this.#m_aLeaderBoardOrderElement = new Array();
			this.#m_aDriverElement = new Array();
			this.#m_aPositionElement = new Array();
			this.#m_aLeaderGapElement = new Array();
			this.#m_aIntervalElement = new Array();
			this.#m_aSectorTimeElements = new Array();
			this.#m_aCompactSectorTimeElement = new Array();
			this.#m_aBestLapElement = new Array();
			this.#m_aLastLapElement = new Array();
			this.#m_aMiniSectorElement = new Array();
			this.#m_aTelemetryElement = new Array();
			this.#m_aDRSElement = new Array();*/
		}

		onTime(p_time)
		{
			if(this.#m_clockState && this.#m_elSessionTimeRemaining)
			{
				if(this.#m_clockState.Extrapolating)
				{
					let add_time = p_time.m_fTimeInSecs - this.#m_clockState.Utc.m_fTimeInSecs;

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
		{/*
			let i = 0;
			let DRIVER_POSITION = i++,
				TEAM_COLOUR = i++,
				DRIVER_NUMBER = i++,
				DRIVER_SHORTNAME = i++,
				DRIVER_SURNAME = i++,
				DRIVER_SHORT_FULLNAME = i++,
				DRIVER_FULLNAME = i++,
				INTERVAL = i++,
				GAP_TO_LEADER = i++,
				FASTEST_LAP_TIME = i++,
				LAST_LAP_TIME = i++,
				SECTOR_TIMES_ALL = i++,
				SECTOR_TIMES_COMPACT = i++, //just diplays the most recent sector.
				LATEST_TIME = i++,
				SECTOR_WIDGET = i++,
				TELEMETRY_WIDGET = i++,
				DRS = i++,
				PITSTOP_COUNT = i++,
				TYRE_STORY = i++,
				TYRE_STORY_COMPACT = i++,
				CURRENT_TYRE = i++,
				CURRENT_TYRE_AND_AGE = i++,
				POSITION_CHANGE = i++;

			let quali_layout = [DRIVER_POSITION ,
				TEAM_COLOUR ,
				DRIVER_SHORTNAME,
				FASTEST_LAP_TIME,
				LATEST_TIME,
				CURRENT_TYRE_AND_AGE,
				SECTOR_WIDGET
				];
			let quali_layout2 = [DRIVER_POSITION ,
				TEAM_COLOUR ,
				DRIVER_SHORTNAME,
				FASTEST_LAP_TIME,
				LAST_LAP_TIME,
				SECTOR_TIMES_ALL,
				SECTOR_TIMES_COMPACT,
				SECTOR_WIDGET,
				LATEST_TIME
				];

			let race_layout = [DRIVER_POSITION ,
				TEAM_COLOUR ,
				DRIVER_SHORTNAME,
				FASTEST_LAP_TIME,
				LAST_LAP_TIME,
				SECTOR_TIMES_ALL,
				SECTOR_TIMES_COMPACT,
				SECTOR_WIDGET,
				LATEST_TIME
				];
*/
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


				this.#m_aDriverElement[id] = document.getElementById('driver-' + id);
				this.#m_aDriverElement[id].style.top = (this.#m_aDriverList[id].Line -1) * 5 + "%";

				for(let i = 0; i < columns.length; i++)
				switch(columns[i])
				{
					case LEADERBOARD_DRIVER_POSITION:
						this.#m_aPositionElement[id] = document.getElementById('driver-' + id + '-position');
						break;
					case LEADERBOARD_INTERVAL:
						this.#m_aIntervalElement[id] = document.getElementById('driver-' + id + '-interval');
						break;
					case LEADERBOARD_GAP_TO_LEADER:
						this.#m_aLeaderGapElement[id] = document.getElementById('driver-' + id + '-leader-gap');
						break;
					case LEADERBOARD_FASTEST_LAP_TIME:
						this.#m_aBestLapElement[id] = document.getElementById('driver-' + id + '-best-lap');
						break;
					case LEADERBOARD_LAST_LAP_TIME:
						this.#m_aLastLapElement[id] = document.getElementById('driver-' + id + '-last-lap');
						break;
					case LEADERBOARD_SECTOR_TIMES_ALL:
						this.#m_aSectorTimeElements[id] = [ document.getElementById('driver-' + id + '-sector0-time'),
															document.getElementById('driver-' + id + '-sector1-time'),
															document.getElementById('driver-' + id + '-sector2-time')];
						break;
					case LEADERBOARD_SECTOR_TIMES_COMPACT:
						this.#m_aCompactSectorTimeElement[id] = document.getElementById('driver-' + id + '-last-sector-time');
						break;
					case LEADERBOARD_LATEST_TIME:
						this.#m_aLatestTimeElement[id] = document.getElementById('driver-' + id + '-latest-time');
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
								this.#m_aMiniSectorElement[id][j][k] = document.getElementById(div_id);
							}
							let div_id = 'sector-' + id + '-' + j;
							this.#m_aSectorWidgetElement[id][j] = document.getElementById(div_id);
						}
						break;
					case LEADERBOARD_TELEMETRY_WIDGET:
						this.#m_aTelemetryElement[id]=  [document.getElementById('driver-' + id + '-throttle'),
															document.getElementById('driver-' + id + '-brake'),
															document.getElementById('driver-' + id + '-speed')
															//,
															//document.getElementById('driver-' + id + '-gear'),
															];
						break;
					case LEADERBOARD_DRS:
						this.#m_aDRSElement[id] = document.getElementById('driver-' + id + '-drs');
						break;
					case LEADERBOARD_PITSTOP_COUNT:
						this.#m_aPitStopCountElement[id] = document.getElementById('driver-' + id + '-pitstop-count');
						break;
					case LEADERBOARD_TYRE_STORY:
						this.#m_aTyreStoryElement[id] = document.getElementById('driver-' + id + '-tyre-story');
						break;
					case LEADERBOARD_TYRE_STORY_COMPACT:
						this.#m_aTyreStoryCompactElement[id] = document.getElementById('driver-' + id + '-tyre-story-compact');
						break;
					case LEADERBOARD_CURRENT_TYRE:
						this.#m_aCurrentTyreElement[id] = document.getElementById('driver-' + id + '-tyre-current');
						break;
					case LEADERBOARD_CURRENT_TYRE_AND_AGE:
						this.#m_aCurrentTyreAgeElement[id] = document.getElementById('driver-' + id + '-tyre-current-age');
						break;
					case LEADERBOARD_POSITION_CHANGE:
						this.#m_aPositionChangeElement[id] = document.getElementById('driver-' + id + '-position-change');
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
			if(!this.#m_elDriverTracker)
				return;

			for(const id in this.#m_aDriverList)
			{
				//add the driver track dots here.
				if(! this.#m_aDriverTrackerDots[id])
				{
					let html = '<div id="driver-tracker-dot-' + id + '" class="driver_tracker_dot" style="background-color: #'+ this.#m_aDriverList[id].TeamColour +';">' + this.#m_aDriverList[id].Tla.slice(0,1) + '</div>';
					this.#m_elDriverTracker.insertAdjacentHTML('beforeend', html);
					this.#m_aDriverTrackerDots[id] = document.getElementById('driver-tracker-dot-' + id);
				}
			}
			this.#m_bDriverTrackerBuilt = true;				
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
					this.#m_elLeaderBoard.style.fontSize = p_entry[i].contentRect.height * 2/3 / this.#m_iLeaderBoardRowCount + "px";

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
	};

	function setupMultiview()
	{

		//overwrite the document.
		document.open();


			/*
			<div id="timing-view" class="timing-view" style="color: white; position: absolute; z-index: 1050; top:0px; left: 0px; width: 25%; height: 10%; background-color: rgba(0, 0, 0, 0.850)">\
				<div class="timing-header container-div" id="timing-header">\
					<div class="horizontal timer-header-upper">\
						<img class="timing-f1-logo container-content" src="https://www.formula1.com/etc/designs/fom-website/images/f1_logo.svg">\
						<div id="timing-session-name" class="timing-session-name container-content">Loading...</div>\
						<div class="timing-session-lap-count container-content" id="timer-lap">-</div>\
					</div>\
					<div class="horizontal timer-header-lower">\
						<div class="timer-time-remaining container-content" id="timer-time-remaining"></div>\
						<div class="timer-track-status container-content" id="timer-track-status"></div>\
					</div>\
				</div>\
			</div>\
			<div id="timer-leaderboard" class="data_panel leaderboard" style="left: 0%; top: 10%; height: 50%; width:25%; position:absolute;"></div>\
			<div id="timer-race-control" class="data_panel race_control_messages" style="left: 0%; top: 60%; height: 20%; width:25%; position:absolute;"></div>\
			<div class="data_panel timing-driver-tracker" id="timer-driver-tracker" style="left: 50%; bottom: 0%; height: 20%; width:50%; position:absolute; z-index:1050;"></div>\
			
*/

			//<div id="timer-session-status"></div>\
			/*'<div id="my-new-player" style="position: fixed; top: 0%; left: 0%; width: 50%; height: 100%;"></div>'+
			'<div id="my-new-player1" style="position: fixed; top: 0%; left: 33%; width: 33vw; height: 100vh;"></div>'+
			'<div id="my-new-player2" style="position: fixed; top: 0%; left: 66%; width: 33vw; height: 100vh;"></div>'+*/

		document.write(g_sMutliviewHeaderHTML + g_sMutliviewMainBodyHTML);

		//stop it from loading anything else.
		window.stop();

		 //getF1StreamLinks();
		//return;
		/*
		if(window.location.href.indexOf("grand") != -1)
			aCanvasDrawInstructions = aCanvasDrawInstructions_Race;
		else
			aCanvasDrawInstructions = aCanvasDrawInstructions_Quali;
		*
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

		var smSettingsFrameHtml =
			"<div id='sm-offset-settings-btn' class='sm-autohide' style='background-color: #000000aa; color: #fff; font-size: 12px; padding: 8px 16px; border-radius: 0px 0px 20px 20px; position: fixed; top: 0; left: 5%; cursor: pointer; z-index: 1004; display: none;'>SYNC MENU</div>" +
			"<div id='sm-offset-settings' style='padding: 10px; position: fixed; top: 0; left: 0; background-color: #000; border-radius: 0px 0px 20px; display: none; z-index: 1005;'>" +
			"<div id='sm-offset-settings-close-btn' style='text-align: right; font-size: 20px; cursor: pointer;'>[x]</div>" +
			"<div id='sm-offset-settings-msg-top' style='margin: 10px 0px;'></div>" +
			"<table>" +
			"<tr><th colspan='3'>OFFSETS [ms]</th></tr>";

		for (let i = 0; i < gMultiviewLayout.length; i++)
			smSettingsFrameHtml += "<tr><td>Window #" + i + "</td><td><input id='sm-offset-" + i + "' type='number' step='250' value='' style='width: 80px;'></td><td><span id='sm-offset-external-" + i + "'></span></td></tr>";

		smSettingsFrameHtml += "<tr><td>Max desync [ms]</td><td><input id='sm-maxdesync' type='number' step='10' value='300' min='10' max='3000' style='width: 80px;'></td></tr>" +
			"</table>" +
			"<table style='margin-top: 40px;'>" +
			"<tr><th colspan='2'>CURRENT SYNC [ms]</th></tr>" +
			"<tr><td>Window #0</td><td>0 ms</td></tr>";

		for (let i = 1; i < gMultiviewLayout.length; i++)
			smSettingsFrameHtml += "<tr><td>Window #" + i + "</td><td id='sm-sync-status-" + i + "'></td></tr>";

		smSettingsFrameHtml += "</table>" +
			"<div id='sm-sync-status-text' style='text-align: center; font-size: 24px; line-height: 24px; height: 24px; color: #ff0000;'></div>" +
			"</div>" +
			"<style>" +
			"body { background-color: #000; color: #fff; font-family: Arial; margin: 0; }" +
			"td,th { padding: 4px 20px; }" +
			"#sm-offset-settings-msg-top p { padding: 10px; border-radius: 10px; font-size: 14px; background-color: #ffef5b; color: #000; }" +
			"#sm-offset-settings-btn, .sm-bg:hover ~ #sm-offset-settings-btn, #sm-offset-settings-btn:hover { display: block !important; }" +
			"</style>";

		var smAllWindowExtraHtml =  "<style>" +
			".bmpui-ui-piptogglebutton, .bmpui-ui-airplaytogglebutton, .bmpui-ui-casttogglebutton, .bmpui-ui-vrtogglebutton { display: none; }" +
			"</style>";

		var smMainWindowExtraHtml = "";
		var smSecondaryWindowExtraHtml = "";// +
		//"<style>" +
		//".bmpui-ui-rewindbutton, .bmpui-ui-playbacktogglebutton, .bmpui-ui-forwardbutton, .bmpui-controlbar-top, .bmpui-ui-hugeplaybacktogglebutton { display: none; }" +
		// "</style>";
*/
		//var smWindow = new Array(gMultiviewLayout.length);
		let g_iVideoCount = gMultiviewLayout.video.length;
		let g_aWindows = new Array(gMultiviewLayout.window_count);
		let g_iWindowBuiltCount = 0;
		let smPlayers = new Array(g_iVideoCount);//array of the bitmovin players.
		let smElements = new Array(g_iVideoCount);//2d array, [parent_element, element] for each video. (allows the transformation crop).
		let sF1SubscriptionToken = "";
		let listAvailableF1Streams = {};

		let elControlBar = document.getElementById("control-bar-viewer");
		let elLeftTime = document.getElementById("current-played-time");
		let elRightTime = document.getElementById("total-time");
		let elSeebar = document.getElementById("seekbar");
		let updateIntervalTimer = null;

		//synchronisation data
		let videoProgrammeStartTime = new Array(g_iVideoCount);
		let videoOverideOffsets = new Array(g_iVideoCount);
		let liveVideoOffset = new Array(g_iVideoCount);
		let elLiveOffsets = new Array(g_iVideoCount);
		let synchronisationTimer = null;

		let timing_vewer;
		let timer;
		//let other_timer;

		let isLiveStream = false;

		function onResize(p_window_id)
		{
			var ww = window.innerWidth;
			var wh = window.innerHeight;
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
				videoOverideOffsets[i] = 0;
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

				//now sort out the internal sizing of the squashed data display
			   /* if(gMultiviewLayout[i][4] == "data-squashed")
				{
					for(var j = 0; j < canvas.length; j++)
					{
						canvas[j].width = canvasDims[j][0] = Math.floor(canvas[j].clientWidth) * 2;
						canvas[j].height = canvasDims[j][1] = Math.floor(canvas[j].clientHeight) * 2;
					}
				}*/
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
		}

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
			//get the content ID
			var str = "com/";
			var id1 = window.location.href.indexOf(str);
			id1+= str.length;
			var id2 = window.location.href.indexOf("/", id1);
			var contentID = window.location.href.slice(id1, id2);

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
			var streamListURL = "https://f1tv.formula1.com/3.0/R/ENG/WEB_HLS/ALL/CONTENT/VIDEO/" + contentID + "/F1_TV_Pro_Annual/14";
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
				//jsonResp.resultObj.containers[0].metadata.longDescription

				initialiseTimerView(year, date, jsonResp.resultObj.containers[0].metadata.longDescription, jsonResp.resultObj.containers[0].metadata.emfAttributes.Meeting_Name.replaceAll(" ", "_"));
			}

			//setup the video settings dialogue.
			var i = gMultiviewLayout.video.length;
			while(i--)
			{
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
			}
		}

		function onStreamSelectChange(p_id)
		{
			var el = document.getElementById("select-stream-" + p_id);
			playStream(p_id, listAvailableF1Streams[el.value]);
		}

		function onVolumeChange(p_id)
		{
			var el = document.getElementById("video-volume-" + p_id);
			smPlayers[p_id].setVolume(el.value);
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

		function onVideoLoaded(p_id, p_url)
		{
			//set up video qualities.
			let qualities = smPlayers[p_id].getAvailableVideoQualities();
			let html_opts = '<option value="auto">auto</option>';

			for( let i = 0; i < qualities.length; i++)
				html_opts += '<option value="' + qualities[i].id + '">' + qualities[i].width + 'x' + qualities[i].height + ', ' + Math.floor(qualities[i].bitrate / 1000) + ' kbps</option>';

			let el = document.getElementById("select-quality-" + p_id);
			if(el)
			{
				el.innerHTML = html_opts;
				el.value = smPlayers[p_id].getVideoQuality().id;
				el.addEventListener("change", onStreamQualityChange.bind(null,p_id));
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

			if(p_id == 0)
			{
				isLiveStream = smPlayers[0].isLive();
				initSynchronisation();

				//initTimingLoop();
			}

			loadVideoStartTime(p_id, p_url);
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

		function toggleFullscreen()
		{
			if(document.fullscreenElement !== document.body)
				document.body.requestFullscreen();
			else
				document.exitFullscreen();

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
			updateIntervalTimer = setInterval(updateControlBar, 1000);
		}

		function hideControlBar()
		{
			elControlBar.style.display = "none";
			clearInterval(updateIntervalTimer);
			updateIntervalTimer = null;
		}

		function seek()
		{
			var new_time = elSeebar.value;

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
						smPlayers[i].seek(new_time);
			}
		}

		function checkSynchronisation()
		{
			//update the offsets
			let i = g_iVideoCount;
			 //   console.log("player0 :" + smPlayers[0].getCurrentTime("absolutetime"));
			//let d = Date.now();

			//console.log("Time MS: " + Date.now());
			while(i--)
			{
				if(!isLiveStream)
				{
					//this can be improved with the absolute time - see code below - do somehting similar. add an offset to the videos own current time rather than video 0.
					liveVideoOffset[i] = smPlayers[i].getCurrentTime() - (smPlayers[0].getCurrentTime() + videoOverideOffsets[i]);
					if(Math.abs(liveVideoOffset[i]) > 0.5)
					{
						smPlayers[i].seek(smPlayers[0].getCurrentTime() + videoOverideOffsets[i]);
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
					smPlayers[i].seek(player0time + videoOverideOffsets[i]);
			}
		}

		function initSynchronisation()
		{
			if(synchronisationTimer != null)
				return; //we've already initialised.

			checkSynchronisation();
			synchronisationTimer = window.setInterval(checkSynchronisation, 5000);
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
			let weekday = w_date.getDay();
			if( weekday !== 0)//sunday
			{
				w_date.setDate(w_date.getDate() + (7 - weekday));
				sunday_date = w_date.toISOString().slice(0,10);
			}
			else
				sunday_date = p_date;
//sunday_date = "2022-07-31";

			let base_url = "https://livetiming.formula1.com/static/" + p_year + "/" + sunday_date + "_" + p_session + "/" + p_date + "_" + p_title + "/";
			base_url = base_url.replaceAll(" ", "_");
			let link = base_url + "ArchiveStatus.json";

			let response = await fetch(link);
			response = await response.json();

			timing_vewer = new timing_renderer(gMultiviewLayout.data);

			if(response.Status === "Complete")
				timer = new nonlive_timing(gMultiviewLayout.data, base_url, timing_vewer, p_title);
			else
				timer = new live_timing(gMultiviewLayout.data, timing_vewer, p_title);

			initTimingLoop();
		}
//https://livetiming.formula1.com/static/2022/2022-07-24_French_Grand_Prix/2022-07-24_Race/ArchiveStatus.json
		//https://livetiming.formula1.com/static/2022/2022-07-03_British_Grand_Prix/2022-07-03_Race/ArchiveStatus.json

		function initTimingLoop()
		{
			setInterval(onTimingLoop, 100);
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
			}
			else
			{
				if(!videoProgrammeStartTime[0])
					return;//no point doing anything here.

				time = copyDateTime(videoProgrammeStartTime[0]);
				time.addSeconds(smPlayers[0].getCurrentTime() - 10);
			}

			//let t_start = copyDateTime(silver_stone_programme_start_time);
			//t_start.addJSONTime(new date_time(0,0,0,0,0, smPlayers[0].getCurrentTime() - 10.0));

			timer.onTime(time);
		}



		
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
	*/
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
				smPlayers[e.data.id] = g_aWindows[e.data.windowID].players[e.data.id];
				smElements[i] = g_aWindows[e.data.windowID].elements[e.data.id];

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

		window.addEventListener("message", onMessage);

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
		g_aWindows[0] = window;
		window.onresize = onResize.bind(this, 0);
		//if(gMultiviewLayout.window_count)


		for(let i = 1; i < gMultiviewLayout.window_count; i++)
		{
			let url = "https://f1tv.formula1.com/1000005181/#f1tvplus:submultipopout:" + gLayoutSubType + ":" + gLayoutID + ":" + i;
			g_aWindows[i] = window.open(url, "submultipopout" + i, "popup");
			//g_aWindows[i].alert("this is sent from the main window");
			g_aWindows[i].onresize = () => {alert("resize");}//a = onResize.bind(this, i);
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
				top: 0%; width: 100%; height: 100%; overflow:hidden;"><div id="video-child-div-' + i + '"></div></div>';
				document.getElementById("videos").insertAdjacentHTML("beforeend", frameHtml);

				smElements[i] = [document.getElementById("video-parent-div-" + i), document.getElementById("video-child-div-" + i)];
				smPlayers[i] = new bitmovin.player.Player(smElements[i][1], playerConfig);
				onVideoAdded();
			}

			var table = document.getElementById("video-settings-table");
			var row = '<tr>\
						<td>#' + i + '</td>\
						<td><select name="Choose Stream" id="select-stream-' + i + '"></td>\
						<td><select name="Choose Audio" id="select-audio-' + i + '"></td>\
						<td><input class="slider" id="video-volume-' + i + '" type="range" min="0" max="100" value="50"></td>\
						<td><select name="Choose Quality" id="select-quality-' + i + '"></td>\
						<td id="video-live-offset-' + i + '">0ms</td>\
						<td><input id="video-forced-offset-' + i + '" type="number" step="250" value="" style="width: 80px;"></td>\
					</tr>';
			table.insertAdjacentHTML("beforeend", row);

			elLiveOffsets[i] = document.getElementById("video-live-offset-" + i);
			var el = document.getElementById("video-forced-offset-" + i);
			if(i == 0)
				el.disabled = true;
			else
				el.oninput = setOverideOffset.bind(null, i, el);
		}

		//buildVideoLayout(0);

		
		

		//var control_view = document.getElementById("control-bar-viewer");
		document.getElementById("control-bar").onmouseenter = displayControlBar;
		document.getElementById("control-bar").onmouseleave = hideControlBar;

		document.getElementById("videos").onclick = playOrPauseAll;
		document.getElementById("videos").ondblclick = toggleFullscreen;
		document.getElementById("play-video").onclick = playOrPauseAll;
		document.getElementById("fullscreen").onclick = toggleFullscreen;
		elSeebar.oninput = seek;

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

////////
return;
/////////
		//---------------------------
		// SYNCHRONISATION
		//---------------------------
		function smPauseAll() {
			for (let i = 0; i < smWindow.length; i++) {
				smWindow[i].document.getElementsByTagName("video")[0].pause();
			}
		}

		function smResumeAllWhenReady() {
			var smResumeRetryCount = 0;
			var smReadyCheck = setInterval(function() {
				var smNotReady = 0;

				for (let i = 0; i < smWindow.length; i++) {
					if (smWindow[i].document.getElementsByTagName("video")[0].readyState != 4) {
						smNotReady += 1;
					}
				}
				if (smNotReady == 0) {
					for (let i = 0; i < smWindow.length; i++) {
						smWindow[i].document.getElementsByTagName("video")[0].play();
					}
					document.getElementById("sm-sync-status-text").innerHTML = "";
					clearInterval(smReadyCheck);
				}

				// DIRTY FIX:
				// Simulates click on seek-backward button if syncing takes longer than 2 seconds.
				// This fixes Bitmovin player sometimes not buffering video after setting it's currentTime value.
				// Might cause issues on slow internet connections.
				smResumeRetryCount += 1;
				if (smResumeRetryCount == 20) {
					for (let i = 1; i < smWindow.length; i++) {
						var savedTime = smWindow[i].document.getElementsByTagName("video")[0].currentTime;
						smWindow[i].document.getElementsByClassName("bmpui-ui-rewindbutton")[0].click();
						smWindow[i].document.getElementsByTagName("video")[0].currentTime = savedTime;
					}
				}
			}, 100);
		}

		function smSync() {
			var time = [];
			var offset = [];
			var timeDiff = [];
			var smSynced = 0;

			for (let i = 0; i < smWindow.length; i++) {
				if (typeof smWindow[i].document.getElementsByTagName("video")[0] == 'undefined') {
					return;
				} else if (smWindow[i].document.getElementsByTagName("video")[0].readyState == 0) {
					return;
				}
			}

			if (smWindow[0].document.getElementsByTagName("video")[0].paused) {
				for (let i = 1; i < smWindow.length; i++) {
					if (smWindow[i].document.getElementsByTagName("video")[0].paused != true) {
						smWindow[i].document.getElementsByTagName("video")[0].pause();
					}
				}
				return;
			}

			for (let i = 1; i < smWindow.length; i++) {
				if (smWindow[i].document.getElementsByTagName("video")[0].playbackRate !== smWindow[0].document.getElementsByTagName("video")[0].playbackRate) {
					smWindow[i].document.getElementsByTagName("video")[0].playbackRate = smWindow[0].document.getElementsByTagName("video")[0].playbackRate;
				}
			}

			for (let i = 0; i < smWindow.length; i++) {
				offset[i] = parseInt(document.getElementById("sm-offset-" + i).value) / 1000 || 0;
				var streamId = smWindow[i].window.location.href.split("/")[4];
				//var name = smWindow[i].document.getElementById("bitmovinplayer-video-slave-embeddedPlayer").dataset.name;
				var name = smWindow[i].document.getElementsByClassName("bmpui-label-metadata-title")[0].innerHTML.toLowerCase().replace(" ", "_");

				/*if (smSyncData.videos[streamId]) {
					if ((document.getElementById("sm-offset-" + i).value == "") && (smSyncData.videos[streamId].values[name])) {
						var smSyncValue = smSyncData.videos[streamId].values[name];
						document.getElementById("sm-offset-external-" + i).innerHTML = smSyncValue;
						offset[i] = smSyncValue / 1000;
					} else {
						if (document.getElementById("sm-offset-external-" + i).innerHTML !== "") {
							document.getElementById("sm-offset-external-" + i).innerHTML = "";
						}
					}
				}*/
			}

			var maxDesync = parseInt(document.getElementById("sm-maxdesync").value) / 1000 || 0.3;
			for (let i = 0; i < smWindow.length; i++) {
				time[i] = smWindow[i].document.getElementsByTagName("video")[0].currentTime - offset[i];
			}

			for (let i = 1; i < smWindow.length; i++) {
				timeDiff[i] = Math.abs(time[0] - time[i]);
				document.getElementById("sm-sync-status-" + i).innerHTML = Math.floor(timeDiff[i] * 1000) + " ms";
			}

			for (let i = 1; i < smWindow.length; i++) {
				timeDiff[i] = Math.abs(time[0] - time[i]);
				if (timeDiff[i] > maxDesync) {
					smPauseAll();
					smWindow[i].document.getElementsByTagName("video")[0].currentTime = time[0] + offset[i];
					smSynced += 1;
				}
			}

			if (smSynced > 0) {
				document.getElementById("sm-sync-status-text").innerHTML = "SYNCING";
				smResumeAllWhenReady();
			}
		}

		/*
		var smSyncLoop = setInterval(function() {
			smSync();
		}, 500);*/

		function smCloseAllWindows() {
			for (let i = 0; i < smWindow.length; i++) {
				if (!smWindow[i].closed) {
					smWindow[i].close();
				}
			}
			window.close();
		}
		for (let i = 0; i < smWindow.length; i++) {
			smWindow[i].onbeforeunload = function() {
				smCloseAllWindows();
			};
		}
		window.onbeforeunload = function() {
			smCloseAllWindows();
		};

	}

	function setupSubMultiview()
	{
		document.open();
		document.write(g_sMutliviewHeaderHTML + g_sMutliviewSubBodyHTML);
		window.stop();

		unsafeWindow.elements = new Array();
		unsafeWindow.players = new Array(); 
		
			for (let i = 0; i < gMultiviewLayout.video.length; i++)
			{
				if(gMultiviewLayout.video[i][LAYOUT_DATA_WINDOW_ID] != gLayoutSubWindowID)
					continue;

				let frameHtml = '<div id="video-parent-div-' + i + '" style="opacity: 1.0; position: absolute; z-index: 1000; border: 0; left: 0%;\
				top: 0%; width: 100%; height: 100%; overflow:hidden;"><div id="video-child-div-' + i + '"></div></div>';
				document.getElementById("videos").insertAdjacentHTML("beforeend", frameHtml);
	
				unsafeWindow.elements[i] = [document.getElementById("video-parent-div-" + i), document.getElementById("video-child-div-" + i)];
				unsafeWindow.players[i] = new bitmovin.player.Player(unsafeWindow.elements[i][1], playerConfig);
				
				let data = {
					windowID: gLayoutSubWindowID,
					id: i,
					//player: new bitmovin.player.Player(els[1], playerConfig)
				}

				window.opener.postMessage(data, "*");
			}	

			let data = {windowID: gLayoutSubWindowID};
			window.opener.postMessage(data);
		
		

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
		var smPopoutMenuHtml = "<div id='sm-popout-menu' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1001; text-align: center;'>" +
			"<div id='sm-popout-menu-bg' style='background-color: #0000008f; width: 100%; height: 100%; top: 0; left: 0; position: absolute;'></div>" +
			"<div style='background-color: #c70000; color: #fff; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; border-radius: 10px; position: absolute;'>" +
			"<div style='font-size: 20px; font-weight: bold;'>F1TV+ MULTI-VIEW</div>" +
			"<div id='sm-popout-menu-mode-selection' style='margin-top: 10px;'>" +
			"<div style='font-size: 12px; margin: 4px;'>Select mode:</div>" +
			"<div id='sm-popout-menu-mode-multipopout' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 20px 0px 0px 20px; background-color: #9a0000; cursor: pointer;'>Popouts</div>" +
			"<div id='sm-popout-menu-mode-onewindow' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 0px 20px 20px 0px; background-color: #c13636; cursor: pointer;'>Frames</div>" +
			"</div>" +
			"<div id='sm-popout-menu-frame-selection' style='display: inline-block; margin-top: 10px;'>" +
			"<div style='font-size: 12px; margin: 4px;'>Display aspect ratio:</div>" +
			"<div id='sm-popout-menu-frame-16by9' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 20px 0px 0px 20px; background-color: #9a0000; cursor: pointer;'>16:9</div>" +
			"<div id='sm-popout-menu-frame-21by9' style='display: inline-block; padding: 10px 20px; text-transform: uppercase; border: 1px solid #ff7171; border-radius: 0px 20px 20px 0px; background-color: #c13636; cursor: pointer;'>21:9</div>" +
			"</div>" +
			"<div id='sm-popout-menu-options' style='text-align: center; margin-top: 16px;'>" +
			"<div id='sm-popout-options-list'></div>" +
			"<div id='sm-popout-options-frames' style='display: inline-block;'>" +
			"<div id='sm-popout-options-frame-16by9-list'></div>" +
			"<div id='sm-popout-options-frame-21by9-list' style='display: none;'></div>" +
			"</div>" +
			"</div>" +
			"</div>" +
			"</div>";

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
				});*/
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
						window.location.href = "https://f1tv.formula1.com/" + contentID + "/#f1tvplus:multipopout:16by9:"  + i;
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
				destroyTheatre();
				setupMultiview();
				break;

			case LAYOUT_SUBMULTIVIEW:
				destroyTheatre();
				setupSubMultiview();
				break;
		}
	}

	setupLayout();
})();
