"use strict";var f=require("./package.json"),b=m(require("express-fileupload")),g=require("./configs/users.json"),c=m(require("./configs/config.json")),h=m(require("./configs/data.json")),i=m(require("ps-logger")),d=m(require("process")),e=m(require("express")),j=m(require("shortid")),k=m(require("fs")),l=m(require("path"));function m(a){return a&&a.__esModule?a:{default:a}}var a=e.default();d.default.on("SIGINT",function(){console.info("Interrupted"),d.default.exit(0)}),a.use(b.default({limits:{fileSize:52428800}})),a.get("/",function(b,a){a.json({project:{name:"Sharuto",author:f.author,version:f.version,repo:f.repository}})}),a.post("/",function(a,b){var f=function(a){return g.users.filter(function(b){return b.token===a.replace("Bearer ","")})[0]};if(!a.headers.authorization||!g.users.filter(function(b){return b.token===a.headers.authorization})){b.status(403).send("Unauthorized");return}if(!a.files){b.status(400).send("No files were uploaded.");return}var d=a.files.file,e="".concat(j.default.generate(),".").concat(d.name.split(".")[1]);d.mv("uploads/".concat(e),function(l){var g;if(l){i.default.error(l),b.status(500).send(l);return}g=d.name.endsWith("jpg")||d.name.endsWith("png")||d.name.endsWith("gif")?{id:e.split(".")[0],file:e,description:"".concat(a.headers["x-sharuto-description"]||f(a.headers.authorization).description),delete:j.default.generate(),author:f(a.headers.authorization).social.name,oembed:{provider_name:"Sharuto",provider_url:"https://github.com/Minecodes/sharuto",author_name:f(a.headers.authorization).social.name,author_url:f(a.headers.authorization).social.url,type:"photo",version:"1.0"}}:{id:e.split(".")[0],file:e,description:a.headers["x-sharuto-description"]||f(a.headers.authorization).description,delete:j.default.generate(),author:f(a.headers.authorization).social.name,oembed:{provider_name:"Sharuto",provider_url:"https://github.com/Minecodes/sharuto",author_name:f(a.headers.authorization).social.name,author_url:f(a.headers.authorization).social.url,type:"link",version:"1.0"}},h.default.push(g),k.default.writeFileSync("./configs/data.json",JSON.stringify(h.default,null,4)),b.json({link:"https://".concat(c.default.host,"/").concat(g.id),delete:"https://".concat(c.default.host,"/").concat(g.id,"/delete/").concat(g.delete)})})}),a.get("/:file/delete/:token",function(a,c){var b=function(a,b){return h.default.findIndex(function(c){return c.id===a&&c.delete===b})};if(-1===b(a.params.file,a.params.token)){c.status(404).send("Not found");return}k.default.unlink("./uploads/".concat(h.default[b(a.params.file,a.params.token)].file),function(d){if(d){i.default.error(d),c.status(500).send(d);return}h.default.splice(b(a.params.file,a.params.token),1),k.default.writeFileSync("./configs/data.json",JSON.stringify(h.default,null,4)),c.send("File deleted")})}),a.get("/:file/oembed",function(b,a){if(!h.default.filter(function(a){return a.id===b.params.file&&a.oembed})){a.status(404).send("Not found");return}a.json(h.default.filter(function(a){return a.id===b.params.file})[0].oembed)}),a.all("/test",function(a,b){b.send({description:a.headers["x-sharuto-description"],headers:a.headers})}),a.get("/:file",function(a,c){var b=function(a){return void 0===h.default.filter(function(b){return b.id===a})[0]?null:h.default.filter(function(b){return b.id===a})[0]},d=function(){return g.users.filter(function(c){return c.social.name===b(a.params.file).author})[0]};if(null===b(a.params.file)){c.status(404).send("Not found");return}a.headers["user-agent"].includes("curl")||a.headers["user-agent"].includes("Wget")?c.download(l.default.join(__dirname,"uploads",b(a.params.file).file)):a.headers["user-agent"].includes("Discord")||a.headers["user-agent"].includes("TwitterBot")?c.send('<html>\n    <head>\n        <meta name="twitter:card" content="summary_large_image" />\n        <meta name="og:type" content="website" />\n        <title>'.concat(b(a.params.file).file,'</title>\n        <meta content="').concat(b(a.params.file).file,'" property="og:title" />\n        ').concat(b(a.params.file).file.includes(".png")||b(a.params.file).file.includes(".jpg")||b(a.params.file).file.includes(".gif")?'<meta content="/'.concat(a.params.file,'" property="og:image" />'):"",'\n        <meta content="').concat(b(a.params.file).description,'" property="og:description" />\n        <meta content="').concat(d().social.color,'" data-react-helmet="true" name="theme-color" />\n        <meta name="twitter:site" content="').concat(d().social.twitter.site,'" />\n        <meta name="twitter:creator" content="').concat(d().social.twitter.site,'" />\n        <link href="/').concat(a.params.file,'/oembed" title="oEmbed" rel="alternate" type="application/json+oembed" />\n    </head>\n</html>')):c.sendFile(l.default.join(__dirname,"uploads",b(a.params.file).file))}),a.listen(c.default.port,function(){i.default.info("Server started on port ".concat(c.default.port))})

//# sourceMappingURL=main.js.map