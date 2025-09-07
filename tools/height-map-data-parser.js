'use strict';

const Aseparser = require('ase-parser');
const fs = require('fs');
const util = require('util');

const SPACE    = 0;
const ROOM     = 1;
const SAFEROOM = 2;
const SPAWN    = 3;
const TUNNEL   = 4;
const ENDING   = 5;

/**
 * Similar to the image data parser, the map data parser updates a generated source
 * containing the map data. Like all things, this is a compromise -- it's a trade-off
 * between raw "map data" (which is generally very expensive because it's high entropy)
 * and "processing code".
 */
const HeightMapDataParser = {
    parse: function(dataFile, outputFile) {
        let data = HeightMapDataParser._parseDataFile(dataFile);
        HeightMapDataParser._writeOutputFile(data, outputFile);
    },
    _parseDataFile(dataFile) {
        // Extract the map layer from our map aseprite file - lets me use
        // Aseprite as my map editor, which is pretty easy for this simple game.
        const data = new Aseparser(fs.readFileSync(dataFile), dataFile);
        data.parse();

        let heightmap = [];

        for (let layer = 0; layer < 4; layer++) {
            let { xpos, ypos, w, h, rawCelData: buffer } = data.frames[0].cels[layer];

            heightmap[layer] = [];

            let orig = [];

            console.log(layer, xpos, ypos, w, h);

            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    let p = (y * w + x) * 4;
                    //if (buffer[p] === 10 && buffer[p + 1] === 26 && buffer[p + 2] === 47 && buffer[p + 3] === 255) {
                    if (buffer[p + 3] > 64) {
                        orig[x] = y + ypos;
                        break;
                    }
                }
            }

            heightmap[layer][0] = orig[0];
            heightmap[layer][1] = orig[1];
            heightmap[layer][w - 1] = orig[w - 1];
            heightmap[layer][w - 2] = orig[w - 2];

            for (let x = 2; x < w - 2; x++) {
                //heightmap[layer][x] = Math.floor((orig[x - 2] + orig[x - 1] + orig[x] + orig[x + 1] + orig[x + 2]) / 5);
                heightmap[layer][x] = Math.floor((orig[x - 1] + orig[x] + orig[x + 1]) / 3);
            }
        }

        // HACK: Rearrange so 1 = closest most layer, 0 is background
        // and always empty, 3 (farthest) is currently unused
        heightmap[0] = [];
        heightmap[1] = heightmap[3];
        //heightmap[2] = heightmap[2];
        heightmap[3] = [];

        return heightmap;
    },
    _writeOutputFile(data, outputFile) {
        let js = fs.readFileSync(outputFile, 'utf8');
        let lines = js.split('\n');
        let prefix = lines.findIndex(value => value.match(/<generated-data>/));
        let suffix = lines.findIndex(value => value.match(/<\/generated-data>/));

        let generated = util.inspect(data, { compact: true, maxArrayLength: Infinity, depth: Infinity });
        generated = lines.slice(0, prefix + 1).join('\n') + '\n' + generated + '\n' + lines.slice(suffix).join('\n');

        fs.writeFileSync(outputFile, generated, 'utf8');
    }
};

module.exports = HeightMapDataParser;
