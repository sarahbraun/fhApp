// Lädt Räume aus der CSV in das Select
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "raumliste.csv",
        dataType: "text",
        success: function(data) {processData(data);}
    });
});
function processData(data) {
    var allRows = data.split(/\r?\n|\r/);
    var table;
    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
        var rowCells = allRows[singleRow].split(',');
        table += '<option value="';
        table += rowCells[1];
        table += ',';
        table += rowCells[2];
        table += ',';
        table += rowCells[3];
        table += '">';
        table += rowCells[0];
        if(rowCells[4] != "") {
            table += ' ';
            table += rowCells[4];
        }
        table += '</option>';
    }
    $('#endpoint').append(table);
}

// Übermittelter Wert aus select wird an die function initPath übergeben
function searchEndpoint(endpoint) {
    var res = endpoint.split(",");
    initPath(res[0],res[1],res[2]);
}

// Die Stockwerke wurden bereits in der index.html eingebunden
var eg0Map = document.getElementById('eg0Map');
var og1Map = document.getElementById('og1Map');
var og2Map = document.getElementById('og2Map');
var mainMap = [eg0Map, og1Map, og2Map];

var graphEG = new Graph(grid0);
var rows0 = grid0.length;
var cols0 = grid0[0].length;

var graph1OG = new Graph(grid1);
var rows1 = grid1.length;
var cols1 = grid1[0].length;

var graph2OG = new Graph(grid2);
var rows2 = grid2.length;
var cols2 = grid2[0].length;

var graph = [graphEG, graph1OG, graph2OG];
var rows = [rows0, rows1, rows2];
var cols = [cols0, cols1, cols2];
var grid = [grid0, grid1, grid2];

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
    $(".grid-box").removeClass("start").removeClass("end").removeClass("waypoint").removeClass("path");
    $("#lift").hide().html("");  
    $("#eg0Map").show();
    $("#og1Map").hide();
    $("#og2Map").hide();
    var stockwerk = st;

    // Start beim Eingang ACHTUNG: zuerst wird die Zeile angegeben, dann die Spalte!
    var startY = 15;
    var startX = 5;
    var endY = x - 1; // -1 um Indexierung bei 0 zu beginnen
    var endX = y - 1;
    var liftY = 7;
    var liftX = 6;
    
    // ist Endpunkt im EG?
    if (stockwerk == "0"){
        var start = graph[0].grid[startY][startX];
        var end = graph[st].grid[endY][endX];
        drawPath(0, start, end)
    } else {
        // wenn Endpunkt nicht im EG, dann geh bis zum Lift
        var start = graph[0].grid[startY][startX];
        var end = graph[0].grid[liftY][liftX];
        drawPath(0, start, end);
        
        var start2 = graph[stockwerk].grid[liftY][liftX];
        var end2 = graph[stockwerk].grid[endY][endX];
        // Klicke auf den Lift-Button, um in das andere Stockwerk zu gelangen
        $("#lift").show().append("Nimm den Lift in den "+stockwerk+". Stock!").on("click touch", function() {
            $("#eg0Map").hide();
            $("#lift").hide();
            if (stockwerk == "1"){
                $("#og1Map").show();
            } else if (stockwerk == "2"){
                $("#og2Map").show();
            }
            drawPath(stockwerk, start2, end2);
        });
        
    }
    function drawPath(st, start, end) {
        // astar anwenden
        var result = astar.search(graph[st], start, end);
        // Ergebnisse anzeigen
        window.setTimeout(function() {
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
                        }       
                    }, 100 * ind);
                })(i);
            }
        }, 100);
        // Startpunkt zeigen:
        if (stockwerk == "0") {
            gridElems[st][startY][startX].classList.add('waypoint', 'start');
        } else {
            gridElems[st][liftY][liftX].classList.add('waypoint', 'start');
        }
    }
}