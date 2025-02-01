<h1 align="center">Welcome to mint-filter 👋</h1>

<p align="center">
  <a href="https://github.com/ZhelinCheng/mint-filter" target="_blank">
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/ZhelinCheng/mint-filter.svg">
  </a>

  <a href="https://www.npmjs.com/package/mint-filter" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/mint-filter.svg">
  </a>

  <a href="https://www.npmjs.com/package/mint-filter" target="_blank">
    <img alt="Download" src="https://img.shields.io/npm/dm/mint-filter.svg">
  </a>

  <a href="https://coveralls.io/github/ZhelinCheng/mint-filter?branch=master" target="_blank">
    <img alt="Coverage" src="https://coveralls.io/repos/github/ZhelinCheng/mint-filter/badge.svg?branch=master">
  </a>

  <br/>

  <a href="https://github.com/ZhelinCheng/mint-filter/actions" target="_blank">
    <img alt="Coverage" src="https://github.com/ZhelinCheng/mint-filter/workflows/CI/badge.svg">
  </a>

  <a href="https://github.com/ZhelinCheng/mint-filter#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/ZhelinCheng/mint-filter/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/ZhelinCheng/mint-filter/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/ZhelinCheng/mint-filter" />
  </a>
</p>


> 基于Aho–Corasick算法实现的敏感词过滤方案，Aho–Corasick算法是由Alfred V. Aho和Margaret J.Corasick 发明的字符串搜索算法，用于在输入的一串字符串中匹配有限组"字典"中的子串。它与普通字符串匹配的不同点在于同时与所有字典串进行匹配。算法均摊情况下具有近似于线性的时间复杂度，约为字符串的长度加所有匹配的数量。

实现详细说明（搜索算法未更新，请查看代码）：

个人博客：[《TypeScript：Aho–Corasick算法实现敏感词过滤》](https://zhelin.me/post/47627553bd09576fbdeafc11dc93bfbf/)

掘金社区：[《TypeScript：Aho–Corasick算法实现敏感词过滤》](https://juejin.im/post/5cfa6bb6f265da1b8a4f0ed8)

### 🏠 [Homepage](https://github.com/ZhelinCheng/mint-filter#readme)

## 1. 性能

### 运行性能

**需要注意的是，实际生产环境运行速度会比下面测试数据更快。**

使用20000个随机敏感词实例化的平均时间：< 96ms

测试字符串包含随机生成的汉字、字母、数字。
以下测试均在20000个随机敏感词构建的树下进行测试，每组测试6次取平均值：

| 编号         | 字符串长度        |  不替换敏感词[replace:false]  | 替换敏感词 |
| :--------:   | :-----:          | :----:        | :----:    |
| 1            | 1000             |   < 1.35ms     | < 1.55ms   |
| 2            | 5000             |   < 3.60ms     | < 3.60ms   |
| 3            | 10000            |   < 8.10ms     | < 9.81ms   |
| 4            | 20000            |   < 15.03ms    | < 16.03ms  |
| 5            | 50000            |   < 20.83ms    | < 21.18ms  |
| 6            | 100000           |   < 29.02ms    | < 34.45ms  |

### 与DFA算法对比

|         | Aho-Corasick算法 | DFA算法 |
|---------|----------------|--------|
| 算法效率 | 多模式串时表现良好 | 单模式串时表现良好 |
| 内存占用 | 需要更多内存空间 | 内存消耗小 |
| 匹配速度 | 非常快，具有线性时间复杂度 | 常量时间复杂度，匹配速度受限于自动机大小 |
| 实现难度 | 较为复杂，需要构建AC自动机并进行状态转移 | 实现简单，只需维护一个大的状态转移表 |
| 匹配多个字符串 | 高效，可同时搜索多个模式字符串 | 必须为每个字符串单独执行匹配操作 |
| 错误容错性 | 良好 | 不太好 |



## 2. 安装

```sh
yarn add mint-filter
```

## 3. 使用

### 基础使用
```typescript
import { createMintFilter } from 'mint-filter'

// 初始化过滤器
const filter = createMintFilter(['敏感词1', '敏感词2'])

// 基本过滤使用
const result = filter.filter('这是一段包含敏感词1的文本')
console.log(result)
// 输出: { words: ['敏感词1'], text: '这是一段包含****的文本' }

// 验证文本是否包含敏感词
const isValid = filter.verify('这是一段正常文本')
console.log(isValid) // 输出: true
```

### 高级配置

#### 自定义替换字符
```typescript
// 使用自定义替换字符
const filter = createMintFilter(['敏感词'], { customCharacter: '#' })
const result = filter.filter('包含敏感词的文本')
console.log(result)
// 输出: { words: ['敏感词'], text: '包含###的文本' }
```

#### 过滤选项
```typescript
// 不替换敏感词，仅检测
const result = filter.filter('包含敏感词的文本', { replace: false })
console.log(result)
// 输出: { words: ['敏感词'], text: '包含敏感词的文本' }

// 快速验证模式，发现敏感词立即返回
const result = filter.filter('包含敏感词1和敏感词2的文本', { verify: true })
console.log(result)
// 输出: { words: ['敏感词1'], text: '包含****和敏感词2的文本' }
```

### 动态管理敏感词

```typescript
// 添加新的敏感词
filter.add('新敏感词')

// 删除敏感词
const status = filter.delete('敏感词1')
console.log(status) 
// 输出: 'delete' 表示成功删除
// 输出: 'update' 表示词不存在或其他情况
```

### 特性说明

1. 大小写不敏感：过滤器会自动处理大小写
2. 高性能：使用Aho-Corasick算法实现，具有接近线性的时间复杂度
3. 返回结果包含：
   - words: 检测到的敏感词列表
   - text: 处理后的文本（如果启用替换）

## 4. 构造函数
### constructor

• **new Mint**(`keys`)

#### 参数

| Name | Type |
| :------ | :------ |
| `keys` | `string`[] |

#### 定义于

[index.ts:26](https://github.com/ZhelinCheng/mint-filter/blob/f25e001/src/index.ts#L26)

## 5. 方法

### add

▸ **add**(`key`, `build?`): `boolean`

新增敏感词

**`Example`**

```typescript
const status = mint.add('敏感词')
```

#### 参数

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `key` | `string` | `undefined` | 关键词 |
| `build` | `boolean` | `true` | 是否构建树，默认不用传递 |

#### 返回

`boolean`

状态

#### 定义于

[index.ts:233](https://github.com/ZhelinCheng/mint-filter/blob/f25e001/src/index.ts#L233)

___

### delete

▸ **delete**(`key`): ``"update"`` \| ``"delete"``

删除关键字

**`Example`**

```typescript
const status = mint.delete('敏感词')
```

#### 参数

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | 关键词 |

#### 返回

``"update"`` \| ``"delete"``

状态（update ｜ delete），告知用户是删除了树上的节点还是单纯的更新了节点

#### 定义于

[index.ts:169](https://github.com/ZhelinCheng/mint-filter/blob/f25e001/src/index.ts#L169)

___

### filter

▸ **filter**(`text`, `options?`): `FilterData`

过滤文本

**`Example`**

```typescript
mint.add('无法通过')
let status = mint.filter('这是一句无法通过的文本')
console.log(status) // { words: ["无法通过"], text: "这是一句****的文本" }

status = mint.filter('这是一句无法通过的文本', { replace: false })
console.log(status) // { words: ["无法通过"], text: "这是一句无法通过的文本" }
```

#### 参数

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | 文本内容 |
| `options?` | `Pick`<`FilterOptions`, ``"replace"``\> | - |

#### 返回

`FilterData`

FilterData

#### 定义于

[index.ts:134](https://github.com/ZhelinCheng/mint-filter/blob/f25e001/src/index.ts#L134)

___

### verify

▸ **verify**(`text`): `boolean`

检测文本是否通过验证

**`Example`**

```typescript
mint.add('无法通过')
const status = mint.verify('这是一句无法通过的文本')
console.log(status) // false
```

#### 参数

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | 文本内容 |

#### 返回

`boolean`

Boolean

#### 定义于

[index.ts:152](https://github.com/ZhelinCheng/mint-filter/blob/f25e001/src/index.ts#L152)



## 6. 测试

```sh
yarn run test
```

## 7. 作者

👤 **ZhelinCheng**

* Website: https://zhelin.me
* Github: [@ZhelinCheng](https://github.com/ZhelinCheng)

### 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/ZhelinCheng/mint-filter/issues). You can also take a look at the [contributing guide](https://github.com/ZhelinCheng/mint-filter/blob/master/CONTRIBUTING.md).

### Show your support

Give a ⭐️ if this project helped you!

### 📝 License

Copyright © 2023 [ZhelinCheng](https://github.com/ZhelinCheng).<br />
This project is [MIT](https://github.com/ZhelinCheng/mint-filter/blob/master/LICENSE) licensed.
