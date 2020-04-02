const path = require('path')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const { isBinaryFile } = require('isbinaryfile')
const { reporter } = require('@dhis2/cli-helpers-engine')

const walkDir = require('./walkDir')

const replacePathVariables = (initialPath, data) => {
    let finalPath = initialPath
    Object.keys(data).forEach(key => {
        finalPath = finalPath.replace(RegExp(`{{${key}}}`, 'g'), data[key])
    })
    return finalPath
}
const writeTemplate = async (inFile, outFile, data) => {
    const hbs = await fs.readFile(inFile, 'utf8')
    const template = handlebars.compile(hbs)
    const dest = replacePathVariables(outFile, data)

    reporter.debug(`Installing ${dest} from ${inFile}`)
    await fs.ensureDir(path.dirname(dest))
    await fs.writeFile(dest, template(data))
}

const installTemplate = async (src, dest, data) => {
    await walkDir(src, async p => {
        const outPath = path.join(dest, path.relative(src, p))
        if (await isBinaryFile(p)) {
            await fs.copyFile(p, outPath)
        } else {
            await writeTemplate(p, outPath, data)
        }
    })
}

module.exports = installTemplate
