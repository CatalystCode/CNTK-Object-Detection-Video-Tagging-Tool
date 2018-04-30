(function(glob){
    // TODO Wrap internals into a new object to avoid exposing everything externally

    var AreaSelector = {
        baseParent: null,
        paper: null,
        paperWidth: 0,
        paperHeight: 0,

        overlay: null,
        mask: null,        
        selectionBox: null,
        overlayMask: null,

        crossA: null,
        crossB: null,
        capturingState: false,

        onSelectionBeginCallback: null,
        onSelectionEndCallback: null,

        isEnabled: true,
        squareMode: false,
        twoPointsMode: false,

        init: function(svgZone, onSelectionBegin, onSelectionEnd) {
            this.baseParent = svgZone;
            this.paper = Snap(svgZone);
            this.paperWidth = svgZone.width.baseVal.value;
            this.paperHeight = svgZone.height.baseVal.value;

            this.overlay = this.createOverlay();

            this.mask = this.createMask();
            this.selectionBox = this.createSelectionBox();
            this.overlayMask = this.paper.g();
            this.overlayMask.mask = this.mask;
            this.overlayMask.add(this.mask, this.selectionBox);
            this.overlay.attr({
                mask: this.overlayMask
            });

            this.crossA = this.createCross();
            this.crossB = this.createCross();
            this.subscribeToMouseEvents();

            this.onSelectionEndCallback = onSelectionEnd;
            this.onSelectionBeginCallback = onSelectionBegin;
            return this;
        },

        resize: function(width, height) {
            if (width !== undefined && height !== undefined) {
                this.paperWidth = width;
                this.paperHeight = height;
                this.baseParent.style.width = width;
                this.baseParent.style.height = height;
            } else {
                this.paperWidth = this.baseParent.width.baseVal.value;
                this.paperHeight = this.baseParent.height.baseVal.value;
            }

            this.overlay.attr({
                width: this.paperWidth,
                height: this.paperHeight
            });

            this.mask.attr({
                width: this.paperWidth,
                height: this.paperHeight
            });
        },

        createOverlay: function() {
            var rect = this.paper.rect(0, 0, this.paperWidth, this.paperHeight);
            rect.attr({
                fill: '#000',
                "fill-opacity": 0.5,
                strokeWidth: 0,
                visibility: 'hidden'   
            });

            return rect;
        },

        createMask: function() {
            var rect = this.paper.rect(0, 0, this.paperWidth, this.paperHeight);
            rect.attr({
                fill: '#fff',
                strokeWidth: 0,
                visibility: 'visible'   
            });

            return rect;
        },

        createSelectionBox: function() {
            var rect = this.paper.rect(0, 0, 0, 0);
            rect.attr({
                fill: '#000',
                strokeWidth: 0,
                visibility: 'visible' 
            });
            return rect;
        },

        createCross: function() {
            var verticalLine = this.paper.line(0, 0, 0, this.paperHeight);
            // TODO: Move default line styles to CSS
            verticalLine.attr({
                strokeWidth:1,
                strokeDasharray: '5 5',
                stroke: "#666"
            })
            var horizontalLine = this.paper.line(0, 0, this.paperWidth, 0);
            horizontalLine.attr({
                strokeWidth:1,
                strokeDasharray: '5 5',
                stroke: "#666"
            })

            var cross = this.paper.g();
            cross.add(verticalLine, horizontalLine);
            cross.vl = verticalLine;
            cross.hl = horizontalLine;

            cross.x = 0;
            cross.y = 0;

            cross.attr({
                visibility: 'hidden'
            });

            return cross;
        },

        subscribeToMouseEvents: function() {
            var self = this;
            this.baseParent.addEventListener("pointerenter", function(e){
                self.show(self.crossA);
            });
            this.baseParent.addEventListener("pointerleave", function(e){
                var rect = self.baseParent.getClientRects();
                var x = e.clientX - rect[0].left;
                var y = e.clientY - rect[0].top;

                if (!self.twoPointsMode && !self.capturingState) {
                    self.hide(self.crossA);
                    self.hide(self.crossB);
                    self.hide(self.selectionBox);
                } else if (self.twoPointsMode && self.capturingState) {
                    self.moveCross(self.crossB, x, y);
                    self.moveSelectionBox(self.selectionBox, self.crossA, self.crossB); 
                }
            });
            this.baseParent.addEventListener("pointerdown", function(e){
                var rect = self.baseParent.getClientRects();
                var x = e.clientX - rect[0].left;
                var y = e.clientY - rect[0].top;
                
                if (!self.twoPointsMode) {
                    self.baseParent.setPointerCapture(e.pointerId);
                    self.capturingState = true;
                    self.moveCross(self.crossB, self.crossA.x, self.crossA.y); 
                    self.moveSelectionBox(self.selectionBox, self.crossA, self.crossB); 
                    self.show(self.crossB);     
                    self.show(self.selectionBox);           
                    self.show(self.overlay);     
                    
                    if (typeof self.onSelectionBeginCallback === "function") {
                        self.onSelectionBeginCallback();
                    }
                } 
                else {

                }                 
            });
            this.baseParent.addEventListener("pointerup", function(e){
                var rect = self.baseParent.getClientRects();
                var x = e.clientX - rect[0].left;
                var y = e.clientY - rect[0].top;

                if (!self.twoPointsMode) { 
                    self.baseParent.releasePointerCapture(e.pointerId);
                    self.capturingState = false;

                    self.hide(self.crossB);
                    self.hide(self.overlay);                    
                    
                    if (typeof self.onSelectionEndCallback === "function") {
                        self.onSelectionEndCallback(self.crossA.x, self.crossA.y, self.crossB.x, self.crossB.y);
                    }
                } 
                else if (self.twoPointsMode && !self.capturingState) {
                    self.capturingState = true;
                    
                    self.moveCross(self.crossB, x, y); 
                    self.moveSelectionBox(self.selectionBox, self.crossA, self.crossB); 
                    self.show(self.crossA);  
                    self.show(self.crossB);                         
                    self.show(self.selectionBox);           
                    self.show(self.overlay);   

                    if (typeof self.onSelectionBeginCallback === "function") {
                        self.onSelectionBeginCallback();
                    }

                } else {
                    self.capturingState = false;

                    self.hide(self.crossB);
                    self.hide(self.overlay);   
                                        
                    if (typeof self.onSelectionEndCallback === "function") {
                        self.onSelectionEndCallback(self.crossA.x, self.crossA.y, self.crossB.x, self.crossB.y);
                    }
                    self.moveCross(self.crossA, x, y);
                    self.moveCross(self.crossB, x, y);
                }
            });
            this.baseParent.addEventListener("pointermove", function(e){
                var rect = self.baseParent.getClientRects();
                var x = e.clientX - rect[0].left;
                var y = e.clientY - rect[0].top;
                if (!self.twoPointsMode && !self.capturingState){
                    self.moveCross(self.crossA, x, y);
                }
                else if (!self.twoPointsMode && self.capturingState) {                    
                    self.moveCross(self.crossB, x, y, self.squareMode, self.crossA);                    
                    self.moveSelectionBox(self.selectionBox, self.crossA, self.crossB);
                } 
                else if (self.twoPointsMode && self.capturingState) {
                    self.moveCross(self.crossB, x, y, self.squareMode, self.crossA);                    
                    self.moveSelectionBox(self.selectionBox, self.crossA, self.crossB);
                } 
                else {                    
                    self.moveCross(self.crossA, x, y);
                    self.moveCross(self.crossB, x, y);
                }
            });
            window.addEventListener("keydown", function(e){
                if (e.shiftKey) {
                    self.squareMode = true; 
                } 
                if (e.ctrlKey && !self.capturingState) {
                    self.twoPointsMode = true;                    
                }
            });
            window.addEventListener("keyup", function(e){
                if (!e.shiftKey) {
                    self.squareMode = false;
                }
                if (!e.ctrlKey && self.twoPointsMode) {
                    self.twoPointsMode = false;   
                    self.capturingState = false;

                    self.moveCross(self.crossA, self.crossB.x, self.crossB.y);
                    self.hide(self.crossB);
                    self.hide(self.selectionBox);
                    self.hide(self.overlay);
                }
            });
        },

        unsubscribeFromMouseEvents: function() {

        },

        boundPointToRect: function(x, y) {
            var p = {x:0, y: 0};

            p.x = (x < 0) ? 0 : ((x > this.paperWidth) ? this.paperWidth : x);
            p.y = (y < 0) ? 0 : ((y > this.paperHeight) ? this.paperHeight : y);

            return p;
        },

        moveCross: function(cross, x, y, square, refCross) {
            var self = this;

            var p = this.boundPointToRect(x, y);

            if (square) {
                var dx = Math.abs(p.x - refCross.x);
                var vx = Math.sign(p.x - refCross.x);
                var dy = Math.abs(p.y - refCross.y);
                var vy = Math.sign(p.y - refCross.y);

                var d = Math.min(dx, dy);
                p.x = refCross.x + d * vx;
                p.y = refCross.y + d * vy;
            }

            cross.x = p.x;
            cross.y = p.y;   

            window.requestAnimationFrame(function(){
                // Move vertical line
                
                cross.vl.attr({
                        x1: p.x,
                        x2: p.x,
                        y2: self.paperHeight
                });

                // Move horizontal line
                cross.hl.attr({
                        y1: p.y,
                        x2: self.paperWidth,
                        y2: p.y
                })
            }) 
        
        },

        show: function(element) {
            window.requestAnimationFrame(function(){
                element.attr({
                    visibility: 'visible'
                });
            }) 
        },

        hide: function(element) {
            window.requestAnimationFrame(function(){
                element.attr({
                    visibility: 'hidden'
                });
            }) 
        },

        moveSelectionBox: function(box, crossA, crossB) {
            var x = (crossA.x < crossB.x) ? crossA.x : crossB.x;
            var y = (crossA.y < crossB.y) ? crossA.y : crossB.y;
            var w = Math.abs(crossA.x - crossB.x);
            var h = Math.abs(crossA.y - crossB.y);

            window.requestAnimationFrame(function(){
                box.attr({
                    x: x,
                    y: y,
                    width: w,
                    height: h
                });
            })             
        },

        enable: function() {
            this.isEnabled = true;
            this.baseParent.style.visibility = "visible";
        },

        disable: function() {
            this.isEnabled = false;
            this.baseParent.style.visibility = "hidden";
        }
    };

    glob.AreaSelector = AreaSelector;
})(window);