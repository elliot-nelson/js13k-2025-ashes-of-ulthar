// TweenChain

export class TweenChain {
    constructor(tweenArray) {
        this.t = -1;
        this.tweenArray = tweenArray;
    }

    update() {
        this.t++;

        if (this.t < this.tweenArray[0][0]) {
            this.value = this.tweenArray[0][2];
            return;
        }

        if (this.t >= this.tweenArray[this.tweenArray.length - 1][1]) {
            this.value = this.tweenArray[this.tweenArray.length - 1][3];
            this.finished = true;
            return;
        }

        for (let i = 0; i < this.tweenArray.length; i++) {
            if (this.t >= this.tweenArray[i][0] && this.t < this.tweenArray[i][1]) {
                this.value = (this.tweenArray[i][3] - this.tweenArray[i][2])
                    * (this.t - this.tweenArray[i][0])
                    / (this.tweenArray[i][1] - this.tweenArray[i][0])
                    + this.tweenArray[i][2];
                break;
            }
        }
    }
}
