/*
 * @Author       : 程哲林
 * @Date         : 2023-02-20 20:03:15
 * @LastEditors  : 程哲林
 * @LastEditTime : 2023-05-08 18:09:03
 * @FilePath     : /mint-filter/src/index.ts
 * @Description  : 未添加文件描述
 */

import Node from './node'

interface FilterOptions {
    // sensitive?: boolean;
    replace?: boolean
    verify?: boolean
}

interface FilterData {
    words: string[]
    text: string
}

interface MintOptions {
    customCharacter?: string
}

type MintFilter = {
    filter: (
        text: string,
        options?: Pick<FilterOptions, 'replace' | 'verify'>
    ) => FilterData
    verify: (text: string) => boolean
    delete: (key: string) => 'update' | 'delete'
    add: (key: string) => boolean
}

export const createMintFilter = (
    keys: string[],
    ops?: MintOptions
): MintFilter => {
    const root = new Node('root')
    const customCharacter = ops?.customCharacter ?? '*'

    // 私有函数
    const build = () => {
        const queue: Node[] = []
        queue.push(root)

        let idx = 0
        while (queue.length > idx) {
            const beginNode = queue[idx]
            const map = beginNode.children
            for (const key in beginNode.children) {
                const node = map[key]
                let failNode = beginNode.fail

                while (failNode && !failNode.children[key]) {
                    failNode = failNode.fail
                }

                node.fail = failNode?.children[key] || root
                queue.push(node)
            }
            idx++
        }
    }

    const put = (key: string, len: number) => {
        let node = root
        const lastIdx = len - 1
        node.count++
        for (let idx = 0; idx < len; idx++) {
            const val = key[idx]
            const nextNode = node.children[val]

            if (nextNode) {
                nextNode.count++
                node = nextNode
            } else {
                const newNode = new Node(val, idx + 1)
                newNode.count = 1
                node.children[val] = newNode
                node = newNode
            }

            if (lastIdx === idx && node.depth) {
                node.word = true
            }
        }
    }

    const pop = (key: string, len: number, node: Node): 'update' | 'delete' => {
        if (len === 0) {
            if (node.word) {
                node.word = false
                node.count--
                return 'delete'
            }
            return 'update'
        }

        const val = key[0]
        const child = node.children[val]
        if (!child) return 'update'

        const type = pop(key.slice(1), len - 1, child)
        if (type === 'delete') node.count--
        return type
    }

    // 初始化敏感词库
    keys.forEach((key) => {
        put(key.toLowerCase(), key.length)
    })
    build()

    // 返回公共 API
    return {
        filter: (
            text: string,
            options?: Pick<FilterOptions, 'replace' | 'verify'>
        ): FilterData => {
            let node: Node | undefined = root
            const fText: string[] = []
            const oText: string[] = []
            const words: string[] = []

            const { replace = true, verify = false } = options || {}

            const textLen = text.length
            for (let i = 0; i < textLen; i++) {
                // const key = text.charAt(i);
                const oKey = text[i]
                const key = oKey.toLowerCase()

                while (node && !node?.children[key]) {
                    node = node?.fail
                }
                node = node?.children[key] || root

                fText.push(oKey)
                oText.push(oKey)

                if (node.word) {
                    let idx = i + 1 - node.depth
                    let word = ''
                    while (idx <= i) {
                        const v = oText[idx]
                        word += v

                        if (replace) {
                            fText[idx] = customCharacter
                        }

                        idx++
                    }

                    words.push(word)

                    if (verify) {
                        break
                    }
                }
            }

            return {
                words,
                text: fText.join('')
            }
        },

        verify: (text: string): boolean => {
            const { words } = createMintFilter(keys, ops).filter(text, {
                verify: true
            })
            return !words.length
        },

        delete: (key: string): 'update' | 'delete' => {
            const type = pop(key.toLowerCase(), key.length, root)
            build()
            return type
        },

        add: (key: string): boolean => {
            const lowKey = key.toLowerCase()
            put(lowKey, lowKey.length)
            build()
            return true
        }
    }
}
