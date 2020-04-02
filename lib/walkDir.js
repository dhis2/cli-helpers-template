const path = require('path')
const fs = require('fs-extra')

const walkDir = async (rootDir, fn) => {
    const children = fs.readdirSync(rootDir)
    return Promise.all(
        children.map(async child => {
            const childPath = path.join(rootDir, child)
            if ((await fs.stat(childPath)).isDirectory()) {
                return await walkDir(childPath, fn)
            } else {
                return await fn(childPath)
            }
        })
    )
}

module.exports = walkDir
