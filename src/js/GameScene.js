// GameScene

import { Audio } from './Audio';
import { BigArrowParticle } from './BigArrowParticle';
import { Camera } from './Camera';
import { CloudParticle } from './CloudParticle';
import { TARGET_GAME_HEIGHT, TARGET_GAME_WIDTH, TILE_SIZE, INVENTORY_WOOD_POS, INVENTORY_MEAT_POS, INVENTORY_STONE_POS, INVENTORY_TORCH_POS, SANITY_POS } from './Constants';
import { FallingDirtParticle } from './FallingDirtParticle';
import { game } from './Game';
import { LandingParticle } from './LandingParticle';
import { Replay } from './Replay';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { SacrificeParticle } from './SacrificeParticle';
import { clamp, qr2xy, uv2xy, xy2qr, xy2uv, rgba } from './Util';
import { Viewport } from './Viewport';
import { Button } from './Button';
import { Input } from './input/Input';
import { Villager, IDLE, BUTCHER, WOODCUTTER, TALLOWER, STONECUTTER, FIREKEEPER, TOTEMCARVER, SACRIFICE } from './Villager';
import { TextFloatParticle } from './TextFloatParticle';

import { HelpScene } from './HelpScene';
import { DefeatScene } from './DefeatScene';

import { HeightMapData } from './generated/HeightMapData-gen';

const BUTTON_RECRUIT_VILLAGER = 0;
const BUTTON_REPAIR_BRIDGE = 1;
const BUTTON_REPAIR_HALL = 2;
const BUTTON_REPAIR_ALTAR = 3;

export class GameScene {
    constructor() {
        game.gameScene = this;
        this.entities = [];
        this.screenshakes = [];

        // Clock
        this.t = 0;
        this.influence = 5;
        this.sanity = 100;

        // Inventory
        this.meat = 0;
        this.wood = 0;
        this.stone = 0;
        this.torches = 0;

        // Playthrough Stats
        this.meatGathered = 0;
        this.woodGathered = 0;
        this.stoneGathered = 0;
        this.villagersRecruited = 0;
        this.torchesCrafted = 0;

        this.buttons = [];
        //this.buttons[BUTTON_RECRUIT_VILLAGER] = new Button(20, 140, 'V', 'Recruit Villager');
        this.buttons[BUTTON_RECRUIT_VILLAGER] = new Button((320-80)/2, 15, 'V', 'Recruit Villager');
        this.buttons[BUTTON_REPAIR_BRIDGE] = new Button(240, 100, 'B', 'REPAIR BRIDGE');
        this.buttons[BUTTON_REPAIR_HALL] = new Button(240, 100, 'T', 'REPAIR TALLOW HALL');
        this.buttons[BUTTON_REPAIR_ALTAR] = new Button(240, 100, 'A', 'BUILD ALTAR');

        this.selectedJob = WOODCUTTER;
        this.jobsDisplayed = [WOODCUTTER];

        this.villagers = [];
        this.villagersWithJob = {
            [IDLE]: [],
            [BUTCHER]: [],
            [WOODCUTTER]: [],
            [TALLOWER]: [],
            [STONECUTTER]: [],
            [FIREKEEPER]: [],
            [SACRIFICE]: []
        };

        this.techBridge = false;
        this.techTorches = false;
        this.techStone = false;
        this.techAltar = false;
    }

    update() {
        // Set up displayed jobs
        if (this.techStone) {
            this.jobsDisplayed = [BUTCHER, WOODCUTTER, TALLOWER, STONECUTTER];
        } else if (this.techTorches) {
            this.jobsDisplayed = [BUTCHER, WOODCUTTER, TALLOWER];
        } else if (this.techBridge) {
            this.jobsDisplayed = [BUTCHER, WOODCUTTER];
        } else {
            this.jobsDisplayed = [WOODCUTTER];
        }

        if (this.torches > 0 && !this.techStone) {
            this.techStone = true;
        }

        // Player input

                // move
        ///this.pos.x += this.vel.x;
        ///this.pos.y += this.vel.y;

        if (Input.pressed[Input.Action.RECRUIT_VILLAGER]) {
            console.log(this.recruitVillager());
        }

        if (Input.pressed[Input.Action.BUILD_BRIDGE]) {
            console.log(this.buildBridge());
        }

        if (Input.pressed[Input.Action.BUILD_HALL]) {
            console.log(this.buildHall());
        }

        if (Input.pressed[Input.Action.BUILD_ALTAR]) {
            console.log(this.buildAltar());
        }

        if (Input.pressed[Input.Action.DOWN]) {
            this.moveJobSelector(1);
        }

        if (Input.pressed[Input.Action.UP]) {
            this.moveJobSelector(-1);
        }

        if (Input.pressed[Input.Action.RIGHT]) {
            console.log(this.hireVillager(this.selectedJob));
        }

        if (Input.pressed[Input.Action.LEFT]) {
            console.log(this.fireVillager(this.selectedJob));
        }

        if (Input.pressed[Input.Action.SACRIFICE]) {
            console.log(this.sacrificeVillager());
        }

        if (Input.pressed[Input.Action.JUMP]) {
            this.sanity -= 10;
        }

        // Game ticks

        this.t++;

        if (!this.nextSanityTick) {
            this.nextSanityTick = this.t + 12;
        }

        if (this.t >= this.nextSanityTick) {
            this.sanity -= 0.2;
            this.influence += 0.2;
            this.nextSanityTick = this.t + 12;
        }

        if (this.t === 4) {
        //    Audio.play(Audio.levelStart);
        }

        // Button UI Elements

        this.buttons[BUTTON_RECRUIT_VILLAGER].active = (this.influence >= this.nextWorkerCost());
        this.buttons[BUTTON_RECRUIT_VILLAGER].visible = (this.villagersRecruited > 0 || this.buttons[BUTTON_RECRUIT_VILLAGER].active);

        this.buttons[BUTTON_REPAIR_BRIDGE].active = (this.wood >= 10);
        this.buttons[BUTTON_REPAIR_BRIDGE].visible = !this.techBridge && this.wood >= 10;

        this.buttons[BUTTON_REPAIR_HALL].active = (this.wood >= 10);
        this.buttons[BUTTON_REPAIR_HALL].visible = this.techBridge && !this.techTorches && this.wood >= 10;

        this.buttons[BUTTON_REPAIR_ALTAR].active = (this.stone >= 10);
        this.buttons[BUTTON_REPAIR_ALTAR].visible = this.techTorches && !this.techAltar && this.stone >= 10;

        // Villagers

        for (const villager of this.villagers) {
            villager.update();
        }

        // Entities

        for (const entity of this.entities) {
            entity.update();
        }
        this.entities = this.entities.filter(entity => !entity.cull);

        // Active Sacrifice

        if (this.activeSacrifice) {
            this.activeSacrifice.update();
            if (this.activeSacrifice.cull) {
                this.activeSacrifice = undefined;
            }
        }

        // Check

        if (this.sanity < 0) {
            this.playerLost();
        }

        return;

        //let levelBottomY = qr2xy({ q: 0, r: this.tiles.length - 1 }).y;
        let levelBottomY = 100;
        let cameraMaxY = levelBottomY - (TARGET_GAME_HEIGHT / 2);

        /*Camera.forceTarget = {
            x: this.player.pos.x,
            y: Math.min(this.player.pos.y, cameraMaxY)
        };*/
        //Camera.update();

        Camera.pos.x = (Camera.pos.x * 0.92 + this.player.pos.x * 0.08);
        Camera.pos.y = Math.min((Camera.pos.y * 0.92 + this.player.pos.y * 0.08), cameraMaxY);

        if (this.player.pos.y > levelBottomY) {
            this.player.dieFalling(levelBottomY);
        }

        let entities = [...this.entities];

        for (const entity of entities) {
            entity.update();
        }

        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].cull) {
                this.entities.splice(i, 1);
                i--;
            }
        }

        // Tick screenshakes and cull finished screenshakes
        for (let i = 0; i < this.screenshakes.length; i++) {
            if (!this.screenshakes[i].update()) {
                this.screenshakes.splice(i, 1);
                i--;
            }
        }

        // Tick tileshakes and cull finished tileshakes
        for (let i = 0; i < this.tileshakes.length; i++) {
            if ((this.tileshakes[i].s++ > 15)) {
                this.tileshakes.splice(i, 1);
                i--;
            }
        }

        if (this.fallingDirtCounter > 0) {
            this.fallingDirtCounter--;
            this.spawnFallingDirt();
        }

        if (this.lightUpSlamTiles > 0) {
            this.lightUpSlamTiles--;
        }

        this.spawnClouds();
    }

    draw() {
        // Terrain

        Viewport.ctx.fillStyle = '#40985e';
        Viewport.ctx.fillRect(-5, 0, Viewport.width + 5, Viewport.height);

        Viewport.ctx.drawImage(Sprite.terrain[2].img, 0, -30);
        Viewport.ctx.drawImage(Sprite.terrain[1].img, 0, -30);
        Viewport.ctx.drawImage(Sprite.terrain[0].img, 0, -30);

        Viewport.ctx.fillStyle = '#0a1a2f';
        Viewport.ctx.fillRect(-5, Viewport.height - 31, Viewport.width + 5, 31);

        // Bridge

        if (this.techBridge) {
            Viewport.ctx.drawImage(Sprite.bridge[1].img, 112, 133 - 32);
        } else {
            Viewport.ctx.drawImage(Sprite.bridge[0].img, 112, 133 - 32);
        }

        // Tallower Hall

        if (this.techTorches) {
            Viewport.ctx.drawImage(Sprite.factory[1].img, 198, 133 - 32);
        } else {
            Viewport.ctx.drawImage(Sprite.factory[0].img, 198, 133 - 32);
        }

        // Altar

        this.techAltar = true;
        if (this.activeSacrifice) {
            this.activeSacrifice.draw();
        } else {
            if (this.techAltar) {
                Viewport.ctx.drawImage(Sprite.altar[1].img, 103, 93 - 32);
            } else {
                Viewport.ctx.drawImage(Sprite.altar[0].img, 103, 93 - 32);
            }
            Viewport.ctx.drawImage(Sprite.tree[0].img, 110, 64 - 32);
        }

        if (true) {
            let crunk = String(Math.floor(this.sanity)) + ',' + String(Math.floor(this.influence)) + ',' + String(this.villagers.length);
            Text.drawText(Viewport.ctx, crunk, 3, 3, 1, Text.palette[1]);
        }

        for (const villager of this.villagers) {
            villager.draw();
        }

        for (const button of this.buttons) {
            button.draw();
        }

        this.drawSanityBar();
        this.drawInfluenceBar();
        this.drawJobSelectUI();
        this.drawInventory();

        for (const entity of this.entities) {
            entity.draw();
        }

        // Preview walking path
        /*for (let x = 0; x < 320; x++) {
            Viewport.ctx.drawImage(Sprite.icons[1].img, x, HeightMapData[3][x]);
        }*/

        return;

        let bottomSea = 4;
        let topSea = 14;
        let percentage = Math.floor(clamp(this.player.pos.y / (this.tiles.length * TILE_SIZE), 0, Infinity) * (topSea - bottomSea) + bottomSea);

        Viewport.ctx.fillStyle = '#4b3b9c';
        Viewport.ctx.fillRect(0, Viewport.height - percentage, Viewport.width, percentage);

        /*Viewport.ctx.fillStyle = '#8fcccb';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 2, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#449489';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 4, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#285763';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 6, Viewport.width, 1);*/

        // Render screenshakes (canvas translation)
        let shakeX = 0, shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        Viewport.ctx.translate(shakeX, shakeY);

        for (let entity of this.entities) {
            if (entity.z === -1) entity.draw();
        }

        this.drawTileShakemap();
        this.drawTiles();

        let overlayEntities = [];

        for (let entity of this.entities) {
            if (entity.z > -1) entity.draw();

            if (entity.displayOverlay) {
                overlayEntities.push(entity);
            }
        }

        //Text.drawText(Viewport.ctx, `${this.littlePigsRescued}/${this.littlePigs}`, 180, 5, 1, Text.duotone, Text.black);
        //Text.drawText(Viewport.ctx, 'PRESS mnop\nTO DO', 10, 100, 1, Text.tan, Text.shadow);

        for (let entity of overlayEntities) {
            entity.drawOverlay();
        }

        let pigsToShow = clamp(Math.floor(this.t / 5) - 5, 0, this.littlePigs);
        for (let i = 0; i < pigsToShow; i++) {
            let frame = (this.littlePigsRescued > i) ? 0 : 3;
            Viewport.ctx.drawImage(Sprite.littlepig[0][frame].img, Viewport.width - i * 11 - 13, 3);
        }
    }


    drawSanityBar() {
        let k = Math.floor((this.sanity / 100) * 78);
        Viewport.ctx.drawImage(Sprite.sanitybar[0].img, 320-18-5, -3);
        Viewport.ctx.drawImage(Sprite.sanitybar[1].img, 320-18-5, -3);
        Viewport.ctx.drawImage(Sprite.sanitybar[2].img,
            0, 2 + (78 - k),
            18, k,
            320-18-5, -3 + 2 + (78 - k),
            18, k
        );
    }

    drawInfluenceBar() {
        let k = Math.floor(Math.min(this.influence / this.nextWorkerCost(), 1) * 80);
        Viewport.ctx.drawImage(Sprite.influencebar[0].img, (320-80)/2, 3);
        Viewport.ctx.drawImage(Sprite.influencebar[1].img,
            2, 3,
            k, 4,
            (320-80)/2 + 2, 3 + 3,
            k, 4
        );
    }

    drawJobSelectUI() {
        const cornerX = 7;
        const cornerY = 120;
        const verticalMargin = 10;

        let selectedIdx = 0;

        for (let i = 0; i < this.jobsDisplayed.length; i++) {
            if (this.selectedJob === this.jobsDisplayed[i]) {
                selectedIdx = i;
            }

            const color = this.selectedJob === this.jobsDisplayed[i] ? Text.palette[3] : Text.palette[2];
            const numberText = String(this.villagersWithJob[this.jobsDisplayed[i]].length);
            const width = Text.measure(numberText).w;
            Text.drawText(Viewport.ctx, Villager.JOB_NAMES[this.jobsDisplayed[i]], cornerX + 5, cornerY + 4 + verticalMargin * i, 1, color);
            Text.drawText(Viewport.ctx, numberText, cornerX + 92 - width, cornerY + 4 + verticalMargin * i, 1, color);
        }

        const leftArrow = this.villagersWithJob[this.selectedJob].length > 0 ? 0 : 2;
        const rightArrow = this.villagersWithJob[IDLE].length > 0 ? 1 : 3;

        Viewport.ctx.drawImage(Sprite.jobselect[1].img, cornerX, cornerY + selectedIdx * verticalMargin);
        Viewport.ctx.drawImage(Sprite.smallarrows[leftArrow].img, cornerX + 77, cornerY + 4 + selectedIdx * verticalMargin);
        Viewport.ctx.drawImage(Sprite.smallarrows[rightArrow].img, cornerX + 94, cornerY + 4 + selectedIdx * verticalMargin);
    }

    drawInventory() {
        let woodWidth = Text.measure(String(this.wood), 1).w;
        let meatWidth = Text.measure(String(this.meat), 1).w;
        let stoneWidth = Text.measure(String(this.stone), 1).w;
        let torchWidth = Text.measure(String(this.torches), 1).w;

        Viewport.ctx.drawImage(Sprite.icons[0].img, INVENTORY_WOOD_POS.u - 60, INVENTORY_WOOD_POS.v - 1);
        Text.drawText(Viewport.ctx, 'WOOD', INVENTORY_WOOD_POS.u - 50, INVENTORY_WOOD_POS.v, 1, Text.palette[4]);
        Text.drawText(Viewport.ctx, String(this.wood), INVENTORY_WOOD_POS.u - woodWidth, INVENTORY_WOOD_POS.v, 1, Text.palette[4]);

        if (this.techBridge) {
            Viewport.ctx.drawImage(Sprite.icons[2].img, INVENTORY_MEAT_POS.u - 60, INVENTORY_MEAT_POS.v - 1);
            Text.drawText(Viewport.ctx, 'MEAT', INVENTORY_MEAT_POS.u - 50, INVENTORY_MEAT_POS.v, 1, Text.palette[4]);
            Text.drawText(Viewport.ctx, String(this.meat), INVENTORY_MEAT_POS.u - meatWidth, INVENTORY_MEAT_POS.v, 1, Text.palette[4]);
        }

        if (this.techTorches) {
            Viewport.ctx.drawImage(Sprite.icons[3].img, INVENTORY_TORCH_POS.u - 60, INVENTORY_TORCH_POS.v - 1);
            Text.drawText(Viewport.ctx, 'TORCHES', INVENTORY_TORCH_POS.u - 50, INVENTORY_TORCH_POS.v, 1, Text.palette[4]);
            Text.drawText(Viewport.ctx, String(this.torches), INVENTORY_TORCH_POS.u - torchWidth, INVENTORY_TORCH_POS.v, 1, Text.palette[4]);
        }

        if (this.techStone) {
            Viewport.ctx.drawImage(Sprite.icons[1].img, INVENTORY_STONE_POS.u - 60, INVENTORY_STONE_POS.v - 1);
            Text.drawText(Viewport.ctx, 'STONE', INVENTORY_STONE_POS.u - 50, INVENTORY_STONE_POS.v, 1, Text.palette[4]);
            Text.drawText(Viewport.ctx, String(this.stone), INVENTORY_STONE_POS.u - stoneWidth, INVENTORY_STONE_POS.v, 1, Text.palette[4]);
        }

    }

    drawTileShakemap() {
        for (let r = 0; r < this.tileshakemap.length; r++) {
            for (let q = 0; q < this.tileshakemap[0].length; q++) {
                this.tileshakemap[r][q].x = 0;
                this.tileshakemap[r][q].y = 0;
            }
        }

        for (let i = 0; i < this.tileshakes.length; i++) {
            let tileshake = this.tileshakes[i];
            for (let tile of tileshake.tiles) {
                //this.tileshakemap[tile.r][tile.q].x += tileshake.screenshake.x;
                let k = 0;
                if (tileshake.s < 9) k++;
                if (tileshake.s < 6) k++;
                if (tileshake.s < 4) k++;
                if (tileshake.s < 2) k++;
                this.tileshakemap[tile.r][tile.q].y += k;
            }
        }
    }

    tileIsPassable(q, r) {
        return true;
        if (r < 0 || r >= this.tiles.length) return true;
        if (q < 0 || q >= this.tiles[0].length) return true;
        return this.tiles[r][q] < 1 || this.tiles[r][q] === 6;
    }

    entityIsOnSolidGround(entity) {
        let qr = xy2qr({ x: entity.pos.x, y: entity.pos.y + entity.bb[1].y });

        return !this.tileIsPassable(qr.q, qr.r);
    }

    landedOnTile(tile, superslamFlag) {
        if (superslamFlag) {
            for (let i = 0; i < this.superslamTiles.length; i++) {
                let slam = this.superslamTiles[i];
                if (tile.r === slam.r && tile.q >= slam.q1 && tile.q <= slam.q2) {
                    for (let q = slam.q1; q <= slam.q2; q++) {
                        this.tiles[slam.r + 1][q] = this.tiles[slam.r][q];
                        this.tiles[slam.r][q] = this.tiles[slam.r + 1][q] === 5 ? 6 : 0;

                        let xy = this.player.pos;
                        this.addEntity(new BigArrowParticle({ x: xy.x, y: xy.y }));
                    }
                }
            }
        }

        for (let entity of this.entities) {
            if (entity.landedOnTile) entity.landedOnTile(tile);
        }

        this.addEntity(new LandingParticle(this.player.pos));
        this.addEntity(new LandingParticle(this.player.pos));
        this.addEntity(new LandingParticle(this.player.pos));
        this.addEntity(new LandingParticle(this.player.pos));

        this.lightUpSlamTiles = 12;

        this.fallingDirtCounter = 4;
    }

    spawnFallingDirt() {
        for (let i = 0; i < this.superslamTiles.length; i++) {
            let slam = this.superslamTiles[i];
            if (!this.tileIsPassable(slam.q1, slam.r)) {
                let x = (slam.q1 + Math.random() * (slam.q2 + 1 - slam.q1)) * TILE_SIZE;
                let y = slam.r * TILE_SIZE + TILE_SIZE + 1;
                this.addEntity(new FallingDirtParticle({ x: x, y: y }));
            }
        }
    }

    addEntity(entity) {
        if (!entity.z) {
            entity.z = 1;
        }

        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].z > entity.z) {
                this.entities.splice(i, 0, entity);
                return;
            }
        }

        this.entities.push(entity);
    }

    addScreenShake(screenshake) {
        // This screen shake applies to the entire rendered screen, including GUI
        this.screenshakes.push(screenshake);
    }

    addTileShake(screenshake, originQR) {
        let tiles = [];

        for (let q = originQR.q; q >= 0; q--) {
            if (this.tileIsPassable(q, originQR.r - 1) && !this.tileIsPassable(q, originQR.r)) {
                tiles.push({ q: q, r: originQR.r });
            } else {
                break;
            }
        }
        for (let q = originQR.q + 1; q < this.tiles[0].length; q++) {
            if (this.tileIsPassable(q, originQR.r - 1) && !this.tileIsPassable(q, originQR.r)) {
                tiles.push({ q: q, r: originQR.r });
            } else {
                break;
            }
        }

        this.tileshakes.push({
            screenshake: screenshake,
            tiles: tiles,
            s: 0
        });
    }

    extractSuperslamTiles(originQR) {
        let r = originQR.r;
        let q1 = originQR.q;
        let q2 = originQR.q;

        for (let q = originQR.q; q >= 0; q--) {
            if (this.tileIsPassable(q, originQR.r + 1) && !this.tileIsPassable(q, originQR.r)) {
                q1 = q;
            } else {
                break;
            }
        }
        for (let q = originQR.q + 1; q < this.tiles[0].length; q++) {
            if (this.tileIsPassable(q, originQR.r + 1) && !this.tileIsPassable(q, originQR.r)) {
                q2 = q;
            } else {
                break;
            }
        }

        return {
            r: r,
            q1: q1,
            q2: q2
        };
    }

    spawnClouds() {
        let clouds = this.entities.filter(entity => entity instanceof CloudParticle).length;
        if (clouds < 1) {
            this.addEntity(new CloudParticle());
            this.lastCloud = this.t;
        }

        if (this.t - this.lastCloud > 60 * 5 && Math.random() < 0.01) {
            this.addEntity(new CloudParticle());
            this.lastCloud = this.t;
        }
    }

    moveJobSelector(delta) {
        let idx = this.jobsDisplayed.indexOf(this.selectedJob);
        idx = (idx + delta + this.jobsDisplayed.length) % this.jobsDisplayed.length;
        this.selectedJob = this.jobsDisplayed[idx];
    }

    recruitVillager() {
        const cost = this.nextWorkerCost();
        if (this.influence >= cost) {
            this.influence -= cost;

            const villager = new Villager(this.selectedJob || WOODCUTTER);
            this.villagers.push(villager);
            this.villagersWithJob[villager.job].push(villager);
            this.villagersRecruited++;

            return true;
        }

        return false;
    }

    hireVillager() {
        if (this.villagersWithJob[IDLE].length > 0) {
            // TODO
            const villager = this.villagersWithJob[IDLE].pop();
            villager.job = this.selectedJob;
            this.villagersWithJob[this.selectedJob].push(villager);
            return true;
        }
        return false;
    }

    fireVillager() {
        if (this.villagersWithJob[this.selectedJob].length > 0) {
            // TODO
            const villager = this.villagersWithJob[this.selectedJob].pop();
            villager.job = IDLE;
            this.villagersWithJob[IDLE].push(villager);
            return true;
        }
        return false;
    }

    sacrificeVillager() {
        if (this.villagersWithJob[this.selectedJob].length > 0) {
            // TODO
            const villager = this.villagersWithJob[this.selectedJob].pop();
            villager.job = SACRIFICE;
            this.villagersWithJob[SACRIFICE].push(villager);
            this.activeSacrifice = new SacrificeParticle();
            return true;
        }
        return false;
    }

    beginSacrifice(villager) {
        this.villagersWithJob[SACRIFICE].splice(this.villagersWithJob[SACRIFICE].indexOf(villager), 1);
        this.villagers.splice(this.villagers.indexOf(villager), 1);
        this.activeSacrifice.villager = villager;
        console.log('VILLAGER DEAD');
    }

    consumeMeat() {
        if (this.meat > 0) {
            this.meat--;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_MEAT_POS.u + 6, v: INVENTORY_MEAT_POS.v }, '-1', [4, 2]));
        } else {
            this.sanity--;
            this.entities.push(new TextFloatParticle({ u: SANITY_POS.u, v: SANITY_POS.v }, '-1', [0, 2]));
        }
    }

    grantSanity() {
        if (this.sanity < 100) {
            this.sanity++;
            this.entities.push(new TextFloatParticle({ u: SANITY_POS.u, v: SANITY_POS.v }, '+1', [0, 2]));
        }
    }

    gatherMeat() {
        this.meat += 5;
        this.meatGathered += 5;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: INVENTORY_MEAT_POS.u + 6, v: INVENTORY_MEAT_POS.v }, '+5', [4, 2]));
    }

    gatherWood() {
        this.wood += 5;
        this.woodGathered += 5;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '+5', [4, 2]));
    }

    craftTorch() {
        this.torches += 1;
        this.torchesCrafted += 1;
        this.wood -= 2;
        this.meat -= 2;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: INVENTORY_TORCH_POS.u + 6, v: INVENTORY_TORCH_POS.v }, '+1', [4, 2]));
        this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '-2', [4, 2]));
        this.entities.push(new TextFloatParticle({ u: INVENTORY_MEAT_POS.u + 6, v: INVENTORY_MEAT_POS.v }, '-2', [4, 2]));
    }

    gatherStone() {
        this.stone += 5;
        this.stoneGathered += 5;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: 100, v: 100 }, '+5', [4, 2]));
        this.entities.push(new TextFloatParticle({ u: INVENTORY_STONE_POS.u + 6, v: INVENTORY_STONE_POS.v }, '+5', [4, 2]));
    }

    buildBridge() {
        const button = this.buttons[BUTTON_REPAIR_BRIDGE];

        if (button.active && button.visible && this.wood >= 10 && !this.techBridge) {
            this.wood -= 10;
            this.techBridge = true;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '-10', [4, 2]));

            // TODO build bridge animation
        }
    }

    buildHall() {
        const button = this.buttons[BUTTON_REPAIR_HALL];

        if (button.active && button.visible && this.wood >= 10 && !this.techTorches) {
            this.wood -= 10;
            this.techTorches = true;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '-10', [4, 2]));

            // TODO build hall animation
        }
    }

    buildAltar() {
        const button = this.buttons[BUTTON_REPAIR_ALTAR];

        if (button.active && button.visible && this.stone >= 10 && !this.techAltar) {
            this.stone -= 10;
            this.techAltar = true;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_STONE_POS.u + 6, v: INVENTORY_STONE_POS.v }, '-10', [4, 2]));

            // TODO build altar animation
        }
    }

    nextWorkerCost() {
        return Math.floor(1 * Math.pow(1.3, this.villagers.length));
    }

    playerLost() {
        const stats = {
            seconds: Math.floor(this.t / 60),
            woodGathered: this.woodGathered,
            meatGathered: this.meatGathered,
            torchesCrafted: this.torchesCrafted,
            stoneGathered: this.stoneGathered,
        };
        game.scenes.pop();
        game.scenes.push(new DefeatScene(stats));
    }
}
