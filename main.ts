import { author, repository, version } from './package.json'
import fileUploader from 'express-fileupload'
import { users } from './configs/users.json'
import config from './configs/config.json'
import data from './configs/data.json'
import logger from 'ps-logger'
import process from 'process'
import express from 'express'
import shortid from 'shortid'
import fs from 'fs'
import path from 'path'
const app = express()



interface Data {
    id: string,
    file: string,
    description: string,
    delete: string,
    author: string,
    oembed?: {
        provider_name: "Sharuto",
        provider_url: "https://github.com/Minecodes/sharuto",
        author_name: string,
        author_url: string,
        type: "photo" | "video" | "link" | "rich" | string,
        version: "1.0"
    }
}




process.on('SIGINT', () => {
  console.info("Interrupted")
  process.exit(0)
})



/**
 * Limit: 50mb (default / cloudflare free plan limit)
 */
app.use(fileUploader({
    limits: { fileSize: 50 * 1024 * 1024 }
}))


app.get('/', (req, res) => {
    res.json(
        {
            "project": {
                "name": "Sharuto",
                "author": author,
                "version": version,
                "repo": repository
            }
        }
    )
})

app.post('/', (req, res) => {
    if (!req.headers.authorization) {
        res.status(403).send('Unauthorized')
        return
    }

    if (!users.filter(i => i.token === req.headers.authorization) ? true : false) {
        res.status(403).send('Unauthorized')
        return
    }

    if (!req.files) {
        res.status(400).send('No files were uploaded.')
        return
    }

    let file = req.files.file
    let fileName = `${shortid.generate()}.${file.name.split(".")[1]}`
    
    function getUser(token: string) {
        return users.filter(i => i.token === token.replace("Bearer ", ""))[0]
    }

    file.mv(`uploads/${fileName}`, (err) => {
        if (err) {
            logger.error(err)
            res.status(500).send(err)
            return
        } else {
            let d: Data
            if (file.name.endsWith("jpg") || file.name.endsWith("png") || file.name.endsWith("gif")) {
                d = {
                    id: fileName.split(".")[0],
                    file: fileName,
                    description: `${req.headers["x-sharuto-description"] || getUser(req.headers.authorization).description}`,
                    delete: shortid.generate(),
                    author: getUser(req.headers.authorization).social.name,
                    oembed: {
                        provider_name: "Sharuto",
                        provider_url: "https://github.com/Minecodes/sharuto",
                        author_name: getUser(req.headers.authorization).social.name,
                        author_url: getUser(req.headers.authorization).social.url,
                        type: "photo",
                        version: "1.0"
                    }
                }   
            } else {
                d = {
                    id: fileName.split(".")[0],
                    file: fileName,
                    description: req.headers["x-sharuto-description"] || getUser(req.headers.authorization).description,
                    delete: shortid.generate(),
                    author: getUser(req.headers.authorization).social.name,
                    oembed: {
                        provider_name: "Sharuto",
                        provider_url: "https://github.com/Minecodes/sharuto",
                        author_name: getUser(req.headers.authorization).social.name,
                        author_url: getUser(req.headers.authorization).social.url,
                        type: "link",
                        version: "1.0"
                    }
                }
            }
            data.push(d)
            fs.writeFileSync('./configs/data.json', JSON.stringify(data, null, 4))
            res.json(
                {
                    link: `https://${config.host}/${d.id}`,
                    delete: `https://${config.host}/${d.id}/delete/${d.delete}`
                }
            )
        }
    })
})

app.get('/:file/delete/:token', (req, res) => {
    // delete the file and remove from configs/data.json
    function getIndex(file, token) {
        return data.findIndex(i => i.id === file && i.delete === token)
    }

    if (getIndex(req.params.file, req.params.token) === -1) {
        res.status(404).send('Not found')
        return
    }

    fs.unlink(`./uploads/${data[getIndex(req.params.file, req.params.token)].file}`, (err) => {
        if (err) {
            logger.error(err)
            res.status(500).send(err)
            return
        } else {
            data.splice(getIndex(req.params.file, req.params.token), 1)
            fs.writeFileSync('./configs/data.json', JSON.stringify(data, null, 4))
            res.send('File deleted')
        }
    })

})

app.get('/:file/oembed', (req, res) => {
    if (!data.filter(i => i.id === req.params.file && i.oembed)) {
        res.status(404).send('Not found')
        return
    }

    res.json(data.filter(i => i.id === req.params.file)[0].oembed)
})

app.all('/test', (req, res) => {
    res.send({
        description: req.headers["x-sharuto-description"],
        headers: req.headers
    })
})

app.get('/:file', (req, res) => {
    //if (!data.filter(i => i.id == req.params["file"])) {
    //    res.status(404).send('Not found')
    //    return
    //}

    function getInfos(file) {
        if (typeof data.filter(d => d.id === file)[0] === "undefined") {
            return null
        } else {
            return data.filter(d => d.id === file)[0]
        }
    }

    function getUser() {
        return users.filter(i => i.social.name === getInfos(req.params.file).author)[0]
    }

    if (getInfos(req.params.file) === null) {
        res.status(404).send('Not found')
        return
    }


    if (req.headers['user-agent'].includes('curl') || req.headers['user-agent'].includes('Wget')) {
        res.download(path.join(__dirname, 'uploads', getInfos(req.params.file).file))
    } else if (req.headers['user-agent'].includes('Discord') || req.headers['user-agent'].includes('TwitterBot')) {
        res.send(
`<html>
    <head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="og:type" content="website" />
        <title>${getInfos(req.params.file).file}</title>
        <meta content="${getInfos(req.params.file).file}" property="og:title" />
        ${getInfos(req.params.file).file.includes('.png') || getInfos(req.params.file).file.includes('.jpg') || getInfos(req.params.file).file.includes('.gif') ? `<meta content="/${req.params.file}" property="og:image" />` : ''}
        <meta content="${getInfos(req.params.file).description}" property="og:description" />
        <meta content="${getUser().social.color}" data-react-helmet="true" name="theme-color" />
        <meta name="twitter:site" content="${getUser().social.twitter.site}" />
        <meta name="twitter:creator" content="${getUser().social.twitter.site}" />
        <link href="/${req.params.file}/oembed" title="oEmbed" rel="alternate" type="application/json+oembed" />
    </head>
</html>`
            )
    } else {
        res.sendFile(path.join(__dirname, 'uploads', getInfos(req.params.file).file))
    }
})

app.listen(config.port, () => {
    logger.info(`Server started on port ${config.port}`)
})