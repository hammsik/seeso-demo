const express = require('express');
const app = express();
const path = require('path');
const port = 8083;

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

app.use( '/', express.static( path.join(__dirname, 'dist') ));  
// 이 부분이 없으면 아래코드에서 index.html을 로드하지 못한다.
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'dist/index.html'));  
})
// 기본 경로 '/'을 통해 빌드된 dist/index.html 파일을 로드시킨다.

app.listen(port, () => {
    console.log(`Express.js 서버가 http://localhost:${port} 포트에서 실행 중입니다.`);
});
