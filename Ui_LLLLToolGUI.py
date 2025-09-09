# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'LLLLToolGUI.ui'
##
## Created by: Qt User Interface Compiler version 6.8.1
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide6.QtCore import (QCoreApplication, QDate, QDateTime, QLocale,
    QMetaObject, QObject, QPoint, QRect,
    QSize, QTime, QUrl, Qt)
from PySide6.QtGui import (QBrush, QColor, QConicalGradient, QCursor,
    QFont, QFontDatabase, QGradient, QIcon,
    QImage, QKeySequence, QLinearGradient, QPainter,
    QPalette, QPixmap, QRadialGradient, QTransform)
from PySide6.QtWidgets import (QAbstractItemView, QApplication, QCheckBox, QComboBox,
    QDoubleSpinBox, QGridLayout, QGroupBox, QHeaderView,
    QLabel, QLineEdit, QMainWindow, QPlainTextEdit,
    QPushButton, QSizePolicy, QSpinBox, QTabWidget,
    QTableView, QToolBar, QWidget)

class Ui_L4ToolMW(object):
    def setupUi(self, L4ToolMW):
        if not L4ToolMW.objectName():
            L4ToolMW.setObjectName(u"L4ToolMW")
        L4ToolMW.resize(513, 429)
        self.centralwidget = QWidget(L4ToolMW)
        self.centralwidget.setObjectName(u"centralwidget")
        self.gridLayout = QGridLayout(self.centralwidget)
        self.gridLayout.setObjectName(u"gridLayout")
        self.closeBtn = QPushButton(self.centralwidget)
        self.closeBtn.setObjectName(u"closeBtn")
        sizePolicy = QSizePolicy(QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Preferred)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(self.closeBtn.sizePolicy().hasHeightForWidth())
        self.closeBtn.setSizePolicy(sizePolicy)

        self.gridLayout.addWidget(self.closeBtn, 4, 3, 1, 1)

        self.tabWidget = QTabWidget(self.centralwidget)
        self.tabWidget.setObjectName(u"tabWidget")
        self.fridaPage = QWidget()
        self.fridaPage.setObjectName(u"fridaPage")
        self.gridLayout_2 = QGridLayout(self.fridaPage)
        self.gridLayout_2.setObjectName(u"gridLayout_2")
        self.checkBoxGroup = QGroupBox(self.fridaPage)
        self.checkBoxGroup.setObjectName(u"checkBoxGroup")
        sizePolicy1 = QSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Fixed)
        sizePolicy1.setHorizontalStretch(0)
        sizePolicy1.setVerticalStretch(0)
        sizePolicy1.setHeightForWidth(self.checkBoxGroup.sizePolicy().hasHeightForWidth())
        self.checkBoxGroup.setSizePolicy(sizePolicy1)
        self.gridLayout_3 = QGridLayout(self.checkBoxGroup)
        self.gridLayout_3.setObjectName(u"gridLayout_3")
        self.rmCoverImgCheckBox = QCheckBox(self.checkBoxGroup)
        self.rmCoverImgCheckBox.setObjectName(u"rmCoverImgCheckBox")

        self.gridLayout_3.addWidget(self.rmCoverImgCheckBox, 0, 0, 1, 1)

        self.blockRotationCheckBox = QCheckBox(self.checkBoxGroup)
        self.blockRotationCheckBox.setObjectName(u"blockRotationCheckBox")
        self.blockRotationCheckBox.setChecked(False)

        self.gridLayout_3.addWidget(self.blockRotationCheckBox, 2, 0, 1, 1)

        self.forceRotateCheckBox = QCheckBox(self.checkBoxGroup)
        self.forceRotateCheckBox.setObjectName(u"forceRotateCheckBox")

        self.gridLayout_3.addWidget(self.forceRotateCheckBox, 2, 1, 1, 1)

        self.replaceArchiveLocalCheckBox = QCheckBox(self.checkBoxGroup)
        self.replaceArchiveLocalCheckBox.setObjectName(u"replaceArchiveLocalCheckBox")
        self.replaceArchiveLocalCheckBox.setEnabled(False)

        self.gridLayout_3.addWidget(self.replaceArchiveLocalCheckBox, 0, 1, 1, 1)

        self.openWithInFesModeCheckBox = QCheckBox(self.checkBoxGroup)
        self.openWithInFesModeCheckBox.setObjectName(u"openWithInFesModeCheckBox")
        self.openWithInFesModeCheckBox.setEnabled(False)

        self.gridLayout_3.addWidget(self.openWithInFesModeCheckBox, 1, 0, 1, 1)

        self.updateArchiveDetailsBtn = QPushButton(self.checkBoxGroup)
        self.updateArchiveDetailsBtn.setObjectName(u"updateArchiveDetailsBtn")
        self.updateArchiveDetailsBtn.setEnabled(False)

        self.gridLayout_3.addWidget(self.updateArchiveDetailsBtn, 1, 1, 1, 1)


        self.gridLayout_2.addWidget(self.checkBoxGroup, 1, 0, 1, 2)

        self.changableGroup = QGroupBox(self.fridaPage)
        self.changableGroup.setObjectName(u"changableGroup")
        self.gridLayout_4 = QGridLayout(self.changableGroup)
        self.gridLayout_4.setObjectName(u"gridLayout_4")
        self.antiAliasComboBox = QComboBox(self.changableGroup)
        self.antiAliasComboBox.addItem("")
        self.antiAliasComboBox.addItem("")
        self.antiAliasComboBox.addItem("")
        self.antiAliasComboBox.addItem("")
        self.antiAliasComboBox.setObjectName(u"antiAliasComboBox")

        self.gridLayout_4.addWidget(self.antiAliasComboBox, 1, 4, 1, 1)

        self.label_11 = QLabel(self.changableGroup)
        self.label_11.setObjectName(u"label_11")

        self.gridLayout_4.addWidget(self.label_11, 3, 3, 1, 1)

        self.label_4 = QLabel(self.changableGroup)
        self.label_4.setObjectName(u"label_4")
        sizePolicy2 = QSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        sizePolicy2.setHorizontalStretch(0)
        sizePolicy2.setVerticalStretch(0)
        sizePolicy2.setHeightForWidth(self.label_4.sizePolicy().hasHeightForWidth())
        self.label_4.setSizePolicy(sizePolicy2)

        self.gridLayout_4.addWidget(self.label_4, 1, 3, 1, 1)

        self.simulationFrequencySpinBox = QSpinBox(self.changableGroup)
        self.simulationFrequencySpinBox.setObjectName(u"simulationFrequencySpinBox")
        self.simulationFrequencySpinBox.setMinimum(30)
        self.simulationFrequencySpinBox.setMaximum(150)
        self.simulationFrequencySpinBox.setSingleStep(5)
        self.simulationFrequencySpinBox.setValue(120)

        self.gridLayout_4.addWidget(self.simulationFrequencySpinBox, 2, 4, 1, 1)

        self.maxFPSSpinBox = QSpinBox(self.changableGroup)
        self.maxFPSSpinBox.setObjectName(u"maxFPSSpinBox")
        self.maxFPSSpinBox.setMinimum(10)
        self.maxFPSSpinBox.setMaximum(1000)
        self.maxFPSSpinBox.setSingleStep(10)
        self.maxFPSSpinBox.setValue(60)

        self.gridLayout_4.addWidget(self.maxFPSSpinBox, 0, 4, 1, 1)

        self.simulationCountPerFrameSpinBox = QSpinBox(self.changableGroup)
        self.simulationCountPerFrameSpinBox.setObjectName(u"simulationCountPerFrameSpinBox")
        self.simulationCountPerFrameSpinBox.setMinimum(1)
        self.simulationCountPerFrameSpinBox.setMaximum(5)
        self.simulationCountPerFrameSpinBox.setSingleStep(1)
        self.simulationCountPerFrameSpinBox.setValue(5)

        self.gridLayout_4.addWidget(self.simulationCountPerFrameSpinBox, 3, 4, 1, 1)

        self.groupBox_5 = QGroupBox(self.changableGroup)
        self.groupBox_5.setObjectName(u"groupBox_5")
        self.gridLayout_5 = QGridLayout(self.groupBox_5)
        self.gridLayout_5.setObjectName(u"gridLayout_5")
        self.lowResolutionComboBox = QComboBox(self.groupBox_5)
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.addItem("")
        self.lowResolutionComboBox.setObjectName(u"lowResolutionComboBox")
        self.lowResolutionComboBox.setEditable(True)

        self.gridLayout_5.addWidget(self.lowResolutionComboBox, 0, 1, 1, 1)

        self.mediumResolutionComboBox = QComboBox(self.groupBox_5)
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.addItem("")
        self.mediumResolutionComboBox.setObjectName(u"mediumResolutionComboBox")
        self.mediumResolutionComboBox.setEditable(True)

        self.gridLayout_5.addWidget(self.mediumResolutionComboBox, 1, 1, 1, 1)

        self.highResolutionComboBox = QComboBox(self.groupBox_5)
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.addItem("")
        self.highResolutionComboBox.setObjectName(u"highResolutionComboBox")
        self.highResolutionComboBox.setEditable(True)

        self.gridLayout_5.addWidget(self.highResolutionComboBox, 2, 1, 1, 1)

        self.label = QLabel(self.groupBox_5)
        self.label.setObjectName(u"label")
        sizePolicy2.setHeightForWidth(self.label.sizePolicy().hasHeightForWidth())
        self.label.setSizePolicy(sizePolicy2)

        self.gridLayout_5.addWidget(self.label, 0, 0, 1, 1)

        self.label_2 = QLabel(self.groupBox_5)
        self.label_2.setObjectName(u"label_2")
        sizePolicy2.setHeightForWidth(self.label_2.sizePolicy().hasHeightForWidth())
        self.label_2.setSizePolicy(sizePolicy2)

        self.gridLayout_5.addWidget(self.label_2, 1, 0, 1, 1)

        self.label_3 = QLabel(self.groupBox_5)
        self.label_3.setObjectName(u"label_3")
        sizePolicy2.setHeightForWidth(self.label_3.sizePolicy().hasHeightForWidth())
        self.label_3.setSizePolicy(sizePolicy2)

        self.gridLayout_5.addWidget(self.label_3, 2, 0, 1, 1)


        self.gridLayout_4.addWidget(self.groupBox_5, 0, 0, 4, 2)

        self.label_5 = QLabel(self.changableGroup)
        self.label_5.setObjectName(u"label_5")
        sizePolicy2.setHeightForWidth(self.label_5.sizePolicy().hasHeightForWidth())
        self.label_5.setSizePolicy(sizePolicy2)

        self.gridLayout_4.addWidget(self.label_5, 2, 3, 1, 1)

        self.label_10 = QLabel(self.changableGroup)
        self.label_10.setObjectName(u"label_10")
        sizePolicy2.setHeightForWidth(self.label_10.sizePolicy().hasHeightForWidth())
        self.label_10.setSizePolicy(sizePolicy2)

        self.gridLayout_4.addWidget(self.label_10, 0, 3, 1, 1)

        self.groupBox = QGroupBox(self.changableGroup)
        self.groupBox.setObjectName(u"groupBox")
        self.gridLayout_12 = QGridLayout(self.groupBox)
        self.gridLayout_12.setObjectName(u"gridLayout_12")
        self.advStoryHighSpinBox = QDoubleSpinBox(self.groupBox)
        self.advStoryHighSpinBox.setObjectName(u"advStoryHighSpinBox")
        self.advStoryHighSpinBox.setReadOnly(False)
        self.advStoryHighSpinBox.setMinimum(0.100000000000000)
        self.advStoryHighSpinBox.setSingleStep(0.050000000000000)
        self.advStoryHighSpinBox.setValue(2.000000000000000)

        self.gridLayout_12.addWidget(self.advStoryHighSpinBox, 2, 3, 1, 1)

        self.advStoryMediumSpinBox = QDoubleSpinBox(self.groupBox)
        self.advStoryMediumSpinBox.setObjectName(u"advStoryMediumSpinBox")
        self.advStoryMediumSpinBox.setReadOnly(False)
        self.advStoryMediumSpinBox.setMinimum(0.100000000000000)
        self.advStoryMediumSpinBox.setSingleStep(0.050000000000000)
        self.advStoryMediumSpinBox.setValue(1.500000000000000)

        self.gridLayout_12.addWidget(self.advStoryMediumSpinBox, 1, 3, 1, 1)

        self.advStoryLowSpinBox = QDoubleSpinBox(self.groupBox)
        self.advStoryLowSpinBox.setObjectName(u"advStoryLowSpinBox")
        self.advStoryLowSpinBox.setReadOnly(False)
        self.advStoryLowSpinBox.setMinimum(0.100000000000000)
        self.advStoryLowSpinBox.setSingleStep(0.050000000000000)
        self.advStoryLowSpinBox.setValue(1.000000000000000)

        self.gridLayout_12.addWidget(self.advStoryLowSpinBox, 0, 3, 1, 1)

        self.label_17 = QLabel(self.groupBox)
        self.label_17.setObjectName(u"label_17")
        sizePolicy2.setHeightForWidth(self.label_17.sizePolicy().hasHeightForWidth())
        self.label_17.setSizePolicy(sizePolicy2)

        self.gridLayout_12.addWidget(self.label_17, 0, 0, 1, 1)

        self.label_16 = QLabel(self.groupBox)
        self.label_16.setObjectName(u"label_16")
        sizePolicy2.setHeightForWidth(self.label_16.sizePolicy().hasHeightForWidth())
        self.label_16.setSizePolicy(sizePolicy2)

        self.gridLayout_12.addWidget(self.label_16, 1, 0, 1, 1)

        self.label_15 = QLabel(self.groupBox)
        self.label_15.setObjectName(u"label_15")
        sizePolicy2.setHeightForWidth(self.label_15.sizePolicy().hasHeightForWidth())
        self.label_15.setSizePolicy(sizePolicy2)

        self.gridLayout_12.addWidget(self.label_15, 2, 0, 1, 1)


        self.gridLayout_4.addWidget(self.groupBox, 0, 2, 4, 1)


        self.gridLayout_2.addWidget(self.changableGroup, 2, 0, 3, 2)

        self.tabWidget.addTab(self.fridaPage, "")
        self.tab_2 = QWidget()
        self.tab_2.setObjectName(u"tab_2")
        self.gridLayout_13 = QGridLayout(self.tab_2)
        self.gridLayout_13.setObjectName(u"gridLayout_13")
        self.groupBox_3 = QGroupBox(self.tab_2)
        self.groupBox_3.setObjectName(u"groupBox_3")
        sizePolicy1.setHeightForWidth(self.groupBox_3.sizePolicy().hasHeightForWidth())
        self.groupBox_3.setSizePolicy(sizePolicy1)
        self.gridLayout_14 = QGridLayout(self.groupBox_3)
        self.gridLayout_14.setObjectName(u"gridLayout_14")
        self.textAnimationSpeedDSpinBox = QDoubleSpinBox(self.groupBox_3)
        self.textAnimationSpeedDSpinBox.setObjectName(u"textAnimationSpeedDSpinBox")
        self.textAnimationSpeedDSpinBox.setMinimum(1.000000000000000)
        self.textAnimationSpeedDSpinBox.setSingleStep(0.050000000000000)

        self.gridLayout_14.addWidget(self.textAnimationSpeedDSpinBox, 0, 1, 1, 1)

        self.label_19 = QLabel(self.groupBox_3)
        self.label_19.setObjectName(u"label_19")
        sizePolicy1.setHeightForWidth(self.label_19.sizePolicy().hasHeightForWidth())
        self.label_19.setSizePolicy(sizePolicy1)

        self.gridLayout_14.addWidget(self.label_19, 0, 2, 1, 1)

        self.label_18 = QLabel(self.groupBox_3)
        self.label_18.setObjectName(u"label_18")
        sizePolicy1.setHeightForWidth(self.label_18.sizePolicy().hasHeightForWidth())
        self.label_18.setSizePolicy(sizePolicy1)

        self.gridLayout_14.addWidget(self.label_18, 0, 0, 1, 1)

        self.textOnlyCharTimeDSpinBox = QDoubleSpinBox(self.groupBox_3)
        self.textOnlyCharTimeDSpinBox.setObjectName(u"textOnlyCharTimeDSpinBox")
        self.textOnlyCharTimeDSpinBox.setMinimum(0.030000000000000)
        self.textOnlyCharTimeDSpinBox.setValue(0.030000000000000)

        self.gridLayout_14.addWidget(self.textOnlyCharTimeDSpinBox, 0, 3, 1, 1)

        self.autoModeEnterCheckbox = QCheckBox(self.groupBox_3)
        self.autoModeEnterCheckbox.setObjectName(u"autoModeEnterCheckbox")

        self.gridLayout_14.addWidget(self.autoModeEnterCheckbox, 1, 0, 1, 2)


        self.gridLayout_13.addWidget(self.groupBox_3, 0, 0, 1, 1)

        self.tabWidget.addTab(self.tab_2, "")
        self.advancePage = QWidget()
        self.advancePage.setObjectName(u"advancePage")
        self.gridLayout_7 = QGridLayout(self.advancePage)
        self.gridLayout_7.setObjectName(u"gridLayout_7")
        self.groupBox_4 = QGroupBox(self.advancePage)
        self.groupBox_4.setObjectName(u"groupBox_4")
        sizePolicy1.setHeightForWidth(self.groupBox_4.sizePolicy().hasHeightForWidth())
        self.groupBox_4.setSizePolicy(sizePolicy1)
        self.gridLayout_9 = QGridLayout(self.groupBox_4)
        self.gridLayout_9.setObjectName(u"gridLayout_9")
        self.replaceOldResCheckBox = QCheckBox(self.groupBox_4)
        self.replaceOldResCheckBox.setObjectName(u"replaceOldResCheckBox")
        sizePolicy1.setHeightForWidth(self.replaceOldResCheckBox.sizePolicy().hasHeightForWidth())
        self.replaceOldResCheckBox.setSizePolicy(sizePolicy1)

        self.gridLayout_9.addWidget(self.replaceOldResCheckBox, 0, 0, 1, 1)

        self.versionLabel = QLabel(self.groupBox_4)
        self.versionLabel.setObjectName(u"versionLabel")
        self.versionLabel.setAlignment(Qt.AlignRight|Qt.AlignTrailing|Qt.AlignVCenter)

        self.gridLayout_9.addWidget(self.versionLabel, 0, 1, 1, 1)

        self.targetResVersionLineEdit = QLineEdit(self.groupBox_4)
        self.targetResVersionLineEdit.setObjectName(u"targetResVersionLineEdit")
        self.targetResVersionLineEdit.setReadOnly(True)

        self.gridLayout_9.addWidget(self.targetResVersionLineEdit, 1, 0, 1, 2)


        self.gridLayout_7.addWidget(self.groupBox_4, 0, 0, 1, 2)

        self.groupBox_2 = QGroupBox(self.advancePage)
        self.groupBox_2.setObjectName(u"groupBox_2")
        sizePolicy3 = QSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Preferred)
        sizePolicy3.setHorizontalStretch(0)
        sizePolicy3.setVerticalStretch(0)
        sizePolicy3.setHeightForWidth(self.groupBox_2.sizePolicy().hasHeightForWidth())
        self.groupBox_2.setSizePolicy(sizePolicy3)
        self.gridLayout_10 = QGridLayout(self.groupBox_2)
        self.gridLayout_10.setObjectName(u"gridLayout_10")
        self.getResVersionsBtn = QPushButton(self.groupBox_2)
        self.getResVersionsBtn.setObjectName(u"getResVersionsBtn")
        sizePolicy2.setHeightForWidth(self.getResVersionsBtn.sizePolicy().hasHeightForWidth())
        self.getResVersionsBtn.setSizePolicy(sizePolicy2)

        self.gridLayout_10.addWidget(self.getResVersionsBtn, 0, 2, 1, 1)

        self.deviceOSComboBox = QComboBox(self.groupBox_2)
        self.deviceOSComboBox.addItem("")
        self.deviceOSComboBox.addItem("")
        self.deviceOSComboBox.setObjectName(u"deviceOSComboBox")

        self.gridLayout_10.addWidget(self.deviceOSComboBox, 0, 1, 1, 1)

        self.label_9 = QLabel(self.groupBox_2)
        self.label_9.setObjectName(u"label_9")
        sizePolicy2.setHeightForWidth(self.label_9.sizePolicy().hasHeightForWidth())
        self.label_9.setSizePolicy(sizePolicy2)

        self.gridLayout_10.addWidget(self.label_9, 0, 0, 1, 1)

        self.resVersionTableView = QTableView(self.groupBox_2)
        self.resVersionTableView.setObjectName(u"resVersionTableView")
        self.resVersionTableView.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.resVersionTableView.setSelectionMode(QAbstractItemView.SingleSelection)
        self.resVersionTableView.setSelectionBehavior(QAbstractItemView.SelectRows)

        self.gridLayout_10.addWidget(self.resVersionTableView, 1, 0, 1, 3)


        self.gridLayout_7.addWidget(self.groupBox_2, 1, 0, 3, 2)

        self.tabWidget.addTab(self.advancePage, "")
        self.tab = QWidget()
        self.tab.setObjectName(u"tab")
        self.gridLayout_8 = QGridLayout(self.tab)
        self.gridLayout_8.setObjectName(u"gridLayout_8")
        self.logMaxSpinBox = QSpinBox(self.tab)
        self.logMaxSpinBox.setObjectName(u"logMaxSpinBox")
        self.logMaxSpinBox.setMinimum(100)
        self.logMaxSpinBox.setMaximum(50000)
        self.logMaxSpinBox.setSingleStep(100)
        self.logMaxSpinBox.setValue(1000)

        self.gridLayout_8.addWidget(self.logMaxSpinBox, 0, 1, 1, 1)

        self.label_6 = QLabel(self.tab)
        self.label_6.setObjectName(u"label_6")

        self.gridLayout_8.addWidget(self.label_6, 0, 0, 1, 1)

        self.autoScrollLogCheckBox = QCheckBox(self.tab)
        self.autoScrollLogCheckBox.setObjectName(u"autoScrollLogCheckBox")

        self.gridLayout_8.addWidget(self.autoScrollLogCheckBox, 0, 2, 1, 1)

        self.logPlainTextEdit = QPlainTextEdit(self.tab)
        self.logPlainTextEdit.setObjectName(u"logPlainTextEdit")
        self.logPlainTextEdit.setReadOnly(True)

        self.gridLayout_8.addWidget(self.logPlainTextEdit, 1, 0, 1, 3)

        self.tabWidget.addTab(self.tab, "")

        self.gridLayout.addWidget(self.tabWidget, 0, 0, 1, 4)

        self.basicGroup = QGroupBox(self.centralwidget)
        self.basicGroup.setObjectName(u"basicGroup")
        self.gridLayout_6 = QGridLayout(self.basicGroup)
        self.gridLayout_6.setObjectName(u"gridLayout_6")
        self.connectDeviceComboBox = QComboBox(self.basicGroup)
        self.connectDeviceComboBox.setObjectName(u"connectDeviceComboBox")
        self.connectDeviceComboBox.setEditable(False)

        self.gridLayout_6.addWidget(self.connectDeviceComboBox, 1, 1, 1, 1)

        self.connectMethodComboBox = QComboBox(self.basicGroup)
        self.connectMethodComboBox.addItem("")
        self.connectMethodComboBox.addItem("")
        self.connectMethodComboBox.addItem("")
        self.connectMethodComboBox.addItem("")
        self.connectMethodComboBox.addItem("")
        self.connectMethodComboBox.setObjectName(u"connectMethodComboBox")

        self.gridLayout_6.addWidget(self.connectMethodComboBox, 0, 1, 1, 1)

        self.label_8 = QLabel(self.basicGroup)
        self.label_8.setObjectName(u"label_8")
        sizePolicy2.setHeightForWidth(self.label_8.sizePolicy().hasHeightForWidth())
        self.label_8.setSizePolicy(sizePolicy2)

        self.gridLayout_6.addWidget(self.label_8, 1, 0, 1, 1)

        self.label_7 = QLabel(self.basicGroup)
        self.label_7.setObjectName(u"label_7")
        sizePolicy2.setHeightForWidth(self.label_7.sizePolicy().hasHeightForWidth())
        self.label_7.setSizePolicy(sizePolicy2)

        self.gridLayout_6.addWidget(self.label_7, 0, 0, 1, 1)


        self.gridLayout.addWidget(self.basicGroup, 2, 0, 3, 3)

        self.applyCfgBtn = QPushButton(self.centralwidget)
        self.applyCfgBtn.setObjectName(u"applyCfgBtn")
        sizePolicy.setHeightForWidth(self.applyCfgBtn.sizePolicy().hasHeightForWidth())
        self.applyCfgBtn.setSizePolicy(sizePolicy)

        self.gridLayout.addWidget(self.applyCfgBtn, 3, 3, 1, 1)

        self.attachBtn = QPushButton(self.centralwidget)
        self.attachBtn.setObjectName(u"attachBtn")
        sizePolicy.setHeightForWidth(self.attachBtn.sizePolicy().hasHeightForWidth())
        self.attachBtn.setSizePolicy(sizePolicy)

        self.gridLayout.addWidget(self.attachBtn, 2, 3, 1, 1)

        L4ToolMW.setCentralWidget(self.centralwidget)
        self.toolBar = QToolBar(L4ToolMW)
        self.toolBar.setObjectName(u"toolBar")
        self.toolBar.setMovable(False)
        L4ToolMW.addToolBar(Qt.ToolBarArea.BottomToolBarArea, self.toolBar)

        self.retranslateUi(L4ToolMW)

        self.tabWidget.setCurrentIndex(0)
        self.antiAliasComboBox.setCurrentIndex(3)
        self.lowResolutionComboBox.setCurrentIndex(4)
        self.mediumResolutionComboBox.setCurrentIndex(6)
        self.highResolutionComboBox.setCurrentIndex(8)
        self.connectMethodComboBox.setCurrentIndex(3)


        QMetaObject.connectSlotsByName(L4ToolMW)
    # setupUi

    def retranslateUi(self, L4ToolMW):
        L4ToolMW.setWindowTitle(QCoreApplication.translate("L4ToolMW", u"LLLLToolGUI", None))
#if QT_CONFIG(tooltip)
        self.closeBtn.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p>\u65ad\u5f00Frida\u4e0eLLLL\u8fdb\u7a0b\u7684\u8fde\u63a5</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.closeBtn.setText(QCoreApplication.translate("L4ToolMW", u"\u65ad\u5f00", None))
        self.checkBoxGroup.setTitle(QCoreApplication.translate("L4ToolMW", u"\u529f\u80fd\u5f00\u5173", None))
#if QT_CONFIG(tooltip)
        self.rmCoverImgCheckBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u79fb\u9664\u76f4\u64ad\u548cArchive\u4e2d\u5f00\u573a\u524d/\u4e8b\u6545\u65f6/AFTER\u8fc7\u6e21/\u7ed3\u675f\u540e\u7684\u906e\u6321\u56fe\u50cf</span></p><p>\u4f1a\u4e3aArchive\u6dfb\u52a0\u4e00\u4e2a\u7b2c0\u79d2\u7684\u7a7a\u7ae0\u8282\uff0c\u65b9\u4fbf\u4ece\u5934\u5f00\u59cb\u64ad\u653e</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.rmCoverImgCheckBox.setText(QCoreApplication.translate("L4ToolMW", u"\u79fb\u9664LiveStream\u56fe\u50cf\u906e\u6321", None))
#if QT_CONFIG(tooltip)
        self.blockRotationCheckBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">macOS\u4e13\u7528</span></p><p><span style=\" font-weight:700;\">\u7981\u7528\u6e38\u620f\u7684\u4e00\u5207\u65b9\u5411\u65cb\u8f6c</span></p><p>\u89e3\u51b3macOS\u65e0\u6cd5\u5904\u7406\u65cb\u8f6c\u5bfc\u81f4\u7684\u96be\u4ee5\u6b63\u5e38\u4f7f\u7528</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.blockRotationCheckBox.setText(QCoreApplication.translate("L4ToolMW", u"(macOS) \u7981\u7528\u6e38\u620f\u65b9\u5411\u65cb\u8f6c", None))
#if QT_CONFIG(tooltip)
        self.forceRotateCheckBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">macOS\u4e13\u7528</span></p><p>\u70b9\u51fb<span style=\" font-weight:700;\">\u5e94\u7528</span>\u65f6\u5f3a\u884c\u91cd\u7f6eUnity\u65cb\u8f6c\uff0c\u4f7fApp\u8fdb\u884c\u4e00\u6b2190\u00b0\u65cb\u8f6c</p><p>\u65cb\u8f6c\u5230\u6b63\u786e\u6a2a\u5411\u4f4d\u7f6e\u540e\u518d\u70b9\u51fb\u5e94\u7528<span style=\" font-weight:700;\">\u65e0\u53cd\u5e94</span></p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.forceRotateCheckBox.setText(QCoreApplication.translate("L4ToolMW", u"(macOS) \u5e94\u7528\u65f6\u5f3a\u5236\u8fdb\u884c\u65cb\u8f6c", None))
#if QT_CONFIG(tooltip)
        self.replaceArchiveLocalCheckBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u5229\u7528\u4fdd\u5b58\u7684\u6570\u636e\u4e3aArchive\u8865\u5165\u672c\u5730\u6e32\u67d3\u94fe\u63a5</span></p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.replaceArchiveLocalCheckBox.setText(QCoreApplication.translate("L4ToolMW", u"\u66ff\u6362Archive\u4e3a\u672c\u5730\u6e32\u67d3", None))
#if QT_CONFIG(tooltip)
        self.openWithInFesModeCheckBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u4ee5Fes\u00d7LIVE\u65b9\u5f0f\u6253\u5f00With\u00d7MEETS\uff0c\u89e3\u9501\u673a\u4f4d\u63a7\u5236</span></p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.openWithInFesModeCheckBox.setText(QCoreApplication.translate("L4ToolMW", u"\u4ee5Fes\u65b9\u5f0f\u6253\u5f00With\u00d7MEETS", None))
#if QT_CONFIG(tooltip)
        self.updateArchiveDetailsBtn.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u624b\u52a8\u4ece\u9879\u76ee\u5e93\u4e0b\u8f7dArchive\u6570\u636e</span></p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.updateArchiveDetailsBtn.setText(QCoreApplication.translate("L4ToolMW", u"\u624b\u52a8\u5237\u65b0Archive\u6570\u636e", None))
        self.changableGroup.setTitle(QCoreApplication.translate("L4ToolMW", u"\u53ef\u8c03\u529f\u80fd", None))
        self.antiAliasComboBox.setItemText(0, QCoreApplication.translate("L4ToolMW", u"\u7981\u7528", None))
        self.antiAliasComboBox.setItemText(1, QCoreApplication.translate("L4ToolMW", u"2x", None))
        self.antiAliasComboBox.setItemText(2, QCoreApplication.translate("L4ToolMW", u"4x", None))
        self.antiAliasComboBox.setItemText(3, QCoreApplication.translate("L4ToolMW", u"8x", None))

        self.label_11.setText(QCoreApplication.translate("L4ToolMW", u"\u7269\u7406\u6a21\u62df\u6bcf\u5e27", None))
        self.label_4.setText(QCoreApplication.translate("L4ToolMW", u"\u6297\u952f\u9f7f\u5f3a\u5ea6", None))
#if QT_CONFIG(tooltip)
        self.simulationFrequencySpinBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u8bbe\u7f6e\u5e03\u6599\u6a21\u62df\u9891\u7387</span></p><p>\u5b98\u65b9\u63a8\u8350\u503c\u4e3a90\uff0c\u5e94\u7528\u9ed8\u8ba4\u4e3a50</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
#if QT_CONFIG(tooltip)
        self.maxFPSSpinBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u8bbe\u7f6e\u6574\u4e2a\u7a0b\u5e8f\u7684\u6700\u9ad8\u5e27\u7387</span></p><p>\u5982\u679c\u8bbe\u7f6e\u8d85\u8fc7\u5237\u65b0\u7387\uff0c\u5e94\u7528\u65f6\u4f1a\u88ab\u8c03\u4f4e\u81f3\u5237\u65b0\u7387</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
#if QT_CONFIG(tooltip)
        self.simulationCountPerFrameSpinBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u8bbe\u7f6e\u6bcf\u5e27\u5e03\u6599\u6a21\u62df\u6b21\u6570</span></p><p>\u5b98\u65b9\u63a8\u8350\u503c\u4e3a3\uff0c\u5e94\u7528\u9ed8\u8ba4\u4e3a5</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
#if QT_CONFIG(tooltip)
        self.groupBox_5.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u624b\u52a8\u63a7\u5236Fes\u00d7LIVE/With\u00d7MEETS\u7684\u6e32\u67d3\u5206\u8fa8\u7387</span></p><p>\u4fee\u6539\u540e\u9700\u8981\u5207\u6362\u753b\u9762\u8d28\u91cf\u6863\u4f4d\u624d\u80fd\u751f\u6548</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.groupBox_5.setTitle(QCoreApplication.translate("L4ToolMW", u"LiveStream\u6e32\u67d3", None))
        self.lowResolutionComboBox.setItemText(0, QCoreApplication.translate("L4ToolMW", u"480x270", None))
        self.lowResolutionComboBox.setItemText(1, QCoreApplication.translate("L4ToolMW", u"960x540", None))
        self.lowResolutionComboBox.setItemText(2, QCoreApplication.translate("L4ToolMW", u"1280x720", None))
        self.lowResolutionComboBox.setItemText(3, QCoreApplication.translate("L4ToolMW", u"1600x900", None))
        self.lowResolutionComboBox.setItemText(4, QCoreApplication.translate("L4ToolMW", u"1920x1080", None))
        self.lowResolutionComboBox.setItemText(5, QCoreApplication.translate("L4ToolMW", u"2560x1440", None))
        self.lowResolutionComboBox.setItemText(6, QCoreApplication.translate("L4ToolMW", u"2880x1620", None))
        self.lowResolutionComboBox.setItemText(7, QCoreApplication.translate("L4ToolMW", u"3200x1800", None))
        self.lowResolutionComboBox.setItemText(8, QCoreApplication.translate("L4ToolMW", u"3840x2160", None))

        self.mediumResolutionComboBox.setItemText(0, QCoreApplication.translate("L4ToolMW", u"480x270", None))
        self.mediumResolutionComboBox.setItemText(1, QCoreApplication.translate("L4ToolMW", u"960x540", None))
        self.mediumResolutionComboBox.setItemText(2, QCoreApplication.translate("L4ToolMW", u"1280x720", None))
        self.mediumResolutionComboBox.setItemText(3, QCoreApplication.translate("L4ToolMW", u"1600x900", None))
        self.mediumResolutionComboBox.setItemText(4, QCoreApplication.translate("L4ToolMW", u"1920x1080", None))
        self.mediumResolutionComboBox.setItemText(5, QCoreApplication.translate("L4ToolMW", u"2560x1440", None))
        self.mediumResolutionComboBox.setItemText(6, QCoreApplication.translate("L4ToolMW", u"2880x1620", None))
        self.mediumResolutionComboBox.setItemText(7, QCoreApplication.translate("L4ToolMW", u"3200x1800", None))
        self.mediumResolutionComboBox.setItemText(8, QCoreApplication.translate("L4ToolMW", u"3840x2160", None))

        self.highResolutionComboBox.setItemText(0, QCoreApplication.translate("L4ToolMW", u"480x270", None))
        self.highResolutionComboBox.setItemText(1, QCoreApplication.translate("L4ToolMW", u"960x540", None))
        self.highResolutionComboBox.setItemText(2, QCoreApplication.translate("L4ToolMW", u"1280x720", None))
        self.highResolutionComboBox.setItemText(3, QCoreApplication.translate("L4ToolMW", u"1600x900", None))
        self.highResolutionComboBox.setItemText(4, QCoreApplication.translate("L4ToolMW", u"1920x1080", None))
        self.highResolutionComboBox.setItemText(5, QCoreApplication.translate("L4ToolMW", u"2560x1440", None))
        self.highResolutionComboBox.setItemText(6, QCoreApplication.translate("L4ToolMW", u"2880x1620", None))
        self.highResolutionComboBox.setItemText(7, QCoreApplication.translate("L4ToolMW", u"3200x1800", None))
        self.highResolutionComboBox.setItemText(8, QCoreApplication.translate("L4ToolMW", u"3840x2160", None))

        self.label.setText(QCoreApplication.translate("L4ToolMW", u"\u4f4e", None))
        self.label_2.setText(QCoreApplication.translate("L4ToolMW", u"\u4e2d", None))
        self.label_3.setText(QCoreApplication.translate("L4ToolMW", u"\u9ad8", None))
        self.label_5.setText(QCoreApplication.translate("L4ToolMW", u"\u7269\u7406\u6a21\u62df\u9891\u7387", None))
        self.label_10.setText(QCoreApplication.translate("L4ToolMW", u"\u6700\u9ad8\u5e27\u7387", None))
#if QT_CONFIG(tooltip)
        self.groupBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u624b\u52a8\u63a7\u5236Story(\u6d3b\u52a8\u8bb0\u5f55)\u7684\u6e32\u67d3\u500d\u7387</span></p><p><span style=\" font-weight:700;\">\u5171\u4eabWith\u00d7MEETS/Fes\u00d7LIVE\u753b\u9762\u8d28\u91cf\u6863\u4f4d</span></p><p>\u4fee\u6539\u540e\u9700\u8981\u5207\u6362\u753b\u9762\u8d28\u91cf\u6863\u4f4d\u624d\u80fd\u751f\u6548</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.groupBox.setTitle(QCoreApplication.translate("L4ToolMW", u"\u6d3b\u52a8\u8bb0\u5f55\u6e32\u67d3", None))
        self.advStoryHighSpinBox.setSuffix(QCoreApplication.translate("L4ToolMW", u"x", None))
        self.advStoryMediumSpinBox.setSuffix(QCoreApplication.translate("L4ToolMW", u"x", None))
        self.advStoryLowSpinBox.setSuffix(QCoreApplication.translate("L4ToolMW", u"x", None))
        self.label_17.setText(QCoreApplication.translate("L4ToolMW", u"\u4f4e", None))
        self.label_16.setText(QCoreApplication.translate("L4ToolMW", u"\u4e2d", None))
        self.label_15.setText(QCoreApplication.translate("L4ToolMW", u"\u9ad8", None))
        self.tabWidget.setTabText(self.tabWidget.indexOf(self.fridaPage), QCoreApplication.translate("L4ToolMW", u"\u4e3b\u8981\u529f\u80fd", None))
        self.groupBox_3.setTitle(QCoreApplication.translate("L4ToolMW", u"\u89c6\u89c9\u5c0f\u8bf4\u6a21\u5f0f", None))
        self.textAnimationSpeedDSpinBox.setSuffix(QCoreApplication.translate("L4ToolMW", u"x", None))
        self.label_19.setText(QCoreApplication.translate("L4ToolMW", u"\u7eaf\u6587\u672c\u5355\u5b57\u65f6\u957f", None))
        self.label_18.setText(QCoreApplication.translate("L4ToolMW", u"\u6587\u672c\u52a8\u753b\u901f\u5ea6", None))
        self.textOnlyCharTimeDSpinBox.setSuffix(QCoreApplication.translate("L4ToolMW", u"\u79d2", None))
        self.autoModeEnterCheckbox.setText(QCoreApplication.translate("L4ToolMW", u"\u81ea\u52a8\u542f\u7528Auto\uff08\u901f\u5ea61\uff09", None))
        self.tabWidget.setTabText(self.tabWidget.indexOf(self.tab_2), QCoreApplication.translate("L4ToolMW", u"\u5176\u4ed6\u8c03\u6574", None))
        self.groupBox_4.setTitle(QCoreApplication.translate("L4ToolMW", u"\u529f\u80fd\u9009\u9879", None))
#if QT_CONFIG(tooltip)
        self.replaceOldResCheckBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u4fee\u6539\u54cd\u5e94\u548c\u8bf7\u6c42\u4f7fLLLL\u8fd0\u884c\u5728\u66f4\u4f4e\u7248\u672c\u4e0b</span></p><p>\u4ee5\u4fbf\u64ad\u653e\u65e7Fes\u00d7LIVE\u548c\u4f7f\u7528\u4f4e\u7248\u672c\u5ba2\u6237\u7aef</p><p><span style=\" font-weight:700;\">\u9700\u8981\u5148\u4ece\u5386\u53f2\u8d44\u6e90\u6587\u4ef6\u5217\u8868\u4e2d\u9009\u4e2d\u4e00\u4e2a\u7248\u672c</span></p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.replaceOldResCheckBox.setText(QCoreApplication.translate("L4ToolMW", u"\u66ff\u6362\u4e3a\u5176\u4ed6\u7248\u672c\u7684\u8d44\u6e90\u6587\u4ef6", None))
        self.versionLabel.setText("")
        self.groupBox_2.setTitle(QCoreApplication.translate("L4ToolMW", u"\u83b7\u53d6\u5386\u53f2\u8d44\u6e90\u6587\u4ef6\u5217\u8868", None))
        self.getResVersionsBtn.setText(QCoreApplication.translate("L4ToolMW", u"\u83b7\u53d6", None))
        self.deviceOSComboBox.setItemText(0, QCoreApplication.translate("L4ToolMW", u"iOS/macOS", None))
        self.deviceOSComboBox.setItemText(1, QCoreApplication.translate("L4ToolMW", u"Android", None))

#if QT_CONFIG(tooltip)
        self.deviceOSComboBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p>\u9009\u62e9\u6b63\u786e\u7684\u64cd\u4f5c\u7cfb\u7edf\u624d\u80fd\u6210\u529f\u66ff\u6362\u8d44\u6e90\u6587\u4ef6</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.label_9.setText(QCoreApplication.translate("L4ToolMW", u"LLLL\u6240\u5728\u8bbe\u5907\u7684\u64cd\u4f5c\u7cfb\u7edf", None))
        self.tabWidget.setTabText(self.tabWidget.indexOf(self.advancePage), QCoreApplication.translate("L4ToolMW", u"\u8d44\u6e90\u7248\u672c", None))
        self.logMaxSpinBox.setSuffix(QCoreApplication.translate("L4ToolMW", u" \u884c", None))
        self.label_6.setText(QCoreApplication.translate("L4ToolMW", u"Log\u7f13\u5b58\u884c\u6570", None))
        self.autoScrollLogCheckBox.setText(QCoreApplication.translate("L4ToolMW", u"\u81ea\u52a8\u6eda\u52a8", None))
        self.tabWidget.setTabText(self.tabWidget.indexOf(self.tab), QCoreApplication.translate("L4ToolMW", u"Log", None))
        self.basicGroup.setTitle(QCoreApplication.translate("L4ToolMW", u"Frida\u914d\u7f6e", None))
#if QT_CONFIG(tooltip)
        self.connectDeviceComboBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u9009\u62e9\u8fd0\u884cLLLL\u7684\u8bbe\u5907</span></p><p><span style=\" font-weight:700;\">LOCAL, USB\u548cREMOTE</span>\u4f1a\u81ea\u52a8\u5217\u51fa\uff0c\u5982\u679c\u6ca1\u6709\u5217\u51fa\u8bf7\u5207\u6362\u8fde\u63a5\u65b9\u5f0f\u5237\u65b0\u5217\u8868</p><p>\u5982\u679c\u8fd8\u662f\u6ca1\u6709\uff0c\u8bf7\u4f7f\u7528HOST\u624b\u52a8\u8fde\u63a5</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.connectMethodComboBox.setItemText(0, QCoreApplication.translate("L4ToolMW", u"REMOTE", None))
        self.connectMethodComboBox.setItemText(1, QCoreApplication.translate("L4ToolMW", u"HOST", None))
        self.connectMethodComboBox.setItemText(2, QCoreApplication.translate("L4ToolMW", u"USB", None))
        self.connectMethodComboBox.setItemText(3, QCoreApplication.translate("L4ToolMW", u"LOCAL", None))
        self.connectMethodComboBox.setItemText(4, QCoreApplication.translate("L4ToolMW", u"DEVICE_ID", None))

#if QT_CONFIG(tooltip)
        self.connectMethodComboBox.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p><span style=\" font-weight:700;\">\u9009\u62e9Frida\u4e0e\u4f60\u7684\u8bbe\u5907\u7684\u8fde\u63a5\u65b9\u5f0f</span></p><p><span style=\" font-weight:700;\">LOCAL:</span> \u672c\u673a\u8fdb\u7a0b\uff08macOS\uff09</p><p><span style=\" font-weight:700;\">REMOTE</span>: \u8fdc\u7a0b\u8bbe\u5907\uff08Android/iOS, frida-server\uff09</p><p><span style=\" font-weight:700;\">USB</span>\uff1aUSB\u8bbe\u5907\uff08Android/iOS, frida-server\uff09</p><p><span style=\" font-weight:700;\">HOST</span>: \u624b\u52a8\u8f93\u5165\u8fd0\u884cfrida-server\u7684\u4e3b\u673a\u548c\u5176\u7aef\u53e3\uff08\u9ad8\u7ea7\uff09</p><p><span style=\" font-weight:700;\">DEVICE_ID</span>: \u901a\u8fc7\u8bbe\u5907ID\u8fde\u63a5\u8bbe\u5907\uff08\u9ad8\u7ea7\uff09</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.label_8.setText(QCoreApplication.translate("L4ToolMW", u"\u8fde\u63a5\u8bbe\u5907", None))
        self.label_7.setText(QCoreApplication.translate("L4ToolMW", u"\u8fde\u63a5\u65b9\u5f0f", None))
#if QT_CONFIG(tooltip)
        self.applyCfgBtn.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p>\u901a\u77e5Frida\u5e94\u7528\u8bbe\u7f6e</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.applyCfgBtn.setText(QCoreApplication.translate("L4ToolMW", u"\u5e94\u7528", None))
#if QT_CONFIG(tooltip)
        self.attachBtn.setToolTip(QCoreApplication.translate("L4ToolMW", u"<html><head/><body><p>\u9644\u52a0Frida\u5230LLLL\u8fdb\u7a0b</p></body></html>", None))
#endif // QT_CONFIG(tooltip)
        self.attachBtn.setText(QCoreApplication.translate("L4ToolMW", u"\u9644\u52a0", None))
        self.toolBar.setWindowTitle(QCoreApplication.translate("L4ToolMW", u"toolBar", None))
    # retranslateUi

