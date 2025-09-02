# LLLLToolGUI
基于frida的Link! Like! LoveLive! GUI工具

为macOS原生运行及iOS越狱设备设计，同时兼容Android设备（有无Root均可）和一般iOS设备（需要开发者账号）

仅在Mac mini (2024) *macOS Sequoia 15.3.1*上进行了测试

# 本程序仅供个人编程交流学习使用，请勿挪作它用！以其他用途导致的任何问题，开发者均不承担任何责任。

# 设备要求
> iOS

已越狱并有一台可用的Windows/Linux/macOS设备 或 拥有Apple开发者账号及macOS设备

> Android

有一台可用的Windows/Linux/macOS设备

> macOS

搭载**Apple Silicon**，可原生运行LLLL

# 实现功能
* 渲染分辨率提升 (LiveStream & Story)
  * LiveStream: 自定义分辨率（强制16:9）
  * Story: 1.0x, 1.5x和2.0x渲染分辨率
* 替换Archive为本地渲染源（数据来自[@ChocoLZS](https://github.com/ChocoLZS)）
* 运行低版本或低资源版本的LLLL（Android数据来自[@ChocoLZS](https://github.com/ChocoLZS)）
* 以Fes×LIVE模式运行With×MEETS（提供机位切换）
* 移除LiveStream遮挡图像
* 机位移动旋转限制与FOV限制放宽
  * Arena：顶部机位
  * Stand：背后机位
  * 未选择对象的Focus：原Arena
* 帧率上限解除至屏幕刷新率
* （macOS专用）禁用旋转/手动旋转

# 除分辨率和帧率提升功能外，严禁用于任何视频制作和直播

# 环境配置
## 桌面端
1. 在桌面设备（Windows, Linux, macOS）上安装Python 3.10+   
2. 安装Frida
   - `pip install frida frida-tools`

**请将本应用放置在独立的文件夹中，本应用需要在文件夹下保存一些内容**
## macOS (Apple Silicon)
使用PlayCover运行LLLL后，直接对Local进行附加即可。
## iOS
### 已越狱
1. 在Cydia或Sileo添加源`https://build.frida.re`
2. 安装`Frida`包
3. 连接电脑，USB即可看到iOS设备
### 未越狱
1. 准备好一台macOS设备和开发者账号
2. 使用Xcode将从[frida](https://github.com/frida/frida/releases)仓库下载的`frida-gadget`置入去壳的App中，并添加相应的载入逻辑
3. 使用开发者账号加壳，安装到设备上
## Android
### 已Root（模拟器）
1. 下载与frida版本相符的[frida-server](https://github.com/frida/frida/releases)，并将其传输到设备上
2. 修改frida-server的权限为可执行
   - `chmod 755 frida-server`
3. 启动frida-server，如果有端口冲突，使用`-l <host>:<port>`自行修改
   - `./frida-server -l localhost:<port>`
4. USB即可看到设备
### 未Root
> Xposed方案

参见 [FridaXposedModule](https://github.com/WindySha/FridaXposedModule)
> Objection方案

1. 安装[Objection](https://github.com/sensepost/objection)
   - `pip install objection`
2. 从[frida](https://github.com/frida/frida/releases)仓库下载`frida-gadget-android-<架构>.so`
3. 使用Objection重新打包应用，将`frida-gadget`也打包进去
4. 后续请参见其他教程）

# 从源码运行
安装必要的包
`pip install -r requirements.txt`
# 调试/编译TypeScript(Frida)
1. 安装`npm`
2. 在`main.py`中修改`COMPILE_WHEN_START`为`True`
# 致谢
* [Frida](https://frida.re/)
* [frida-il2cpp-bridge](https://github.com/vfsfitvnm/frida-il2cpp-bridge)
* [@ChocoLZS](https://github.com/ChocoLZS)