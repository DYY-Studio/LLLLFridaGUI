import sys, frida, json, traceback, shutil, os, logging, math, requests, datetime
from urllib.parse import urlparse, urljoin
from requests import adapters
from PySide6 import QtCore, QtGui, QtWidgets
from PySide6.QtWidgets import QMessageBox
from typing import Optional

logger = logging.getLogger("MainLogger")
logger.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter('[%(asctime)s][%(levelname)s] %(message)s'))
logger.addHandler(console_handler)

app = QtWidgets.QApplication(sys.argv)

COMPILE_WHEN_START = False # DEBUG专用，启动时需要等待NPM进行编译

def exceptionHandle(exc_type, exc_value, exc_traceback):
    """全局异常处理函数"""
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return

    tb_str = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))

    logger.exception("Uncaught exception:", tb_str)

    # 弹出消息框
    crushMsgBox = QtWidgets.QMessageBox()
    crushMsgBox.setIcon(QtWidgets.QMessageBox.Icon.Critical)
    crushMsgBox.setWindowTitle("错误")
    crushMsgBox.setText("程序发生未处理的异常")
    crushMsgBox.setDetailedText(tb_str)
    crushMsgBox.setStandardButtons(QtWidgets.QMessageBox.StandardButton.Ok)
    crushMsgBox.exec()

if __name__ == "__main__":
    sys.excepthook = exceptionHandle

PROGRAM_DIR = os.path.dirname(os.path.realpath(sys.argv[0]))
if not os.access(PROGRAM_DIR, os.W_OK):
    QMessageBox.critical(None, 'Error', 'Program directory is not writable.\nPlease run the program as administrator.\nOr move the program to a writable directory.')
    sys.exit(1)

FRIDA_DIR = os.path.join(PROGRAM_DIR, 'frida')
FRIDA_SCRIPT = os.path.join(FRIDA_DIR, 'dist', '_.js')
npmProcess = QtCore.QProcess(app)

if COMPILE_WHEN_START:
    NPM_PROGRAM = shutil.which('npm')

    if NPM_PROGRAM is None:
        QMessageBox.critical(None, 'Error', 'Node.js not found')
        sys.exit(1)

    if not os.path.exists(FRIDA_DIR) or not os.path.exists(os.path.join(FRIDA_DIR, 'src', 'index.ts')):
        QMessageBox.critical(None, 'Error', 'Frida dir or TypeScript not found')
        sys.exit(1)
    else:
        if not os.path.exists(os.path.join(FRIDA_DIR, 'dist')):
            os.mkdir(os.path.join(FRIDA_DIR, 'dist'))

    npmProcess.setProcessChannelMode(QtCore.QProcess.ProcessChannelMode.MergedChannels)
    npmProcess.setProgram(shutil.which("npm"))
    npmProcess.setWorkingDirectory(FRIDA_DIR)


    progressDialog = QtWidgets.QProgressDialog()
    def npmCanceled():
        if npmProcess.state() != QtCore.QProcess.ProcessState.NotRunning:
            logger.info("npm install canceled")
            npmProcess.terminate()
            npmProcess.kill()
            progressDialog.close()
            sys.exit(1)

    progressDialog.setWindowTitle("NPM Installation Check")
    progressDialog.setLabelText("Please wait for npm install")
    progressDialog.setRange(0, 0)
    progressDialog.canceled.connect(npmCanceled)
    progressDialog.show()
    progressDialog.setWindowModality(QtCore.Qt.WindowModality.WindowModal)

    def npmFinished(exitCode, exitStatus):
        if exitStatus == QtCore.QProcess.ExitStatus.NormalExit and exitCode == 0:
            progressDialog.close()
            logger.info("npm install finished")
            npmProcess.finished.disconnect()
            runBuildArguments = ["run", "build"]
            npmProcess.setArguments(runBuildArguments)
            npmProcess.start()
            mainWindow.show()
        else:
            msgBox = QMessageBox()
            msgBox.setWindowTitle("Error")
            msgBox.setText("NPM Installation Error")
            msgBox.setDetailedText(npmProcess.readAll().data().decode())
            msgBox.exec()
            sys.exit(1)

    logger.info("Please wait for npm install")
    installArguments = ['install', '--verbose', '--registry', 'https://mirrors.cloud.tencent.com/npm/']
    npmProcess.setArguments(installArguments)
    npmProcess.finished.connect(npmFinished)
    npmProcess.start()
else:
    if not os.path.exists(os.path.join(FRIDA_DIR, 'dist', '_.js')):
        QMessageBox.critical(None, 'Error', 'Frida script not found')
        sys.exit(1)

def onChangeConnectMethod(idx: int):
    allDevices = frida.enumerate_devices()
    try:
        match idx:
            case 0: # REMOTE
                devices = [d for d in allDevices if d.type == 'remote']
                ui.connectDeviceComboBox.setEditable(False)
            case 1: # HOST
                devices = None
                ui.connectDeviceComboBox.setEditable(True)
            case 2: # USB
                devices = [d for d in allDevices if d.type == 'usb']
                ui.connectDeviceComboBox.setEditable(False)
            case 3: # LOCAL
                devices = [d for d in allDevices if d.type == 'local']
                ui.connectDeviceComboBox.setEditable(False)
            case 4: # DEVICE_ID
                devices = None
                ui.connectDeviceComboBox.setEditable(True)
        ui.connectDeviceComboBox.clear()
        if devices:
            for d in devices:
                ui.connectDeviceComboBox.addItem(f'{d.name} ({d.id})', d)
    except:
        logger.error('Failed to get devices')
        ui.connectDeviceComboBox.clear()
        devices = None

def onChangeConnectDevice(idx: int):
    device: frida.core.Device = ui.connectDeviceComboBox.itemData(idx)
    if device and device.is_lost:
        QMessageBox.warning(mainWindow, 'Warning', f'Device \"{device.name} ({device.id})\" is lost.')
        ui.connectDeviceComboBox.removeItem(idx)

class FridaWorker(QtCore.QObject):
    log_sig = QtCore.Signal(str)
    status_sig = QtCore.Signal(str)
    error_sig = QtCore.Signal(str)
    connected_sig = QtCore.Signal(bool)

    def __init__(self) -> None:
        super().__init__()
        self._device: Optional[frida.core.Device] = None
        self._session: Optional[frida.core.Session] = None
        self._script: Optional[frida.core.Script] = None
        self._connected = False
    
    @QtCore.Slot(str)
    def attach(self, device_id: str) -> None:
        """在指定设备上附加"""
        try:
            pid = None
            self._device = frida.get_device(device_id)

            for p in self._device.enumerate_processes():
                if p.name in ('リンクラ', 'com.oddno.lovelive', 'Link!Like!LoveLive!'):
                    pid = p.pid
                    break
            
            if pid is None:
                raise RuntimeError(f"Process not found")

            self._session = self._device.attach(pid)
            self._session.on("detached", self._on_detached)


            with open(FRIDA_SCRIPT, mode='r', encoding='utf-8') as f:
                self._script = self._session.create_script(f.read())
            self._script.on("message", self._on_message)
            self._script.load()


            self._connected = True
            self.connected_sig.emit(True)
            self.status_sig.emit(f"Attached to PID {pid}")
        except Exception as e:
            self.error_sig.emit(f"Attach failed: {e}")
            self.connected_sig.emit(False)

    @QtCore.Slot()
    def detach(self) -> None:
        try:
            if self._script is not None:
                self._script.unload()
                self._script = None
            if self._session is not None:
                self._session.detach()
                self._session = None
                self._connected = False
                self.connected_sig.emit(False)
                self.status_sig.emit("Detached")
        except Exception as e:
            self.error_sig.emit(f"Detach error: {e}")

    @QtCore.Slot(str)
    def set_config_json(self, cfg_json: str) -> None:
        """从 GUI 传入 JSON 文本，调用 RPC setconfig"""
        if not self._script:
            self.error_sig.emit("Not attached")
            return
        try:
            cfg = json.loads(cfg_json) if cfg_json.strip() else {}
            ok = self._script.exports_sync.setconfig(cfg)
            self.status_sig.emit(f"setconfig -> {ok}")
        except Exception as e:
            self.error_sig.emit(f"setconfig failed: {e}")

    def _on_message(self, message: dict, data) -> None:
        global ARCHIVE_DETAILS, ARCHIVE_LIST
        try:
            if message.get("type") == "send":
                payload = message.get("payload", {})
                if isinstance(payload, dict):
                    t = payload.get("type", "log")
                    if t in ("log", "vm", "config", "action-ok", "action-error", "error"):
                        self.log_sig.emit(t + json.dumps(payload, ensure_ascii=False))
                    elif t == "archiveDataGet":
                        archive_id = payload.get("archive_id", "")
                        if archive_id and archive_id in ARCHIVE_DETAILS and archive_id in ARCHIVE_LIST and ARCHIVE_LIST[archive_id].get("external_link", ""):
                            archive_detail = ARCHIVE_DETAILS[archive_id]
                            archive_info = ARCHIVE_LIST[archive_id]
                            self._script.post({
                                "type": "archiveData", 
                                "payload": {
                                    "live_type": archive_info['live_type'],
                                    "archive_url": urljoin("https://assets.link-like-lovelive.app", archive_info["external_link"]),
                                    "chapters": archive_detail["chapters"],
                                    "costume_ids": archive_detail["costume_ids"],
                                    "timeline_ids": archive_detail["timeline_ids"],
                                }})
                            self.log_sig.emit(f"Sent archive detail {archive_id}")
                        else:
                            self._script.post({
                                "type": "archiveData",
                                "payload": {
                                    "live_type": 2,
                                    "archive_url": "",
                                    "chapters": [],
                                    "costume_ids": [],
                                    "timeline_ids": []
                                }
                            })
                            self.error_sig.emit(f"Cannot find archive {archive_id}")
                            doUpdateArchiveDetails()
                    else:
                        self.log_sig.emit("Unknown" +str(payload))
                else:
                    self.log_sig.emit("UnknownType" + str(payload))
            elif message.get("type") == "error":
                desc = message.get("description", "<script error>")
                self.error_sig.emit(desc)
            else:
                self.log_sig.emit("UnknownMsg" +str(message))
        except Exception as e:
            self.error_sig.emit(f"on_message error: {e}")

    def _on_detached(self, reason: str, crash) -> None:
        self._connected = False
        self.connected_sig.emit(False)
        self.status_sig.emit(f"Session detached: {reason}")
        if crash:
            self.error_sig.emit(f"Crash info: {crash}")


fridaThread = QtCore.QThread(app)
fridaWorker = FridaWorker()
fridaWorker.moveToThread(fridaThread)
fridaThread.start()

def onAttach():

    def doAttach():
        ui.attachBtn.setEnabled(False)
        logger.info("Attaching, please wait...")
        QtCore.QMetaObject.invokeMethod(
            fridaWorker, 
            "attach", 
            QtCore.Qt.ConnectionType.QueuedConnection, 
            QtCore.Q_ARG(str, device.id))

    device: frida.core.Device = None
    if ui.connectMethodComboBox.currentIndex() in (0, 2, 3):
        device = ui.connectDeviceComboBox.itemData(ui.connectDeviceComboBox.currentIndex())
        if not isinstance(device, frida.core.Device):
            QMessageBox.warning(mainWindow, 'Warning', 'Please select a device.')
            return
        elif device.is_lost:
            QMessageBox.warning(mainWindow, 'Warning', f'Device \"{device.name} ({device.id})\" is lost.')
            ui.connectDeviceComboBox.removeItem(ui.connectDeviceComboBox.currentIndex())
            return
        else:
            doAttach()
    elif ui.connectMethodComboBox.currentIndex() == 4:
        deviceID = ui.connectDeviceComboBox.currentText()
        for device in frida.enumerate_devices():
            if device.id == deviceID:
                doAttach()
                return
        QMessageBox.warning(mainWindow, "Error", f"Device \"{deviceID}\" not found")
    elif ui.connectMethodComboBox.currentIndex() == 1:
        host = ui.connectDeviceComboBox.currentText()
        if host:
            try:
                device = frida.get_device_manager().add_remote_device(host)
                doAttach()
            except Exception as e:
                QMessageBox.warning(mainWindow, "Error", f"Failed to connect to {host}: {e}")
        else:
            QMessageBox.warning(mainWindow, "Error", "Please select a device")

def onDetach():
    QtCore.QMetaObject.invokeMethod(
        fridaWorker, 
        "detach", 
        QtCore.Qt.ConnectionType.QueuedConnection)

def readCfg(cfgPath: str):

    def getShortSide(longSide: int):
        return math.floor(int(longSide) / 16 * 9)

    try:
        with open(cfgPath, mode="r", encoding="utf-8") as f:
            cfg: dict[str, str] = json.load(f)
            ui.simulationFrequencySpinBox.setValue(cfg.get("MagicaClothSimulationFrequency", 120))
            ui.simulationCountPerFrameSpinBox.setValue(cfg.get("MagicaClothSimulationCountPerFrame", 5))
            ui.maxFPSSpinBox.setValue(cfg.get("MaximumFPS", 60))
            ui.blockRotationCheckBox.setChecked(cfg.get("OrientationModify", False))
            ui.forceRotateCheckBox.setChecked(cfg.get("ForceRotate", False))
            ui.rmCoverImgCheckBox.setChecked(cfg.get("RemoveImgCover", False))
            ui.lowResolutionComboBox.setCurrentText('{}x{}'.format(cfg.get("LowQualityLongSide", 1920), getShortSide(cfg.get("LowQualityLongSide", 1920))))
            ui.mediumResolutionComboBox.setCurrentText('{}x{}'.format(cfg.get("MediumQualityLongSide", 2880), getShortSide(cfg.get("MediumQualityLongSide", 2880))))
            ui.highResolutionComboBox.setCurrentText('{}x{}'.format(cfg.get("HighQualityLongSide", 3840), getShortSide(cfg.get("HighQualityLongSide", 3840))))
            ui.antiAliasComboBox.setCurrentIndex(math.floor(math.log2(cfg.get("AntiAliasing", 8))))
            ui.openWithInFesModeCheckBox.setChecked(cfg.get("ModifyWithToFes", False))
            ui.replaceArchiveLocalCheckBox.setChecked(cfg.get("LocalizeArchive", False))
            ui.targetResVersionLineEdit.setText(cfg.get("TargetResVersion", ""))
            ui.versionLabel.setText(cfg.get("TargetClientVersion", ""))

            ui.advStoryLowSpinBox.setValue(cfg.get("LowQualityAdvFactor", 1.0))
            ui.advStoryMediumSpinBox.setValue(cfg.get("MediumQualityAdvFactor", 1.5))
            ui.advStoryHighSpinBox.setValue(cfg.get("HighQualityAdvFactor", 2.0))

            ui.textOnlyCharTimeDSpinBox.setValue(cfg.get("NovelSingleCharDisplayTime", 0.03))
            ui.textAnimationSpeedDSpinBox.setValue(cfg.get("NovelTextAnimationSpeedFactor", 1.0))

            ui.autoModeEnterCheckbox.setChecked(cfg.get("AutoNovelAuto", False))
            ui.autoCloseSubtitleCheckBox.setChecked(cfg.get("AutoCloseSubtitle", False))

    except Exception as e:
        QMessageBox.warning(mainWindow, "Error", f"Failed to read config.json")

def generateCfg():

    def getAntiAlias(idx: int):
        if not idx:
            return 0
        else:
            return math.floor(pow(2, idx))
        
    LQLongSide = 1080
    MQLongSide = 1620
    HQLongSide = 2160

    try:
        LQLongSide = max(int(i.strip()) for i in ui.lowResolutionComboBox.currentText().split('x') if i.strip())
        MQLongSide = max(int(i.strip()) for i in ui.mediumResolutionComboBox.currentText().split('x') if i.strip())
        HQLongSide = max(int(i.strip()) for i in ui.highResolutionComboBox.currentText().split('x') if i.strip())
    except:
        pass


    return json.dumps({
        "MagicaClothSimulationFrequency": ui.simulationFrequencySpinBox.value(),
        "MagicaClothSimulationCountPerFrame": ui.simulationCountPerFrameSpinBox.value(),
        "LowQualityLongSide": LQLongSide,
        "MediumQualityLongSide": MQLongSide,
        "HighQualityLongSide": HQLongSide,
        "LowQualityAdvFactor": ui.advStoryLowSpinBox.value(),
        "MediumQualityAdvFactor": ui.advStoryMediumSpinBox.value(),
        "HighQualityAdvFactor": ui.advStoryHighSpinBox.value(),
        "MaximumFPS": ui.maxFPSSpinBox.value(),
        "OrientationModify": ui.blockRotationCheckBox.isChecked(),
        "ForceRotate": ui.forceRotateCheckBox.isChecked(),
        "RemoveImgCover": ui.rmCoverImgCheckBox.isChecked(),
        "AntiAliasing": getAntiAlias(ui.antiAliasComboBox.currentIndex()),
        "ModifyWithToFes": ui.openWithInFesModeCheckBox.isChecked(),
        "LocalizeArchive": ui.replaceArchiveLocalCheckBox.isChecked(),
        "TargetResVersion": "" if not ui.replaceOldResCheckBox.isChecked() or not ui.targetResVersionLineEdit.text().strip() else ui.targetResVersionLineEdit.text().strip(),
        "TargetClientVersion": "" if not ui.replaceOldResCheckBox.isChecked() or not ui.versionLabel.text().strip() else ui.versionLabel.text().strip(),
        "NovelSingleCharDisplayTime": ui.textOnlyCharTimeDSpinBox.value(),
        "NovelTextAnimationSpeedFactor": ui.textAnimationSpeedDSpinBox.value(),
        "AutoNovelAuto": ui.autoModeEnterCheckbox.isChecked(),
        "AutoCloseSubtitle": ui.autoCloseSubtitleCheckBox.isChecked(),
    })

def onApplyCfg():

    QtCore.QMetaObject.invokeMethod(
        fridaWorker,
        "set_config_json",
        QtCore.Qt.ConnectionType.QueuedConnection, 
        QtCore.Q_ARG(str, generateCfg()))

def onAttachResult(ok: bool):
    if ok:
        ui.mainPage.setEnabled(True)
        ui.extendPage.setEnabled(True)
        ui.basicGroup.setEnabled(False)
        ui.applyCfgBtn.setEnabled(True)
        ui.closeBtn.setEnabled(True)
        onApplyCfg()
    else:
        ui.mainPage.setEnabled(False)
        ui.extendPage.setEnabled(False)
        ui.basicGroup.setEnabled(True)
        ui.applyCfgBtn.setEnabled(False)
        ui.closeBtn.setEnabled(False)
        ui.attachBtn.setEnabled(True)

def resolutionInputCheck(text: str):
    if text.strip() and len(text.split('x')) == 1 and not text.isdigit():
        QMessageBox.warning(mainWindow, 'Warning', 'Please input a valid resolution!\nThe resolution must be <number>x<number>')
    for s in text.split('x'):
        s = s.strip()
        if s and not s.isdigit():
            QMessageBox.warning(mainWindow, 'Warning', 'Please input a valid resolution!\nThe resolution must be <number>x<number>')

def messageHandle(msg: str):
    toolBarLabel.setText(
        toolBarLabel.fontMetrics().elidedText(msg, QtCore.Qt.TextElideMode.ElideRight, toolBarLabel.width())
    )
    cursor: QtGui.QTextCursor = ui.logPlainTextEdit.textCursor()
    while ui.logPlainTextEdit.blockCount() > ui.logMaxSpinBox.value():
        cursor.movePosition(cursor.MoveOperation.Start)
        cursor.select(cursor.SelectionType.BlockUnderCursor)
        cursor.removeSelectedText()
        cursor.deleteChar()
    ui.logPlainTextEdit.appendPlainText(msg)

    if ui.autoScrollLogCheckBox.isChecked():
        scrollBar = ui.logPlainTextEdit.verticalScrollBar()
        if scrollBar.value() != scrollBar.maximum():
            scrollBar.setValue(scrollBar.maximum())

class RequestWorker(QtCore.QObject):
    finished = QtCore.Signal(requests.Response)

    def __init__(self):
        super().__init__()
        self.session = requests.Session()
        self.session.mount('https://', adapters.HTTPAdapter(max_retries=5))

    @QtCore.Slot(str)
    def get(self, url: str):
        self.finished.emit(requests.get(url))

requestThread = QtCore.QThread(app)
requestWorker = RequestWorker()
requestWorker.moveToThread(requestThread)
requestThread.start()

ARCHIVE_LIST_URLS = [
    'https://fastly.jsdelivr.net/gh/ChocoLZS/linkura-live-data@main/data/archive.json',
    'https://raw.githubusercontent.com/ChocoLZS/linkura-live-data/main/data/archive.json'
]

ARCHIVE_DETAILS_URLS = [
    'https://fastly.jsdelivr.net/gh/ChocoLZS/linkura-live-data@main/data/archive-details.json',
    'https://raw.githubusercontent.com/ChocoLZS/linkura-live-data/main/data/archive-details.json'
]

CLINET_ANDROID_LIST_URLS = [
    'https://fastly.jsdelivr.net/gh/ChocoLZS/linkura-live-data@main/data/client-res.json',
    'https://raw.githubusercontent.com/ChocoLZS/linkura-live-data/main/data/client-res.json'
]

CLINET_IOS_LIST_URLS = [
    'https://fastly.jsdelivr.net/gh/DYY-Studio/linkura-live-data@main/data/client-res-ios.json',
    'https://raw.githubusercontent.com/DYY-Studio/linkura-live-data/main/data/client-res-ios.json'
]

def doMakeRequest(url: str):
    QtCore.QMetaObject.invokeMethod(
        requestWorker,
        'get',
        QtCore.Q_ARG(str, url),
    )

def onResVersionSelectionChanged(selected: QtCore.QItemSelection, deselected: QtCore.QItemSelection):
    if selected:
        ui.targetResVersionLineEdit.setText(selected.indexes()[0].data(QtCore.Qt.ItemDataRole.DisplayRole))
        ui.versionLabel.setText(selected.indexes()[0].data(QtCore.Qt.ItemDataRole.UserRole))

def doReadResVersions():
    model: QtGui.QStandardItemModel = QtGui.QStandardItemModel()
    model.setHorizontalHeaderLabels(['ResVersion'])
    verticalLabels: list[str] = list()
    match ui.deviceOSComboBox.currentIndex():
        case 0:
            with open('client-res-ios.json', mode='r', encoding='utf-8') as f:
                for k, v in json.load(f).items().__reversed__():
                    verticalLabels.append(v[0])
                    item = QtGui.QStandardItem(k)
                    item.setData(v[0], QtCore.Qt.ItemDataRole.UserRole)
                    model.appendRow(item)
        case 1:
            with open('client-res.json', mode='r', encoding='utf-8') as f:
                for k, v in json.load(f).items():
                    for res in v.__reversed__():
                        verticalLabels.append(k)
                        item = QtGui.QStandardItem(res)
                        item.setData(k, QtCore.Qt.ItemDataRole.UserRole)
                        model.appendRow(item)
    model.setVerticalHeaderLabels(verticalLabels)
    ui.resVersionTableView.setModel(model)
    ui.resVersionTableView.resizeColumnToContents(0)
    ui.resVersionTableView.selectionModel().selectionChanged.connect(onResVersionSelectionChanged)

def doUpdateArchiveDetails():
    ui.updateArchiveDetailsBtn.setEnabled(False)
    doMakeRequest(ARCHIVE_DETAILS_URLS[0])

def doGetResVersion():
    ui.getResVersionsBtn.setEnabled(False)
    ui.deviceOSComboBox.setEnabled(False)
    if ui.deviceOSComboBox.currentIndex() == 0:
        doMakeRequest(CLINET_IOS_LIST_URLS[0])
    else:
        doMakeRequest(CLINET_ANDROID_LIST_URLS[0])

ARCHIVE_DETAILS: dict[str, dict[str, str]] = dict()
ARCHIVE_LIST: dict[str, dict[str, str]] = dict()

class RequestReceiver(QtCore.QObject):

    @QtCore.Slot(requests.Response)
    def requestFinished(self, res: requests.Response):
        global ARCHIVE_DETAILS, ARCHIVE_LIST
        urlslist = (ARCHIVE_LIST, ARCHIVE_DETAILS_URLS, CLINET_ANDROID_LIST_URLS, CLINET_IOS_LIST_URLS)
        fileName = os.path.basename(urlparse(res.url).path)
        if res.status_code == 200:
            with open(os.path.realpath(fileName), mode = 'w', encoding = 'utf-8') as f:
                f.write(res.text)
                logger.info(f'{fileName} done')
            if fileName == 'archive-details.json':
                ARCHIVE_DETAILS = res.json()
                doMakeRequest(ARCHIVE_LIST_URLS[0])
            elif fileName == 'archive.json':
                ARCHIVE_LIST = {item.get("archives_id", ""): item for item in res.json()}
                ui.updateArchiveDetailsBtn.setEnabled(True)
                ui.openWithInFesModeCheckBox.setEnabled(True)
                ui.replaceArchiveLocalCheckBox.setEnabled(True) 
            else:
                ui.getResVersionsBtn.setEnabled(True)
                doReadResVersions()
                ui.deviceOSComboBox.setEnabled(True)
        else:
            for urls in urlslist:
                if res.url in urls:
                    idx = urls.index(res.url)
                    if idx < len(urls) - 1:
                        doMakeRequest(urls[idx + 1])
                        logger.info(f'{fileName} failed, retrying...')
                    else:
                        QtCore.QTimer.singleShot(5000, doGetResVersion)
                        logger.info(f'{fileName} failed')

requestReceiver = RequestReceiver()
requestWorker.finished.connect(requestReceiver.requestFinished)

class LogEmitter(QtCore.QObject):
    log_signal = QtCore.Signal(str)

class QtLogHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.emitter = LogEmitter()

    def emit(self, record):
        msg = self.format(record)
        toolBarLabel.setText(msg)
        self.emitter.log_signal.emit(msg)

def onAppExit():
    requestThread.quit()
    if not requestThread.wait(5):
        requestThread.terminate()
    fridaThread.quit()
    if not fridaThread.wait(5):
        fridaThread.terminate()
    if npmProcess.state() != QtCore.QProcess.ProcessState.NotRunning:
        npmProcess.terminate()
        if not fridaThread.wait(5):
            npmProcess.kill()

    with open(CFG_PATH, mode='w', encoding='utf-8') as f:
        f.write(generateCfg())

CFG_PATH = os.path.join(PROGRAM_DIR, 'config.json')

if __name__ == '__main__':
    from Ui_LLLLToolGUI import Ui_L4ToolMW
    mainWindow = QtWidgets.QMainWindow()
    ui = Ui_L4ToolMW()
    ui.setupUi(mainWindow)
    toolBarLabel = QtWidgets.QLabel("Not connected")
    toolBarLabel.setSizePolicy(QtWidgets.QSizePolicy.Policy.Expanding, QtWidgets.QSizePolicy.Policy.Fixed)
    ui.toolBar.addWidget(toolBarLabel)

    ui.mainPage.setEnabled(False)
    ui.extendPage.setEnabled(False)
    ui.applyCfgBtn.setEnabled(False)
    ui.closeBtn.setEnabled(False)
    for d in frida.enumerate_devices():
        if d.type == 'local':
            ui.connectDeviceComboBox.addItem(f'{d.name} ({d.id})', d)

    ui.connectMethodComboBox.currentIndexChanged.connect(onChangeConnectMethod)
    ui.connectDeviceComboBox.currentIndexChanged.connect(onChangeConnectDevice)

    ui.applyCfgBtn.clicked.connect(onApplyCfg)
    ui.attachBtn.clicked.connect(onAttach)
    ui.closeBtn.clicked.connect(onDetach)

    guiLogHandler = QtLogHandler()
    guiLogHandler.setFormatter(
        logging.Formatter(fmt='[%(asctime)s][%(levelname)s] %(message)s', datefmt='%H:%M:%S')
    )
    guiLogHandler.setLevel(logging.INFO)
    guiLogHandler.emitter.log_signal.connect(messageHandle)
    logger.addHandler(guiLogHandler)

    doMakeRequest(ARCHIVE_DETAILS_URLS[0])

    def fridaInfoMsg(msg):
        logger.info(msg)
    def fridaErrorMsg(msg):
        logger.error(msg)
    fridaWorker.log_sig.connect(fridaInfoMsg)
    fridaWorker.status_sig.connect(fridaInfoMsg)
    fridaWorker.error_sig.connect(fridaErrorMsg)

    fridaWorker.connected_sig.connect(onAttachResult)

    ui.lowResolutionComboBox.editTextChanged.connect(resolutionInputCheck)
    ui.mediumResolutionComboBox.editTextChanged.connect(resolutionInputCheck)
    ui.highResolutionComboBox.editTextChanged.connect(resolutionInputCheck)

    ui.getResVersionsBtn.clicked.connect(doGetResVersion)

    ui.updateArchiveDetailsBtn.clicked.connect(doUpdateArchiveDetails)

    if os.path.exists(CFG_PATH): readCfg(CFG_PATH)

    if not COMPILE_WHEN_START:
        mainWindow.show()

    app.aboutToQuit.connect(onAppExit)

    sys.exit(app.exec())