<script>
import EasySeeSo from 'seeso/easy-seeso';
// import { TrackingState } from 'seeso'

const licenseKey = 'dev_r6lhgvzp6c9qrujmix67580y3r207itavw0fonmf';

export default {
    data() {
        return {
            seeso: null,
            textArr: [],
            windowCenter_x: 0,
            windowCenter_y: 0,
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
            // const elem = document.elementFromPoint(this.windowCenter_y);
            var spanList = this.findNearElements(spanElements);
            var minSpanId = parseInt(spanList[0].id);
            var maxSpanId = parseInt(spanList[spanList.length - 1].id);
            spanElements.forEach((span) => {
                var targetSpanId = parseInt(span.id);
                if (targetSpanId < minSpanId || targetSpanId > maxSpanId) {
                    span.classList.remove('highlight');
                }

            })
            spanList.forEach((span) => {
                console.log(parseInt(span.id) + ', ' + minSpanId);
                span.classList.add('highlight');
            });
        },
        findNearElements(spanElements) {
            var minGap = window.innerHeight;
            var nearElementList = [];
            spanElements.forEach((span) => {
                var gap = Math.abs(span.getBoundingClientRect().y - this.windowCenter_y);
                console.log(gap);
                if (gap < minGap) {
                    nearElementList = [];
                    minGap = gap;
                    nearElementList.push(span);
                } else if (gap == minGap) {
                    nearElementList.push(span);
                }
            })
            console.log(nearElementList);
            if (!(nearElementList[0].hasAttribute('id'))) nearElementList.shift();
            return nearElementList;
        }
    },
    created() {
        this.windowCenter_x = window.innerWidth / 2;
        this.windowCenter_y = window.innerHeight / 2;
    },
    async mounted() {
        await this.makingText();
        const spanElements = document.querySelectorAll('span');
        this.highlightAction(spanElements);

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
    word-break: keep-all;
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
    animation-duration: 0.5s;
}

.removeHighlight {
    background-color: transparent;
    animation-name: fadeOut;
    animation-duration: 0.8s;
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
            :id="(textArr.slice(0, index).reduce((acc, val) => acc + val.length, 0) + index2)">
            {{ item2 + ' ' }}
        </span>
        <br>
    </span>
</template>
  