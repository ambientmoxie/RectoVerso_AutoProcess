#target "InDesign"

(function () {

    // --------------------------------------
    // 1. Choose CSV
    // --------------------------------------
    var csvFile = File.openDialog("Choose Data.csv", "*.csv");
    if (!csvFile) {
        alert("No CSV selected. Script cancelled.");
        return;
    }

    if (app.documents.length === 0) {
        alert("Open Fiches.indd first.");
        return;
    }

    var doc = app.activeDocument;

    // --------------------------------------
    // 2. Locate Recto and Verso master pages
    // --------------------------------------
    var masterRecto = doc.masterSpreads.itemByName("A-Recto");
    var masterVerso = doc.masterSpreads.itemByName("B-Verso");

    if (!masterRecto.isValid) {
        alert('Master spread "A-Recto" not found.');
        return;
    }
    if (!masterVerso.isValid) {
        alert('Master spread "B-Verso" not found.');
        return;
    }

    var rectoTemplate = masterRecto.pages[0];
    var versoTemplate = masterVerso.pages[0];

    // --------------------------------------
    // 3. CSV parsing
    // --------------------------------------
    function parseCSVLine(line) {
        var result = [];
        var current = "";
        var inQuotes = false;

        for (var i = 0; i < line.length; i++) {
            var ch = line.charAt(i);

            if (ch === '"') {
                if (inQuotes && i + 1 < line.length && line.charAt(i + 1) === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                result.push(current);
                current = "";
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    function readCSV(file) {
        var lines = [];
        file.open("r");

        var firstLine = file.readln();
        if (firstLine && firstLine.charCodeAt(0) === 0xFEFF) {
            firstLine = firstLine.slice(1);
        }
        lines.push(firstLine);

        while (!file.eof) {
            lines.push(file.readln());
        }
        file.close();

        if (lines.length === 0) return [];

        var header = parseCSVLine(lines[0]);
        var rows = [];

        for (var i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;

            var fields = parseCSVLine(lines[i]);
            var obj = {};

            for (var h = 0; h < header.length; h++) {
                obj[header[h]] = fields[h] || "";
            }

            rows.push(obj);
        }

        return rows;
    }

    // --------------------------------------
    // 4. Tools
    // --------------------------------------
    function findFrameByLabel(page, label) {
        var items = page.pageItems;
        for (var i = 0; i < items.length; i++) {
            if (items[i].label === label) return items[i];
        }
        return null;
    }

    function placeImageIntoFrame(page, frameLabel, imagePath) {

        if (!imagePath) return;

        var frame = findFrameByLabel(page, frameLabel);
        if (!frame) return;

        var file = File(imagePath);
        if (!file.exists) {
            $.writeln("Image missing: " + file.fsName);
            return;
        }

        try {
            if (frame.images.length > 0)
                frame.images[0].remove();
        } catch (e) {}

        var placed = frame.place(file);
        if (!placed || placed.length === 0) return;

        var img = placed[0];

        img.fit(FitOptions.FILL_PROPORTIONALLY);
        frame.fit(FitOptions.CENTER_CONTENT);
    }

    // --------------------------------------
    // 5. Read CSV rows
    // --------------------------------------
    var rows = readCSV(csvFile);
    if (rows.length === 0) {
        alert("CSV empty or unreadable.");
        return;
    }

    // --------------------------------------
    // 6. Always remove initial page (brutal but guaranteed)
    // --------------------------------------
    try {
        doc.pages[0].remove();
    } catch (e) {
        $.writeln("Could not remove initial page: " + e);
    }

    // --------------------------------------
    // 7. Generate pages
    // --------------------------------------
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

    app.doScript(function () {

        for (var r = 0; r < rows.length; r++) {

            var row = rows[r];
            var folder = File(doc.fullName).parent;

            // ---------------------------
            // RECTO PAGE
            // ---------------------------
            var recto = doc.pages.add(LocationOptions.AT_END);
            rectoTemplate.pageItems.everyItem().duplicate(recto);

            // Fill Recto frames
            if (findFrameByLabel(recto, "nameFrame")) {
                findFrameByLabel(recto, "nameFrame").contents = row["Name"] || "";
            }
            if (findFrameByLabel(recto, "descriptionFrame")) {
                findFrameByLabel(recto, "descriptionFrame").contents = row["Description"] || "";
            }
            if (findFrameByLabel(recto, "durationFrame")) {
                findFrameByLabel(recto, "durationFrame").contents = row["Duration"] || "";
            }
            if (findFrameByLabel(recto, "indexFrame")) {
                findFrameByLabel(recto, "indexFrame").contents = row["Index"] || "";
            }

            // Cover image
            placeImageIntoFrame(
                recto,
                "imageFrame",
                folder + "/Images/" + row["Cover"] + ".png"
            );

            // ---------------------------
            // VERSO PAGE
            // ---------------------------
            var verso = doc.pages.add(LocationOptions.AT_END);
            versoTemplate.pageItems.everyItem().duplicate(verso);

            // Fill verso fields
            if (findFrameByLabel(verso, "detailFrame")) {
                findFrameByLabel(verso, "detailFrame").contents = row["Detail"] || "";
            }

            // QR code (EPS)
            placeImageIntoFrame(
                verso,
                "QRFrame",
                folder + "/QR/" + row["QR"] + ".eps"
            );
        }

    }, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Generate Recto + Verso Cards");

    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

    alert("Recto + Verso cards generated: " + (rows.length * 2) + " pages.");

})();
