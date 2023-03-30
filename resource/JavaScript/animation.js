(function(w) {
    const window = w;
    if (!(window instanceof Window)) {
        throw new Error("Not found object Window in argument 'w'");
    }

    function loadCss(url) {
        return new Promise((resolve, reject) => {
            const link = window.document.createElement("link");
            link.type = "text/css";
            link.href = url;
            link.rel = "stylesheet";
            //link.as = "style";
            link.media = 'print';
            link.onload = (e) => {
                link.media = 'all';
                resolve(e);
            };
            link.onerror = (e) => {
                reject(e);
            }
            window.document.getElementsByTagName("head")[0].append(link);
        });
    }
    function loadFont(url) {
        return new Promise((resolve, reject) => {
            const link = window.document.createElement("link");
            //link.type = "text/css";
            link.href = url;
            link.rel = "stylesheet";
            //link.as = "font";
            link.onload = (e) => {
                resolve(e);
            };
            link.onerror = (e) => {
                reject(e);
            }
            window.document.getElementsByTagName("head")[0].append(link);
        });
    }
    window.loadCss = loadCss;

    const cssMainStyle = loadCss("https://master-akadem.ru/audioplayer/style.css");
    loadFont("https://fonts.googleapis.com/css?family=Roboto&display=swap");
    window.cssMainStyleTemp = cssMainStyle;

    class EventEmitter {
        constructor() {
            this._events = {};
        }
        on(evt, listener) {
            (this._events[evt] || (this._events[evt] = [])).push(listener);
            return this;
        }
        emit(evt, arg) {
            (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
        }
    }
    class FdkProgressbarModel extends EventEmitter {
        constructor(option = {}) {
            super();

            this.range = {
                min: option.min ? option.min : 0,
                max: option.max ? option.max : 100,
                step: option.step ? option.step : 1
            };
            this.offset = option.offset ? option.offset : 0;
            if (this.offset > this.range.max) {
                this.offset = this.range.max
            }
        }

        setMinRange(min) {
            this.range.min = min;

            this.updateState("min", this.range.min);
        }
        setMaxRange(max) {
            this.range.max = max;

            this.updateState("max", this.range.max);
        }
        setStepRange(step) {
            this.range.step = step;

            this.updateState("step", this.range.step);
        }
        getMinRange() {
            return this.range.min;
        }
        getMaxRange() {
            return this.range.max;
        }
        getStepRange() {
            return this.range.step;
        }
        updateState(name, value) {
            let content = {
                data: {}
            };
            content.data[name] = value;

            this.emit("updateState", content);
        }

        set currentOffset(currentOffset) {
            this.offset = currentOffset;

            this.updateState("currentOffset", this.offset);
        }
        get currentOffset() {
            return this.offset;
        }
    }
    class FdkProgressbarView extends EventEmitter {
        /**
         * РЎРѕР·РґР°РµС‚ СЌРєР·РµРјРїР»СЏСЂ РєР»Р°СЃСЃР° 
         * 
         * @constructor
         * @this  {FdkProgressbarView} 
         * @param {object class FdkProgressbarModel} model - РёСЃС‚РѕС‡РЅРёРє РґР°РЅРЅС‹С… 
         * @param {object} elements - elements.root - С…СЂР°РЅРёС‚ СЃСЃС‹Р»РєСѓ РЅР° Р±Р°Р·РѕРІС‹Р№ СЌР»РµРјРµРЅС‚-html
         */
        constructor(model, elements, option = {}) {
            super();

            this.model = model;
            this.nameCssElements = {
                "root": "fdk-progressbar",
                "line": "fdk-progressbar__line",
                "move": "fdk-progressbar__line-move",
                "circle": "fdk-progressbar__circle",
                "notice": "fdk-progressbar__notice"
            };

            this.elements = {};
            this.elements.rootNode = elements.root;
            this.elements.window = elements.window;
            this.stateCircle = false;
            this.activeDownClick = false;
            this.stateNotice = option.stateNotice || false;
            this.noticeSymbol = option.noticeSymbol || "%";

            // РўРѕР»С‰РёРЅР° Р»РёРЅРёРё
            this.heightLine = option.heightLine ? option.heightLine : 1;
            // РўРѕР»С‰РёРЅР° РѕРєСЂСѓР¶РЅРѕСЃС‚Рё
            this.heightCircle = option.heightCircle ? option.heightCircle : 10;
            // РЁРёСЂРёРЅР° Р»РёРЅРёРё
            this.lineWidth = option.lineWidth ? option.lineWidth : 100;
            // Р’РЅСѓС‚СЂРµРЅРЅРёР№ РѕС‚СЃС‚СѓРї
            this.mainPadding = option.mainPadding ? option.mainPadding : "10px 15px";
            // Р¦РІРµС‚ Р·Р°РґРЅРµРіРѕ С„РѕРЅР° Р»РёРЅРёРё
            this.lineBgColor = option.lineBgColor ? option.lineBgColor : "rgba(192, 192, 192, 0.4)";
            // Р¦РІРµС‚ РїРµСЂРµРґРЅРµРіРѕ С„РѕРЅР° Р»РёРЅРёРё
            this.lineFgColor = option.lineFgColor ? option.lineFgColor : "white";
            // Р¦РІРµС‚ РѕРєСЂСѓР¶РЅРѕСЃС‚Рё
            this.circleColor = option.circleColor ? option.circleColor : "white";
            // Р¦РІРµС‚ Р·Р°РґРЅРµРіРѕ С„РѕРЅР° РѕРїРёСЃР°РЅРёСЏ
            this.bgColorNotice = option.bgColorNotice ? option.bgColorNotice : "#ff2a67";
            // Р¦РІРµС‚ С‚РµРєСЃС‚Р° РґР»СЏ РѕРєРЅР° СЃ РѕРїРёСЃР°РЅРёРµРј
            this.textColorNotice = option.textColorNotice ? option.textColorNotice : "white";

            this.onCallbackMouseMoveWindowFun = null;

            this.createDomHtml();
            this.createDomNoticeHtml();


            if (this.stateNotice) {
                this.elements.rootNode.addEventListener("mousemove", e => this.showNotice(e));
                this.elements.notice = this.elements.rootNode.querySelector(`.${this.nameCssElements.notice}`);
                 
            }
            this.defaultCss();
            this.elements.circleNode = this.elements.rootNode.querySelector(`.${this.nameCssElements.circle}`);
            this.elements.line = this.elements.rootNode.querySelector(`.${this.nameCssElements.line}`);
            this.elements.lineMove = this.elements.rootNode.querySelector(`.${this.nameCssElements.move}`);

            this.elements.rootNode.addEventListener("mousedown", e => {
                if (this.activeDownClick) {
                    if (this.stateCircle) {
                        this.elements.window.removeEventListener("mousemove", this.onCallbackMouseMoveWindowFun);
                        this.stateCircle = false;
                        this.emit("rootNodeClick", e)
                    }
                }
                this.elements.window.addEventListener("mousemove", (this.onCallbackMouseMoveWindowFun = ((e) => {
                    this.emit("mouseMoveWindow", e);
                }).bind(this)));
                this.stateCircle = true;
                /*this.emit("rootNodeClick", e)*/
                this.activeDownClick = true;
            });
            this.elements.window.addEventListener("mouseup", e => {
                if (this.stateCircle) {
                    this.elements.window.removeEventListener("mousemove", this.onCallbackMouseMoveWindowFun);
                    this.stateCircle = false;
                    this.emit("rootNodeClick", e)
                }
            });

            this.model.on("updateState", state => this.render());
        }
        /**
         * РњРµС‚РѕРґ СЃРѕР·РґР°РµС‚ РїРѕР»РЅСѓСЋ html-СЃС‚СЂСѓРєС‚СѓСЂСѓ РёРЅРґРёРєР°С‚РѕСЂР°
         * @return Element HTML
         * @throws Error
         */
        createDomHtml() {
            if (!this.elements.rootNode) {
                throw Error("Root Node not founded: [Method->createDomHtml]");
            }
            if (!this.elements.rootNode.classList.contains(this.nameCssElements.root)) {
                this.elements.rootNode.classList.add(this.nameCssElements.root);
            }

            this.elements.rootNode.insertAdjacentHTML("beforeEnd", `<div class="${this.nameCssElements.line}">
                                                                <div class="${this.nameCssElements.move}">
                                                                  <div class="${this.nameCssElements.circle}"></div>
                                                                </div>
                                                              </div>`);
        }
        /**
         * РњРµС‚РѕРґ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ СЃРІРѕР№СЃС‚РІР° СЃС‚РёР»РµР№ РґР»СЏ РЅР°СЃС‚СЂР°РёРІР°РµРјС‹С… СЌР»РµРјРµРЅС‚РѕРІ 
         */
        defaultCss() {
            this.elements.rootNode.style.padding = this.mainPadding;
            let line = this.elements.rootNode.querySelector(".fdk-progressbar__line");
            line.style.height = `${this.heightLine}px`;
            line.style.backgroundColor = `${this.lineBgColor}`;
            line.style.width = `${this.lineWidth}px`;
            let circle = this.elements.rootNode.querySelector(".fdk-progressbar__circle");
            circle.style.height = `${this.heightCircle}px`;
            circle.style.width = `${this.heightCircle}px`;
            circle.style.top = `calc(50% - ${this.heightCircle}px / 2)`;
            circle.style.left = `calc(100% - ${this.heightCircle}px / 2)`;
            circle.style.backgroundColor = `${this.circleColor}`;
            let move = this.elements.rootNode.querySelector(".fdk-progressbar__line-move");
            move.style.backgroundColor = `${this.lineFgColor}`;
            if (this.stateNotice) {
                this.elements.notice.style.color = `${this.textColorNotice}`;
                this.elements.notice.style.backgroundColor = `${this.bgColorNotice}`;
                this.elements.notice.style.borderColor = `${this.bgColorNotice}`;
            }
        }
        /**
         * РњРµС‚РѕРґ РґРѕР±Р°РІР»СЏРµС‚ РІСЃРїР»С‹РІР°СЋС‰РёР№ Р±Р»РѕРє  
         */
        createDomNoticeHtml() {
            if (!this.stateNotice) return;

            this.elements.rootNode.insertAdjacentHTML("afterBegin", `<div class="${this.nameCssElements.notice}"></div>`);
             
        }
        /**
         * РњРµС‚РѕРґ РёР·РјРµРЅСЏРµС‚ РІРЅРµС€РЅРµРµ РїСЂРµРґСЃС‚Р°РІР»РµРЅРёРµ РёРЅРґРёРєР°С‚РѕСЂР° 
         */
        render() {
            let w = this.elements.line.getBoundingClientRect().width;
            let offetPhis = (w / (this.model.getMaxRange() - this.model.getMinRange())) * (this.model.currentOffset - this.model.getMinRange());
            let proc = offetPhis * 100 / w;
            this.elements.lineMove.style.width = `${proc}%`;

            this.emit("render", null);
        }
        /**
         * РњРµС‚РѕРґ РѕС‚РѕР±СЂР°Р¶Р°РµС‚ СЃРјРµС‰РµРЅРёРµ РЅР°Рґ РёРЅРґРёРєР°С‚РѕСЂРѕРј 
         * @param {Event} e - when hover on cursor 
         */
        showNotice(e) {
            let x = e.clientX - this.elements.line.getBoundingClientRect().left;
            let w = this.elements.line.getBoundingClientRect().width;
            let offset = 0;

            if (x <= 0) {
                offset = this.model.getMinRange();
            } else if (x >= w) {
                offset = this.model.getMaxRange();
            } else {
                offset = this.model.getMinRange() + (((this.model.getMaxRange() - this.model.getMinRange()) / w) * x);
                offset = offset - (offset % this.model.getStepRange());
            }
            this.elements.notice.innerHTML = `${offset.toFixed(0)}${this.noticeSymbol}`;
            x = e.clientX - this.elements.rootNode.getBoundingClientRect().left - this.elements.notice.getBoundingClientRect().width / 2;
            this.elements.notice.style.left = `${x}px`;
        }
    }
    class FdkProgressbarScaleTimeView extends FdkProgressbarView {
        /**
         * РЎРѕР·РґР°РµС‚ СЌРєР·РµРјРїР»СЏСЂ РєР»Р°СЃСЃР° 
         * 
         * @constructor
         * @this  {FdkProgressbarView} 
         * @param {object class FdkProgressbarModel} model - РёСЃС‚РѕС‡РЅРёРє РґР°РЅРЅС‹С… 
         * @param {object} elements - elements.root - С…СЂР°РЅРёС‚ СЃСЃС‹Р»РєСѓ РЅР° Р±Р°Р·РѕРІС‹Р№ СЌР»РµРјРµРЅС‚-html
         */
        constructor(model, elements, option = {}) {
            option.lineWidth = option.lineWidth ? option.lineWidth : 280;
             
            super(model, elements, option);
        }
        /**
         * РњРµС‚РѕРґ РїСЂРёРЅРёРјР°РµС‚ СЃРµРєСѓРЅРґС‹ (РЅРµРєРѕС‚РѕСЂР°СЏ РІСЂРµРјРµРЅРЅР°СЏ РјРµС‚РєР° РѕС‚ РѕР±С‰РµРіРѕ РІСЂРµРјРµРЅРё) Рё РІРѕР·РІСЂР°С‰Р°РµС‚ РїСЂРµРѕР±СЂР°Р·РѕРІР°РЅРЅРѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ РІ С„РѕСЂРјР°С‚Рµ 00:01/05:23 | 00:55:01/10:05:23
         * @param {Event} e - when hover on cursor 
         */
        getFormatTime(seconds) {
            let hours = "",
                minuts = "";
            let times = [],
                stringTime = "";
            let r = "",
                time = 0;


            if ((time = seconds / 3600) >= 1) {
                hours = String(Math.floor(time));
                seconds = seconds - (+hours * 3600);

                stringTime = (hours.length > 1 ? hours : '0' + hours);
                times.push(stringTime);
            }
            if ((time = seconds / 60) >= 1) {
                minuts = String(Math.floor(time));
                seconds = seconds - (+minuts * 60);

                stringTime = (minuts.length > 1 ? minuts : '0' + minuts);
                times.push(stringTime);
            }
            stringTime = (String(Math.floor(seconds)).length > 1 ? seconds : '0' + seconds);
            times.push(stringTime);
            if (times.length == 1) {
                times.unshift("00");
            }

            return times.join(":");
        }
        /**
         * РњРµС‚РѕРґ РѕС‚РѕР±СЂР°Р¶Р°РµС‚ СЃРјРµС‰РµРЅРёРµ (РІСЂРµРјСЏ С‚РµРєСѓС‰РµРµ Рё РѕР±С‰РµРµ, current and total РІ С„РѕСЂРјР°С‚Рµ 00:01/05:23 | 00:55:01/10:05:23)
         * @param {Event} e - when hover on cursor 
         */
        showNotice(e) {
            let x = e.clientX - this.elements.line.getBoundingClientRect().left;
            let w = this.elements.line.getBoundingClientRect().width;
            let offset = 0;
            if (x <= 0) {
                offset = this.model.getMinRange();
            } else if (x >= w) {
                offset = this.model.getMaxRange();
            } else {
                offset = this.model.getMinRange() + (((this.model.getMaxRange() - this.model.getMinRange()) / w) * x);
                offset = offset - (offset % this.model.getStepRange());
            }
            this.elements.notice.innerHTML = `${this.getFormatTime(offset)}/${this.getFormatTime(this.model.getMaxRange())}`;
            let a = e.clientX + (this.elements.notice.getBoundingClientRect().width / 2);
            let a2 = e.clientX - (this.elements.notice.getBoundingClientRect().width / 2);
            let b = this.elements.rootNode.getBoundingClientRect().left + this.elements.notice.getBoundingClientRect().width;
            let c = this.elements.rootNode.getBoundingClientRect().left + this.elements.rootNode.getBoundingClientRect().width - (this.elements.notice.getBoundingClientRect().width);
            if (a < b) {
                this.elements.notice.style.left = `${0}px`;
            } else if (a2 > c) {
                this.elements.notice.style.left = `${this.elements.rootNode.getBoundingClientRect().width - (this.elements.notice.getBoundingClientRect().width)}px`;
            } else {
                x = e.clientX - this.elements.rootNode.getBoundingClientRect().left - this.elements.notice.getBoundingClientRect().width / 2;
                this.elements.notice.style.left = `${x}px`;
            }
        }
    }
    class FdkProgressbarController {
        constructor(model, view) {
            this.model = model;
            this.view = view;

            this.view.on("rootNodeClick", e => {
                this.offset(e);
            });
            this.view.on("mouseMoveWindow", e => {
                this.offset(e);
            });
        }
        offset(e) {
            let x = e.clientX - this.view.elements.line.getBoundingClientRect().left;
            let w = this.view.elements.line.getBoundingClientRect().width;
            let offset = 0;

            if (x <= 0) {
                offset = this.model.getMinRange();
            } else if (x >= w) {
                offset = this.model.getMaxRange();
            } else {
                offset = this.model.getMinRange() + (((this.model.getMaxRange() - this.model.getMinRange()) / w) * x);
                offset = offset - (offset % this.model.getStepRange());
            }

            this.model.currentOffset = offset;
        }
    }
    class FdkProgressbar {
        constructor(option) {

            let modelOffset = {
                min: undefined,
                max: undefined,
                step: undefined,
                offset: undefined
            };
            if (option.range) {
                for (let key in option.range) {
                    modelOffset[key] = option.range[key];
                }
            }
            if (option.startOffset) {
                modelOffset.offset = option.startOffset;
            }

            this.pm = new FdkProgressbarModel(modelOffset);
            this.pv = new FdkProgressbarView(this.pm, {
                root: option.rootNode,
                window: window
            }, {
                stateNotice: option.notice,
                noticeSymbol: option.noticeSymbol,
                heightLine: option.heightVolumeLine,
                heightCircle: option.heightVolumeCircle,
                lineBgColor: option.lineBgColorVolume,
                lineFgColor: option.lineFgColor,
                circleColor: option.circleColor,
                lineWidth: option.lineWidth,
                mainPadding: option.mainPadding,
                bgColorNotice: option.bgColorNotice,
                textColorNotice: option.textColorNotice
            });
            this.pv.render();
            this.pc = new FdkProgressbarController(this.pm, this.pv);

            if (option.callbacks) {
                if (option.callbacks.move) {
                    this.pv.on("render", () => {
                        option.callbacks.move({
                            data: this.pm.currentOffset
                        });
                    });
                }
            }

        }
        get currentOffset() {
            return this.pm.currentOffset;
        }
        set currentOffset(value) {
            this.pm.currentOffset = value;
        }
    }
    class FdkProgressbarScaleTime {
        constructor(option) {
             
            let modelOffset = {
                min: undefined,
                max: undefined,
                step: undefined,
                offset: undefined
            };
            if (option.range) {
                for (let key in option.range) {
                    modelOffset[key] = option.range[key];
                }
            }
            if (option.startOffset) {
                modelOffset.offset = option.startOffset;
            }
            this.pm = new FdkProgressbarModel(modelOffset);
            this.pv = new FdkProgressbarScaleTimeView(this.pm, {
                root: option.rootNode,
                window: window
            }, {
                stateNotice: option.notice,
                noticeSymbol: option.noticeSymbol,
                heightLine: option.heightVolumeLine,
                heightCircle: option.heightVolumeCircle,
                lineBgColor: option.lineBgColorVolume,
                lineFgColor: option.lineFgColor,
                circleColor: option.circleColor,
                lineWidth: option.lineWidth,
                mainPadding: option.mainPadding
            });
            this.pv.render();
            this.pc = new FdkProgressbarController(this.pm, this.pv);

            if (option.callbacks) {
                if (option.callbacks.move) {
                    this.pv.on("render", () => {
                        option.callbacks.move({
                            data: this.pm.currentOffset
                        });
                    });
                }
                if (option.callbacks.click) {
                    this.pv.on("rootNodeClick", () => {
                        option.callbacks.click({
                            data: this.pm.currentOffset
                        });
                    });
                }
                if (option.callbacks.moveManual) {
                    this.pv.on("mouseMoveWindow", () => {
                        option.callbacks.moveManual({
                            data: this.pm.currentOffset
                        });
                    });
                }
            }
        }
        get currentOffset() {
            return this.pm.currentOffset;
        }
        set currentOffset(value) {
            this.pm.currentOffset = value;
        }
        set maxRange(range) {
            this.pm.setMaxRange(range);
        }
    }
    /**
     * РљР»Р°СЃСЃ РїСЂРµРґРІСЃС‚Р°РІР»СЏРµС‚ СѓСЂРѕРІРµРЅСЊ РіСЂРѕРјРєРѕСЃС‚Рё СЃ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕР№ РєРЅРѕРїРєРѕР№ РіСЂРѕРјРєРѕСЃС‚Рё
     */
    class FdkProgressbarSound extends EventEmitter {
        constructor(elements, option) {
            super();

            this.nameCssElements = {
                "root": "fdk-progressbar-sound",
                "root-progressbar": "fdk-progressbar",
                "volume": "fdk-progressbar__bt-volume"
            };

            if (!option.pbVolume) {
                option.pbVolume = {};
            }

            this.templateStates = {
                up: '&#x1f50a;',
                down: '&#x1f509;',
                off: '&#128264;'
            };

            if (option.templateHtmlCodes) {
                this.templateStates = {
                    up: option.templateHtmlCodes.up ? option.templateHtmlCodes.up : '&#x1f50a;',
                    down: option.templateHtmlCodes.down ? option.templateHtmlCodes.down : '&#x1f509;',
                    off: option.templateHtmlCodes.off ? option.templateHtmlCodes.off : '&#128264;'
                };
            }

            this.prevLevelVolume = 0;
            this.sizeLogoVolume = "18";
            if (option.pbVolume.sizeLogoVolume) {
                this.sizeLogoVolume = option.pbVolume.sizeLogoVolume;
            }

            this.state = FdkProgressbarSound.STATE.UP;
            this.elements = {};
            this.elements.rootNode = elements.rootNode;

            this.createDomHtml();

            this.elements.volume = this.elements.rootNode.querySelector(".fdk-progressbar__bt-volume");
            this.elements.volume.addEventListener("click", (e) => {

                if (this.state.indexOf(FdkProgressbarSound.STATE.UP) == -1 && this.state.indexOf(FdkProgressbarSound.STATE.DOWN) == -1) {
                    this.state = FdkProgressbarSound.STATE.UP;
                } else {
                    this.state = FdkProgressbarSound.STATE.OFF;
                }

                this.setState(this.state);

                this.emit("updateState", this.state);
            });
             
            this.progressbar = (new FdkProgressbar({
                rootNode: this.elements.rootNode.querySelector(`.${this.nameCssElements["root-progressbar"]}`),
                startOffset: option.startOffset,
                range: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                callbacks: {
                    move: (e) => {
                        if (e.data >= 0 && e.data <= 15) {
                            this.setState(FdkProgressbarSound.STATE.OFF);
                        } else if (e.data >= 15 && e.data <= 75) {
                            this.setState(FdkProgressbarSound.STATE.DOWN);
                        } else if (e.data >= 75 && e.data <= 100) {
                            this.setState(FdkProgressbarSound.STATE.UP);
                        }

                        this.emit("moveSound", e);
                    }
                },
                notice: true,
                noticeSymbol: "%",
                heightVolumeLine: option.pbVolume.heightVolumeLine,
                heightVolumeCircle: option.pbVolume.heightVolumeCircle,
                lineBgColorVolume: option.pbVolume.lineBgColorVolume,
                lineFgColor: option.pbVolume.lineFgColor,
                circleColor: option.pbVolume.circleColor,
                lineWidth: option.pbVolume.lineWidth,
                mainPadding: option.mainPadding,
                bgColorNotice: option.pbVolume.bgColorNotice,
                textColorNotice: option.pbVolume.textColorNotice
            }));
            this.on("updateState", data => {
                if (data.indexOf(FdkProgressbarSound.STATE.UP) == -1 && data.indexOf(FdkProgressbarSound.STATE.DOWN) == -1) {
                    this.prevLevelVolume = this.progressbar.currentOffset;
                    this.progressbar.currentOffset = 0;
                } else {
                    this.progressbar.currentOffset = this.prevLevelVolume;
                }
            });

            this.defaultCss();
            this.setState(this.state);
        }
        /**
         * РњРµС‚РѕРґ СЃРѕР·РґР°РµС‚ РїРѕР»РЅСѓСЋ html-СЃС‚СЂСѓРєС‚СѓСЂСѓ РёРЅРґРёРєР°С‚РѕСЂР°
         * @return Element HTML
         * @throws Error
         */
        createDomHtml() {
            if (!this.elements.rootNode) {
                throw Error("Root Node not founded: [Method->createDomHtml]");
            }
            if (!this.elements.rootNode.classList.contains(this.nameCssElements.root)) {
                this.elements.rootNode.classList.add(this.nameCssElements.root);
            }
            this.elements.rootNode.insertAdjacentHTML("beforeEnd", `<div class="${this.nameCssElements["root-progressbar"]}"></div>
                                                              <div class="${this.nameCssElements.volume}"></div>`);
        }
        defaultCss() {
            this.elements.volume.style.fontSize = this.sizeLogoVolume + "px";
        }
        setState(type) {
            this.elements.volume.innerHTML = this.templateStates[type];
        }
    }
    FdkProgressbarSound.STATE = {
        UP: "up",
        DOWN: "down",
        OFF: "off"
    };

    window.FdkProgressbarSound = FdkProgressbarSound;
    window.FdkProgressbar = FdkProgressbar;
    window.FdkProgressbarScaleTime = FdkProgressbarScaleTime;
})(window);
(function(w) {
    const window = w;
    if (!(window instanceof Window)) {
        throw new Error("Not found object Window in argument 'w'");
    }
    if (window.FdkScrollBar) return;

    class FdkScrollBar {
        constructor(elements, options) {
            this.elements = elements;
            this.options = options;

            this.defaultParams = {
                scroll: {
                    width: 5,
                    bgc: "#c8c8c899"
                },
                height: 250
            };

            if (this.options) {
                if (this.options.scroll) {
                    this.options.scroll.width = this.options.scroll.width || this.defaultParams.scroll.width;
                    this.options.scroll.bgc = this.options.scroll.bgc || this.defaultParams.scroll.bgc;
                } else {
                    this.options = { scroll: {} };
                    this.options.scroll.width = this.defaultParams.scroll.width;
                    this.options.scroll.bgc = this.defaultParams.scroll.bgc;
                }
                if(!this.options.height) this.options.height = this.defaultParams.height;

            } else {
                this.options = { scroll: {} };
                this.options.scroll.width = this.defaultParams.scroll.width;
                this.options.scroll.bgc = this.defaultParams.scroll.bgc;
                this.options.height = this.defaultParams.height;
            }

            this.offsetScroll = 50;
            this.stateDragVerticalMove = false;
            this.startPositionVerticalMove = 0;

            this.nameCssElements = {
                "root": {
                    "value": "virtual-scrollbar",
                    "params": ["virtual-scrollbar_theme-mode_params-1"]
                },
                "main": {
                    "value": "virtual-scrollbar__container-main",
                    "params": []
                },
                "wrapper-content": {
                    "value": "virtual-scrollbar__wrapper-content",
                    "params": []
                },
                "content": {
                    "value": "virtual-scrollbar__content",
                    "params": []
                },
                "scroll-vertical": {
                    "value": "virtual-scrollbar__scrollbar-vertical",
                    "params": ["virtual-scrollbar__scrollbar-vertical_theme-scroll_off"]
                },
                "controll-up": {
                    "value": "virtual-scrollbar__controll-up",
                    "params": ["unenabled"]
                },
                "controll-line": {
                    "value": "virtual-scrollbar__controll-line",
                    "params": []
                },
                "move-vertical": {
                    "value": "virtual-scrollbar__controll-move-vertical",
                    "params": []
                },
                "controll-down": {
                    "value": "virtual-scrollbar__controll-down",
                    "params": ["unenabled"]
                },
                "scroll-horizontal": {
                    "value": "virtual-scrollbar__scrollbar-horizontal",
                    "params": ["virtual-scrollbar__scrollbar-vertical_theme-scroll_off"]
                },
                "controll-left": {
                    "value": "virtual-scrollbar__controll-left",
                    "params": ["unenabled"]
                },
                "move-horizontal": {
                    "value": "virtual-scrollbar__controll-move-horizontal",
                    "params": []
                },
                "controll-right": {
                    "value": "virtual-scrollbar__controll-right",
                    "params": []
                }
            };

            this.createDomHtml();
            this.defaultCss();

            this.elements.scrollBarVerticalButtonUp = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-vertical .virtual-scrollbar__controll-up");
            this.elements.scrollBarVerticalButtonDown = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-vertical .virtual-scrollbar__controll-down");
            this.elements.scrollBarHorizontalButtonLeft = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-horizontal .virtual-scrollbar__controll-left");
            this.elements.scrollBarHorizontalButtonRight = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-horizontal .virtual-scrollbar__controll-right");
            this.elements.scrollVertical = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-vertical .virtual-scrollbar__controll-line");
            this.elements.scrollMoveElementVertical = this.elements.scrollVertical.querySelector(".virtual-scrollbar__controll-move-vertical");
            this.elements.scrollHorizontal = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-horizontal .virtual-scrollbar__controll-line");
            this.elements.scrollMoveElementHorizontal = this.elements.scrollHorizontal.querySelector(".virtual-scrollbar__controll-move-horizontal");
            this.elements.wrapperContentScrollBar = this.elements.scrollBar.querySelector(".virtual-scrollbar__wrapper-content");
            this.elements.contentScrollBar = this.elements.scrollBar.querySelector(".virtual-scrollbar__content");
            this.elements.scrollVericalWrapper = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-vertical");
            this.elements.scrollHorizontalWrapper = this.elements.scrollBar.querySelector(".virtual-scrollbar__scrollbar-horizontal");
            this.elements.window = elements.window;

            this._onCallbackWheelAnonim = null;
            this._onCallbackScrollBarVerticalButtonUp = null;
            this._onCallbackScrollBarVerticalButtonDown = null;
            this._onCallbackScrollBarHorizontalButtonLeft = null;
            this._onCallbackScrollBarHorizontalButtonRight = null;
            this._onCallbackScrollVertical = null;
            this._onCallbackScrollMoveElementVertical = null;
            this._onCallbackMoveWindow = null;

            this._observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {  
                    if (mutation.type == "childList") { 
                        this.update();
                    }
                });
            });
            let config = { childList: true };
            this.bindObserber(this.elements.contentScrollBar, config);

            this.elements.scrollMoveElementVertical.style.backgroundColor = this.options.scroll.bgc;
            this.elements.scrollMoveElementVertical.style.width = `${this.options.scroll.width}px`;

            this.elements.wrapperContentScrollBar.style.height = `${this.options.height}px`;

            this.elements.wrapperContentScrollBar.addEventListener("focus", e => {
                this.elements.scrollMoveElementVertical.style.opacity = "1";
            });
            this.elements.wrapperContentScrollBar.addEventListener("blur", e => {
                this.elements.scrollMoveElementVertical.style.opacity = "0";
            });

            this.start();
        }
        /**
         * РњРµС‚РѕРґ СЃРѕР·РґР°РµС‚ РїРѕР»РЅСѓСЋ html-СЃС‚СЂСѓРєС‚СѓСЂСѓ РёРЅРґРёРєР°С‚РѕСЂР°
         * @return Element HTML
         * @throws Error
         */
        createDomHtml() {
            if (!this.elements.scrollBar) {
                throw Error("Root Node not founded: [Method->createDomHtml]");
            }
            if (!this.elements.scrollBar.classList.contains(this.nameCssElements.root.value)) {
                this.elements.scrollBar.classList.add(this.nameCssElements.root);
            }
            this.nameCssElements.root.params.forEach((item) => {
                this.elements.scrollBar.classList.add(item);
            });

            let data = this.elements.scrollBar.innerHTML;
            this.elements.scrollBar.innerHTML = "";
            this.elements.scrollBar.insertAdjacentHTML("beforeEnd", `<div class="${this.nameCssElements.main.value + this.getParamsCssInNode(this.nameCssElements.main.params)}">
                                                                  <div class="${this.nameCssElements["wrapper-content"].value +" " + this.getParamsCssInNode(this.nameCssElements["wrapper-content"].params)}">
                                                                    <div class="${this.nameCssElements.content.value + this.getParamsCssInNode(this.nameCssElements.content.params)}">${data}</div>
                                                                  </div>
                                                                  <div class="${this.nameCssElements["scroll-vertical"].value + " " + this.getParamsCssInNode(this.nameCssElements["scroll-vertical"].params)}">
                                                                    <div class="${this.nameCssElements["controll-up"].value + " " + this.getParamsCssInNode(this.nameCssElements["controll-up"].params)}"><span>вЇ…</span></div>
                                                                    <div class="${this.nameCssElements["controll-line"].value + " " + this.getParamsCssInNode(this.nameCssElements["controll-line"].params)}">
                                                                      <span class="${this.nameCssElements["move-vertical"].value + " " + this.getParamsCssInNode(this.nameCssElements["move-vertical"].params)}"></span>
                                                                    </div>
                                                                    <div class="${this.nameCssElements["controll-down"].value + " " + this.getParamsCssInNode(this.nameCssElements["controll-down"].params)}"><span>вЇ†</span></div>
                                                                  </div>
                                                                </div>
                                                                <div class="${this.nameCssElements["scroll-horizontal"].value + " " + this.getParamsCssInNode(this.nameCssElements["scroll-horizontal"].params)}"> <!--  -->
                                                                  <div class="${this.nameCssElements["controll-left"].value + " " + this.getParamsCssInNode(this.nameCssElements["controll-left"].params)}">
                                                                    <span>вЇ‡</span>
                                                                  </div>
                                                                  <div class="${this.nameCssElements["controll-line"].value + " " + this.getParamsCssInNode(this.nameCssElements["controll-line"].params)}">
                                                                    <span class="${this.nameCssElements["move-horizontal"].value + " " + this.getParamsCssInNode(this.nameCssElements["move-horizontal"].params)}"></span>
                                                                  </div>
                                                                  <div class="${this.nameCssElements["controll-right"].value + " " + this.getParamsCssInNode(this.nameCssElements["controll-right"].params)}"><span>вЇ€</span></div>
                                                                </div>`);
        }
        getParamsCssInNode(obj) {
            let str = [];
            obj.forEach((item) => {
                str.push(item);
            });
            return str.join(" ");
        }
        defaultCss() {
            // ...
        }
        /**
         *  After change inside state component to run method
         */
        update() {
            this.start();

            this.directionVerticalUp();
            this.directionVerticalDown();
            this.directionVerticalUp();
        }
        start() {
            let infoScrollBar = this.getInfoStateScrollBar();

            if (infoScrollBar.verticalShow) {
                /* Feature detection */
                let passiveIfSupported = false;

                try {
                  window.addEventListener("test", null,
                    Object.defineProperty(
                      {},
                      "passive",
                      {
                        get: function() { passiveIfSupported = { passive: false }; }
                      }
                    )
                  );
                } catch(err) {}

                 
                this.elements.scrollVericalWrapper.classList.remove("virtual-scrollbar__scrollbar-vertical_theme-scroll_off");

                this.normalizeStateScrollBar();

                if (!this._onCallbackWheelAnonim)
                    this.elements.scrollBar.addEventListener("wheel", (this._onCallbackWheelAnonim = this.onCallbackWheel.bind(this)), passiveIfSupported);
                if (!this._onCallbackScrollBarVerticalButtonUp)
                    this.elements.scrollBarVerticalButtonUp.addEventListener("click", (this._onCallbackScrollBarVerticalButtonUp = this.onCallbackScrollBarVerticalButtonUp.bind(this)));
                if (!this._onCallbackScrollBarVerticalButtonDown)
                    this.elements.scrollBarVerticalButtonDown.addEventListener("click", (this._onCallbackScrollBarVerticalButtonDown = this.onCallbackScrollBarVerticalButtonDown.bind(this)));
                if (!this._onCallbackScrollVertical)
                    this.elements.scrollVertical.addEventListener("click", (this._onCallbackScrollVertical = this.onCallbackScrollVertical.bind(this)));
                if (!this._onCallbackScrollMoveElementVertical)
                    this.elements.scrollMoveElementVertical.addEventListener("mousedown", (this._onCallbackScrollMoveElementVertical = this.onCallbackScrollMoveElementVertical.bind(this)));
                if (!this._onCallbackMoveWindow)
                    this.elements.window.addEventListener("mousemove", (this._onCallbackMoveWindow = this.onCallbackMoveWindow.bind(this)));
                if (!this._onCallbackMouseUpWindow)
                    this.elements.window.addEventListener("mouseup", (this._onCallbackMouseUpWindow = this.onCallbackMouseUpWindow.bind(this)));

            } else {
                 
                this.elements.scrollVericalWrapper.classList.add("virtual-scrollbar__scrollbar-vertical_theme-scroll_off");

                this.elements.scrollBar.removeEventListener("wheel", this._onCallbackWheelAnonim);
                this.elements.scrollBarVerticalButtonUp.removeEventListener("click", this._onCallbackScrollBarVerticalButtonUp);
                this.elements.scrollBarVerticalButtonDown.removeEventListener("click", this._onCallbackScrollBarVerticalButtonDown);
                this.elements.scrollVertical.removeEventListener("click", this._onCallbackScrollVertical);

                this._onCallbackWheelAnonim = null;
                this._onCallbackScrollBarVerticalButtonUp = null;
                this._onCallbackScrollBarVerticalButtonDown = null;
                this._onCallbackScrollVertical = null;

            }
        }
        /**
         *  РЈСЃС‚Р°РЅРѕРІРёС‚СЊ РґР»РёРЅСѓ РІРµСЂС‚РёРєР°Р»СЊРЅРѕРіРѕ СЃРєСЂРѕР»Р»Р±Р°СЂР° 
         */
        bindSizeVertical() {
            // РџСЂРѕС†РµРЅС‚ СЃРєСЂС‹С‚РѕР№ С‡Р°СЃС‚Рё РѕС‚ Р±Р»РѕРєР° СЃ СЃРѕРґРµСЂР¶РёРјС‹Рј
            let pr1 = ((this.elements.contentScrollBar.getBoundingClientRect().height - this.elements.wrapperContentScrollBar.getBoundingClientRect().height) * 100 / (this.elements.contentScrollBar.getBoundingClientRect().height));
            // РџСЂРѕС†РµРЅС‚ РІРёРґРёРјРѕР№ С‡Р°СЃС‚Рё РѕС‚ Р±Р»РѕРєР° СЃ СЃРѕРґРµСЂР¶РёРјС‹Рј 
            let pr2 = 100 - pr1;
            // Р’С‹СЃРѕС‚Р° РІРµСЂС‚РёРєР°Р»СЊРЅРѕРіРѕ СЌР»РµРјРµРЅС‚Р° РїСЂРѕРєСЂСѓС‚РєРё РІС‹СЂР°Р¶РµРЅРЅСѓСЋ С‡РµСЂРµР· РїСЂРѕС†РµРЅС‚ РІРёРґРёРјРѕР№ С‡Р°СЃС‚Рё Р±Р»РѕРєР° СЃРµРґРµСЂР¶РёРјРѕРіРѕ РґР»СЏ Р±Р»РѕРєР° СЃ РїСЂРѕРєСЂСѓС‚РєРѕР№ 
            let heightBar = (pr2 * this.elements.scrollVertical.getBoundingClientRect().height) / 100;

            // Р•СЃР»Рё РІС‹СЃРѕС‚Р° РІС‹С…РѕРґРёС‚ Р·Р° РїСЂРµРґРµР»С‹ РґРѕРїСѓСЃС‚РёРјРѕРіРѕ СЂР°Р·РјРµСЂР°, С‚Рѕ РѕСЃС‚Р°РІРёС‚СЊ РµРµ С„РёРєСЃРёСЂРѕРІР°РЅРЅРѕР№ 
            if (heightBar < 20) {
                heightBar = 20;
            }
            this.elements.scrollMoveElementVertical.style.height = `${heightBar}px`;
        }
        /**
         *  РЈСЃС‚Р°РЅРѕРІРёС‚СЊ РґР»РёРЅСѓ РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРѕРіРѕ СЃРєСЂРѕР»Р»Р±Р°СЂР° 
         */
        bindSizeHorizontal() {
            let wrapperContentScrollBar = this.elements.scrollBar.querySelector(".virtual-scrollbar__wrapper-content");
            let contentScrollBar = this.elements.scrollBar.querySelector(".virtual-scrollbar__content");
            let pr1 = ((contentScrollBar.getBoundingClientRect().height - wrapperContentScrollBar.getBoundingClientRect().height) * 100 / (contentScrollBar.getBoundingClientRect().height));
            let pr2 = (100 - (contentScrollBar.getBoundingClientRect().height - wrapperContentScrollBar.getBoundingClientRect().height) * 100 / (contentScrollBar.getBoundingClientRect().height));
            let heightBar = (pr2 * this.elements.scrollVertical.getBoundingClientRect().height) / 100;
            if (heightBar < 20) {
                heightBar = 20;
            }
            this.elements.scrollVertical.querySelector(".virtual-scrollbar__controll-move-vertical").style.height = `${heightBar}px`;
        }
        /**
         *  Р’РµСЂРЅСѓС‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ РѕР± РІРµСЂС‚РёРєР°Р»СЊРЅРѕРј РїРѕР»Р·СѓРЅРєРµ, РµРіРѕ РїРѕР·РёС†РёСЋ СЃРјРµС‰РµРЅРёСЏ СЃ СѓС‡РµС‚РѕРј РІРЅРµС€РЅРёС… СЃРјРµС‰РµРЅРёР№, РїСЂРѕС†РµРЅС‚ СЃРјРµС‰РµРЅРёСЏ РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅРѕ СЂРѕРґРёС‚РµР»СЏ Рё РґР»РёРЅСѓ  
         *  @return Object {height, offsetTop, offsetProcentTop}
         */
        getInfoVerticalScrollBar() {
            let height = this.elements.scrollMoveElementVertical.getBoundingClientRect().height;
            let offsetTop = this.elements.scrollMoveElementVertical.getBoundingClientRect().top - (this.elements.scrollBar.getBoundingClientRect().top + this.elements.scrollBarVerticalButtonUp.getBoundingClientRect().height);
            let offsetProcentTop = offsetTop * 100 / (this.elements.scrollVertical.getBoundingClientRect().height - this.elements.scrollMoveElementVertical.getBoundingClientRect().height);

            return {
                height: height,
                offsetTop: offsetTop,
                offsetProcentTop: offsetProcentTop
            }
        }
        /**
         *  Р’РµСЂРЅСѓС‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ РѕР± РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРѕРј РїРѕР»Р·СѓРЅРєРµ, РµРіРѕ РїРѕР·РёС†РёСЋ СЃРјРµС‰РµРЅРёСЏ СЃ СѓС‡РµС‚РѕРј РІРЅРµС€РЅРёС… СЃРјРµС‰РµРЅРёР№, РїСЂРѕС†РµРЅС‚ СЃРјРµС‰РµРЅРёСЏ РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅРѕ СЂРѕРґРёС‚РµР»СЏ Рё С€РёСЂРёРЅСѓ
         *  @return Object {width, offsetLeft, offsetProcentLeft}
         */
        getInfoHorizontalScrollBar() {
            let width = this.elements.scrollMoveElementHorizontal.getBoundingClientRect().width;
            let offsetLeft = this.elements.scrollMoveElementHorizontal.getBoundingClientRect().left - (this.elements.scrollBar.getBoundingClientRect().left + this.elements.scrollBarHorizontalButtonLeft.getBoundingClientRect().width);
            let offsetProcentLeft = offsetLeft * 100 / (this.elements.scrollVertical.getBoundingClientRect().width - this.elements.scrollMoveElementHorizontal.getBoundingClientRect().width);

            return {
                width: width,
                offsetLeft: offsetLeft,
                offsetProcentLeft: offsetProcentLeft
            }
        }
        /**
         *  Р’РѕР·РІСЂР°С‰Р°РµС‚ СЃС„РѕСЂРјРёСЂРѕРІР°РЅРЅСѓСЋ СЃС‚СЂСѓРєС‚СѓСЂСѓ РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРёСЏ СЃРєСЂРѕР»Р»Р±Р°СЂР° 
         */
        getStructureScrollbar() {}
        /**
         *  Р’РѕР·РІСЂР°С‰Р°РµС‚ РёРЅС„РѕСЂРјР°С†РёСЋ РѕР± РІРёРґРёРјРѕСЃС‚Рё РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРѕРіРѕ Рё РІРµСЂС‚РёРєР°Р»СЊРЅРѕРіРѕ СЃРєСЂРѕР»Р»Р±Р°СЂР°
         */
        getInfoStateScrollBar() {
            let verticalShow = (this.elements.wrapperContentScrollBar.getBoundingClientRect().height < this.elements.contentScrollBar.getBoundingClientRect().height ? true : false);
            let horizontalShow = (this.elements.wrapperContentScrollBar.getBoundingClientRect().width < this.elements.contentScrollBar.getBoundingClientRect().width ? true : false);;
 
 
            return {
                horizontalShow: horizontalShow,
                verticalShow: verticalShow
            }
        }

        directionVerticalUp(val) {

            let offsetY = val ? val : this.offsetScroll;

            // РЎРјРµС‰РµРЅРёРµ СЃРІРµСЂС…Сѓ Р±Р»РѕРєР° СЃ СЃРѕРґРµСЂР¶РёРјС‹Рј 
            let offsteUp = this.elements.contentScrollBar.getBoundingClientRect().top - this.elements.wrapperContentScrollBar.getBoundingClientRect().top;
            let offsetDown = (this.elements.contentScrollBar.getBoundingClientRect().height - Math.abs(this.elements.contentScrollBar.getBoundingClientRect().top)) - this.elements.wrapperContentScrollBar.getBoundingClientRect().height - this.elements.wrapperContentScrollBar.getBoundingClientRect().top;
            let offsetEnd = this.elements.contentScrollBar.getBoundingClientRect().height - this.elements.wrapperContentScrollBar.getBoundingClientRect().height;

            let l = offsteUp + offsetY;
            if (l > 0) l = 0;
            this.elements.contentScrollBar.style.top = l + "px";
            //this.elements.contentScrollBar.style.transform = `translate3d(0px, ${l}px, 0px)`;

            offsteUp = -(this.elements.contentScrollBar.getBoundingClientRect().top - this.elements.wrapperContentScrollBar.getBoundingClientRect().top);
            let allHeightScroll = Math.abs(this.elements.wrapperContentScrollBar.getBoundingClientRect().height - this.elements.contentScrollBar.getBoundingClientRect().height)
            let procentUp = (offsteUp * 100 / allHeightScroll);
            let offsetLine = procentUp * (this.elements.scrollVertical.getBoundingClientRect().height - this.elements.scrollMoveElementVertical.getBoundingClientRect().height) / 100;
            this.elements.scrollMoveElementVertical.style.top = `${offsetLine}px`;
            //this.elements.scrollMoveElementVertical.style.transform = `translate3d(0px, ${offsetLine}px, 0px)`

        }
        directionVerticalDown(val) {

            let offsetY = val ? val : this.offsetScroll;

            // РЎРјРµС‰РµРЅРёРµ СЃРІРµСЂС…Сѓ Р±Р»РѕРєР° СЃ СЃРѕРґРµСЂР¶РёРјС‹Рј 
            let offsteUp = this.elements.contentScrollBar.getBoundingClientRect().top - this.elements.wrapperContentScrollBar.getBoundingClientRect().top;
            let offsetDown = (this.elements.contentScrollBar.getBoundingClientRect().height - Math.abs(this.elements.contentScrollBar.getBoundingClientRect().top)) - this.elements.wrapperContentScrollBar.getBoundingClientRect().height - this.elements.wrapperContentScrollBar.getBoundingClientRect().top;
            let offsetEnd = this.elements.contentScrollBar.getBoundingClientRect().height - this.elements.wrapperContentScrollBar.getBoundingClientRect().height;

            let l = offsteUp - offsetY;
            if (this.elements.contentScrollBar.getBoundingClientRect().height > this.elements.wrapperContentScrollBar.getBoundingClientRect().height) {
                if (l > -offsetEnd) {

                    this.elements.contentScrollBar.style.top = l + "px";
                    //this.elements.contentScrollBar.style.transform = `translate3d(0px, ${l}px, 0px)`;
                } else {
                    //this.elements.contentScrollBar.style.transform = `translate3d(0px, ${-offsetEnd}px, 0px)`;
                    this.elements.contentScrollBar.style.top = -offsetEnd + "px";
                }
            }

            offsteUp = -(this.elements.contentScrollBar.getBoundingClientRect().top - this.elements.wrapperContentScrollBar.getBoundingClientRect().top);
            let allHeightScroll = Math.abs(this.elements.wrapperContentScrollBar.getBoundingClientRect().height - this.elements.contentScrollBar.getBoundingClientRect().height)
            let procentUp = (offsteUp * 100 / allHeightScroll);
            let offsetLine = procentUp * (this.elements.scrollVertical.getBoundingClientRect().height - this.elements.scrollMoveElementVertical.getBoundingClientRect().height) / 100;
            this.elements.scrollMoveElementVertical.style.top = `${offsetLine}px`;
            //this.elements.scrollMoveElementVertical.style.transform = `translate3d(0px, ${offsetLine}px, 0px)`;
        }

        onCallbackWheel(e) {
            e = e || window.event;
            var delta = e.deltaY || e.detail || e.wheelDelta;

            if (delta <= 0) {
                this.directionVerticalUp();
            } else if (delta > 0) {
                this.directionVerticalDown();
            }
            e.preventDefault();
        }
        onCallbackScrollMoveElementVertical(e) {
            this.stateDragVerticalMove = true;
            this.startPositionVerticalMove = e.clientY;
            this.elements.scrollBar.classList.add("unenabled");
        }
        onCallbackScrollBarVerticalButtonUp(e) {
            this.directionVerticalUp();
        }
        onCallbackScrollBarVerticalButtonDown(e) {
            this.directionVerticalDown();
        }

        onCallbackScrollBarHorizontalButtonLeft(e) {}
        onCallbackScrollBarHorizontalButtonRight(e) {}

        onCallbackMoveWindow(e) {
            if (this.stateDragVerticalMove) {
                let offsetElements = (this.elements.scrollBar.getBoundingClientRect().top + this.elements.scrollBarVerticalButtonUp.getBoundingClientRect().height);
                let positionScroll = this.elements.scrollMoveElementVertical.getBoundingClientRect().top - offsetElements;
                let delta = this.startPositionVerticalMove - e.clientY;
                let offsteUp = this.elements.contentScrollBar.getBoundingClientRect().top - offsetElements;
                let offsetUpMove = this.elements.scrollMoveElementVertical.getBoundingClientRect().top - offsetElements;
                let allHeightScroll = Math.abs(this.elements.wrapperContentScrollBar.getBoundingClientRect().height - this.elements.contentScrollBar.getBoundingClientRect().height)
                let allHeightScrollMoveVertical = (this.elements.scrollVertical.getBoundingClientRect().height - this.elements.scrollMoveElementVertical.getBoundingClientRect().height);
                let pr1 = 100 - ((allHeightScrollMoveVertical - offsetUpMove) * 100 / allHeightScrollMoveVertical);
                if (delta < 0) {
                    let l = positionScroll + Math.abs(delta);
                    if (l > allHeightScrollMoveVertical) {
                        l = allHeightScrollMoveVertical;
                    } else {
                        this.startPositionVerticalMove = e.clientY;
                    }
                    this.elements.scrollMoveElementVertical.style.top = `${l}px`;
                } else {
                    let l = positionScroll - delta;
                    if (l < 0) {
                        l = 0;
                    } else {
                        this.startPositionVerticalMove = e.clientY
                    }
                    this.elements.scrollMoveElementVertical.style.top = `${l}px`;
                }
                this.elements.contentScrollBar.style.top = -(((pr1 * allHeightScroll) / 100)) + "px";
            }
        }
        onCallbackMouseUpWindow(e) {
            if (this.stateDragVerticalMove) {
                this.stateDragVerticalMove = false;
                this.startPositionVerticalMove = 0;
                this.elements.scrollBar.classList.remove("unenabled");
            }
        }
        onCallbackScrollVertical(e) {
            if (e.target == this.elements.scrollVertical) {
                let offsetElements = (this.elements.scrollBar.getBoundingClientRect().top + this.elements.scrollBarVerticalButtonUp.getBoundingClientRect().height);
                let delta = e.clientY - offsetElements;
                let positionScroll = this.elements.scrollMoveElementVertical.getBoundingClientRect().top - offsetElements;

                if (delta < positionScroll) {
                    this.directionVerticalUp();
                } else {
                    this.directionVerticalDown();
                }
            }
        }
        bindObserber(obj, conf) {
            this._observer.observe(obj, conf);
        }
        normalizeStateScrollBar() {

            this.bindSizeVertical();

            // РЈСЃС‚Р°РЅРѕРІРёС‚СЊ РїРѕР·РёС†РёСЋ РІРµСЂС‚РёРєР°Р»СЊРЅРѕРіРѕ РїРѕР»Р·СѓРЅРєР° 
            if (this.getInfoVerticalScrollBar().offsetTop + this.getInfoVerticalScrollBar().height > this.elements.scrollVertical.getBoundingClientRect().height) {
                const diffHeight = (this.getInfoVerticalScrollBar().offsetTop + this.getInfoVerticalScrollBar().height - this.elements.scrollVertical.getBoundingClientRect().height);
                this.elements.scrollMoveElementVertical.style.top = `${this.getInfoVerticalScrollBar().offsetTop - diffHeight}px`;

                //this.elements.contentScrollBar.style.top = 100 +  "px";
            }
            // РЈСЃС‚Р°РЅРѕРІРёС‚СЊ РїРѕР·РёС†РёСЋ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ

        }
    }

    window.FdkScrollBar = FdkScrollBar;
})(window);
(function(w) {
    const window = w;
    if (!(window instanceof Window)) {
        throw new Error("Not found object Window in argument 'w'");
    }
    class EventEmitter {
        constructor() {
            this._events = {};
        }
        on(evt, listener) {
            (this._events[evt] || (this._events[evt] = [])).push(listener);
            return this;
        }
        emit(evt, arg) {
            (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
        }
    }

    class FdkPlayerPropertis {}
    FdkPlayerPropertis.STATE = {
        PLAY: "play",
        PAUSE: "pause"
    };
    FdkPlayerPropertis.MATH = {};
    FdkPlayerPropertis.MATH.RANDOM = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    FdkPlayerPropertis.MATH.RANDOMWITHOUT = function(min, max, without) {
        let number = null,
            flag;
        do {
            flag = false;
            number = FdkPlayerPropertis.MATH.RANDOM(min, max);
            for (let key in without) {
                if (without[key] == number)
                    flag = true;
            }
        } while (flag);
        return number;
    }
    FdkPlayerPropertis.BUTTONS = {
        AWESOME: "awesome",
        UNICODE: "unicode"
    };
    FdkPlayerPropertis.TYPE_PROCESS = {
        EVENT_PREV: "prev",
        EVENT_NEXT: "next",
        EVENT_PLAY: "play",
        EVENT_PLAYLIST: "playlist"
    };
    FdkPlayerPropertis.POSITION = {
        LEFT_TOP: "left-top",
        RIGHT_TOP: "right-top",
        LEFT_BOTTOM: "left-bottom",
        RIGHT_BOTTOM: "right-bottom",
        DEFAULT: "default"
    };
    class FdkPlayerModel extends EventEmitter {
        /**
         * РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ СЃРѕР·РґР°РЅРёСЏ СЌРєР·РµРјРїР»СЏСЂР° РєР»Р°СЃСЃР° РђСѓРґРёРѕРїР»РµРµСЂ
         * @param tracks:Array - РјР°СЃСЃРёРІ РѕР±СЉРµРєС‚РѕРІ СЃ РёРЅС„РѕСЂРјР°С†РёРµР№ РѕР± Р°СѓРґРёРѕС„Р°Р№Р»Рµ
         */
        constructor(tracks) {
            super();

            this.audioTracks = tracks || [];
            this.currentAudioId = 0;
            this.played = FdkPlayerPropertis.STATE.PAUSE;
            this.modeEvent = null;
        }
        /**
         * РЈСЃС‚Р°РЅРѕРІРёС‚СЊ С‚РµРєСѓС‰РёР№ С‚СЂРµРє РїРѕ ID
         */
        set currentAudioTrackId(id) {
            this.currentAudioId = id;

            this.emit("updateCurrentAudioTrackId", this.currentAudioId);
        }
        /**
         * Р’РµСЂРЅСѓС‚СЊ С‚РµРєСѓС‰РёР№ ID
         */
        get currentAudioTrackId() {
            return this.currentAudioId;
        }
        /**
         * Р’РµСЂРЅСѓС‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ РѕР± Р°СѓРґРёРѕ С„Р°Р№Р»Рµ РїРѕ ID
         */
        getAudioTrack(id) {
            return this.audioTracks[id];
        }
        getAudioTracks() {
            return this.audioTracks;
        }
        set playState(state) {
            this.played = state;

            this.emit("updatePlayState", this.played);
        }
        get playState() {
            return this.played;
        }
        set typeEvent(event) {
            this.modeEvent = event;
        }
        get typeEvent() {
            return this.modeEvent;
        }
    }
    class FdkPlayerView extends EventEmitter {
        constructor(elements, model, options) {
            super();

            this.elements = {};
            this.elements.player = elements.player;
            this.elements.window = elements.window;
            this.model = model;
            this.modeShuffle = false;

            this.audio = this.createAudio();
            this.setAudioTrack();
            this.audio.volume = 50 / 100;
            this.options = options;
            this._defaultSettings = {
                "autoplay": false,
                "loop": false,
                "playlist": true,
                "playlistItem": {
                    "background": "#333",
                    "backgroundHover": "#ff477c",
                    "backgroundActive": "#ff2a67"
                },
                "scrolling": {
                    "widthLine": 5,
                    "backgroundLine": "#c8c8c899"
                },
                "widthPlayer": 520,
                "heightPlaylist": 350,
                "volumeOpacity": 100,
                "backgroundColor": "#000",
                "backgroundColorOver": "#31313180",
                "positionPlayer": FdkPlayerPropertis.POSITION.DEFAULT,
                "idPlayer": 1,
                "z-index": 999999,
                "buttonShuffle": {
                    "backgroundColor": "#fff",
                    "backgroundColorHover": "#ff477c",
                    "backgroundColorActive": "#ff2a67",
                },
                "buttonNext": {
                    "backgroundColor": "#fff",
                    "backgroundColorHover": "#ff477c"
                },
                "buttonPrev": {
                    "backgroundColor": "#fff",
                    "backgroundColorHover": "#ff477c"
                },
                "buttonPlay": {
                    "backgroundColor": "#fff",
                    "backgroundColorHover": "#ff477c"
                },
                "nameGroupArtist": {
                    "colorText": "#fff",
                    "backgroundColor": "none"
                },
                "indicatorVolume": {
                    "backgroundColorLine": "#c0c0c066",
                    "foregroundColorLine": "#fff",
                    "colorText": "#fff",
                    "colorCircle": "#fff",
                    "backgroundColorInfoPopUp": "#ff477c",
                    "widthIndicator": 75,
                    "heightIndicator": 1,
                    "sizeCircle": 10,
                    "sizeCircleHover": 20
                },
                "indicatorTimeSound": {
                    "backgroundColorLine": "#c0c0c066",
                    "foregroundColorLine": "#fff",
                    "colorText": "#fff",
                    "colorCircle": "#fff",
                    "backgroundColorInfoPopUp": "#ff477c",
                    "widthIndicator": 280,
                    "heightIndicator": 1,
                    "sizeCircle": 1,
                    "sizeCircleHover": 1,
                }
            };

            if (this.options.playlist) {
                if (this.options.playlist.visible === undefined) {
                    this.options.playlist.visible = this._defaultSettings.playlist;
                }
                if (this.options.playlist.loop === undefined) {
                    this.options.playlist.loop = this._defaultSettings.loop;
                }
                if (this.options.playlist.items === undefined) {
                    this.options.playlist.items = {};
                    this.options.playlist.items.bgc = this._defaultSettings.playlistItem.background;
                    this.options.playlist.items.bgch = this._defaultSettings.playlistItem.backgroundHover;
                    this.options.playlist.items.bgca = this._defaultSettings.playlistItem.backgroundActive;
                } else {
                    this.options.playlist.items.bgc = this.options.playlist.items.bgc || this._defaultSettings.playlistItem.background;
                    this.options.playlist.items.bgch = this.options.playlist.items.bgch || this._defaultSettings.playlistItem.backgroundHover;
                    this.options.playlist.items.bgca = this.options.playlist.items.bgca || this._defaultSettings.playlistItem.backgroundActive;
                }
            } else {
                this.options.playlist = {};
                this.options.playlist.visible = this._defaultSettings.playlist;
                this.options.playlist.loop = this._defaultSettings.loop;

                this.options.playlist.items = {};
                this.options.playlist.items.bgc = this._defaultSettings.playlistItem.background;
                this.options.playlist.items.bgch = this._defaultSettings.playlistItem.backgroundHover;
                this.options.playlist.items.bgca = this._defaultSettings.playlistItem.backgroundActive;
            }
            if (this.options.autoplay === undefined) {
                this.options.autoplay = this._defaultSettings.autoplay;
            }
            if (this.options.buttons === undefined) {
                this.options.buttons = {};
                this.options.buttons.shuffle = {};
                this.options.buttons.shuffle.bgc = this._defaultSettings.buttonShuffle.backgroundColor;
                this.options.buttons.shuffle.bgch = this._defaultSettings.buttonShuffle.backgroundColorHover;
                this.options.buttons.shuffle.bgca = this._defaultSettings.buttonShuffle.backgroundColorActive;
                this.options.buttons.next = {};
                this.options.buttons.next.bgc = this._defaultSettings.buttonNext.backgroundColor;
                this.options.buttons.next.bgch = this._defaultSettings.buttonNext.backgroundColorHover;
                this.options.buttons.prev = {};
                this.options.buttons.prev.bgc = this._defaultSettings.buttonPrev.backgroundColor;
                this.options.buttons.prev.bgch = this._defaultSettings.buttonPrev.backgroundColorHover;
                this.options.buttons.play = {};
                this.options.buttons.play.bgc = this._defaultSettings.buttonPlay.backgroundColor;
                this.options.buttons.play.bgch = this._defaultSettings.buttonPlay.backgroundColorHover;
            } else {
                this.options.buttons.shuffle = this.options.buttons.shuffle || {};
                this.options.buttons.shuffle.bgc = this.options.buttons.shuffle.bgc || this._defaultSettings.buttonShuffle.backgroundColor;
                this.options.buttons.shuffle.bgch = this.options.buttons.shuffle.bgch || this._defaultSettings.buttonShuffle.backgroundColorHover;
                this.options.buttons.shuffle.bgca = this.options.buttons.shuffle.bgca || this._defaultSettings.buttonShuffle.backgroundColorActive;
                this.options.buttons.next = this.options.buttons.next || {};
                this.options.buttons.next.bgc = this.options.buttons.next.bgc || this._defaultSettings.buttonNext.backgroundColor;
                this.options.buttons.next.bgch = this.options.buttons.next.bgch || this._defaultSettings.buttonNext.backgroundColorHover;
                this.options.buttons.prev = this.options.buttons.prev || {};
                this.options.buttons.prev.bgc = this.options.buttons.prev.bgc || this._defaultSettings.buttonPrev.backgroundColor;
                this.options.buttons.prev.bgch = this.options.buttons.prev.bgch || this._defaultSettings.buttonPrev.backgroundColorHover;
                this.options.buttons.play = this.options.buttons.play || {};
                this.options.buttons.play.bgc = this.options.buttons.play.bgc || this._defaultSettings.buttonPlay.backgroundColor;
                this.options.buttons.play.bgch = this.options.buttons.play.bgch || this._defaultSettings.buttonPlay.backgroundColorHover;
            }

            if (this.options.headers === undefined) {
                this.options.headers = {};
                this.options.headers.author = {};
                this.options.headers.song = {};
                this.options.headers.song.colorText = this._defaultSettings.nameGroupArtist.colorText;
                this.options.headers.song.bgc = this._defaultSettings.nameGroupArtist.backgroundColor;

                this.options.headers.author.colorText = this._defaultSettings.nameGroupArtist.colorText;
                this.options.headers.author.bgc = this._defaultSettings.nameGroupArtist.backgroundColor;
            } else {
                this.options.headers.author = this.options.headers.author || {};
                this.options.headers.song = this.options.headers.song || {};

                this.options.headers.song.colorText = this.options.headers.song.colorText || this._defaultSettings.nameGroupArtist.colorText;
                this.options.headers.song.bgc = this.options.headers.song.bgc || this._defaultSettings.nameGroupArtist.backgroundColor;

                this.options.headers.author.colorText = this.options.headers.author.colorText || this._defaultSettings.nameGroupArtist.colorText;
                this.options.headers.author.bgc = this.options.headers.author.bgc || this._defaultSettings.nameGroupArtist.backgroundColor;
            }

            this.options.width = this.options.width || this._defaultSettings.widthPlayer;
            this.options.heightPlaylist = this.options.heightPlaylist || this._defaultSettings.heightPlaylist;

            if (this.options.opacity == undefined) this.options.opacity = this._defaultSettings.volumeOpacity;


            this.options.bgc = this.options.bgc || this._defaultSettings.backgroundColor;
            this.options.position = this.options.position || this._defaultSettings.positionPlayer;

            this.options.bgColorOverBg = this.options.bgColorOverBg || this._defaultSettings.backgroundColorOver;

            this.model.on("updateCurrentAudioTrackId", id => {
                this.setAudioTrack();
                this.setBgImage();
                this.setTitles();
                let playPromise = this.audio.play();

                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                            // Automatic playback started!
                            // Show playing UI.
                        })
                        .catch(error => {
                            // Auto-play was prevented
                            // Show paused UI.
                        });
                }

                if (this.options.playlist && this.options.playlist.visible) {
                    if (this.model.typeEvent == FdkPlayerPropertis.TYPE_PROCESS.EVENT_NEXT ||
                        this.model.typeEvent == FdkPlayerPropertis.TYPE_PROCESS.EVENT_PREV) {
                        // РЈРїСЂР°РІР»СЏС‚СЊ РїР»РµР№Р»РёСЃС‚РѕРј
                        this.setCurrentTrackInPlaylist();
                    }
                    // Р’С‹РґРµР»РёС‚СЊ РЅРѕРІС‹Р№ РїСѓРЅРєС‚ СЃРїРёСЃРєР°
                    this.setHoverEffectCurrentTrackInPlaylist();
                }
            });
            this.model.on("updatePlayState", state => {
                this.playAudio();
            });
            /**
             * РЎСЂР°Р±Р°С‚С‹РІР°РµС‚ РєРѕРіРґР° РїСЂРѕРёСЃС…РѕРґРёС‚ Р·Р°РїСѓСЃРє РїСЂРѕРёРіСЂС‹РІР°РЅРёСЏ
             */
            this.audio.addEventListener("play", (e) => {
                this.playAudio();
            });
            /**
             * РџСЂРѕРёСЃС…РѕРґРёС‚ РєРѕРіРґР° РґР°РЅРЅС‹Рµ РЅРµ Р±С‹Р»Рё РїРѕР»РЅРѕСЃС‚СЊСЋ Р·Р°РіСЂСѓР¶РµРЅС‹ РЅРѕ РЅРµ РїРѕ РѕС€РёР±РєРµ 
             */
            this.audio.addEventListener("abort", (e) => {
                // 
                 
            });
            /**
             * Р‘СЂР°СѓР·РµСЂ РіРѕС‚РѕРІ Р·Р°РїСѓСЃС‚РёС‚СЊ РїСЂРѕРёРіСЂС‹РІР°РЅРёРµ РЅРѕ РґР°РЅРЅС‹С… РЅРµ РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РґР»СЏ С‚РѕРіРѕ С‡С‚РѕР±С‹ РІРѕСЃРїСЂРѕРёР·РІРµСЃС‚Рё РІРµСЃСЊ РЅР°Р±РѕСЂ РґР°РЅРЅС‹Рµ Р±РµР· Р±СѓС„РµСЂРёР·Р°С†РёРё
             */
            this.audio.addEventListener("canplay", (e) => {
                // 
                 
                if (this.options.autoplay) {
                    this.options.autoplay = false;
                    this.elements.buttonPlay.click();
                }

            });
            /**
             * Р‘СЂР°СѓР·РµСЂ РіРѕС‚РѕРІ Р·Р°РїСѓСЃС‚РёС‚СЊ РїСЂРѕРёРіСЂС‹РІР°РЅРёРµ Рё РґР°РЅРЅС‹Рµ РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РґР»СЏ РїРѕР»РЅРѕРіРѕ РїСЂРѕРёРіСЂС‹РІР°РЅРёСЏ РЅР°Р±РѕСЂР° РґР°РЅРЅС‹С…
             */
            this.audio.addEventListener("canplaythrough", (e) => {
                // 
                 
            });
            /**
             * РђС‚СЂРёР±СѓС‚ РґР»РёС‚РµР»СЊРЅРѕСЃС‚Рё РѕР±РЅРѕРІР»РµРЅ
             */
            this.audio.addEventListener("durationchange", (e) => {
                // 
                 
            });
            this.audio.addEventListener("emptied", (e) => {
                // 
                 
            });
            this.audio.addEventListener("ended", (e) => {
                if (this.model.getAudioTracks().length == this.model.currentAudioTrackId + 1) {
                    if (!this.modeShuffle) {
                        if (this.options.playlist.loop) {
                            this.emit("nextAudio", null);
                        }
                    } else {
                        this.emit("nextAudio", null);
                    }
                } else {
                    this.emit("nextAudio", null);
                }
                 
            });
            this.audio.addEventListener("error", (e) => {
                // 
                 
                 
            });
            this.audio.addEventListener("loadeddata", (e) => {
                // 
                 
            });
            this.audio.addEventListener("loadedmetadata", (e) => {

                 
                 
                this.progressbarTime.maxRange = Math.floor(e.target.duration);
                // 
            });
            /**
             * РЎСЂР°Р±Р°С‚С‹РІР°РµС‚ РєРѕРіРґР° Р±СЂР°СѓР·РµСЂ РЅР°С‡РёРЅР°РµС‚ Р·Р°РіСЂСѓР¶Р°С‚СЊ РґР°РЅРЅС‹Рµ Р°СѓРґРёРѕС‚СЂРµРєР° 
             */
            this.audio.addEventListener("loadstart", (e) => {
                // 
                 
            });
            /**
             * РџР»РµРµСЂ РїРµСЂРµС…РѕРґРёС‚ РІ СЃРѕСЃС‚РѕСЏРЅРёРµ РїР°СѓР·С‹
             */
            this.audio.addEventListener("pause", (e) => {
                // 
                 
            });
            /**
             * 
             */
            this.audio.addEventListener("playing", (e) => {
                // 
                 
            });
            this.audio.addEventListener("progress", (e) => {
                // 
                 
            });
            this.audio.addEventListener("ratechange", (e) => {
                // 
                 
            });
            this.audio.addEventListener("seeked", (e) => {
                // 
                ////
                //audio.play();
            });
            this.audio.addEventListener("seeking", (e) => {

            });
            this.audio.addEventListener("stalled", (e) => {
                ////
                
            });
            this.audio.addEventListener("suspend", (e) => {
                // 
                 
            });
            /**
             * Р’С‹Р·С‹РІР°РµС‚СЃСЏ РєРѕРіРґР° РѕР±РЅРѕРІР»СЏРµС‚СЃСЏ С‚РµРєСѓС‰РµРµ СЃРѕСЃС‚РѕСЏРЅРёРµ СѓС‡Р°СЃС‚РєР° РїСЂРѕРёРіСЂС‹РІР°РЅРёСЏ Р°СѓРґРёРѕ
             */
            this.audio.addEventListener("timeupdate", (e) => {
                this.progressbarTime.currentOffset = this.audio.currentTime;
            });
            this.audio.addEventListener("volumechange", (e) => {
                // 
                 
            });
            this.audio.addEventListener("waiting", (e) => {
                // 
                 
            });

            if (options.modeCodeButtons && options.modeCodeButtons == FdkPlayerPropertis.BUTTONS.UNICODE) {
                this.modeCodeButtons = FdkPlayerPropertis.BUTTONS.UNICODE;
            } else {
                this.loadFontAwesome();
                this.modeCodeButtons = FdkPlayerPropertis.BUTTONS.AWESOME;
            }

            // default unicode html-characters
            this.templateButtons = {
                shuffle: '&#x1f500;',
                prev: '&#x23EE;',
                next: '&#x23ed;',
                pause: '&#x23f8;',
                play: '&#x25b6;',
                sorton: '&#x2191;',
                sortoff: '&#x2193;'
            };
            // default unicode html-characters
            this.templateButtonsFontAwesome = {
                shuffle: '<i class="fa fa-random" aria-hidden="true"></i>',
                prev: '<i class="fa fa-step-backward" aria-hidden="true"></i>',
                next: '<i class="fa fa-step-forward" aria-hidden="true"></i>',
                pause: '<i class="fa fa-pause" aria-hidden="true"></i>',
                play: '<i class="fa fa-play" aria-hidden="true"></i>',
                sorton: '<i class="fa fa-sort-alpha-asc" aria-hidden="true"></i>',
                sortoff: '<i class="fa fa-sort-alpha-desc" aria-hidden="true"></i>'
            };

            // custom html-code
            if (this.options.templateHtmlCode && this.modeCodeButtons == FdkPlayerPropertis.BUTTONS.UNICODE) {
                this.templateButtons = {
                    shuffle: this.options.templateHtmlCodes.shuffle || this.templateButtons.shuffle,
                    prev: this.options.templateHtmlCodes.prev || this.templateButtons.prev,
                    next: this.options.templateHtmlCodes.next || this.templateButtons.next,
                    pause: this.options.templateHtmlCodes.pause || this.templateButtons.pause,
                    play: this.options.templateHtmlCodes.play || this.templateButtons.play,
                    sorton: this.options.templateHtmlCodes.sorton || this.templateButtons.sorton,
                    sortoff: this.options.templateHtmlCodes.sortoff || this.templateButtons.sortoff,
                };
            }

            // css every node
            this.nameCssElements = {
                "root": {
                    "value": "fdk-audio-player",
                    "params": []
                },
                "main": {
                    "value": "fdk-audio-player__main",
                    "params": []
                },
                "content": {
                    "value": "fdk-audio-player__content",
                    "params": []
                },
                "overbg": {
                    "value": "fdk-audio-player__overbg",
                    "params": []
                },
                "inline": {
                    "value": "fdk-audio-player__inline",
                    "data-api-uid": {
                        "1": ["fdk-audio-player__inline_theme_pos-1"],
                        "2": ["fdk-audio-player__inline_theme_pos-2"],
                        "3": ["fdk-audio-player__inline_theme_pos-3"],
                        "4": ["fdk-audio-player__inline_off"]
                    }
                },
                "buttons": {
                    "shuffle": {
                        "value": "fdk-audio-player__button-shuffle",
                        "params": []
                    },
                    "prev": {
                        "value": "fdk-audio-player__button-prev",
                        "params": ["fdk-audio-player__button-icon"]
                    },
                    "next": {
                        "value": "fdk-audio-player__button-next",
                        "params": ["fdk-audio-player__button-icon"]
                    },
                    "play": {
                        "value": "fdk-audio-player__button-play",
                        "params": ["fdk-audio-player__button-icon"]
                    }
                },
                "volume": {
                    "value": "fdk-audio-player__volume",
                    "params": []
                },
                "sound": {
                    "value": "fdk-progressbar-sound",
                    "params": []
                },
                "header": {
                    "sub": {
                        "value": "fdk-audio-player__sub-header",
                        "params": []
                    },
                    "main": {
                        "value": "fdk-audio-player__header",
                        "params": ["marquee-content"]
                    }
                },
                "progressbar": {
                    "value": "fdk-progressbar",
                    "params": []
                },
                "playlist": {
                    "value": "fdk-audio-player__playlist",
                    "params": []
                },
                "scrollbar": {
                    "value": "virtual-scrollbar",
                    "params": ["virtual-scrollbar_theme-mode_params-1"]
                }
            };

            this.createDomHtml();

            this.elements.buttonShuffle = this.elements.player.querySelector(`.${this.nameCssElements.buttons.shuffle.value}`);
            this.elements.buttonPlay = this.elements.player.querySelector(`.${this.nameCssElements.buttons.play.value}`);
            this.elements.buttonPrev = this.elements.player.querySelector(`.${this.nameCssElements.buttons.prev.value}`);
            this.elements.buttonNext = this.elements.player.querySelector(`.${this.nameCssElements.buttons.next.value}`);
            this.elements.bgImage = this.elements.player.querySelector(`.${this.nameCssElements.main.value}`);
            this.elements.title = this.elements.player.querySelector(`.${this.nameCssElements.header.main.value}`);
            this.elements.titleSub = this.elements.player.querySelector(`.${this.nameCssElements.header.sub.value}`);
            this.elements.overbg = this.elements.player.querySelector(`.${this.nameCssElements.overbg.value}`);

            this.elements.title.style.color = this.options.headers.author.colorText;
            this.elements.title.style.backgroundColor = this.options.headers.author.bgc;
            this.elements.titleSub.style.color = this.options.headers.song.colorText;
            this.elements.titleSub.style.backgroundColor = this.options.headers.song.bgc;

            this.elements.player.style.width = `${this.options.width}px`;
            //this.elements.player.style.opacity = `${this.options.opacity/100}`;
            this.elements.player.style.backgroundColor = `${this.options.bgc}`;
            this.elements.overbg.style.backgroundColor = this.options.bgColorOverBg;

            this.defaultCss();
            this.setBgImage();
            this.setTitles();

            this.elements.buttonShuffle.style.color = this.options.buttons.shuffle.bgc;
            this.elements.buttonShuffle.addEventListener("click", e => {
                this.modeShuffle = this.modeShuffle ? false : true;
                if (this.modeShuffle) {
                    this.elements.buttonShuffle.style.color = this.options.buttons.shuffle.bgca;
                } else {
                    this.elements.buttonShuffle.style.color = this.options.buttons.shuffle.bgc;
                }
            });
            this.elements.buttonShuffle.addEventListener("mouseover", e => {
                if (!this.modeShuffle)
                    this.elements.buttonShuffle.style.color = this.options.buttons.shuffle.bgch;
            });
            this.elements.buttonShuffle.addEventListener("mouseout", e => {
                if (!this.modeShuffle)
                    this.elements.buttonShuffle.style.color = this.options.buttons.shuffle.bgc;
            });
            this.elements.buttonPlay.style.color = this.options.buttons.play.bgc;
            this.elements.buttonPlay.addEventListener("click", e => {
                if (this.audio.paused) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
                this.playAudio();
            });
            this.elements.buttonPlay.addEventListener("mouseover", e => {
                this.elements.buttonPlay.style.color = this.options.buttons.play.bgch;
            });
            this.elements.buttonPlay.addEventListener("mouseout", e => {
                this.elements.buttonPlay.style.color = this.options.buttons.play.bgc;
            });
            this.elements.buttonPrev.style.color = this.options.buttons.prev.bgc;
            this.elements.buttonPrev.addEventListener("click", e => {
                this.emit("prevAudio", null);
            });
            this.elements.buttonPrev.addEventListener("mouseover", e => {
                this.elements.buttonPrev.style.color = this.options.buttons.prev.bgch;
            });
            this.elements.buttonPrev.addEventListener("mouseout", e => {
                this.elements.buttonPrev.style.color = this.options.buttons.prev.bgc;
            });
            this.elements.buttonNext.style.color = this.options.buttons.next.bgc;
            this.elements.buttonNext.addEventListener("click", e => {
                this.emit("nextAudio", null);
            });
            this.elements.buttonNext.addEventListener("mouseover", e => {
                this.elements.buttonNext.style.color = this.options.buttons.next.bgch;
            });
            this.elements.buttonNext.addEventListener("mouseout", e => {
                this.elements.buttonNext.style.color = this.options.buttons.next.bgc;
            });


            this.options.trackbars = this.options.trackbars || {};
            this.options.trackbars.volume = this.options.trackbars.volume || {};
            this.options.trackbars.song = this.options.trackbars.song || {};
            this.progressbarTime = (new FdkProgressbarScaleTime({
                rootNode: this.elements.player.querySelector(`.${this.nameCssElements.progressbar.value}`),
                startOffset: 0,
                range: {
                    min: 0,
                    max: 0,
                    step: 1
                },
                callbacks: {
                    move: (e) => {},
                    click: (e) => {
                        this.audio.currentTime = e.data;
                    },
                    moveManual: (e) => {
                        this.audio.currentTime = e.data;
                    }
                },
                notice: true,
                noticeSymbol: " ",
                mainPadding: "10px 1px",

                heightVolumeLine: this.options.trackbars.song.height,
                heightVolumeCircle: this.options.trackbars.song.circleSize,
                lineBgColorVolume: this.options.trackbars.song.bgc,
                lineFgColor: this.options.trackbars.song.fgc,
                circleColor: this.options.trackbars.song.circleColor,
                lineWidth: `${(this.options.width - 40)}`, //this.options.trackbars.song.width,
                bgColorNotice: this.options.trackbars.song.bgcInfoPopUp,
                textColorNotice: this.options.trackbars.song.textColor,

            }));

            // manage volume sound 
            this.progressbarSound = new FdkProgressbarSound({
                rootNode: this.elements.player.querySelector(`.${this.nameCssElements.sound.value}`)
            }, {
                templateHtmlCodes: {
                    up: '<i class="fa fa-volume-up" aria-hidden="true"></i>',
                    down: '<i class="fa fa-volume-down" aria-hidden="true"></i>',
                    off: '<i class="fa fa-volume-off" aria-hidden="true"></i>'
                },
                pbVolume: {
                    heightVolumeLine: this.options.trackbars.volume.height,
                    heightVolumeCircle: this.options.trackbars.volume.circleSize,
                    lineBgColorVolume: this.options.trackbars.volume.bgc,
                    lineFgColor: this.options.trackbars.volume.fgc,
                    circleColor: this.options.trackbars.volume.circleColor,
                    lineWidth: this.options.trackbars.volume.width,
                    bgColorNotice: this.options.trackbars.volume.bgcInfoPopUp,
                    textColorNotice: this.options.trackbars.volume.textColor,
                    sizeLogoVolume: 18
                },
                startOffset: 50
            });

            // scrolling for playlist
            if (this.options.playlist && this.options.playlist.visible) {

                if (!this.options.playlist.scrollbar) {
                    this.options.playlist.scrollbar = {}
                }

                this.createDomHtmlPlaylist();
                this.elements.virtualScrollbar = this.elements.player.querySelector(`.${this.nameCssElements.scrollbar.value}`);
                this.setPlaylist();

                //setTimeout(()=>{
                this.scrollbar = new FdkScrollBar({
                    scrollBar: this.elements.virtualScrollbar,
                    window: this.elements.window
                }, { scroll: { width: this.options.playlist.scrollbar.width, bgc: this.options.playlist.scrollbar.bgc }, height: this.options.heightPlaylist });

                this.elements.playlist = this.elements.player.querySelector(`.${this.nameCssElements.playlist.value}`);
                this.setHoverEffectCurrentTrackInPlaylist();

                this.elements.playlist.addEventListener("click", e => this.emit("modifyPlaylist", e));
                this.elements.playlist.addEventListener("mouseover", e => {
                    let o = e.target.closest(".fdk-playlist__item");
                    if (!o) return;
                    // РїСЂРµРґС‹РґСѓС‰РёРµ РїРѕРјРµРЅСЏС‚СЊ РЅР° РїРѕ РґРµС„РѕР»С‚Сѓ
                    let objs = this.elements.playlist.querySelectorAll(".fdk-playlist__item");
                    objs.forEach((item) => {
                        item.style.backgroundColor = this.options.playlist.items.bgc;
                    });
                    // С‚РµРєСѓС‰РёР№ Р°РєС‚РёРІРЅС‹Р№
                    o.style.backgroundColor = this.options.playlist.items.bgch;
                    let elem = this.elements.playlist.querySelector(`.fdk-playlist__item[data-item-uid='${this.model.currentAudioTrackId}']`);
                    elem.style.backgroundColor = this.options.playlist.items.bgca;
                });
                this.elements.playlist.addEventListener("mouseout", e => {
                    let objs = this.elements.playlist.querySelectorAll(".fdk-playlist__item");
                    objs.forEach((item) => {
                        item.style.backgroundColor = this.options.playlist.items.bgc;
                    });
                    let elem = this.elements.playlist.querySelector(`.fdk-playlist__item[data-item-uid='${this.model.currentAudioTrackId}']`);
                    elem.style.backgroundColor = this.options.playlist.items.bgca;
                });

                /*try {
                    cssMainStyle.then(e => {
                        this.scrollbar.update();
                    });
                } catch (e) {}*/

                //}, 100);

            }

            this.progressbarSound.on("moveSound", e => {
                this.audio.volume = e.data / 100;
            });


            if (this.options.opacity < 100) {
                this.elements.player.style.opacity = `${this.options.opacity/100}`;
                this.elements.player.addEventListener("mouseover", e => {
                    this.elements.player.style.opacity = "1";
                });
                this.elements.player.addEventListener("mouseout", e => {
                    this.elements.player.style.opacity = `${this.options.opacity/100}`;
                });
            }

            switch (this.options.position) {
                case FdkPlayerPropertis.POSITION.LEFT_TOP:
                    this.elements.player.style.position = "fixed";
                    let pos = () => {
                        this.elements.player.style.left = `${0}px`;
                        this.elements.player.style.top = `${0}px`;
                    }
                    this.elements.window.addEventListener("resize", pos);
                    this.elements.window.addEventListener("scroll", pos);
                    pos();
                    this.elements.window.document.getElementsByTagName("body")[0].append(this.elements.player);
                    break;
                case FdkPlayerPropertis.POSITION.RIGHT_TOP:
                    this.elements.player.style.position = "fixed";
                    let pos1 = () => {
                        this.elements.player.style.left = `${this.elements.window.document.documentElement.clientWidth - this.elements.player.getBoundingClientRect().width}px`;
                        this.elements.player.style.top = `${0}px`;
                    }
                    this.elements.window.addEventListener("resize", pos1);
                    this.elements.window.addEventListener("scroll", pos1);
                    pos1();
                    this.elements.window.document.getElementsByTagName("body")[0].append(this.elements.player);
                    break;
                case FdkPlayerPropertis.POSITION.LEFT_BOTTOM:
                    this.elements.player.style.position = "fixed";
                    let pos2 = () => {
                        this.elements.player.style.left = `${0}px`;
                        this.elements.player.style.top = `${this.elements.window.document.documentElement.clientHeight - this.elements.player.getBoundingClientRect().height}px`;
                    }
                    this.elements.window.addEventListener("resize", pos2);
                    this.elements.window.addEventListener("scroll", pos2);
                    pos2();
                    this.elements.window.document.getElementsByTagName("body")[0].append(this.elements.player);
                    break;
                case FdkPlayerPropertis.POSITION.RIGHT_BOTTOM:
                    this.elements.player.style.position = "fixed";
                    let pos3 = () => {
                        this.elements.player.style.left = `${this.elements.window.document.documentElement.clientWidth - this.elements.player.getBoundingClientRect().width}px`;
                        this.elements.player.style.top = `${this.elements.window.document.documentElement.clientHeight - this.elements.player.getBoundingClientRect().height}px`;
                    }
                    this.elements.window.addEventListener("resize", pos3);
                    this.elements.window.addEventListener("scroll", pos3);
                    pos3();
                    this.elements.window.document.getElementsByTagName("body")[0].append(this.elements.player);
                    break;
            }

            // update data from model
            this.render();
        }
        createAudio() {
            const audio = window.document.createElement("audio");
            audio.preload = "metadata";
            audio.type = "audio/mp3";

            return audio;
        }
        removeAudio() {
            try {
                this.audio.pause();
                this.audio.remove();
            } catch (e) {}
        }
        render() {
            // update current audio

            // update state playlist in scrollbar or not
        }
        /**
         * РњРµС‚РѕРґ СЃРѕР·РґР°РµС‚ СѓР·РµР» РґР»СЏ Р·Р°РіСЂСѓР·РєРё С€СЂРёС„С‚РѕРІ Awesome
         */
        loadFontAwesome() {
            loadCss("https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css", e => {});
        }
        /**
         * РњРµС‚РѕРґ СЃРѕР·РґР°РµС‚ СЃС‚СЂСѓРєС‚СѓСЂСѓ РѕСЃРЅРѕРІРЅРѕР№ С‡Р°СЃС‚Рё РєРѕРјРїРѕРЅРµРЅС‚Р° РїР»РµРµСЂР°
         * @trhow Object:Error - РёСЃРєР»СЋС‡РµРЅРёРµ РґР»СЏ СЃРёС‚СѓР°С†РёРё, РєРѕРіРґР° РєРѕСЂРЅРµРІРѕР№ СѓР·РµР» РЅРµ РЅР°Р№РґРµРЅ
         */
        createDomHtml() {
            if (!this.elements.player) {
                throw Error("Root Node not founded: [Method->createDomHtml]");
            }
            if (!this.elements.player.classList.contains(this.nameCssElements.root.value)) {
                this.elements.player.classList.add(this.nameCssElements.root);
            }
            this.elements.player.innerHTML = "";
            this.elements.player.insertAdjacentHTML("beforeEnd", `
      <div class="${this.nameCssElements.main.value + " " + this.getParamsCssInNode(this.nameCssElements.main.params)}">
        <div class="${this.nameCssElements.overbg.value + "" + this.getParamsCssInNode(this.nameCssElements.overbg.params)}"></div>
        <div class="${this.nameCssElements.content.value + " " + this.getParamsCssInNode(this.nameCssElements.content.params)}">
          <div class="${this.nameCssElements.inline.value + " " + this.getParamsCssInNode(this.nameCssElements.inline["data-api-uid"]["1"])}" data-api-uid="1">
          <div class="${this.nameCssElements.buttons.shuffle.value + " " + this.getParamsCssInNode(this.nameCssElements.buttons.shuffle.params)}">
          </div>
          <div class="${this.nameCssElements.volume.value + " " + this.getParamsCssInNode(this.nameCssElements.volume.params)}">
            <div class="${this.nameCssElements.sound.value + " " + this.getParamsCssInNode(this.nameCssElements.sound.params)}" data-fdk-progressbar-sound-uid="1"></div>
          </div>
          </div>
          <div class="${this.nameCssElements.inline.value + " " + this.getParamsCssInNode(this.nameCssElements.inline["data-api-uid"]["2"])}" data-api-uid="2">
          <span class="${this.nameCssElements.header.sub.value + " " + this.getParamsCssInNode(this.nameCssElements.header.sub.params)}">

          </span>
          <span class="${this.nameCssElements.header.main.value + " " + this.getParamsCssInNode(this.nameCssElements.header.main.params)}">

          </span>
          </div>
          <div class="${this.nameCssElements.inline.value + " " + this.getParamsCssInNode(this.nameCssElements.inline["data-api-uid"]["3"])}" data-api-uid="3">
          <div class="${this.nameCssElements.progressbar.value + " " + this.getParamsCssInNode(this.nameCssElements.progressbar.params)}"></div>
          <div class="${this.nameCssElements.inline.value + " " + this.getParamsCssInNode(this.nameCssElements.inline["data-api-uid"]["1"])}">
            <div class="${this.nameCssElements.buttons.prev.value + " " + this.getParamsCssInNode(this.nameCssElements.buttons.prev.params)}">
            </div>
            <div class="${this.nameCssElements.buttons.play.value + " " + this.getParamsCssInNode(this.nameCssElements.buttons.play.params)}">
            </div>
            <div class="${this.nameCssElements.buttons.next.value + " " + this.getParamsCssInNode(this.nameCssElements.buttons.next.params)}">
            </div>
          </div>
          </div>
        </div>
        </div>`);
        }
        /**
         * РњРµС‚РѕРґ СЃРѕР·РґР°РµС‚ СЃС‚СЂСѓРєС‚СѓСЂСѓ С‡Р°СЃС‚Рё РїР»РµР№Р»РёСЃС‚Р° РїР»РµРµСЂР°
         * @trhow Object:Error - РёСЃРєР»СЋС‡РµРЅРёРµ РґР»СЏ СЃРёС‚СѓР°С†РёРё, РєРѕРіРґР° РєРѕСЂРЅРµРІРѕР№ СѓР·РµР» РЅРµ РЅР°Р№РґРµРЅ
         */
        createDomHtmlPlaylist() {
            if (!this.elements.player) {
                throw Error("Root Node not founded: [Method->createDomHtml]");
            }
            this.elements.player.insertAdjacentHTML("beforeEnd", `
      <div class="${this.nameCssElements.playlist.value +" "+ this.getParamsCssInNode(this.nameCssElements.playlist.params)}">
      <div class="${this.nameCssElements.inline.value}">
        <div class="${this.nameCssElements.scrollbar.value +" "+ this.getParamsCssInNode(this.nameCssElements.scrollbar.params)}"></div>
      </div>
      <div class="${this.nameCssElements.inline.value +" "+ this.getParamsCssInNode(this.nameCssElements.inline["data-api-uid"]["4"])}" data-api-uid="4">
        <div><input type="text" placeholder="filter"> <i class="fdk-audio-player__button-icon"></i></div>
        <i class="fdk-audio-player__button-icon"></i>
      </div>
      </div>`);
        }
        /**
         * РњРµС‚РѕРґ РІРѕР·РІСЂР°С‰Р°РµС‚ СЃС‚СЂРѕРєСѓ РёР· СЃС„РѕСЂРјРёСЂРѕРІР°РЅРЅС‹С… Р·РЅР°С‡РµРЅРёР№ СЃРІРѕР№СЃС‚РІ CSS
         * @param obj:Array - РјР°СЃСЃРёРІ РѕС‚РґРµР»СЊРЅС‹С… СЃРІРѕР№СЃС‚РІ
         * @return String
         */
        getParamsCssInNode(obj) {
            let str = [];
            obj.forEach((item) => {
                str.push(item);
            });
            return str.join(" ");
        }
        /**
         * РњРµС‚РѕРґ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ Р·РЅР°С‡РµРЅРёРµ РѕР±СЉРµРєС‚РѕРІ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РёР»Рё РЅР°СЃС‚СЂРѕР№РєРё РїРµСЂРµРґР°РЅРЅС‹Рµ РёР· РІРЅРµ, Р° С‚Р°Рє Р¶Рµ СЃРІРѕР№СЃС‚РІР° С‚Р°Р±Р»РёС† СЃС‚РёР»РµР№ 
         */
        defaultCss() {
            const mode = this.getModeButtons();

            this.elements.buttonShuffle.innerHTML = mode.shuffle;
            this.elements.buttonPlay.innerHTML = mode.play;
            this.elements.buttonPrev.innerHTML = mode.prev;
            this.elements.buttonNext.innerHTML = mode.next;
        }
        /**
         * РњРµС‚РѕРґ РІРѕР·РІСЂР°С‰Р°РµС‚ СЃСЃС‹Р»РєСѓ РЅР° С€Р°Р±Р»РѕРЅ СЃРѕРґРµСЂР¶Р°С‰РёР№ РІР°СЂРёР°РЅС‚ РєРЅРѕРїРѕРє 
         * @return Object - С€Р°Р±Р»РѕРЅ СЃ html-РєРѕРґРѕРј РёР»Рё html-РєРѕРґР°РјРё СЃРёРјРІРѕР»РѕРІ 
         */
        getModeButtons() {
            if (this.modeCodeButtons == FdkPlayerPropertis.BUTTONS.AWESOME)
                return this.templateButtonsFontAwesome;
            else
                return this.templateButtons;
        }
        /**
         * РњРµС‚РѕРґ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ СЃСЃС‹Р»РєСѓ РЅР° Р°СѓРґРёРѕ РІ РѕР±СЉРµРєС‚Рµ DOM Audio API
         */
        setAudioTrack() {
            this.audio.src = this.model.getAudioTrack(this.model.currentAudioTrackId).fileAudio;
        }
        /**
         * РњРµС‚РѕРґ РІРєР»СЋС‡Р°РµС‚ РїСЂРѕРёРіСЂС‹РІР°РЅРёРµ РёР»Рё СЃС‚Р°РІРёС‚ РЅР° РїР°СѓР·Сѓ Р°СѓРґРёРѕС‚СЂРµРє, Р° С‚Р°Рє Р¶Рµ РјРµРЅСЏРµС‚ СЃРѕСЃС‚РѕСЏРЅРёРµ РєРЅРѕРїРєРё РџРђРЈР—Рђ/РџР›Р•Р™
         */
        playAudio() {
            const mode = this.getModeButtons();
            if (this.audio.paused) {
                this.elements.buttonPlay.innerHTML = mode.play;
            } else {
                this.elements.buttonPlay.innerHTML = mode.pause;
            }
        }
        /**
         * РњРµС‚РѕРґ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ РёР·РѕР±СЂР°Р¶РµРЅРёРµ С‚СЂРµРєР°
         */
        setBgImage() {
            this.elements.bgImage.style.backgroundImage = `url(${this.model.getAudioTrack(this.model.currentAudioTrackId).fileImage})`;
        }
        /**
         * РњРµС‚РѕРґ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ Р·Р°РіРѕР»РѕРІРєРё
         */
        setTitles() {
            this.elements.titleSub.innerHTML = this.model.getAudioTrack(this.model.currentAudioTrackId).title;
            this.elements.title.innerHTML = this.model.getAudioTrack(this.model.currentAudioTrackId).titleSub;
        }
        /**
         * РњРµС‚РѕРґ С„РѕСЂРјРёСЂСѓРµС‚ РїР»РµР№Р»РёСЃС‚ Рё РґРѕР±Р°РІР»СЏРµС‚ РµРіРѕ РІ РїР»РµРµСЂ
         */
        setPlaylist() {
            let content = this.elements.virtualScrollbar;
            let playlist = "";
            playlist += `
        <div class="fdk-playlist">`;
            this.model.getAudioTracks().forEach((value, index) => {
                playlist += `
          <div class="fdk-playlist__item" style="background-color:${this.options.playlist.items.bgc};" data-item-uid="${index}">
          <img src="${value.fileImage}" alt="" class="fdk-playlist__image">
          <span class="fdk-playlist__text">${value.title} - ${value.titleSub}</span>
          </div>`;
            });
            playlist += `</div>`;
            content.insertAdjacentHTML("beforeEnd", playlist);
        }

        __setPlaylist() {
            let content = this.elements.virtualScrollbar;
            let divPl = this.elements.window.document.createElement("div");
            divPl.classList.add("fdk-playlist");

            this.model.getAudioTracks().forEach((value, index) => {
                let div = this.elements.window.document.createElement("div");
                div.classList.add("fdk-playlist__item");
                div.setAttribute("style", `background-color:${this.options.playlist.items.bgc}`);
                div.dataset.itemUid = `${index}`;

                let img = this.elements.window.document.createElement("img");
                img.classList.add("fdk-playlist__image");
                img.src = `${value.fileImage}`;
                let span = this.elements.window.document.createElement("span");
                span.classList.add("fdk-playlist__text");
                span.innerHTML = `${value.title} - ${value.titleSub}`;

                div.append(img);
                div.append(span);

                divPl.append(div);
            });
            content.append(divPl);
        }
        /**
         * РњРµС‚РѕРґ СѓСЃС‚Р°РЅРѕРІРєРё С‚РµРєСѓС‰РµРіРѕ СЌР»РµРјРµРЅС‚Р° РІ РїР»РµР№Р»РёСЃС‚Рµ
         */
        setCurrentTrackInPlaylist() {
            let playlistOffsetTop = this.elements.player.querySelector(`.${this.nameCssElements.playlist.value}`).getBoundingClientRect().top;
            let itemInPlaylistOffsetTop = this.elements.virtualScrollbar.querySelector(`.virtual-scrollbar__content .fdk-playlist .fdk-playlist__item[data-item-uid='${this.model.currentAudioTrackId}']`).getBoundingClientRect().top;
            let distance = playlistOffsetTop - itemInPlaylistOffsetTop;
            if (distance < 0) {
                this.scrollbar.directionVerticalDown(Math.abs(distance));
            } else {
                this.scrollbar.directionVerticalUp(Math.abs(distance));
            }
        }
        setHoverEffectCurrentTrackInPlaylist() {
            // РїСЂРµРґС‹РґСѓС‰РёРµ РїРѕРјРµРЅСЏС‚СЊ РЅР° РїРѕ РґРµС„РѕР»С‚Сѓ
            let objs = this.elements.playlist.querySelectorAll(".fdk-playlist__item");
            objs.forEach((item) => {
                item.style.backgroundColor = this.options.playlist.items.bgc;
            });
            let elem = this.elements.playlist.querySelector(`.fdk-playlist__item[data-item-uid='${this.model.currentAudioTrackId}']`);
            elem.style.backgroundColor = this.options.playlist.items.bgca;
        }
    }
    class FdkPlayerController {
        constructor(view, model) {

            this.view = view;
            this.model = model;

            this.view.on("prevAudio", e => {
                const min = 0,
                    max = this.model.getAudioTracks().length - 1;
                let current = this.model.currentAudioTrackId;
                if (this.view.modeShuffle) {
                    current = FdkPlayerPropertis.MATH.RANDOMWITHOUT(min, max, [current]);
                } else {
                    current--;
                    if (current < min) {
                        current = max;
                    }
                }
                this.model.typeEvent = FdkPlayerPropertis.TYPE_PROCESS.EVENT_PREV;
                this.model.currentAudioTrackId = current;
            });
            this.view.on("nextAudio", e => {
                const min = 0,
                    max = this.model.getAudioTracks().length - 1;
                let current = this.model.currentAudioTrackId;
                if (this.view.modeShuffle) {
                    current = FdkPlayerPropertis.MATH.RANDOMWITHOUT(min, max, [current]);
                } else {
                    current++;
                    if (current > max) {
                        current = min;
                    }
                }
                this.model.typeEvent = FdkPlayerPropertis.TYPE_PROCESS.EVENT_NEXT;
                this.model.currentAudioTrackId = current;
            });
            this.view.on("modifyPlaylist", e => {
                let item = e.target.closest(".fdk-playlist__item");
                if (item) {
                    this.model.typeEvent = FdkPlayerPropertis.TYPE_PROCESS.EVENT_PLAYLIST;
                    this.model.currentAudioTrackId = +item.dataset.itemUid;
                }
            });

        }
    }
    class FdkPlayerJs extends EventEmitter {
        constructor(elements, options) {
            super();
                try {
                    cssMainStyleTemp.then(e => {
                        
                        this.pm = new FdkPlayerModel(options.audioTracks);
                        this.pv = new FdkPlayerView({
                            player: elements.player,
                            window: window
                        }, this.pm, {
                            templateHtmlCodes: options.templateHtmlCodes,
                            modeCodeButtons: options.modeCodeButtons,
                            autoplay: options.autoplay,
                            width: options.width,
                            opacity: options.opacity,
                            bgColorOverBg: options.bgColorOverBg,
                            bgc: options.bgc,
                            position: options.position,
                            playlist: options.playlist,
                            buttons: options.buttons,
                            headers: options.headers,
                            trackbars: options.trackbars,
                            heightPlaylist: options.heightPlaylist
                        });
                        this.pc = new FdkPlayerController(this.pv, this.pm);

                    });

                } catch (e) {  }


        }
        removeAudio() {
            this.pv.removeAudio();
        }
    }

    window.FdkPlayerJs = FdkPlayerJs;
    window.FdkPlayerPropertis = FdkPlayerPropertis;
})(window);