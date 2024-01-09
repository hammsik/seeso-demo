const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8083;

const options = {
    key: fs.readFileSync('./keys/private.pem'),
    cert: fs.readFileSync('./keys/public.pem')
  };

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

app.use( '/', express.static( path.join(__dirname, 'dist') )); // 아래코드에서 index.html을 로드하기 위한 path 설정
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'dist/index.html'));  
}) // 기본 경로 '/'을 통해 빌드된 dist/index.html 파일을 로드

const server = https.createServer(options, app);
server.listen(port, () => {
    console.log(`Express.js 서버가 http://localhost:${port} 포트에서 실행 중입니다.`);
});
