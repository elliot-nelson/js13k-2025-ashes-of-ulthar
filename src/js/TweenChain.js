// TweenChain

export class TweenChain {
    constructor(tweenArray) {
        this.t = -1;
        this.tweenArray = tweenArray;
    }

    update() {
        this.t++;

        if (this.t < this.tweenArray[0].t1) {
            this.value = this.tweenArray[0].v1;
            return;
        }

        if (this.t >= this.tweenArray[this.tweenArray.length - 1].t2) {
            this.value = this.tweenArray[this.tweenArray.length - 1].v2;
            this.finished = true;
            console.log('finishing');
            return;
        }

        for (let i = 0; i < this.tweenArray.length; i++) {
            if (this.t >= this.tweenArray[i].t1 && this.t < this.tweenArray[i].t2) {
                this.value = (this.tweenArray[i].v2 - this.tweenArray[i].v1)
                    * (this.t - this.tweenArray[i].t1)
                    / (this.tweenArray[i].t2 - this.tweenArray[i].t1)
                    + this.tweenArray[i].v1;
                break;
            }
        }
    }
}
