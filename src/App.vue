<script>
import EasySeeSo from 'seeso/easy-seeso';
// import { TrackingState } from 'seeso'

const licenseKey = 'dev_r6lhgvzp6c9qrujmix67580y3r207itavw0fonmf';

export default {
    data() {
        return {
            seeso: null,
            textArr: []
        };
    },
    methods: {
        afterInitialized() {
            console.log('sdk init success!')
        },
        afterFailed() {
            console.log('sdk init fail!')
            this.text = '실패'
        },
        onGaze(gazeInfo) {
            // if (gazeInfo.trackingState === TrackingState.SUCCESS) {
            let canvas = document.getElementById("output")
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            let ctx = canvas.getContext("2d");
            ctx.fillStyle = '#FF0000'
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.beginPath();
            ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
            ctx.fill();
            // }
        },
        parseCalibrationDataInQueryString() {
            const href = window.location.href
            const decodedURI = decodeURI(href)
            const queryString = decodedURI.split('?')[1];
            if (!queryString) return undefined
            const jsonString = queryString.slice("calibrationData=".length, queryString.length)
            return jsonString
        },
        onClickCalibrationBtn() {
            const userId = 'hammsik'; // ex) 5e9easf293
            const redirectUrl = 'http://localhost:8083';
            const calibrationPoint = 5;
            EasySeeSo.openCalibrationPage(licenseKey, userId, redirectUrl, calibrationPoint);
        },
        makingText() {
            return fetch('/inputText.txt')
                .then(response => response.text())
                .then(data => {
                    const spanListSplitedByLine = data.split('\n');
                    console.log(spanListSplitedByLine.length)
                    for (const element of spanListSplitedByLine) {
                        this.textArr.push(element.split(' '));
                    }
                });
        },
        highlightAction(spanElements) {
            // getBoundingClientRect() 호출
            spanElements.forEach((span, index) => {
            const rect = span.getBoundingClientRect();
            console.log(`Span element ${index} is at y position: ${rect.y}`);
            if (window.innerHeight * 0.4 < rect.y && rect.y < window.innerHeight * 0.6) {
                span.classList.add('highlight');
            } 
            else {
                span.classList.remove('highlight');
            }
        });
        }
    },
    async mounted() {
        await this.makingText();
        const spanElements = document.querySelectorAll('span');

        console.log(window.innerHeight);
        this.seeso = new EasySeeSo();
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.highlightAction(spanElements);
                    ticking = false;
                });

                ticking = true;
            }
        });

        // (async () => { this.seeso.init(licenseKey, this.afterInitialized, this.afterFailed) })()
        // (async () => { this.seeso.init(licenseKey, this.onGaze, this.afterFailed) })()

        // const calibrationData = this.parseCalibrationDataInQueryString()
        // if (calibrationData) {
        //     (async () => {
        //         this.seeso = new EasySeeSo();
        //         // Don't forget to enter your license key.`
        //         await this.seeso.init(licenseKey, async () => { this.seeso.startTracking(this.onGaze) }, this.afterFailed)
        //     })()
        // } else {
        //     console.log('No calibration data given.')
        //     const calibrationButton = document.getElementById('calibrationButton')
        //     calibrationButton.addEventListener('click', this.onClickCalibrationBtn)
        // }
    },
}
</script>

<style scoped>
span {
    line-height: 2;
}

@keyframes fadeIn {
    from {
        background-color: transparent
    }

    to {
        background-color: rgb(204, 216, 255);
    }
}

@keyframes fadeOut {
    from {
        background-color: rgb(204, 216, 255);
    }

    to {
        background-color: transparent
    }
}

.highlight {
    background-color: rgb(204, 216, 255);
    /* transition: background-color 1s ease; */
    animation-name: fadeIn;
    animation-duration: 0.8s;
}
.removeHighlight {
    background-color: transparent;
    animation-name: fadeOut;
    animation-duration: 0.8s;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<template>
    <!-- <canvas id="output"></canvas> -->
    <!-- <button id="calibrationButton" style="margin: 0 auto;"> Start Calibration </button> -->
    <h2 id="title">{{ text }}</h2>
    <h2 id="gazeInfo" style="text-align: center; color: red;"></h2>
    <span v-for='(item, index) in textArr' :key="index">
        &nbsp;
        <span v-for='(item2, index2) in item' :key="index2"
            :id="'item-' + (textArr.slice(0, index).reduce((acc, val) => acc + val.length, 0) + index2)">
            {{ item2 + ' ' }}
        </span>
        <br>
    </span>
</template>
  