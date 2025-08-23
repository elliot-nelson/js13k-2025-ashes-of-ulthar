// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
import advpng from 'imagemin-advpng';
import chalk from 'chalk';
import childProcess from 'child_process';
import fs from 'fs';
import gulp from 'gulp';
import log from 'fancy-log';
import * as rollup from 'rollup';
import * as roadroller from 'roadroller';

import AsepriteCli from './tools/aseprite-cli.js';
import ImageDataParser from './tools/image-data-parser.js';
import LevelConverter from './tools/level-converter.js';

// -----------------------------------------------------------------------------
// Gulp Plugins
// -----------------------------------------------------------------------------
import advzip from 'gulp-advzip';
import concat from 'gulp-concat';
import cleancss from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import rename from 'gulp-rename';
import size from 'gulp-size';
import sourcemaps from 'gulp-sourcemaps';
import template from 'gulp-template';
import terser from 'gulp-terser';
import zip from 'gulp-zip';

// -----------------------------------------------------------------------------
// Flags
// -----------------------------------------------------------------------------
let watching = false;
let dist = process.argv.includes('--dist');
let fast = !dist;

// -----------------------------------------------------------------------------
// JS Build
// -----------------------------------------------------------------------------
async function compileBuild() {
    try {
        const bundle = await rollup.rollup({
            input: 'src/js/index.js',
            onwarn: (warning, rollupWarn) => {
                // Suppress circular dependency spam.
                if (warning.code !== 'CIRCULAR_DEPENDENCY') {
                    rollupWarn(warning);
                }
            }
        });

        await bundle.write({
            file: 'dist/temp/app.js',
            format: 'iife',
            name: 'app'
        });
    } catch (error) {
        // Use rollup's error output
        const { handleError } = await import('./node_modules/rollup/dist/shared/loadConfigFile.js');
        handleError(error, true);
        throw error;
    }
}

function minifyBuild() {
    // Fast Mode Shortcut
    if (fast) return Promise.resolve();

    let cache = {};

    return gulp.src('dist/temp/app.js')
        .pipe(sourcemaps.init())
        // Phase 1: Mangle all props except DOM & built-ins. (Reserved props are built-ins
        // that terser doesn't know about yet, but which will break the game if they get mangled.)
        .pipe(terser({
            toplevel: true,
            nameCache: cache,
            mangle: {
                properties: {
                    reserved: [
                        'imageSmoothingEnabled',
                        'KeyW',
                        'KeyA',
                        'KeyS',
                        'KeyD',
                        'ArrowUp',
                        'ArrowLeft',
                        'ArrowDown',
                        'ArrowRight',
                        'Escape',
                        'Space',
                        'Enter',
                        'OS13kMusic,Wizard with a Shotgun - Oblique Mystique'
                    ]
                }
            }
        }))
        // Phase 2: Specifically target properties we know match builtins but that
        // we can still safely mangle (because we don't refer to the builtin).
        .pipe(terser({
            nameCache: cache,
            mangle: {
                properties: {
                    builtins: true,
                    regex: /^(behavior|direction|frame|reset|update|anchor|DEAD|canvas|entities|history|pressed|page|paused|resize|reload|pages|pattern|pause|unpause|sheet|state|init|play|text)$/
                }
            }
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/temp'));
}

async function packBuild() {
    const packer = new roadroller.Packer([
        {
            data: fs.readFileSync('dist/temp/app.js', 'utf8'),
            type: 'js',
            action: 'eval'
        }
    ]);

    await packer.optimize();

    const { firstLine, secondLine } = packer.makeDecoder();

    fs.writeFileSync('dist/temp/app.packed.js', firstLine + secondLine, 'utf8');
}

const buildJs = gulp.series(
    compileBuild,
    minifyBuild,
    ...(dist ? [packBuild] : [async () => log.info('Skipping packBuild (not --dist).')])
);

// -----------------------------------------------------------------------------
// CSS Build
// -----------------------------------------------------------------------------
function buildCss() {
    return gulp.src('src/css/*.css')
        .pipe(concat('app.css'))
        .pipe(cleancss())
        .pipe(gulp.dest('dist/temp'));
}

// -----------------------------------------------------------------------------
// Assets Build
// -----------------------------------------------------------------------------
async function exportSpriteSheet() {
    let src = 'src/assets/*.aseprite';
    let png = 'src/assets/generated/spritesheet-gen.png';
    let data = 'src/assets/generated/spritesheet-gen.json';

    try {
        await AsepriteCli.exec(`--batch ${src} --sheet-type rows --sheet ${png} --data ${data} --format json-array`);
    } catch (e) {
        log.error(e);
        log.warn(chalk.red('Failed to update sprite sheet, but building anyway...'));
    }
}

async function generateSpriteSheetData() {
    let data = 'src/assets/generated/spritesheet-gen.json';
    let image = 'dist/temp/sprites.png';
    let output = 'src/js/generated/SpriteSheet-gen.js';

    await ImageDataParser.parse(data, image, output);
}

async function exportTileSheet() {
    let src = 'src/assets/tiles.aseprite';
    let png = 'src/assets/generated/tiles-gen.png';

    try {
        await AsepriteCli.exec(`--batch ${src} --sheet-type rows --sheet-width 32 --sheet ${png}`);
    } catch (e) {
        log.error(e);
        log.warn(chalk.red('Failed to update tile sheet, but building anyway...'));
    }
}

function copyAssets() {
    let pipeline = gulp.src('src/assets/generated/spritesheet-gen.png')
        .pipe(size({ title: 'spritesheet  pre' }));

    if (!fast) {
        pipeline = pipeline
        .pipe(imagemin())
        .pipe(imagemin([
            advpng({ optimizationLevel: 4, iterations: 20 })
        ]));
    }

    return pipeline
        .pipe(size({ title: 'spritesheet post' }))
        .pipe(rename('sprites.png'))
        .pipe(gulp.dest('dist/temp'));
}

async function pngoutAssets() {
    // This step relies on a new tool "pngout", comment out if not available.
    // This saves me an extra 20 bytes on the spritesheet.
    // childProcess.execSync('pngout dist/temp/sprites.png');
}

async function generateLevelData() {
    const levelGlob = 'src/assets/level*.tmx';
    const outputFile = 'src/js/generated/LevelData-gen.js';

    await LevelConverter.convert(levelGlob, outputFile);
}

function copyFinalSprites() {
    return gulp.src('dist/temp/sprites.png')
        .pipe(gulp.dest('dist/final'));
}

const buildAssets = gulp.series(
    exportSpriteSheet,
    exportTileSheet,
    copyAssets,
    pngoutAssets,
    generateSpriteSheetData,
    generateLevelData,
    copyFinalSprites
);

// -----------------------------------------------------------------------------
// HTML Build
// -----------------------------------------------------------------------------
function buildHtml() {
    const cssContent = fs.readFileSync('dist/temp/app.css');
    const jsContent = fs.readFileSync(dist ? 'dist/temp/app.packed.js' : 'dist/temp/app.js');

    return gulp.src('src/index.html')
        .pipe(template({ css: cssContent, js: jsContent }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        //.pipe(gulp.src('dist/temp/app.js.map'))
        .pipe(gulp.dest('dist/build'));
}

// -----------------------------------------------------------------------------
// ZIP Build
// -----------------------------------------------------------------------------
function buildZip() {
    let s;

    return gulp.src(['dist/build/*', '!dist/build/*.map'])
        .pipe(size())
        .pipe(zip('js13k-2023-harold-is-heavy.zip'))
        .pipe(advzip({ optimizationLevel: 4, iterations: 200 }))
        .pipe(s = size({ title: 'zip' }))
        .pipe(gulp.dest('dist/final'))
        .on('end', () => {
            let remaining = (13 * 1024) - s.size;
            if (remaining < 0) {
                log.warn(chalk.red(`${-remaining} bytes over`));
            } else {
                log.info(chalk.green(`${remaining} bytes remaining`));
            }
        });
}

// -----------------------------------------------------------------------------
// Build
// -----------------------------------------------------------------------------
const build = gulp.series(
    buildAssets,
    buildJs,
    buildCss,
    buildHtml,
    ...(dist ? [buildZip] : [async () => log.info('Skipping buildZip (not --dist).')]),
    ready,
);

async function ready() {
    return;
    if (!watching) return;

    const BELL = '\u0007';
    const REVERSE = '\x1B[?5h';
    const NORMAL = '\x1B[?5l';

    process.stdout.write(`${BELL}${REVERSE}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    process.stdout.write(`${NORMAL}\n`);
}

// -----------------------------------------------------------------------------
// Watch
// -----------------------------------------------------------------------------
function watch() {
    watching = true;

    gulp.watch(['src/**', '!src/**/generated/**'], build);
}

// -----------------------------------------------------------------------------
// Task List
// -----------------------------------------------------------------------------
export {
    compileBuild,
    minifyBuild,
    buildJs,
    buildCss,
    buildAssets,
    buildHtml,
    buildZip,
    build,
    watch
};

export default gulp.series(build, watch);
