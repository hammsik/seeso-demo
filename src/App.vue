<script>
import EasySeeSo from 'seeso/easy-seeso';
import { TrackingState } from 'seeso'

const licenseKey = 'dev_r6lhgvzp6c9qrujmix67580y3r207itavw0fonmf';

export default {
    data() {
        return {
            seeso: null,
            textArr: [],
            windowCenter_x: 0,
            windowCenter_y: 0,
            spanElements: null,
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
            if (gazeInfo.trackingState === TrackingState.SUCCESS) {
                let canvas = document.getElementById("output")
                let ctx = canvas.getContext("2d");
                ctx.fillStyle = '#EF4040'
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.beginPath();
                ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
                ctx.fillStyle =
                    ctx.fill();
                console.log(gazeInfo.x + ', ' + gazeInfo.y)
                this.highlightAction(gazeInfo.x, gazeInfo.y);

                if (gazeInfo.y > window.innerHeight * 0.2) {
                    this.autoScroll(gazeInfo.y);
                }
            }
        },
        parseCalibrationDataInQueryString() {
            const href = window.location.href
            const decodedURI = decodeURI(href)
            const queryString = decodedURI.split('?')[1];
            if (!queryString) return undefined
            const jsonString = queryString.slice("calibrationData=".length, queryString.length)
            return jsonString
        },
        // onClickCalibrationBtn() {
        //     const userId = 'hammsik';
        //     const redirectUrl = 'https://localhost:8083';
        //     const calibrationPoint = 5;
        //     EasySeeSo.openCalibrationPage(licenseKey, userId, redirectUrl, calibrationPoint);
        // },
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
        highlightAction(x, y) {
            var spanList = this.findNearElements(x, y);
            if (spanList == null) {
                this.spanElements.forEach((span) => { span.classList.remove('highlight'); })
            } else {
                var minSpanId = parseInt(spanList[0].id);
                var maxSpanId = parseInt(spanList[spanList.length - 1].id);
                this.spanElements.forEach((span) => {
                    var targetSpanId = parseInt(span.id);
                    if (targetSpanId < minSpanId || targetSpanId > maxSpanId) {
                        span.classList.remove('highlight');
                    }

                })
                spanList.forEach((span) => {
                    span.classList.add('highlight');
                });
            }
        },
        findNearElements(x, y) {
            if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return null;
            var minGap = window.innerHeight;
            var nearElementList = [];
            this.spanElements.forEach((span) => {
                var gap = Math.abs(span.getBoundingClientRect().y - y);
                if (gap < minGap) {
                    nearElementList = [];
                    minGap = gap;
                    nearElementList.push(span);
                } else if (gap == minGap) {
                    nearElementList.push(span);
                }
            })
            if (!(nearElementList[0].hasAttribute('id'))) nearElementList.shift();
            return nearElementList;
        },
        autoScroll(gazeInfo_y) {
            const maxScrollSpeed = 6;
            const scrollSpeed = (gazeInfo_y / window.innerHeight) * maxScrollSpeed;
            const textLayout = document.getElementById('text-layout');
            textLayout.scrollTop += scrollSpeed;

        },
    },


    created() {
        this.windowCenter_x = window.innerWidth / 2;
        this.windowCenter_y = window.innerHeight / 2;
    },


    async mounted() {
        document.body.style.overflow = 'hidden';
        await this.makingText();
        this.spanElements = document.querySelectorAll('span');

        console.log(window.innerHeight);
        this.seeso = new EasySeeSo();

        this.$nextTick(() => {
            const canvas = document.getElementById("output");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        // const calibrationData = this.parseCalibrationDataInQueryString()
        // if (calibrationData) {
        (async () => {
            this.seeso = new EasySeeSo();
            // Don't forget to enter your license key.`
            await this.seeso.init(licenseKey, async () => {
                await this.seeso.startTracking(this.onGaze);
                // await this.seeSo.setCalibrationData(calibrationData);
            }, this.afterFailed)
        })()
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
    line-height: 3;
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

.highlight {
    background-color: rgb(204, 216, 255);
    animation-name: fadeIn;
    animation-duration: 0.5s;
}
</style>

<template>
    <div style="position: relative;">
        <canvas id="output" style="; position: absolute; z-index: 1;"></canvas>
        <!-- <button id="calibrationButton" style="margin: 0 auto;"> Start Calibration </button> -->
        <div id="text-layout"
            style="position: absolute; z-index: 2; height: 100vh; width: 100vw; padding: 10px; overflow: auto;"
            @scroll="handleScroll">
            <span v-for='(item, index) in textArr' :key="index">
                &nbsp;
                <span v-for='(item2, index2) in item' :key="index2"
                    :id="(textArr.slice(0, index).reduce((acc, val) => acc + val.length, 0) + index2)">
                    {{ item2 + ' ' }}
                </span>
                <br>
            </span>
        </div>
    </div>
</template>