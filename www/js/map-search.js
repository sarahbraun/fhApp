function drawGrid(x, y) {
    'use strict';
    // Das Erdgeschoss wurde bereits in der index.html eingebunden
    var graphEG = new Graph(grid0);
    var mainMap = document.getElementById('mainMap');
    var rows = grid0.length;
    var cols = grid0[0].length;

    /*
        Speichert die erstellten Elemente, es kann über die gefundenen Koordinaten
        auf sie zugegriffen werden. z. B.: gridElems[y][x].style.backgroundColor = 'red';
    */
    var gridElems = [];
    
    // Entferne zuvor erstelles Grid
    var elements = document.getElementsByClassName("grid-box");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }

    // vorläufiger Container für die zu erstellenden HTML-Elemente
    var docFrag = document.createDocumentFragment();

    // Raster Elemente für begehbare Bereiche erzeugen
    for (var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < cols; j++) {
            // ignoriere nicht begehbare Bereiche
            if (grid0[i][j] === 0) continue;
            // Element erzeugen und Attribute setzen
            var elem = document.createElement('div');
            elem.className = 'grid-box';
            elem.style.left = 100/cols * j + '%';
            elem.style.top = 100/rows * i + '%';
            elem.title = i + ', ' + j;
            //
            docFrag.appendChild(elem);
            row[j] = elem;
        }
        // Elemente für späteren Zugriff speichern
        gridElems[i] = row;
    }

    mainMap.appendChild(docFrag);

    // astar anwenden
    // Start beim Eingang ACHTUNG: zuerst wird die Zeile angegeben, dann die Spalte!!!!
    var startY = 15;
    var startX = 5;
    var endY = x - 1;
    var endX = y - 1;

    var start = graphEG.grid[startY][startX];
    var end = graphEG.grid[endY][endX];
    var result = astar.search(graphEG, start, end);

    // Ergebnisse anzeigen
    window.setTimeout(function() {
        for (i = 0; i < result.length; i++) {
            (function(ind) {
                // jeden Wegpunkt nach 100 millisekunden hinzufügen
                setTimeout(function(){
                    if (ind < result.length -1){
                        // Style für jeden gefundenen Wegpunkt hinzufügen
                        gridElems[ result[ind].x ][ result[ind].y ].classList.add('waypoint', 'path');
                    } else {
                        // Style für Endpunkt hinzufügen
                        gridElems[ result[ind].x ][ result[ind].y ].classList.add('waypoint', 'end');
                    }       
                }, 100 * ind);
            })(i);
        }
    }, 100);
    // Startpunkt zeigen:
    gridElems[startY][startX].classList.add('waypoint', 'start');
}
// Übermittelter Wert aus select wird an die function drawGrid übergeben
function searchEndpoint(endpoint) {
    var res = endpoint.split(",");
    drawGrid(res[0],res[1]);
}
