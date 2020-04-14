# jsxtoamp

将ReactJSX文件转换成为支付宝小程序文件

Transforms single React JSX file intro Alipay Mini Program files

# Prerequisites|预装

Node: any 12.x version starting with v12.0.0 or greater

确保本地已经预先安装NPM以及NODE,能在控制台使用npm以及node指令

# Installation|安装使用

1. clone the project from github to your local machine | 克隆本分支
2. cmd to the project root and invoke npm i, make sure the process complete successfully | npm i 
3. move necessary jsx file to the project root same level as ast.js | 将JSX放入ast.js同级
4. typing node ast.js <yourJSXfilename> | 控制台切入项目使用指令 node ast.js <你的JSX文件名>
5. .axml .acss .js file will appear on your root hopefully

# In-working-progress|功能缺陷

not support components in react, will be brought into mini program as is

不支持JSX中的引入模版或者自定义模版

not support import or require automation, will need to be handled manually

不支持自动化管理第三方lib的引入,需要手动处理

may exists other unknown malfunctions, please leave a msg

可能存在其它未知缺陷,请多多支持




