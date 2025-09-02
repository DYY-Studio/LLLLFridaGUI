# LLLLHRFrida
基于frida的Link! Like! LoveLive! Hook脚本

面向macOS及越狱iOS设备，但也兼容Android设备（无论是否Root）和无越狱iOS设备（需要开发者账号）

# 设备要求
> iOS

已越狱 或 拥有Apple开发者账号及macOS设备，并有一台可用的Windows/Linux/macOS设备。

> Android

有一台可用的Windows/Linux/macOS设备

> Mac

搭载M系列芯片，可原生运行LLLL

# 实现功能
* 渲染分辨率提升(LiveStream & Story)
  * LiveStream: 可自定义分辨率
  * Story: 1.0x, 1.5x和2.0x渲染分辨率
* 机位移动旋转限制与FOV限制解除
* 帧率上限解除至屏幕刷新率
* （macOS专用）禁用旋转/手动旋转
* 移除开始前/事故时/结束后/AFTER过渡部分的遮挡图像

# 环境配置
## MacOS
`pip install frida frida-tools`

`brew install node`
## Android
### 已Root
1. 在可用的Windows/Linux/MacOS设备上安装Python
2. 安装frida
   - `pip install frida frida-tools`
3. 下载与frida版本相符的[frida-server](https://github.com/frida/frida/releases)，并将其传输到移动设备上
4. 修改frida-server的权限为可执行
   - `chmod 755 frida-server`
5. 启动frida-server，如果有端口冲突，使用`-l <host>:<port>`自行修改

### 未Root
1. 在可用的Windows/Linux/MacOS设备上安装Python
> Xposed方案

参见 [FridaXposedModule](https://github.com/WindySha/FridaXposedModule)
> Objection方案

2. 安装[Objection](https://github.com/sensepost/objection)
   - `pip install objection`
3. 从[frida](https://github.com/frida/frida/releases)仓库下载`frida-gadget-android-<架构>.so`
4. 使用Objection重新打包应用，将`frida-gadget`也打包进去
5. 后续请参见其他教程）

## iOS
### 已越狱
1. 在可用的Windows/Linux/MacOS设备上安装Python
2. 在Cydia或Sileo添加源`https://build.frida.re`
3. 安装`Frida`包
4. 连接电脑，USB即可看到iOS设备

### 未越狱
1. 准备好一台macOS设备和开发者账号
2. 使用Xcode将`frida-gadget`置入去壳的App中，并添加相应的载入逻辑
3. 使用开发者账号加壳，安装到设备上

# 使用方法
1. cd进入项目目录
2. 打开一个命令提示符，`npm run build`
## macOS上运行的LLLL
3. 打开另一个命令提示符，`frida -l ./dist/_.js -n リンクラ`
## iOS/Android设备上的LLLL
3. 运行`frida -U -l ./dist/_.js -n com.oddno.lovelive`