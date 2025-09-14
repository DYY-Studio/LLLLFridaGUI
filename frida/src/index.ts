import "frida-il2cpp-bridge";

let globalConfig = {
    "MagicaClothSimulationFrequency": 120,
    "MagicaClothSimulationCountPerFrame": 5,
    "LowQualityLongSide": 1920,
    "MediumQualityLongSide": 2880,
    "HighQualityLongSide": 3840,
    "LowQualityAdvFactor": 1.0,
    "MediumQualityAdvFactor": 1.5,
    "HighQualityAdvFactor": 2.0,
    "MaximumFPS": 60,
    "OrientationModify": false,
    "ForceRotate": false,
    "RemoveImgCover": false,
    "AntiAliasing": 8,
    "ModifyWithToFes": false,
    "LocalizeArchive": false,
    "TargetClientVersion": "",
    "TargetResVersion": "",
    "NovelSingleCharDisplayTime": 0.03,
    "NovelTextAnimationSpeedFactor": 1.3,
    "AutoNovelAuto": false,
    "AutoCloseSubtitle": false,
    "ProxyUrl": "",
    "ProxyUsername": "",
    "ProxyPassword": "",
}

var hasloaded = false

rpc.exports = {
    setconfig: (cfg: Partial<typeof globalConfig>) => {
        globalConfig = { ...globalConfig, ...cfg }
        console.log("Config updated")

        if (!hasloaded) return;
        const UnityEngineCoreModule = Il2Cpp.domain.assembly("UnityEngine.CoreModule")
        const UnityScreen = UnityEngineCoreModule.image.class("UnityEngine.Screen")
        const UnityApplication = UnityEngineCoreModule.image.class("UnityEngine.Application")
        const EmptyString = Il2Cpp.corlib.class("System.String").field<Il2Cpp.String>("Empty").value
        const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp")
        const SystemDll = Il2Cpp.domain.assembly("System")
        UnityApplication.method("set_targetFrameRate").invoke(
            Math.min((UnityScreen.method("get_currentResolution").invoke() as Il2Cpp.Object).method("get_refreshRate").invoke() as number, globalConfig["MaximumFPS"])
        )
        const UnityQualitySettings = UnityEngineCoreModule.image.class("UnityEngine.QualitySettings")
        UnityQualitySettings.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"])
        if (globalConfig["ForceRotate"]) {
        // 对于无法正确旋转的MacOS系统，强制旋转。
            UnityScreen.method("set_orientation").invoke(5)
            UnityScreen.method("set_orientation").invoke(4)
        }

        if (globalConfig.ProxyUrl) {
            const apiClient = AssemblyCSharp.image.class("Org.OpenAPITools.Client.Configuration")
            .method<Il2Cpp.Object>("get_Default").invoke()
            .method<Il2Cpp.Object>("get_ApiClient").invoke()
            .method<Il2Cpp.Object>("get_RestClient").invoke();
            const proxyUri = SystemDll.image.class("System.Uri").new()
            proxyUri.method(".ctor").overload("System.String").invoke(
                Il2Cpp.string(globalConfig.ProxyUrl)
            )
            const networkCredential = SystemDll.image.class("System.Net.NetworkCredential").new()
            networkCredential.method(".ctor").overload("System.String", "System.String").invoke(
                globalConfig.ProxyUsername?Il2Cpp.string(globalConfig.ProxyUsername):EmptyString,
                globalConfig.ProxyPassword?Il2Cpp.string(globalConfig.ProxyPassword):EmptyString
            )
            const webProxy = SystemDll.image.class("System.Net.WebProxy").new()
            webProxy.method(".ctor").overload(proxyUri.class, "System.Boolean", "System.String[]", networkCredential.class).invoke(
                proxyUri,
                true,
                Il2Cpp.array(Il2Cpp.corlib.class("System.String"), 0),
                networkCredential
            )
            apiClient.method("set_Proxy").invoke(webProxy)
        }
    },
    getconfig: () => globalConfig
}

var serverResVersion = ""

Il2Cpp.perform(() => {
    hasloaded = true

    const UnityEngineCoreModule = Il2Cpp.domain.assembly("UnityEngine.CoreModule")

    const UnityScreen = UnityEngineCoreModule.image.class("UnityEngine.Screen")

    const UnityApplication = UnityEngineCoreModule.image.class("UnityEngine.Application")
    const UnityQualitySettings = UnityEngineCoreModule.image.class("UnityEngine.QualitySettings")
    const UnityRenderPipelinesRuntime = Il2Cpp.domain.assembly("Unity.RenderPipelines.Universal.Runtime")
    const UniversalRenderPipeline = UnityRenderPipelinesRuntime.image.class("UnityEngine.Rendering.Universal.UniversalRenderPipeline")

    const MagicaClothV2 = Il2Cpp.domain.assembly("MagicaClothV2")
    const MagicaManager = MagicaClothV2.image.class("MagicaCloth2.MagicaManager")

    const Core = Il2Cpp.domain.assembly("Core")
    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp")

    // 修改MagicaClothV2的模拟频率
    MagicaManager.method("SetSimulationFrequency").implementation = function (frequency) {
        console.log(`【SetSimulationFrequency】${frequency}, modify to ${globalConfig["MagicaClothSimulationFrequency"]}`)
        return this.method("SetSimulationFrequency").invoke(globalConfig["MagicaClothSimulationFrequency"])
    }
    MagicaManager.method("SetMaxSimulationCountPerFrame").implementation = function (count) {
        console.log(`【SetMaxSimulationCountPerFrame】${count}, modify to ${globalConfig.MagicaClothSimulationCountPerFrame}`)
        return this.method("SetMaxSimulationCountPerFrame").invoke(globalConfig.MagicaClothSimulationCountPerFrame)
    }

    
    function get_SaveData() {
        return AssemblyCSharp.image.class("Global").method<Il2Cpp.Object>("get_Instance").invoke().method<Il2Cpp.Object>("get_SaveData").invoke() 
    }

    const EmptyString = Il2Cpp.corlib.class("System.String").field<Il2Cpp.String>("Empty").value

    if (Core.image.tryClass("Alstromeria.ArchiveLiveDataStream") != null) {
        
        /**
        * 从ArchiveLiveDataStream捕获AlstArchiveFileDownloaders实例
        * 
        * 使Alstromeria系统的Archive也可以使用本地缓存进行播放，而非每次都重新下载
        *
        * @param directoryManager AlstArchiveDirectory
        * @param downloader AlstArchiveFileDownloader
        * @param fileSystem AlstArchiveFileSystem
        */
        Core.image.class("Alstromeria.ArchiveLiveDataStream").method(".ctor").implementation = function (directoryManager, downloader, fileSystem) {
            const objDownloader = downloader as Il2Cpp.Object

            /**
            * 捕获AlstArchiveFileDownloaders实例的IsDownloaded方法
            * 
            * 对于file添加额外的Exists确认，对于已存在的缓存，设置该文件状态为已下载，并返回true
            *
            * @param file Alst.IFile
            * @returns boolean
            */
            objDownloader.method("IsDownloaded").revert()
            objDownloader.method("IsDownloaded").implementation = function (file) {
                var result = this.method("IsDownloaded").invoke(file) as boolean
                if (!result) {
                    const objFile = file as Il2Cpp.Object
                    const name = objFile.method("get_Name").invoke() as Il2Cpp.String
                    const downloadStatus = this.field("downloadStatus").value as Il2Cpp.Object
                    const path = this.field<Il2Cpp.Object>("directoryManager").value.method<Il2Cpp.String>("GetLocalFullPathFromFileName").invoke(name)

                    const fileExists = Il2Cpp.corlib.class("System.IO.File").method("Exists").invoke(path) as boolean
                    if (fileExists) {
                        downloadStatus.method("set_Item").invoke(file, 2)
                        result = true
                    }
                    console.log(`IsDownloadedReCheck(${name}) ${result}`)
                }
                return result
            }
            return this.method(".ctor").invoke(directoryManager, downloader, fileSystem)
        }
    }

    /**
     * 按照设置的质量档位，获取对应的渲染分辨率
     * - 低 1080p
     * - 一般 1620p
     * - 高 2160p(4K)
     * @param isLongSide 是否是长边
     */
    function getSize(quality: number = -1, isLongSide: number = 1) {
        if (quality == -1) {
            quality = get_SaveData().method<Il2Cpp.ValueType>("get_RenderTextureQuality").invoke().field<number>("value__").value
        }
        
        var size = 0
        switch (quality) {
            case 1:
                size = globalConfig["MediumQualityLongSide"]
                break
            case 2:
                size = globalConfig["HighQualityLongSide"]
                break
            default:
                size = globalConfig["LowQualityLongSide"]
        }
        
        if (!isLongSide) {
            return Math.floor(size / 16 * 9)
        } else {
            return size
        }
    }

    if (AssemblyCSharp.image.tryClass("School.LiveMain.SchoolResolution")) {
        const SchoolResolution = AssemblyCSharp.image.class("School.LiveMain.SchoolResolution")

        /**
         * 替换内置的质量档位到分辨率词典
         * @param _liveAreaResolutions School.LiveMain.SchoolResolution._liveAreaResolutions
         */
        function setResolutions(_liveAreaResolutions: Il2Cpp.Object) {
            for (let i = 0; i < 3; i++) {
                const LiveResolution = _liveAreaResolutions.method("get_Item").invoke(i) as Il2Cpp.Object
                LiveResolution.field("_longSide").value = getSize(i, 1)
                LiveResolution.field("_shortSide").value = getSize(i, 0)
            }
        }

        /**
         * 检查是否已经套用自定义的分辨率，没有套用则套用
         * @param quality School.LiveMain.SchoolResolution.LiveAreaQuality
         * @param orientation School.LiveMain.SchoolResolution.LiveResolution
         */
        AssemblyCSharp.image.class("School.LiveMain.SchoolResolution").method("GetResolution").implementation = function (quality, orientation) {
            const _liveAreaResolutions = SchoolResolution.field("_liveAreaResolutions").value as Il2Cpp.Object
            const numQuality = (quality as Il2Cpp.ValueType).field<number>("value__").value
            const longSide = _liveAreaResolutions.method<Il2Cpp.Object>("get_Item").invoke(numQuality).field<number>("_longSide").value

            if (getSize(numQuality, 1) != longSide) {
                setResolutions(_liveAreaResolutions)
            }

            const result = this.method("GetResolution").invoke(quality, orientation)
            console.log("GetResolution", result)
            return result
        }
    }

    const AlphaBlendCamera = Core.image.class("Inspix.AlphaBlendCamera")

    var alphaModified: boolean = false
    /** Fes×LIVE进行AlphaBlend时降低分辨率至更低画质档位以保证帧率
     * 
     * 基于Apple M4平台进行测试，AlphaBlend应当在1080p才能保证稳定的60FPS
     * 
     * @param newAlpha 目标透明度
    */
    AlphaBlendCamera.method("UpdateAlpha").implementation = function (newAlpha) {
        const alpha = newAlpha as number
        const RenderTextureQuality = get_SaveData().method("get_RenderTextureQuality").invoke() as Il2Cpp.ValueType
        const quality = RenderTextureQuality.field<number>("value__").value

        if (alpha > 0 && alpha < 1) {
            if (!alphaModified && quality > 0) {
                alphaModified = true
                get_SaveData().method("set_RenderTextureQuality").invoke(quality - 1)
            }
        }
        else if (alphaModified) {
            alphaModified = false
            if (quality < 2) get_SaveData().method("set_RenderTextureQuality").invoke(quality + 1)
        }
        this.method("UpdateAlpha").invoke(newAlpha)
    }

    /**
     *  针对第二音乐堂（八重咲舞台）边界过近导致Focus失效的问题，将边界左右扩展0.5
     */ 
    Core.image.class("Inspix.Character.IsFocusableChecker").method("SetFocusArea").implementation = function () {
        this.method("SetFocusArea").invoke()
        const focusAreaMaxValue = this.field("focusAreaMaxValue").value as Il2Cpp.Object
        const focusAreaMinValue = this.field("focusAreaMinValue").value as Il2Cpp.Object
        focusAreaMaxValue.handle.add(0x00).writeFloat(focusAreaMaxValue.handle.add(0x00).readFloat() + 0.50)
        focusAreaMinValue.handle.add(0x00).writeFloat(focusAreaMinValue.handle.add(0x00).readFloat() - 0.50)
        console.log(`【IsFocusableChecker.SetFocusArea】${this.field("focusAreaMinValue").value} ${this.field("focusAreaMaxValue").value}`)
    }

    /**
     *  修改所有Fixed机位（Arena, Stand）的设置，解除其移动和旋转限制，扩展FOV可调范围，提高灵敏度
     */ 
    AssemblyCSharp.image.class("School.LiveMain.FesLiveFixedCamera").method(".ctor").implementation = function ( camera, targetTexture, setting, cameraType) {
        const objCameraSetting = setting as Il2Cpp.Object
        const CameraType = cameraType as Il2Cpp.Object
        console.log(`【FixedCamera.ctor】${objCameraSetting} ${setting} ${CameraType.toString()}`)
        objCameraSetting.handle.add(0x1C).writeFloat(1000000.0) // moveRadiusLimit
        objCameraSetting.handle.add(0x2C).writeFloat(360.0) // rotateAngleLimit

        objCameraSetting.handle.add(0x3C).writeFloat(0.1) // panSensitivity
        objCameraSetting.handle.add(0x34).writeFloat(10.0) // fovRange: min
        objCameraSetting.handle.add(0x38).writeFloat(150.0) // fovRange: max

        const objRenderTexture = targetTexture as Il2Cpp.Object
        objRenderTexture.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"])

        if (CameraType.toString() == "LiveCameraTypeArenaView") {
            objCameraSetting.handle.add(0x10).writeFloat(0.0) // defaultWorldPosition: x
            objCameraSetting.handle.add(0x14).writeFloat(0.9) // defaultWorldPosition: y
            objCameraSetting.handle.add(0x18).writeFloat(-4.0) // defaultWorldPosition: z

            objCameraSetting.handle.add(0x20).writeFloat(0.0) // defaultWorldRotationEuler: x
            objCameraSetting.handle.add(0x24).writeFloat(0.0) // defaultWorldRotationEuler: y
            objCameraSetting.handle.add(0x28).writeFloat(0.0) // defaultWorldRotationEuler: z
        }
        else {
            objCameraSetting.handle.add(0x10).writeFloat(0.0) // defaultWorldPosition: x
            objCameraSetting.handle.add(0x14).writeFloat(7.5) // defaultWorldPosition: y
            objCameraSetting.handle.add(0x18).writeFloat(0.5) // defaultWorldPosition: z

            objCameraSetting.handle.add(0x20).writeFloat(90.0) // defaultWorldRotationEuler: x
            objCameraSetting.handle.add(0x24).writeFloat(0.0) // defaultWorldRotationEuler: y
            objCameraSetting.handle.add(0x28).writeFloat(0.0) // defaultWorldRotationEuler: z
        }

        return this.method(".ctor").invoke(camera, targetTexture, setting, cameraType)
    }

    /**
     *  这是为了便于我录制全身Focus而将Focus向下旋转9.0
     */ 
    // AssemblyCSharp.image.class("School.LiveMain.IdolFrontCraneCamera").method("CalculateDefaultLocalRotation").implementation = function () {
    //     const result = this.method("CalculateDefaultLocalRotation").invoke() as Il2Cpp.Object

    //     const current = result.handle.add(0x00).readFloat()
    //     if (current > 9.0) {
    //         result.handle.add(0x00).writeFloat(current - 9.0)
    //     }

    //     return result
    // }
    
    /**
     * 调整Focus，解除其移动和旋转限制，扩展FOV可调范围，提高灵敏度
     * 
     * 为了方便我的录制，将初始位置设置为(0.0, 0.0, 6.0)
     */ 
    AssemblyCSharp.image.class("School.LiveMain.IdolTargetingCamera").method(".ctor").implementation = function ( camera,  targetTexture,  setting) {
        const objCameraSetting = setting as Il2Cpp.Object
        
        objCameraSetting.handle.add(0x24).writeFloat(100000.0) // moveRadiusLimit
        objCameraSetting.handle.add(0x34).writeFloat(360.0) // rotateAngleLimit
        objCameraSetting.handle.add(0x54).writeFloat(0.05) // panSensitivity
        objCameraSetting.handle.add(0x3C).writeFloat(10.0) // fovRange: min
        objCameraSetting.handle.add(0x40).writeFloat(150.0) // fovRange: max

        objCameraSetting.handle.add(0x18).writeFloat(0.0) // defaultWorldPosition: x
        objCameraSetting.handle.add(0x1C).writeFloat(1.2) // defaultWorldPosition: y
        objCameraSetting.handle.add(0x20).writeFloat(6.0) // defaultWorldPosition: z

        objCameraSetting.handle.add(0x28).writeFloat(0.0) // defaultWorldRotationEuler: x

        objCameraSetting.handle.add(0x38).writeFloat(56.0) // defaultFov

        objCameraSetting.handle.add(0x44).writeFloat(0.1) // followSpeed
        objCameraSetting.handle.add(0x4C).writeFloat(0.0) // boundSizeRange: min
        objCameraSetting.handle.add(0x50).writeFloat(500.0) // boundSizeRange: max
        console.log(`【IdolTargetingCamera.ctor】${setting}`)
        // objCameraSetting.handle.add(0x48).writeFloat(200.0) // boundSize
        // objCameraSetting.handle.add(0x4C).writeFloat(0.0) // boundSizeRange: min
        // objCameraSetting.handle.add(0x50).writeFloat(500.0) // boundSizeRange: max

        const objRenderTexture = targetTexture as Il2Cpp.Object
        objRenderTexture.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"])
        this.method(".ctor").invoke(camera, targetTexture, setting)

        const tracer = this.field("tracer").value as Il2Cpp.Object
        const defaultWorldPositionFromIdol = tracer.class.field("defaultWorldPositionFromIdol").value as Il2Cpp.Object
        defaultWorldPositionFromIdol.method("Set").invoke(0.0, 0.0, 6.0)
        tracer.class.field("defaultWorldPositionFromIdol").value = defaultWorldPositionFromIdol
    }

    /**
     * 从CreateRenderTextureDescriptor入手，修改StoryCamera对应的RenderTexture
     * 
     * 渲染分辨率直接使用LiveStream的质量设置
     */
    UniversalRenderPipeline.method("CreateRenderTextureDescriptor").implementation = function (camera, renderScale, isHdrEnabled, msaaSamples, needsAlpha, requiresOpaqueTexture) {
        const objCamera = camera as Il2Cpp.Object
        
        if (!objCamera.toString().startsWith("StoryCamera")) {
            return this.method("CreateRenderTextureDescriptor").invoke(camera, renderScale, isHdrEnabled, msaaSamples, needsAlpha, requiresOpaqueTexture)
        }
        const quality = (get_SaveData().method("get_RenderTextureQuality").invoke() as Il2Cpp.ValueType).field<number>("value__").value

        const RenderTexture = objCamera.method("get_targetTexture").invoke() as Il2Cpp.Object
        if  (!RenderTexture.isNull()) {
            const RenderTextureHeight = RenderTexture.method("get_height").invoke() as number
            const RenderTextureWidth = RenderTexture.method("get_width").invoke() as number

            var factor = 1.0
            switch (quality) {
                case 0:
                    factor = globalConfig.LowQualityAdvFactor
                    break
                case 1:
                    factor = globalConfig.MediumQualityAdvFactor
                    break
                case 2:
                    factor = globalConfig.HighQualityAdvFactor
                    break
            }

            RenderTexture.method("set_width").invoke(Math.floor(RenderTextureWidth * factor))
            RenderTexture.method("set_height").invoke(Math.floor(RenderTextureHeight * factor))
            RenderTexture.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"])
            RenderTexture.method("set_autoGenerateMips").invoke(true)
            RenderTexture.method("set_useMipMap").invoke(true)
            RenderTexture.method("set_useDynamicScale").invoke(true)
        }
        
        return this.method("CreateRenderTextureDescriptor").invoke(camera, renderScale, isHdrEnabled, msaaSamples, needsAlpha, requiresOpaqueTexture)
    }

    // 修改抗锯齿至8
    UnityQualitySettings.method("set_antiAliasing").implementation = function (aa) {
        return this.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"])
    }

    // 对于无法正确旋转的macOS系统，禁用旋转相关函数
    AssemblyCSharp.image.class("Inspix.PlayerGameViewUtilsImpl").method("SetPortraitImpl").implementation = function () {
        if (globalConfig["OrientationModify"]) console.log(`【REQUEST_ORIENTATION】DO NOTHING`)
            else return this.method("SetPortraitImpl").invoke()
    }

    AssemblyCSharp.image.class("Inspix.PlayerGameViewUtilsImpl").method("SetLandscapeImpl").implementation = function () {
        if (globalConfig["OrientationModify"]) console.log(`【REQUEST_ORIENTATION】DO NOTHING`)
            else return this.method("SetLandscapeImpl").invoke()
    }

    AssemblyCSharp.image.class("Inspix.PlayerGameViewUtilsImpl").method("CurrentOrientationIsImpl").implementation = function () {
        if (globalConfig["OrientationModify"]) {
            console.log(`【CURRENT_ORIENTATION_IS】modify to true`)
            return true
        } else {
            return this.method("CurrentOrientationIsImpl").invoke()
        }
    }

    // 修改帧率至targetFPS（最高为设备刷新率）
    UnityApplication.method("set_targetFrameRate").implementation = function (fps) {

        const targetFPS = Math.min((
            UnityScreen.method("get_currentResolution").invoke() as Il2Cpp.Object
        ).method("get_refreshRate").invoke() as number, globalConfig["MaximumFPS"])

        console.log(`【SET_TARGET_FRAME_RATE】request: ${fps}, modify to ${targetFPS}`)
        return this.method("set_targetFrameRate").invoke(targetFPS)
    }

    UnityApplication.method("set_targetFrameRate").invoke(
        Math.min((UnityScreen.method("get_currentResolution").invoke() as Il2Cpp.Object).method("get_refreshRate").invoke() as number, globalConfig["MaximumFPS"])
    )
    UnityQualitySettings.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"])

    
    /**
     * 通过Hook CoverImageCommandReceiver隐藏遮挡图像
     */
    Core.image.class("Inspix.CoverImageCommandReceiver").method("<Awake>b__9_0").implementation = function (value) { 
        const objValue = value as Il2Cpp.Object
        if (globalConfig["RemoveImgCover"]) {
            objValue.method(".ctor").invoke(
                EmptyString,
                objValue.field<number>('SyncTime').value
            )
        }
        this.method("<Awake>b__9_0").invoke(objValue)
    }

    /**
     * 隐藏遮挡图像的同时，强制可视化角色阴影
     */
    Core.image.class("Inspix.Character.FootShadow.FootShadowManipulator").method("<SetupObserveProperty>b__15_0").implementation = function (value) {
        const objValue = value as Il2Cpp.Object
        if (globalConfig.RemoveImgCover) {
            objValue.method(".ctor").invoke(
                true,
                objValue.field<number>('SyncTime').value
            )
        }
        this.method("<SetupObserveProperty>b__15_0").invoke(objValue)
    }

    /**
     * 隐藏遮挡图像的同时，强制可视化角色模型
     */
    Core.image.class("Inspix.Character.CharacterVisibleReceiver").method("<SetupReceiveActions>b__9_0").implementation = function (value) {
        const objValue = value as Il2Cpp.Object
        if (globalConfig.RemoveImgCover) {
            objValue.method(".ctor").invoke(
                true,
                objValue.field<number>('SyncTime').value
            )
        }
        this.method("<SetupReceiveActions>b__9_0").invoke(objValue)
    }

    // Archive修改相关结构
    type LiveChapter = {
        is_available: boolean,
        is_extra: boolean,
        name: string,
        play_time_second: number
    }

    type ArchiveData = {
        archive_url: string,
        live_type: number,
        chapters: Array<LiveChapter>,
        costume_ids: Array<number>,
        timeline_ids: Array<number>,
    }

    var archiveData: ArchiveData = {
        archive_url: "",
        live_type: 3,
        chapters: [],
        costume_ids: [],
        timeline_ids: []
    }
    var archiveDataGet: MessageRecvOperation

    // 从With×MEETS和Fes×LIVE的数据请求中获取目前正在请求的ArchiveId，并向前端请求数据
    AssemblyCSharp.image.class("School.LiveMain.ApiRepository").method("ArchiveGetFesArchiveDataAsync").implementation = function (archiveId) {
        if (globalConfig.LocalizeArchive) {
            send({type: "archiveDataGet", archive_id: (archiveId as Il2Cpp.String).content})
            archiveDataGet = recv("archiveData", function (data) {
                archiveData = data.payload
            })
            archiveDataGet.wait()
        }
        
        return this.method<Il2Cpp.Object>("ArchiveGetFesArchiveDataAsync").invoke(archiveId)
    }

    AssemblyCSharp.image.class("School.LiveMain.ApiRepository").method("ArchiveGetWithArchiveDataAsync").implementation = function (archiveId) {
        if (globalConfig.LocalizeArchive) {
            send({type: "archiveDataGet", archive_id: (archiveId as Il2Cpp.String).content})
            archiveDataGet = recv("archiveData", function (data) {
                archiveData = data.payload
            })
            archiveDataGet.wait()
        }
                
        return this.method<Il2Cpp.Object>("ArchiveGetWithArchiveDataAsync").invoke(archiveId)
    }

    const GetWithArchiveDataResponse = AssemblyCSharp.image.class("Org.OpenAPITools.Model.GetWithArchiveDataResponse")
    const GetFesArchiveDataResponse = AssemblyCSharp.image.class("Org.OpenAPITools.Model.GetFesArchiveDataResponse")

    // 修改资源版本数据
    const globalClass = AssemblyCSharp.image.class("Global").method<Il2Cpp.Object>("get_Instance").invoke()  
    globalClass.method<Il2Cpp.Object>("get_Resources").invoke().method("TryUpdatedRequestedResourceVersion").implementation = function (serverResver) {
        // console.log("serverResver:", serverResver, globalConfig["TargetResVersion"])
        var result = true;
        if (globalConfig["TargetResVersion"]) {
            result = this.method<boolean>("TryUpdatedRequestedResourceVersion").invoke(Il2Cpp.string(globalConfig["TargetResVersion"]))
        }
        else result = this.method<boolean>("TryUpdatedRequestedResourceVersion").invoke(serverResver)

        return result
    }

    type fesTimelineDataRequestBody = {
        ArchivesId: string,
        PlayTimeSecond: number,
        TimelineUnixtime: number
    }

    /**
     * 从CallAPIAsync截获请求数据，修改头部伪装客户端版本，修改路径在Fes×LIVE启动With×MEETS时请求With×MEETS数据
     */
    AssemblyCSharp.image.class("Org.OpenAPITools.Client.ApiClient").method("CallApiAsync").implementation = function (
        path, method, queryParams, postBody, headerParams, formParams, fileParams, pathParams, contentType, cancellationtoken
    ){
        const objHeaderParams = headerParams as Il2Cpp.Object
        if (serverResVersion) {
            const xresversion = Il2Cpp.string("x-res-version")
            if (objHeaderParams.method<boolean>("ContainsKey").invoke(xresversion)) {
                objHeaderParams.method("set_Item").invoke(xresversion, Il2Cpp.string(serverResVersion.split("@")[0]))
            }
        }

        const strPath = (path as Il2Cpp.String).content??""

        if (globalConfig.ModifyWithToFes) {
            if (archiveData.live_type == 2) {
                if (strPath.endsWith("get_fes_archive_data")) {
                    path = Il2Cpp.string("/v1/archive/get_with_archive_data")
                }
                else if (strPath.endsWith("get_fes_timeline_data")) {
                    path = Il2Cpp.string("/v1/archive/withlive_info")
                    const body = JSON.parse((postBody as Il2Cpp.String).content??"{}") as fesTimelineDataRequestBody
                    postBody = EmptyString

                    const params = queryParams as Il2Cpp.Object
                    const classStr = Il2Cpp.corlib.class("System.String")
                    const kvPair = Il2Cpp.corlib.class("System.Collections.Generic.KeyValuePair`2").inflate(
                        classStr, classStr
                    )

                    const matching = [
                        ["live_id", body.ArchivesId],
                        ["play_time_second", body.PlayTimeSecond?.toString()],
                        ["timeline_unixtime", body.TimelineUnixtime?.toString()]
                    ]
                    for (const [key, value] of matching) {
                        if (!key || !value) continue
                        const objKVPair = kvPair.new()
                        objKVPair.method("set_Key").invoke(Il2Cpp.string(key))
                        objKVPair.method("set_Value").invoke(Il2Cpp.string(value))
                        params.method("Add").invoke(objKVPair)
                    }
                }
            }
        }
        // console.log(path, postBody, queryParams)

        return this.method("CallApiAsync").invoke(path, method, queryParams, postBody, headerParams, formParams, fileParams, pathParams, contentType, cancellationtoken)
    }

    type fesCamera = {
        CameraType: number,
        FocusCharacterId: number
    }

    var fesCameraCache: fesCamera = {
        CameraType: 1,
        FocusCharacterId: 0
    }

    // 从序列化函数下手，将Fes启动With时的镜头设置请求统一设置为请求25/08/29 Fes×LIVE
    AssemblyCSharp.image.class("Org.OpenAPITools.Client.ApiClient").method("Serialize").implementation = function (obj) {
        const objObj = obj as Il2Cpp.Object
        if (globalConfig.ModifyWithToFes && objObj.class.fullName == "Org.OpenAPITools.Model.SetFesCameraRequest") {
            if (archiveData.live_type == 2) {
                fesCameraCache = {
                    CameraType: objObj.method<Il2Cpp.ValueType>("get_CameraType").invoke().field<number>("value___").value,
                    FocusCharacterId: objObj.method<number>("get_FocusCharacterId").invoke()
                }
                objObj.method("set_LiveId").invoke(Il2Cpp.string("2fd5361e-75a5-4442-a006-3cd83f6e20cf"))
                objObj.method("set_CameraType").invoke(1)
                objObj.method("set_FocusCharacterId").invoke(0)
            }
        }
        return this.method("Serialize").invoke(objObj)
    }

    // 从反序列化函数下手，伪造返回的客户端版本值，将Fes启动With时的各个请求还原为Fes×LIVE类型
    AssemblyCSharp.image.class("Org.OpenAPITools.Client.ApiClient").method("Deserialize").implementation = function (response, returnType) {
        const objResponse = response as Il2Cpp.Object
        if (globalConfig.TargetResVersion) {
            const headers = objResponse.method<Il2Cpp.Object>("get_Headers").invoke()
            const Enumerator = headers.method<Il2Cpp.Object>("GetEnumerator").invoke()
            while (Enumerator.method("MoveNext").invoke()) {
                const entry = Enumerator.method<Il2Cpp.Object>("get_Current").invoke()
                if (entry.method<Il2Cpp.String>("get_Name").invoke().content == "x-res-version") {
                    serverResVersion = entry.method<Il2Cpp.Object>("get_Value").invoke().method<Il2Cpp.String>("Trim").invoke().content??""
                    entry.method("set_Value").invoke(Il2Cpp.string(globalConfig["TargetResVersion"]))
                    break
                }
            }
        }

        var objType = returnType as Il2Cpp.Object
        const typeName = objType.method<Il2Cpp.String>("get_FullName").invoke().content??""

        if (globalConfig.LocalizeArchive || globalConfig.ModifyWithToFes) {
            if (globalConfig.ModifyWithToFes) {
                if (archiveData.live_type == 2 && typeName == GetWithArchiveDataResponse.fullName) {
                    objType = Il2Cpp.corlib.class("System.Type").method<Il2Cpp.Object>("GetType").overload("System.String").invoke(
                        Il2Cpp.string(GetFesArchiveDataResponse.fullName)
                    )
                }
            }
        }

        const result = this.method<Il2Cpp.Object>("Deserialize").invoke(objResponse, objType)
        
        // 修改Archive为本地渲染
        if ([GetWithArchiveDataResponse.fullName, GetFesArchiveDataResponse.fullName].includes(typeName)) {
            const objData = result
            const objChapters = objData.method<Il2Cpp.Object>("get_Chapters").invoke()
            if (globalConfig.LocalizeArchive) {
                if (archiveData && archiveData.archive_url) {
                    const objCostumeIds = objData.method<Il2Cpp.Object>("get_CostumeIds").invoke()
                    const objTimelineIds = objData.method<Il2Cpp.Object>("get_TimelineIds").invoke()
                    objData.method("set_ArchiveUrl").invoke(Il2Cpp.string(archiveData.archive_url))

                    for (let i = 0; i < objChapters.method<number>("get_Count").invoke(); i++) {
                        const chapter = objChapters.method<Il2Cpp.Object>("get_Item").invoke(i)
                        if (i < archiveData.chapters.length) {
                            chapter.method("set_PlayTimeSecond").invoke(archiveData.chapters[i].play_time_second)
                        } else {
                            break
                        }
                    }

                    if (objCostumeIds.method<number>("get_Count").invoke() == 0) {
                        archiveData.costume_ids.forEach(function (costume_id) {
                            objCostumeIds.method("Add").invoke(costume_id)
                        })
                    }

                    if (objTimelineIds.method<number>("get_Count").invoke() == 0) {
                        archiveData.timeline_ids.forEach(function (timeline_id) {
                            objTimelineIds.method("Add").invoke(timeline_id)
                        })
                    }

                    objData.method("set_ContentCode").invoke(999)
                    if (result.class.fullName == GetWithArchiveDataResponse.fullName) {
                        objData.method("set_VideoUrl").invoke(EmptyString)
                    }
                }
            }
            if (globalConfig.RemoveImgCover) {
                if (archiveData.live_type == 2) {
                    const theVeryFirst = AssemblyCSharp.image.class("Org.OpenAPITools.Model.ArchiveWithliveChapter").new()
                    objChapters.method("Insert").invoke(0, theVeryFirst)
                } else {
                    const theVeryFirst = AssemblyCSharp.image.class("Org.OpenAPITools.Model.ArchiveFesliveChapter").new()
                    objChapters.method("Insert").invoke(0, theVeryFirst)
                }
            }
            if ((archiveData.live_type == 2 && globalConfig.ModifyWithToFes) || archiveData.live_type == 1) {
                objData.method("set_TicketRank").invoke(6);

                const cameraType = AssemblyCSharp.image.class("Org.OpenAPITools.Model.LiveCameraType")
                const listCameraType = Il2Cpp.corlib.class("System.Collections.Generic.List`1").inflate(cameraType).new()
                objData.method("set_SelectableCameraTypes").invoke(
                    listCameraType
                );
                [1, 2, 3, 4].forEach(i => {
                    listCameraType.method("Add").invoke(i)
                })
            }
            objData.method("set_HasExtraAdmission").invoke(true)
        } else if (typeName == "Org.OpenAPITools.Model.GetArchiveListResponse") {
            const archiveList = result.method<Il2Cpp.Object>("get_ArchiveList").invoke()
            const enumerator = archiveList.method<Il2Cpp.Object>("GetEnumerator").invoke()
            while (enumerator.method<boolean>("MoveNext").invoke()) { 
                const current = enumerator.method<Il2Cpp.Object>("get_Current").invoke()

                current.method("set_HasExtraAdmission").invoke(true)
                current.method("set_EarnedStarCount").invoke(4)
                current.method("set_TicketRank").invoke(6)

                if (globalConfig.ModifyWithToFes) {
                    current.method("set_LiveType").invoke(1)
                }
            }
        } else if (globalConfig.ModifyWithToFes && archiveData.live_type == 2 && typeName == "Org.OpenAPITools.Model.SetFesCameraResponse") {
            result.method("set_CameraType").invoke(fesCameraCache.CameraType)
            result.method("set_FocusCharacterId").invoke(fesCameraCache.FocusCharacterId)
        }
        // console.log(result)
        return result
    }
    
    // 在执行Parse时伪造Unity应用版本，执行结束时释放，以保证没有别的兼容性问题
    Core.image.class("Hailstorm.Catalog").method("Parse").overload("Hailstorm.Catalog.Manifest", "System.IO.Stream").implementation = function (manifest, stream) {
  
        if (globalConfig["TargetClientVersion"]) {
            UnityApplication.method("get_version").implementation = function () {
                return Il2Cpp.string(globalConfig["TargetClientVersion"])
            }
        }

        const result = this.method("Parse").overload("Hailstorm.Catalog.Manifest", "System.IO.Stream").invoke(manifest, stream)

        UnityApplication.method("get_version").revert()

        return result
    }

    AssemblyCSharp.image.class("Tecotec.StoryUIWindow").method("Setup").implementation = function (skipReturn, skipLine, timesec, seekbar) {
        this.method("Setup").invoke(skipReturn, skipLine, timesec, seekbar)
        if (globalConfig.AutoNovelAuto) {
            this.method("NovelAutoSpeed").invoke(1)
        }
        if (globalConfig.AutoCloseSubtitle) {
            const isSubtitle = this.field<Il2Cpp.Object>("menu").value.field<boolean>("isSubtitle").value
            if (isSubtitle) this.method("OnClickSwitchSubtitle").invoke()
        }
    }

    AssemblyCSharp.image.class("School.Story.NovelView").method("AddTextAsync").implementation = function (
        text, rubis, durationSec, shouldTapWait, addNewLine
    ) {
        const result = this.method("AddTextAsync").invoke(text, rubis, durationSec, shouldTapWait, addNewLine)
        this.field<Il2Cpp.Object>("textAnimation").value.handle.add(0x28).writeFloat(
            globalConfig.NovelTextAnimationSpeedFactor
        )
        return result
    }

    AssemblyCSharp.image.class("Tecotec.AddNovelTextCommand").method("GetDisplayTime").implementation = function (mnemonic) {
        var result = this.method<number>("GetDisplayTime").invoke(mnemonic) 
        if (!this.method<boolean>("HasVoice").invoke(mnemonic)) {
            return result * (globalConfig.NovelSingleCharDisplayTime / 0.03)
        }
        return result
    }

    console.log("successfully hook")
});