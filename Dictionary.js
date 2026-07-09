const http=require('http');
const https=require('https');
const url=require('url');
const server=http.createServer((req,res)=>{
    const parsedurl=new URL(req.url,`http://${req.headers.host}`);
    if(parsedurl.pathname=='/'){
        res.end(`
            <!DOCTYPE html>
<html>
<head>
    <title>Dictionary App</title>
    <style>
        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
        }

        body{
            min-height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            font-family:Arial, sans-serif;
            background:linear-gradient(135deg,#4f46e5,#7c3aed);
        }

        .container{
            background:white;
            padding:40px;
            border-radius:15px;
            width:400px;
            text-align:center;
            box-shadow:0 10px 25px rgba(0,0,0,0.2);
        }

        h1{
            color:#333;
            margin-bottom:20px;
        }

        p{
            color:#666;
            margin-bottom:25px;
        }

        input{
            width:100%;
            padding:12px;
            font-size:16px;
            border:2px solid #ddd;
            border-radius:8px;
            outline:none;
            margin-bottom:15px;
        }

        input:focus{
            border-color:#4f46e5;
        }

        button{
            width:100%;
            padding:12px;
            border:none;
            border-radius:8px;
            background:#4f46e5;
            color:white;
            font-size:16px;
            cursor:pointer;
            transition:0.3s;
        }

        button:hover{
            background:#4338ca;
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>Dictionary App</h1>
        <p>Search any English word and get its meaning instantly.</p>

        <form action="/dictionary" method="GET">
            <input
                type="text"
                name="word"
                placeholder="Enter a word..."
                required
            >

            <button type="submit">
                Search Meaning
            </button>
        </form>
    </div>

</body>
</html>
            `);
    }
    if(parsedurl.pathname=='/dictionary'){
        let word=parsedurl.searchParams.get("word");
        const apireq=https.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,(apires)=>{
            let data='';
            apires.on("data",(chunks)=>{
                data+=chunks;
            });
            apires.on('end',()=>{
                let result=JSON.parse(data);
                if(!Array.isArray(result)){
    res.end("<h1>Word not found</h1>");
    return;
}
                let phonetic=result[0].phonetic||"N/A";
                let audio=result[0].phonetics[0]?.audio||"N/A";
                let origin=result[0].origin||"Not available";
                let meanings=result[0].meanings[0];
                let partOfSpeech=meanings.partOfSpeech;
                let definitions=meanings.definitions[0];
                let definition=definitions.definition;
                let example=definitions.example||"N/A";
                  res.writeHead(200, { "Content-Type": "text/html" });

    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dictionary Result</title>
            <style>
                body{
                    font-family: Arial, sans-serif;
                    margin:40px;
                    background:#f4f4f4;
                }
                .container{
                    max-width:700px;
                    margin:auto;
                    background:white;
                    padding:20px;
                    border-radius:10px;
                    box-shadow:0 0 10px rgba(0,0,0,0.1);
                }
                h1{
                    color:#333;
                }
                p{
                    font-size:18px;
                }
                audio{
                    margin-top:10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${word}</h1>

                <p><strong>Phonetic:</strong> ${phonetic}</p>

                <p><strong>Origin:</strong> ${origin}</p>

                <p><strong>Part of Speech:</strong> ${partOfSpeech}</p>

                <p><strong>Definition:</strong> ${definition}</p>

                <p><strong>Example:</strong> ${example}</p>

                ${
                    audio !== "N/A"
                    ? `<audio controls>
                         <source src="${audio}" type="audio/mpeg">
                       </audio>`
                    : "<p>No audio available</p>"
                }

                <br><br>
                <a href="/">Search another word</a>
            </div>
        </body>
        </html>
    `);
            });
        });
        apireq.on("error",(err)=>{
            res.end("API error");
        });
        apireq.end();
    }
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server started");
});
