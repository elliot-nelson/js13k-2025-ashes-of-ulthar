// GameScene

import { Audio } from './Audio';
import { INVENTORY_POS, SEPTAGRAM_FLAMES, PALETTE, RESOURCE_NAMES } from './Constants';
import { game } from './Game';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { SacrificeParticle } from './SacrificeParticle';
import { Viewport } from './Viewport';
import { Button } from './Button';
import { Input } from './input/Input';
import { Villager, SillyTask, IDLE, BUTCHER, WOODCUTTER, TALLOWER, STONECUTTER, CANTOR } from './Villager';
import { WinkParticle } from './WinkParticle';
import { ScreenShake } from './ScreenShake';
import { clamp, createCanvas } from './Util';

import { HelpScene } from './HelpScene';
import { TechScene } from './TechScene';
import { GameOverScene } from './GameOverScene';
import { AshParticle } from './AshParticle';

import { TechTree } from './TechTree';
import { drawBlackCat } from './BlackCat';

const BUTTON_RECRUIT_VILLAGER = 0;
const BUTTON_SACRIFICE_VILLAGER = 1;
const BUTTON_SUMMON_FREEDOM = 2;
const BUTTON_CODEX = 3;
const BUTTON_HELP = 4;

const SANITY = 0;
const INFLUENCE = 1;
const WOOD = 2;
const MEAT = 3;
const TORCHES = 4;
const STONE = 5;

export class GameScene {
    constructor() {
        game.gameScene = this;
        this.entities = [];
        this.screenshakes = [];

        // Inventory
        this.resources = [100, 1, 0, 0, 0, 0];
        this.resourcesDisplayed = [0, 1, 0, 0, 0, 0];
        this.gathered = [0, 1, 0, 0, 0, 0];

        // Clock
        this.t = 0;

        this.villagersRecruited = 0;
        this.freedom = 0;

        this.buttons = [
            new Button(5, 3, 'V', 'RECRUIT VILLAGER'),
            new Button(5, 15, 'S', 'SACRIFICE VILLAGER'),
            new Button(5, 27, 'F', 'LIGHT FREEDOM'),
            new Button(275, 156, 'C', 'CODEX'),
            new Button(275, 168, 'H', 'HELP')
        ];
        this.buttons[BUTTON_CODEX].active = true;
        this.buttons[BUTTON_HELP].visible = true;
        this.buttons[BUTTON_HELP].active = true;

        //this.recruitProgressBar = createProgressBar('RECRUIT VILLAGER', PALETTE[4]);
        //this.sacrificeProgressBar = createProgressBar('SACRIFICE VILLAGER', PALETTE[4]);

        this.selectedJob = WOODCUTTER;
        this.jobsDisplayed = [WOODCUTTER];
        this.inventoryDisplayed = [WOOD];

        this.villagers = [];
        this.villagersWithJob = [[], [], [], [], [], [], [], []];

        // These two fake villagers are for laughs
        let villager = new Villager(IDLE);
        villager.task = new SillyTask(-50);
        this.villagers.push(villager);
        villager = new Villager(IDLE);
        villager.task = new SillyTask(80);
        this.villagers.push(villager);

        this.tech = TechTree.create();
        this.unlockTech(this.tech.woodcutter);

        // DEBUG
        /*
        this.unlockTech(this.tech.butcher);
        this.unlockTech(this.tech.tallower);
        this.unlockTech(this.tech.stonecutter);
        this.resources[WOOD] = 50;
        this.resources[MEAT] = 50;
        this.resources[TORCHES] = 50;
        this.resources[STONE] = 50;
        */
    }

    update(handleInput = true) {
        this.jobsDisplayed = [WOODCUTTER];
        this.inventoryDisplayed = [WOOD, MEAT];

        if (this.tech.butcher.unlocked) {
            this.jobsDisplayed.push(BUTCHER);
        }
        if (this.tech.tallower.unlocked) {
            this.jobsDisplayed.push(TALLOWER);
            this.inventoryDisplayed.push(TORCHES);
        }
        if (this.tech.stonecutter.unlocked) {
            this.jobsDisplayed.push(STONECUTTER);
            this.inventoryDisplayed.push(STONE);
        }
        if (this.tech.cantor.unlocked) {
            this.jobsDisplayed.push(CANTOR);
        }

        // Player input

        if (handleInput) {
            if (Input.pressed['KeyV']) {
                this.recruitVillager();
            }

            if (Input.pressed['KeyS']) {
                this.sacrificeVillager();
            }

            if (Input.pressed['KeyF']) {
                this.lightFreedom();
            }

            if (Input.pressed['ArrowDown']) {
                this.moveJobSelector(1);
            }

            if (Input.pressed['ArrowUp']) {
                this.moveJobSelector(-1);
            }

            if (Input.pressed['ArrowRight']) {
                this.hireVillager(this.selectedJob);
            }

            if (Input.pressed['ArrowLeft']) {
                this.fireVillager(this.selectedJob);
            }

            /*if (Input.pressed['Space']) {
                this.resources[SANITY] -= 10;
            }*/

            if (Input.pressed['KeyC']) {
                game.scenes.push(new TechScene(this.tech));
            }

            if (Input.pressed['KeyH']) {
                game.scenes.push(new HelpScene());
            }
        }

        // Game ticks

        this.t++;

        if (!this.nextSanityTick) {
            this.nextSanityTick = this.t + 12;
        }

        if (this.t >= this.nextSanityTick) {
            if (this.villagersRecruited > 0) {
                let drain = 0.2 + (this.freedom * 0.15);
                if (this.tech.sanityplusplus) {
                    drain *= 0.6;
                } else if (this.tech.sanityplus) {
                    drain *= 0.8;
                }
                this.resources[SANITY] -= drain;
            }
            this.resources[INFLUENCE] += 0.2;
            this.nextSanityTick = this.t + 12;
        }

        if (!this.nextSacrificeTick) {
            this.nextSacrificeTick = this.t + 3;
        }

        // Resource ticks
        // Note: very simple check is designed for small-scale
        // changes that never have fractions. Sanity and influence
        // ignore this system.

        for (let i = 2; i < this.resourcesDisplayed.length; i++) {
            if (this.resourcesDisplayed[i] > this.resources[i]) {
                this.resourcesDisplayed[i]--;
            } else if (this.resourcesDisplayed[i] < this.resources[i]) {
                this.resourcesDisplayed[i]++;
            }
        }

        // Game "start up" logic - some tick-based init
        // animations that happen once at start of game.

        if (this.t === 1) {
            Audio.play(Audio.wind);
        }

        if (this.t === 36) {
            this.addScreenShake(new ScreenShake(6, 6));
            Audio.play(Audio.explosion);
        }
        if (this.t >= 36 && this.t <= 38) {
            this.villagers[0].spawnChunks();
            this.villagers[1].spawnChunks();
        }
        if (this.t === 38) {
            this.villagers = [];
            this.resources[MEAT] += 10;
        }

        // Button UI Elements

        if (this.t === 60) {
            this.buttons[BUTTON_RECRUIT_VILLAGER].visible = true;
        }
        if (this.tech.sacrifice.unlocked) {
            this.buttons[BUTTON_SACRIFICE_VILLAGER].visible = true;
        }
        if (this.tech.ritual.unlocked) {
            this.buttons[BUTTON_SUMMON_FREEDOM].visible = true;
        }

        let recruitActive = (this.resources[INFLUENCE] >= this.nextWorkerCost());
        if (recruitActive && !this.buttons[BUTTON_RECRUIT_VILLAGER].active) {
            this.buttons[BUTTON_RECRUIT_VILLAGER].active = true;
            this.buttons[BUTTON_CODEX].visible = true;
            Audio.play(Audio.bell);
        }

        let sacrificeActive = (this.t >= this.nextSacrificeTick && this.tech.sacrifice.unlocked);
        if (sacrificeActive && !this.buttons[BUTTON_SACRIFICE_VILLAGER].active) {
            this.buttons[BUTTON_SACRIFICE_VILLAGER].active = true;
            Audio.play(Audio.bell);
        }

        this.buttons[BUTTON_SUMMON_FREEDOM].active = this.canAffordCosts([0, 0, 5, 5, 20, 5]);

        // Villagers

        for (const villager of this.villagers) {
            villager.update();
        }

        // Entities

        if (this.t > 35) {
            for (const entity of this.entities) {
                entity.update();
            }
            this.entities = this.entities.filter(entity => !entity.cull);
        }

        // Ash rain

        if (this.entities.length < 33) {
            this.entities.push(new AshParticle());
        }

        // Check for player victory

        if (this.freedom === 7) {
            this.gameOver(true);
        }

        // Check for player defeat

        if (this.resources[SANITY] <= 0) {
            this.gameOver(false);
        }

        // Increment screenshakes

        for (let i = 0; i < this.screenshakes.length; i++) {
            if (!this.screenshakes[i].update()) {
                this.screenshakes.splice(i, 1);
                i--;
            }
        }
    }

    draw() {
        // Draw screenshakes

        let shakeX = 0, shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        Viewport.ctx.translate(shakeX, shakeY);

        // Fake "slam" (parallax drop at beginning of game)

        let terrainY = this.t > 36 ? 0 : (285 - 285 * this.t / 36);

        // Background

        Viewport.ctx.fillStyle = PALETTE[3];
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        // Layer 3 (farthest)

        Viewport.ctx.drawImage(Sprite.terrain[2].img, 0, Math.floor(0 + terrainY * 0.8 * 0.8));

        for (let entity of this.entities) {
            if (entity.layer === 3) entity.draw();
        }

        for (let villager of this.villagers) {
            if (villager.layer === 3) villager.draw();
        }

        // Layer 2 (middle)

        Viewport.ctx.drawImage(Sprite.terrain[1].img, 0, Math.floor(0 + terrainY * 0.8));

        for (let entity of this.entities) {
            if (entity.layer === 2) entity.draw();
        }

        for (let villager of this.villagers) {
            if (villager.layer === 2) villager.draw();
        }

        //this.tech.ritual.unlocked = true;
        if (this.tech.ritual.unlocked) {
            this.drawRitual();
        }

        // Layer 1 (closest)

        Viewport.ctx.drawImage(Sprite.terrain[0].img, 0, Math.floor(0 + terrainY));

        // Black cat perch

        let adjustment = this.tech.ritual.unlocked ? 0.1 + (this.freedom * 0.9 / 7) : 0;
        drawBlackCat(this, this.t % (9 - this.freedom) === 0, adjustment);
        //Viewport.ctx.drawImage(Sprite.blackcat[0].img, 160, 73 - 30);

        for (let entity of this.entities) {
            if (entity.layer === 1 || !entity.layer) entity.draw();
        }

        for (let villager of this.villagers) {
            if (villager.layer === 1) villager.draw(Math.floor(terrainY));
        }

        if (this.tech.ritual.unlocked) {
            let text = '' + this.freedom + '/7';
            let textWidth = Text.measure(text).w;
            Text.drawText(Viewport.ctx, text, 170 - textWidth / 2, 99, 1, Text.palette[4]);
        }

        if (this.t > 40) {
            if (game.scene === this) {
                // Hide button prompts if Help Screen is displayed, to avoid confusion
                for (const button of this.buttons) {
                    button.draw();
                }
            }

            this.drawRecruitProgressBar();
            this.drawSacrificeProgressBar();

            this.drawSanityBar();
            //this.drawInfluenceBar();
            this.drawJobSelectUI();
            this.drawInventory();
        }
    }

    drawSanityBar() {
        let k = Math.floor((this.resources[SANITY] / 100) * 78);
        Viewport.ctx.drawImage(Sprite.sanitybar[0].img, 320-18-5, -3);
        Viewport.ctx.drawImage(Sprite.sanitybar[1].img, 320-18-5, -3);
        Viewport.ctx.drawImage(Sprite.sanitybar[2].img,
            0, 2 + (78 - k),
            18, k,
            320-18-5, -3 + 2 + (78 - k),
            18, k
        );
    }

    /*drawInfluenceBar() {
        let k = Math.floor(Math.min(this.resources[INFLUENCE] / this.nextWorkerCost(), 1) * 80);
        Viewport.ctx.drawImage(Sprite.influencebar[0].img, (320-80)/2, 3);
        Viewport.ctx.drawImage(Sprite.influencebar[1].img,
            2, 3,
            k, 4,
            (320-80)/2 + 2, 3 + 3,
            k, 4
        );
    }*/

    drawRecruitProgressBar() {
        if (!this.buttons[BUTTON_RECRUIT_VILLAGER].visible) return;
        if (this.buttons[BUTTON_RECRUIT_VILLAGER].active) return;

        let x = 5 + 11;
        let y = 3 + 8;
        let w = Math.floor(Math.min(this.resources[INFLUENCE] / this.nextWorkerCost(), 1) * 73);

        Viewport.ctx.drawImage(Sprite.progressbar[0].img,
            0, 0,
            w, 1,
            x, y,
            w, 1
        );
    }

    drawSacrificeProgressBar() {
        if (!this.nextSacrificeTick) return;
        if (!this.buttons[BUTTON_SACRIFICE_VILLAGER].visible) return;
        if (this.buttons[BUTTON_SACRIFICE_VILLAGER].active) return;

        let x = 5 + 11;
        let y = 14 + 8;
        let t2 = this.nextSacrificeTick;
        let t1 = this.nextSacrificeTick - 15*60;
        let w = Math.floor(Math.min((this.t - t1) / (t2 - t1), 1) * 79);

        Viewport.ctx.drawImage(Sprite.progressbar[0].img,
            0, 0,
            w, 1,
            x, y,
            w, 1
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

        Viewport.ctx.drawImage(Sprite.jobselect[0].img, cornerX, cornerY + selectedIdx * verticalMargin);
        Viewport.ctx.drawImage(Sprite.smallarrows[leftArrow].img, cornerX + 77, cornerY + 4 + selectedIdx * verticalMargin);
        Viewport.ctx.drawImage(Sprite.smallarrows[rightArrow].img, cornerX + 94, cornerY + 4 + selectedIdx * verticalMargin);
    }

    drawInventory() {
        const inventoryIcon = [0, 0, 0, 2, 3, 1];

        for (let i = 0; i < this.inventoryDisplayed.length; i++) {
            let type = this.inventoryDisplayed[i];
            let strValue = String(this.resourcesDisplayed[type]);
            let width = Text.measure(strValue, 1).w;

            Viewport.ctx.drawImage(
                Sprite.icons[inventoryIcon[type]].img,
                INVENTORY_POS.u - 60,
                INVENTORY_POS.v + i*12 - 1
            );
            Text.drawText(
                Viewport.ctx,
                RESOURCE_NAMES[type],
                INVENTORY_POS.u - 50,
                INVENTORY_POS.v + i*12,
                1,
                Text.palette[4]
            );
            Text.drawText(
                Viewport.ctx,
                strValue,
                INVENTORY_POS.u - width,
                INVENTORY_POS.v + i*12,
                1,
                Text.palette[4]
            );
        }
    }

    drawRitual() {
        let pos = { u: 160 - 39 + 8, v: 17 + Math.floor(Math.sin(this.t / 12) * 2) };

        Viewport.ctx.strokeStyle = PALETTE[1];
        Viewport.ctx.beginPath();
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (j - i === 1 || i - j === 1 || j - i === 6 || i - j === 6) continue;
                Viewport.ctx.moveTo(pos.u + SEPTAGRAM_FLAMES[i].u + 0.5, pos.v + SEPTAGRAM_FLAMES[i].v + 0.5);
                Viewport.ctx.lineTo(pos.u + SEPTAGRAM_FLAMES[j].u + 0.5, pos.v + SEPTAGRAM_FLAMES[j].v + 0.5);
            }
        }
        Viewport.ctx.stroke();

        for (let i = 0; i < 7; i++) {
            let i2 = (i * 3 + 3) % 7;
            let frame = i < this.freedom ? Math.floor((this.t / 6) + i) % 3 : 3;
            Sprite.drawSprite(Viewport.ctx, Sprite.ritualflame[frame], pos.u + SEPTAGRAM_FLAMES[i2].u, pos.v + SEPTAGRAM_FLAMES[i2].v);
        }
    }

    addScreenShake(screenshake) {
        // This screen shake applies to the entire rendered screen, including GUI
        this.screenshakes.push(screenshake);
    }

    moveJobSelector(delta) {
        let idx = this.jobsDisplayed.indexOf(this.selectedJob);
        idx = (idx + delta + this.jobsDisplayed.length) % this.jobsDisplayed.length;
        this.selectedJob = this.jobsDisplayed[idx];
    }

    recruitVillager() {
        const cost = this.nextWorkerCost();
        if (this.resources[INFLUENCE] >= cost) {
            this.resources[INFLUENCE] -= cost;
            this.buttons[BUTTON_RECRUIT_VILLAGER].active = false;

            const villager = new Villager(this.selectedJob || WOODCUTTER);
            this.villagers.push(villager);
            this.villagersWithJob[villager.job].push(villager);
            this.villagersRecruited++;

            this.entities.push(new WinkParticle());
            Audio.play(Audio.wink);
        } else {
            this.addScreenShake(new ScreenShake(4, 4));
            Audio.play(Audio.fail);
        }
    }

    hireVillager() {
        if (this.villagersWithJob[IDLE].length > 0) {
            const villager = this.villagersWithJob[IDLE].pop();
            villager.job = this.selectedJob;
            this.villagersWithJob[this.selectedJob].push(villager);
            Audio.play(Audio.click);
        } else {
            this.addScreenShake(new ScreenShake(4, 4));
            Audio.play(Audio.fail);
        }
    }

    fireVillager() {
        if (this.villagersWithJob[this.selectedJob].length > 0) {
            const villager = this.villagersWithJob[this.selectedJob].pop();
            villager.job = IDLE;
            this.villagersWithJob[IDLE].push(villager);
            Audio.play(Audio.click);
        } else {
            this.addScreenShake(new ScreenShake(4, 4));
            Audio.play(Audio.fail);
        }
    }

    sacrificeVillager() {
        let villagerpool = [...this.villagersWithJob[IDLE], ...this.villagersWithJob[this.selectedJob]];

        if (villagerpool.length > 0 && this.t >= this.nextSacrificeTick) {
            // Sacrifice Villager Logic:
            //
            // Take all villagers that are working on the selected job OR in the idle pool.
            // Sort all of them by progress into their current task.
            // Select the one with the least progress to sacrifice.
            //
            // This doesn't guarantee necessarily that idle villagers will be sacrificed,
            // but it makes it extremely likely because idle villagers have a very low
            // average t (total task length is 30 instead of 300).
            villagerpool.sort((a, b) => (b.task?.t || 0) - (a.task?.t || 0));
            let villager = villagerpool[0];

            // Ensure villager is removed from appropriate lists
            this.villagersWithJob[IDLE] = this.villagersWithJob[IDLE].filter(v => v != villager);
            this.villagersWithJob[this.selectedJob] = this.villagersWithJob[this.selectedJob].filter(v => v != villager);
            this.villagers = this.villagers.filter(v => v != villager);

            // Effects
            this.entities.push(new SacrificeParticle(villager));
            this.entities.push(new WinkParticle());
            Audio.play(Audio.wink);

            // Next sacrifice timer
            this.nextSacrificeTick = this.t + (this.tech.sacrificeplus.unlocked ? 9 : 15) * 60;
            this.buttons[BUTTON_SACRIFICE_VILLAGER].active = false;
        } else {
            this.addScreenShake(new ScreenShake(4, 4));
            Audio.play(Audio.fail);
        }
    }

    lightFreedom() {
        if (this.payCosts([0, 0, 5, 5, 20, 5])) {
            Audio.play(Audio.wink);
            this.freedom++;
        } else {
            this.addScreenShake(new ScreenShake(4, 4));
            Audio.play(Audio.fail);
        }
    }

    nextWorkerCost() {
        return Math.floor(3 * Math.pow(1.24, this.villagers.length));
    }

    gameOver(victory) {
        const stats = {
            seconds: Math.floor(this.t / 60),
            freedom: this.freedom,
            woodGathered: this.gathered[WOOD],
            meatGathered: this.gathered[MEAT],
            torchesCrafted: this.gathered[TORCHES],
            stoneGathered: this.gathered[STONE],
        };
        game.scenes.pop();
        game.scenes.push(new GameOverScene(victory, stats));
    }

    getTechNode(x, y) {
        return Object.values(this.tech).find(node => node.x === x && node.y === y);
    }

    /**
     * Unlock tech node immediately without paying costs or validating.
     */
    unlockTech(node) {
        node.visible = true;
        node.unlocked = true;
        if (node.r) this.getTechNode(node.x + 1, node.y).visible = true;
        if (node.l) this.getTechNode(node.x - 1, node.y).visible = true;
        if (node.u) this.getTechNode(node.x , node.y - 1).visible = true;
        if (node.d) this.getTechNode(node.x, node.y + 1).visible = true;
        this.lastUnlock = node;
    }

    /**
     * Pay costs for and unlock a tech node, if possible.
     */
    buyTech(node) {
        if (!node.unlocked && this.payCosts(node.unlockCost)) {
            this.unlockTech(node);
            return true;
        }
        return false;
    }

    payCosts(arr) {
        if (!this.canAffordCosts(arr)) return false;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) this.resources[i] -= arr[i];
        }
        return true;
    }

    canAffordCosts(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] && this.resources[i] < arr[i]) return false;
        }
        return true;
    }

    grant(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) {
                this.resources[i] = clamp(this.resources[i] + arr[i], 0, i === 0 ? 100 : 10000);
                this.gathered[i] += arr[i];
            }
        }
    }
}
