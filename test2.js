const OpenCC = require('opencc')

// 创建转换器：简体 -> 繁体
const s2tConverter = new OpenCC('s2t.json')

/**
 * 判断文本是否为简体中文
 * @param {string} text - 要检测的文本
 * @returns {Promise<boolean>} - true: 简体中文, false: 非简体
 */
function isSimplified(text) {
    return new Promise((resolve, reject) => {
        if (!text || typeof text !== 'string') return resolve(false)

        // 排除日文假名
        if (/[\u3040-\u30FF]/.test(text)) return resolve(false)

        // 提取所有 CJK 汉字（中日韩共用区）
        const cjkOnly = text.replace(/[^\u4e00-\u9fff]/g, '')
        if (!cjkOnly) return resolve(false)

        // 转换简体 -> 繁体
        s2tConverter.convert(cjkOnly, (err, converted) => {
            if (err) return reject(err)

            // 如果转换后的结果和原文不同 → 原文包含简体
            resolve(converted !== cjkOnly)
        })
    })
}

// 使用示例
;(async () => {
    console.log(await isSimplified('你好世界')) // true
    console.log(await isSimplified('繁體中文')) // false
    console.log(await isSimplified('嗚呼、人間なんて辞めたいな')) // false
    console.log(await isSimplified('啊啊 乾脆不做人好了')) // true
})()
