# march-am-bookmarklets

## 動作環境

- ES2021
  - Chrome 99 以上

## 利用方法

- 利用したいスクリプトの `dist/XXX.txt` の内容をコピー
- 先頭に `javascript:` を追加した上で、ブックマークの URL 欄にペースト

## 開発

```bash
# install pnpm
$ node --version
> v16.11.1
$ corepack enable

# install deps
$ pnpm install

# build scripts
$ pnpm build
```

ref: [google/closure\-compiler: A JavaScript checker and optimizer\.](https://github.com/google/closure-compiler)
