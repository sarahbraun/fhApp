$(document).ready(function() {
    searchEndpoint();
});
// Übermittelter Wert aus URL wird an die function initPath übergeben
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}
function searchEndpoint() {
    var res = $.urlParam('room').split(",");
    initPath(res[0],res[1],res[2]);
}
// Die Stockwerke wurden bereits eingebunden
var eg0Map = document.getElementById('eg0Map');
var og1Map = document.getElementById('og1Map');
var og2Map = document.getElementById('og2Map');
var tb3Map = document.getElementById('tb3Map');
var mainMap = [eg0Map, og1Map, og2Map, tb3Map];

var graphEG = new Graph(grid0);
var rows0 = grid0.length;
var cols0 = grid0[0].length;

var graph1OG = new Graph(grid1);
var rows1 = grid1.length;
var cols1 = grid1[0].length;

var graph2OG = new Graph(grid2);
var rows2 = grid2.length;
var cols2 = grid2[0].length;

var graph3TL = new Graph(grid3);
var rows3 = grid3.length;
var cols3 = grid3[0].length;

var graph = [graphEG, graph1OG, graph2OG, graph3TL];
var rows = [rows0, rows1, rows2, rows3];
var cols = [cols0, cols1, cols2, cols3];
var grid = [grid0, grid1, grid2, grid3];

/*
    Speichert die erstellten Elemente, es kann über die gefundenen Koordinaten
    auf sie zugegriffen werden. z. B.: gridElems[y][x].style.backgroundColor = 'red';
*/
var gridElems = [];

for (var g = 0; g < mainMap.length; g++) {
    gridElems[g] = [];
    initGrids(g)
}

function initGrids(g) {
    'use strict';
    
    // vorläufiger Container für die zu erstellenden HTML-Elemente
    var docFrag = document.createDocumentFragment();

    // Raster Elemente für begehbare Bereiche erzeugen
    for (var i = 0; i < rows[g]; i++) {
        var row = [];
        for (var j = 0; j < cols[g]; j++) {
            // ignoriere nicht begehbare Bereiche
            if (grid[g][i][j] === 0) continue;
            // Element erzeugen und Attribute setzen
            var elem = document.createElement('div');
            elem.className = 'grid-box';
            elem.style.left = 100/cols[g] * j + '%';
            elem.style.top = 100/rows[g] * i + '%';
            elem.title = i + ', ' + j;
            //
            docFrag.appendChild(elem);
            row[j] = elem;
        }
        // Elemente für späteren Zugriff speichern
        gridElems[g][i] = row;
    }
    mainMap[g].appendChild(docFrag);
}

function initPath(st, x, y) {
    'use strict';
    
    // Entferne zuvor erstellen Path
    $(".grid-box").removeClass("start end waypoint path");
    $("#lift").hide().html('<span class="glyphicon glyphicon-circle-arrow-up" aria-hidden="true"></span>');  
    $("#eg0Map").show();
    $("#og1Map").hide();
    $("#og2Map").hide();
    $("#tb3Map").hide();
    var stockwerk = st;

    // Start beim Eingang ACHTUNG: zuerst wird die Zeile angegeben, dann die Spalte!
    var startY = 15;
    var startX = 5;
    var endY = x - 1; // -1 um Indexierung bei 0 zu beginnen
    var endX = y - 1;
    var liftY = 7;
    var liftX = 6;
    var HGzuTLY = 0;
    var HGzuTLX = 1;
    var startTLY = 23;
    var startTLX = 23;
    
    // ist Endpunkt im EG?
    if (stockwerk == "0"){
        var start = graph[0].grid[startY][startX];
        var end = graph[st].grid[endY][endX];
        drawPath(0, start, end)
    } else if (stockwerk == "1" || stockwerk == "2") {
        // wenn Endpunkt im 1OG oder 2OG, dann geh bis zum Lift
        var start = graph[0].grid[startY][startX];
        var end = graph[0].grid[liftY][liftX];
        drawPath(0, start, end);
        
        var start2 = graph[stockwerk].grid[liftY][liftX];
        var end2 = graph[stockwerk].grid[endY][endX];
        // Klicke auf den Lift-Button, um in das andere Stockwerk zu gelangen
        $("#lift").append("Nimm den Lift in den "+stockwerk+". Stock!").off("click touch").on("click touch", function() {
            $("#eg0Map").hide();
            $("#lift").hide();
            if (stockwerk == "1"){
                $("#og1Map").show();
            } else if (stockwerk == "2"){
                $("#og2Map").show();
            }
            drawPath(stockwerk, start2, end2);
        });
    } else if (stockwerk == "3") {
        // wenn Endpunkt im TL, dann geh nach draußen
        var start = graph[0].grid[startY][startX];
        var end = graph[0].grid[HGzuTLY][HGzuTLX];
        drawPath(0, start, end);
        
        var start3 = graph[stockwerk].grid[startTLY][startTLX];
        var end3 = graph[stockwerk].grid[endY][endX];
        // Klicke auf den Button, um zum TL zu gelangen
        $("#lift").append("Gehe zum TechLab!").off("click touch").on("click touch", function() {
            $("#eg0Map").hide();
            $("#lift").hide();
            $("#tb3Map").show();
            drawPath(stockwerk, start3, end3);
        });
    }            
    function drawPath(st, start, end) {
        // astar anwenden
        var result = astar.search(graph[st], start, end);
        // Ergebnisse anzeigen
        for (var i = 0; i < result.length; i++) {
            (function(ind) {
                // jeden Wegpunkt nach 100 millisekunden hinzufügen
                setTimeout(function(){
                    if (ind < result.length -1){
                        // Style für jeden gefundenen Wegpunkt hinzufügen
                        gridElems[st][ result[ind].x ][ result[ind].y ].classList.add('waypoint', 'path');
                    } else {
                        // Style für Endpunkt hinzufügen
                        gridElems[st][ result[ind].x ][ result[ind].y ].classList.add('waypoint', 'end');
                        if (stockwerk != "0" && st == "0"){
                            $("#lift").show()
                        }
                    }       
                }, 100 * ind);
            })(i);
        }
        // Startpunkt zeigen:
        if (st == "0") {
            gridElems[0][startY][startX].classList.add('waypoint', 'start');
        } else if (st == "3") {
            gridElems[3][startTLY][startTLX].classList.add('waypoint', 'start');
        } else {
            gridElems[st][liftY][liftX].classList.add('waypoint', 'start');
        }
    }
}