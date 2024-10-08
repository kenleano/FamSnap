/* eslint-disable */
var FlowChart = class {
  _;
  options;
  element;
  svgElement;
  shapeBar;
  colorBar;
  menuBar;
  statusBar;
  editor;
  nodes;
  labels;
  links;
  ports;
  selectedShapes;
  active;
  get useChangeListener() {
    return this._.useChangeListener;
  }
  set useChangeListener(t) {
    this._.useChangeListener = t;
  }
  get defs() {
    return this.svgElement.querySelector("defs").innerHTML;
  }
  set defs(t) {
    this.svgElement.querySelector("defs").innerHTML = t;
  }
  get mode() {
    return this.options.mode;
  }
  set mode(t) {
    (this.options.mode = t),
      this.element.classList.remove("bfc-dark"),
      this.element.classList.remove("bfc-light"),
      this.element.classList.add("bfc-" + this.options.mode);
  }
  get viewBox() {
    return this._.getViewBox();
  }
  set viewBox(t) {
    this._.snap(),
      this._.setViewBox(t),
      this._.changed({ property: "viewBox" });
  }
  get selectedPortShape() {
    return this._.selectedPortShape;
  }
  set selectedPortShape(t) {
    null == t
      ? ((this._.selectedPortShape = null),
        null != this.selectedPort && (this.selectedPort = null),
        this._.hidePortsUI())
      : t != this._.selectedPortShape &&
        ((this._.selectedPortShape = t), this._.showPortsUI());
  }
  get selectedPort() {
    return this._.selectedPort;
  }
  set selectedPort(t) {
    if (this._.selectedPort != t) {
      var e = { oldPort: this._.selectedPort, newPort: t };
      !1 !==
        FlowChart.events.publish("selected-port-change", [this._.chart, e]) &&
        (null == t
          ? ((this._.selectedPort = null), this._.hidePortShapeBarUI())
          : this._.selectedPort != t &&
            (this.selectedPortShape != t.shape &&
              (this.selectedPortShape = t.shape),
            (this._.selectedPort = t),
            this._.showPortShapeBar()));
    }
  }
  get scale() {
    return this._.getScale();
  }
  set scale(t) {
    if (this.scale != t) {
      t > this.options.scaleMax && (t = this.options.scaleMax),
        t < this.options.scaleMin && (t = this.options.scaleMin);
      var e = [50, 50],
        i = this.viewBox,
        r = this._.svgBCR.width,
        a = this._.svgBCR.height,
        o = r / i[2],
        s = a / i[3],
        h = o > s ? s : o,
        l = i,
        n = i[2],
        c = i[3];
      (i[2] = i[2] / (t / h)),
        (i[3] = i[3] / (t / h)),
        (i[0] = l[0] - (i[2] - n) / (100 / e[0])),
        (i[1] = l[1] - (i[3] - c) / (100 / e[1])),
        (this.viewBox = i);
    }
  }
  static MAGNET_MOVE_PIXELS = 10;
  static MAGNET_RESIZE_PIXELS = 7;
  static MAGNET_WIN_PIXELS = 10;
  static MAGNET_PORT = 20;
  static LINK_DITSNANCE = 20;
  static LINK_ROUNDED_CORENERS = 7;
  static MOVE_NODE_STEP = 3;
  static SCALE_FACTOR = 1.44;
  static DEFAULT_LINK_SHAPE_ID = "rounded";
  static DEFAULT_LABEL_SHAPE_ID = "label";
  static CHANGED_TIMEOUT = 700;
  static PADDING = 30;
  static SEPARATOR = ":";
  static PORTSEPARATOR = "~";
  static shortcuts = {
    open_up_port: {
      keysPressed: ["control", "!shift", "arrowup"],
      activeComponentType: "node|port-shape-bar|field",
      desc: "Open port above the shape",
    },
    open_down_port: {
      keysPressed: ["control", "!shift", "arrowdown"],
      activeComponentType: "node|port-shape-bar|field",
      desc: "Open port below the shape",
    },
    open_left_port: {
      keysPressed: ["control", "!shift", "arrowleft"],
      activeComponentType: "node|port-shape-bar|field",
      desc: "Open left port",
    },
    open_right_port: {
      keysPressed: ["control", "!shift", "arrowright"],
      activeComponentType: "node|port-shape-bar|field",
      desc: "Open right port",
    },
    navigate_port_down: {
      keysPressed: ["!control", "!shift", "arrowdown"],
      activeComponentType: "port-shape-bar",
      desc: "Select shape from the opened port shape bar",
    },
    navigate_port_left: {
      keysPressed: ["!control", "!shift", "arrowleft"],
      activeComponentType: "port-shape-bar",
      desc: "Select shape from the opened port shape bar",
    },
    navigate_port_right: {
      keysPressed: ["!control", "!shift", "arrowright"],
      activeComponentType: "port-shape-bar",
      desc: "Select shape from the opened port shape bar",
    },
    navigate_port_up: {
      keysPressed: ["!control", "!shift", "arrowup"],
      activeComponentType: "port-shape-bar",
      desc: "Select shape from the opened port shape bar",
    },
    undo: { keysPressed: ["control", "keyz"], desc: "Undo" },
    redo: { keysPressed: ["control", "keyy"], desc: "Redo" },
    select_all_nodes: {
      keysPressed: ["control", "keya"],
      desc: "Selectd all nodes",
    },
    select_multiple_nodes: {
      keysPressed: ["shift"],
      desc: "Selectd multiple nodes or shapes",
    },
    resize_node: { mouseActions: ["resize-shape"], desc: "Resize shape" },
    centered_resize_shape: {
      keysPressed: ["control"],
      mouseActions: ["resize-shape"],
      desc: "Centered resize",
    },
    maintain_aspect_ratio_resize_shape: {
      keysPressed: ["shift"],
      mouseActions: ["resize-shape"],
      activeComponentType: "shape",
      desc: "Resize and maintain proportions",
    },
    remove_selected_shapes: {
      keysPressed: ["delete|backspace"],
      activeComponentType: "shape",
      desc: "Remove selected shapes",
    },
    zoom: {
      keysPressed: ["control"],
      mouseActions: ["wheel"],
      desc: "Zoom In/Out",
    },
    move_selected_nodes_left: {
      keysPressed: ["arrowleft", "control", "shift"],
      desc: "Move selected nodes with arrow keys",
    },
    move_selected_nodes_right: {
      keysPressed: ["arrowright", "control", "shift"],
      desc: "Move selected nodes with arrow keys",
    },
    move_selected_nodes_up: {
      keysPressed: ["arrowup", "control", "shift"],
      desc: "Move selected nodes with arrow keys",
    },
    move_selected_nodes_down: {
      keysPressed: ["arrowdown", "control", "shift"],
      desc: "Move selected nodes with arrow keys",
    },
    select_node_left: {
      keysPressed: ["arrowleft", "!control", "!shift"],
      activeComponentType: "node",
      desc: "Select the closest node on the left",
    },
    select_node_right: {
      keysPressed: ["arrowright", "!control", "!shift"],
      activeComponentType: "node",
      desc: "Select the closest node on the right",
    },
    select_node_above: {
      keysPressed: ["arrowup", "!control", "!shift"],
      activeComponentType: "node",
      desc: "Select the closest node on the top",
    },
    select_node_below: {
      keysPressed: ["arrowdown", "!control", "!shift"],
      activeComponentType: "node",
      desc: "Select the closest node on the bottom",
    },
    select_nodes_left: {
      keysPressed: ["arrowleft", "!control", "shift"],
      activeComponentType: "node",
      desc: "Select multiple nodes",
    },
    select_nodes_right: {
      keysPressed: ["arrowright", "!control", "shift"],
      activeComponentType: "node",
      desc: "Select multiple nodes",
    },
    select_nodes_above: {
      keysPressed: ["arrowup", "!control", "shift"],
      activeComponentType: "node",
      desc: "Select multiple nodes",
    },
    select_nodes_below: {
      keysPressed: ["arrowdown", "!control", "shift"],
      activeComponentType: "node",
      desc: "Select multiple nodes",
    },
    align_tofirst_selected_nodes_top: {
      keysPressed: ["keyt", "!shift"],
      activeComponentType: "node",
      desc: "Align top to the first selected node",
    },
    align_tofirst_selected_nodes_bottom: {
      keysPressed: ["keyb", "!shift"],
      activeComponentType: "node",
      desc: "Align bottom to the first selected node",
    },
    align_tofirst_selected_nodes_left: {
      keysPressed: ["keyl", "!shift"],
      activeComponentType: "node",
      desc: "Align left to the first selected node",
    },
    align_tofirst_selected_nodes_right: {
      keysPressed: ["keyr", "!shift"],
      activeComponentType: "node",
      desc: "Align right to the first selected node",
    },
    align_tofirst_selected_nodes_horizontally: {
      keysPressed: ["keye", "!shift"],
      activeComponentType: "node",
      desc: "Align center horizontally to the first selected node",
    },
    align_tofirst_selected_nodes_vertically: {
      keysPressed: ["keyc", "!shift"],
      activeComponentType: "node",
      desc: "Align center vertically to the first selected node",
    },
    align_tolast_selected_nodes_top: {
      keysPressed: ["keyt", "shift"],
      activeComponentType: "node",
      desc: "Align top to the last selected node",
    },
    align_tolast_selected_nodes_bottom: {
      keysPressed: ["keyb", "shift"],
      activeComponentType: "node",
      desc: "Align bottom to the last selected node",
    },
    align_tolast_selected_nodes_left: {
      keysPressed: ["keyl", "shift"],
      activeComponentType: "node",
      desc: "Align left to the last selected node",
    },
    align_tolast_selected_nodes_right: {
      keysPressed: ["keyr", "shift"],
      activeComponentType: "node",
      desc: "Align right to the last selected node",
    },
    align_tolast_selected_nodes_horizontally: {
      keysPressed: ["keye", "shift"],
      activeComponentType: "node",
      desc: "Align center horizontally to the last selected node",
    },
    align_tolast_selected_nodes_vertically: {
      keysPressed: ["keyc", "shift"],
      activeComponentType: "node",
      desc: "Align center vertically to the last selected node",
    },
    paint_node: {
      keysPressed: [
        "digit1|digit2|digit3|digit4|digit5|digit6|digit7|digit8|digit9|numpad1|numpad2|numpad3|numpad4|numpad5|numpad6|numpad7|numpad8|numpad9",
      ],
      activeComponentType: "node",
      desc: "Change color",
    },
    add_shape: {
      keysPressed: ["enter"],
      activeComponentType: "port-shape-bar",
      desc: "Add node",
    },
    edit_next_field: {
      keysPressed: ["tab"],
      activeComponentType: "field",
      desc: "Focus next field",
    },
    exit_edit_field: {
      keysPressed: ["escape"],
      activeComponentType: "field",
      desc: "Finish editing",
    },
    close_port_shape_bar: {
      keysPressed: ["escape"],
      activeComponentType: "port-shape-bar",
      desc: "Hide port shape bar",
    },
    deleselect_shapes: {
      keysPressed: ["escape"],
      activeComponentType: "shape",
      desc: "Unselect shapes",
    },
    edit_shape: {
      keysPressed: ["enter|numpadenter|space"],
      activeComponentType: "shape",
      desc: "Edit shape",
    },
    fit_to_page: {
      keysPressed: ["keyf"],
      activeComponentType: "all-nodes",
      desc: "Fit to page",
    },
    replace_div_with_br_on_enter: {
      keysPressed: ["enter|numpadenter"],
      activeComponentType: "field",
      desc: "",
    },
  };
  static isNEU(t) {
    return null == t || "" === t;
  }
  static isMobile = function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };
  static animate = function (t, e, i, r, a, o, s) {
    return FlowChart.private.animate(t, e, i, r, a, o, s);
  };
  constructor(t, e) {
    ("string" == typeof t || t instanceof String) &&
      (t = document.querySelector(t)),
      (this.options = FlowChart.private.mergeDeep(
        FlowChart.private.defaultOptions(),
        e
      )),
      (this.element = t),
      (this.svgElement = null),
      (this.shapeBar = new FlowChart.ShapeBar(this)),
      (this.colorBar = new FlowChart.ColorBar(this)),
      (this.menuBar = new FlowChart.MenuBar(this)),
      (this.statusBar = new FlowChart.StatusBar(this)),
      (this.selectedShapes = new FlowChart.SelectedShapeCollection(this)),
      (this.editor = new FlowChart.Editor(this)),
      (this.ports = new FlowChart.PortCollection(this)),
      (this.nodes = new FlowChart.ShapeCollection(this)),
      (this.links = new FlowChart.LinkCollection(this)),
      (this.labels = new FlowChart.ShapeCollection(this)),
      (this.active = null),
      (this._ = new FlowChart.private(this)),
      FlowChart.events.publish("init", [this]);
  }
  addNodeWithLink(t, e, i) {
    this._.addNodeWithLink(t, e, i);
  }
  load(t) {
    this._.load(t);
  }
  json(t) {
    return this._.json(t);
  }
  text(t) {
    return this._.text(t);
  }
  svg() {
    return this._.svg();
  }
  exportSVG() {
    FlowChart.private.downloadFile(
      "image/svg+xml",
      this.svg(),
      "flowchart.svg",
      !1,
      "svg"
    );
  }
  getShape(t) {
    return this._.getShape(t);
  }
  generateId() {
    return this._.generateId();
  }
  undo() {
    this._.undo();
  }
  redo() {
    this._.redo();
  }
  undoStepsCount() {
    return this._.undoStepsCount();
  }
  redoStepsCount() {
    return this._.redoStepsCount();
  }
  clearRedo() {
    this._.clearRedo();
  }
  clearUndo() {
    this._.clearUndo();
  }
  alignShapes(t, e, i) {
    this._.alignShapes(t, e, i);
  }
  reposition(t) {
    this._.reposition(t);
  }
  rippleShape(t, e, i) {
    FlowChart.private.rippleShape(t, e, i);
  }
  makeShapeVisible(t, e) {
    t && this._.makeShapesVisible([t], e);
  }
  onInit(t) {
    return this._.on("init", function (e, i) {
      return t.call(e, i);
    });
  }
  onChanged(t) {
    return this._.on("changed", function (e, i) {
      return t.call(e, i);
    });
  }
  onUndoRedoChanged(t) {
    return this._.on("undo-redo-changed", function (e, i) {
      return t.call(e, i);
    });
  }
  onSelectedShapesChanged(t) {
    return this._.on("selected-shapes-changed", function (e, i) {
      return t.call(e, i);
    });
  }
  onSelectedPortChange(t) {
    return this._.on("selected-port-change", function (e, i) {
      return t.call(e, i);
    });
  }
  onShortcut(t) {
    return this._.on("shortcut", function (e, i) {
      return t.call(e, i);
    });
  }
  onMenuItemClick(t) {
    return this._.on("menu-item-click", function (e, i) {
      return t.call(e, i);
    });
  }
  onLinkPoints(t) {
    return this._.on("link-points", function (e, i) {
      return t.call(e, i);
    });
  }
  onShapeDoubleClick(t) {
    return this._.on("shape-db-click", function (e, i) {
      return t.call(e, i);
    });
  }
  onShapeClick(t) {
    return this._.on("shape-click", function (e, i) {
      return t.call(e, i);
    });
  }
  onSvgClick(t) {
    return this._.on("svg-click", function (e, i) {
      return t.call(e, i);
    });
  }
  onFieldChange(t) {
    return this._.on("field-change", function (e, i) {
      return t.call(e, i);
    });
  }
};
void 0 === FlowChart && (FlowChart = {}),
  (FlowChart.VERSION = "1.01.17"),
  "undefined" != typeof module && (module.exports = FlowChart),
  (FlowChart.private = class {
    chart;
    mouseActions;
    keysPressed;
    mouseOverShape;
    mouseOverShapeType;
    touchendEnabledDevice;
    uid;
    useChangeListener;
    initialized;
    changedTimeout;
    changedArgs;
    selectedPortShape;
    selectedPort;
    lastAddedTemplateIdFormPortShapeBar;
    changeFillPressedIndexes;
    changeFillPressedTimeout;
    makeShapeVisibleInterval;
    svgBCR;
    shortcuts;
    static defaultOptions() {
      return {
        mode: "light",
        startPosition: FlowChart.startPosition.center,
        startScale: 1,
        interactive: !0,
        loadFromSession: !1,
        useSession: !0,
        statusBar: !0,
        colors: ["#039BE5", "#F57C00", "#FFCA28"],
        scaleMax: 4,
        scaleMin: 0.5,
        nodeSeparation: 100,
        zoom: { speed: 120, smooth: 12 },
      };
    }
    static countFlowCharts = 0;
    constructor(t) {
      (this.chart = t),
        (this.shortcuts = JSON.parse(JSON.stringify(FlowChart.shortcuts))),
        (this.mouseActions = []),
        (this.keysPressed = []),
        (this.matchedShortcuts = []),
        (this.mouseOverShape = null),
        (this.mouseOverShapeType = null),
        (this.touchendEnabledDevice = !1),
        (this.useChangeListener = !0),
        (this.initialized = !1),
        (this.changedTimeout = null),
        (this.changedArgs = { properties: [] }),
        (this.selectedPortShape = null),
        (this.selectedPort = null),
        (this.uid =
          window.location.pathname + "/" + FlowChart.private.countFlowCharts),
        FlowChart.private.countFlowCharts++,
        (this.changeFillPressedIndexes = []),
        (this.changeFillPressedTimeout = null),
        (this.makeShapeVisibleInterval = null),
        this.init();
    }
    snap() {
      this.useChangeListener &&
        (this.changedTimeout || (this.putInUndoStack(), this.clearRedo()));
    }
    addNodeWithLink(t, e, i) {
      var r = this,
        a = { templateId: e };
      (a = this.chart.nodes.add(a)).element.style.opacity = 0;
      var o = this.chart.links.getByShape(t.shape),
        s = [];
      for (var h of o)
        this.chart.ports.getByLink(h).fromPort == t &&
          (n = this.chart.nodes.get(h.to)) &&
          s.push(n.id);
      var l = [];
      for (var n of this.chart.nodes)
        l.push({ x: n.x, y: n.y, w: n.width, h: n.height, id: n.id });
      FlowChart.private.devin(
        {
          nodeDiscriptors: l,
          neighborNodeIds: s,
          newNodeId: a.id,
          parentNodeId: t.shape.id,
          position: t.position,
          options: this.chart.options,
        },
        function (e) {
          var o = [],
            s = [],
            h = [],
            l = r.chart.scale;
          for (var n of e) {
            var c = r.chart.nodes.get(n.id),
              d = { x: n.x, y: n.y, opacity: 1 };
            if (a == c) {
              var p = { x: n.x, y: n.y, opacity: 0 };
              switch (t.position) {
                case FlowChart.position.left:
                  p.x += 8 / l;
                  break;
                case FlowChart.position.right:
                  p.x -= 8 / l;
                  break;
                case FlowChart.position.top:
                  p.y += 8 / l;
                  break;
                case FlowChart.position.bottom:
                  p.y -= 8 / l;
                  break;
                case FlowChart.position.topLeft:
                  (p.y += 8 / l), (p.x += 8 / l);
                  break;
                case FlowChart.position.bottomLeft:
                  (p.y -= 8 / l), (p.x += 8 / l);
                  break;
                case FlowChart.position.bottomRight:
                  (p.y -= 8 / l), (p.x -= 8 / l);
                  break;
                case FlowChart.position.topRight:
                  (p.y += 8 / l), (p.x -= 8 / l);
              }
              s.push(p);
            } else s.push({ x: c.x, y: c.y, opacity: 0 });
            h.push(d), (c.x = -1e4), (c.y = -1e4), o.push(c);
          }
          for (var u = 0; u < o.length; u++)
            (o[u].x = s[u].x), (o[u].y = s[u].y);
          r.animateShapes(o, s, h, function () {
            i && i(a, y),
              r.makeShapesVisible([o], function () {
                var t = r.chart.editor.getFieldNames(a);
                t.length && r.chart.editor.edit(a, t[0]);
              });
          });
          var f = r.chart.ports.getByOpositeOfPosition(a.id, t.position)[0],
            y = {
              from: t.shape.id,
              to: f.shape.id,
              fromPort: t.id,
              toPort: f.id,
              templateId: "rounded",
            };
          y = r.chart.links.add(y);
        }
      );
    }
    changed(t) {
      if (this.useChangeListener) {
        var e = this;
        for (var i in t) {
          var r = t[i];
          (i = "property") &&
            -1 == this.changedArgs.properties.indexOf(r) &&
            this.changedArgs.properties.push(r);
        }
        if ("selectedShapes" == t.property)
          for (var a of (FlowChart.events.publish("selected-shapes-changed", [
            e.chart,
          ]),
          this.chart.editor.clearFieldBorders(),
          e.chart.selectedShapes))
            this.chart.editor.edit(a);
        this.changedTimeout &&
          (clearTimeout(this.changedTimeout), (this.changedTimeout = null)),
          (this.changedTimeout = setTimeout(function () {
            e.changedTimeout = null;
            var t = e.chart.text([
              "shapes",
              "links",
              "viewBox",
              "selectedShapes",
            ]);
            if (e.chart.options.useSession)
              try {
                sessionStorage.setItem(`${e.uid}_state`, t);
              } catch (t) {
                t.code == t.QUOTA_EXCEEDED_ERR && sessionStorage.clear(),
                  console.error(t);
              }
            FlowChart.events.publish("changed", [e.chart, e.changedArgs]),
              (e.changedArgs = { properties: [] });
          }, FlowChart.CHANGED_TIMEOUT));
      }
    }
    load(t) {
      if (
        ((this.useChangeListener = !1),
        this.chart.nodes.clear(),
        this.chart.labels.clear(),
        this.chart.links.clear(),
        !this.initialized && this.chart.options.loadFromSession)
      ) {
        var e = sessionStorage.getItem(`${this.uid}_state`);
        e && (t = JSON.parse(e));
      }
      if (t) {
        if (
          (t.nodes && this.chart.nodes.addRange(t.nodes),
          t.links && this.chart.links.addRange(t.links),
          t.labels && this.chart.labels.addRange(t.labels),
          t.selectedShapes)
        )
          for (var i of t.selectedShapes) {
            var r = this.chart.getShape(i);
            r && (r.selected = !0);
          }
        t.viewBox && (this.setViewBox(t.viewBox), (this.initialized = !0));
      }
      this.initialized ||
        ((this.chart.scale = this.chart.options.startScale),
        this.chart.reposition(),
        (this.initialized = !0)),
        (this.useChangeListener = !0);
      var a = this.chart.text(["shapes", "links", "viewBox", "selectedShapes"]);
      if (this.chart.options.useSession)
        try {
          sessionStorage.setItem(`${this.uid}_state`, a);
        } catch (t) {
          t.code == t.QUOTA_EXCEEDED_ERR && sessionStorage.clear(),
            console.error(t);
        }
    }
    alignShapes(t, e, i) {
      if (t.length) {
        (this.chart.selectedPortShape = null), t.length;
        var r = t[t.length - 1];
        i && (t.length, (r = t[0]));
        for (var a = 0; a < t.length; a++) {
          var o = t[a];
          e == FlowChart.position.top
            ? (o.y = r.y - r.height / 2 + o.height / 2)
            : e == FlowChart.align.bottom
            ? (o.y = r.y + r.height / 2 - o.height / 2)
            : e == FlowChart.align.left
            ? (o.x = r.x - r.width / 2 + o.width / 2)
            : e == FlowChart.align.right
            ? (o.x = r.x + r.width / 2 - o.width / 2)
            : e == FlowChart.align.vertically
            ? (o.x = r.x)
            : e == FlowChart.align.horizontally && (o.y = r.y);
        }
      }
    }
    getShape(t) {
      var e = this.chart.nodes.get(t);
      return e || (e = this.chart.labels.get(t)), e;
    }
    generateId() {
      for (var t = this.chart.nodes.length + this.chart.labels.length; ; ) {
        if (!this.chart.nodes.contains(t) && !this.chart.labels.contains(t))
          return t;
        t++;
      }
    }
    init() {
      this.chart.element.classList.add("bfc-" + this.chart.mode),
        this.chart.element.classList.add("frame"),
        (this.chart.element.innerHTML = ` ${FlowChart.css()}\n                                <svg class="bfc-svg">                                \n                                    <defs></defs>                                \n                                    <g data-layer="-3"></g>\n                                    <g data-layer="-2"></g>\n                                    <g data-layer="-1"></g>\n                                    <foreignObject class="bfc-html" x="90000" y="90000" width="10000" height="10000"><div data-test-elastic-size style="height: initial; display: inline-block;" class="bfc-flex-center"></div></foreignObject>\n                                </svg>\n                                <div data-statusbar class="bfc-statusbar">\n                                    &nbsp;\n                                </div>\n                                <div data-shapebar class="bfc-shapebar" style="display: none;"></div>\n                                <div data-colorbar class="bfc-colorbar" style="display: none;"></div>\n                                <div data-menubar class="bfc-menubar bfc-horizontal-bar" style="display: none;"></div>${FlowChart.private.logo(
          this.chart.options.logoSvg
        )}`),
        (this.chart.svgElement = this.chart.element.querySelector(".bfc-svg")),
        (this.svgBCR = this.chart.svgElement.getBoundingClientRect());
      var t = [0, 0, this.svgBCR.width, this.svgBCR.height];
      this.chart.svgElement.setAttribute("viewBox", t.join(",")),
        this.chart.menuBar.init(),
        this.chart.shapeBar.init(),
        this.chart.colorBar.init(),
        this.chart.statusBar.init(),
        this.addListeners();
    }
    getViewBox = function () {
      var t = null;
      return this.chart.svgElement
        ? ((t = (t =
            "[" +
            (t = this.chart.svgElement.getAttribute("viewBox")) +
            "]").replace(/\ /g, ",")),
          (t = JSON.parse(t)))
        : null;
    };
    setViewBox(t) {
      isNaN(t[2]) && console.log("not ok"),
        this.chart.svgElement.setAttribute("viewBox", t.toString());
      var e = FlowChart.private.getScale(
        t,
        this.svgBCR.width,
        this.svgBCR.height
      );
      this.updatePortsElement(e);
    }
    getScale() {
      if (this.svgBCR.width > 0 && this.svgBCR.height > 0) {
        var t = FlowChart.private.getScale(
          this.chart.viewBox,
          this.svgBCR.width,
          this.svgBCR.height
        );
        return isNaN(t), t;
      }
      return (
        console.log(
          `setViewBox -> this.svgBCR.width: ${this.svgBCR.width}; this.svgBCR.height: ${this.svgBCR.height};`
        ),
        0
      );
    }
    on(t, e) {
      return FlowChart.events.on(t, e, this.uid), this.chart;
    }
    getSizeOfHTML(t) {
      t && (t = t.replaceAll("contenteditable", " "));
      var e = this.chart.svgElement.querySelector("[data-test-elastic-size]");
      e.innerHTML = t;
      var i = e.getBoundingClientRect(),
        r = this.chart.scale;
      return { width: i.width / r + 6, height: i.height / r + 6 };
    }
    getActiveComponentTypes() {
      if (null != this.chart.selectedPort) return ["port-shape-bar"];
      if (this.chart.editor.hasActiveField()) return ["field"];
      var t = [];
      return (
        this.chart.selectedShapes.nodes.length && t.push("node"),
        this.chart.selectedShapes.labels.length && t.push("label"),
        t.length
          ? (t.push("shape"),
            this.chart.selectedShapes.nodes.length == this.chart.nodes.length &&
              t.push("all-nodes"),
            t)
          : "canvas"
      );
    }
    zoom(t, e) {
      var i = this.chart.viewBox,
        r = i,
        a = i[2],
        o = i[3];
      !0 === t
        ? ((i[2] = i[2] / FlowChart.SCALE_FACTOR),
          (i[3] = i[3] / FlowChart.SCALE_FACTOR))
        : !1 === t
        ? ((i[2] = i[2] * FlowChart.SCALE_FACTOR),
          (i[3] = i[3] * FlowChart.SCALE_FACTOR))
        : ((i[2] = i[2] / t), (i[3] = i[3] / t)),
        e || (e = [50, 50]),
        (i[0] = r[0] - (i[2] - a) / (100 / e[0])),
        (i[1] = r[1] - (i[3] - o) / (100 / e[1]));
      var s = FlowChart.private.getScale(
        i,
        this.svgBCR.width,
        this.svgBCR.height
      );
      (i[2] = this.svgBCR.width / s), (i[3] = this.svgBCR.height / s);
      var h = this.chart.options;
      ((!0 === t && s < h.scaleMax) ||
        (!1 === t && s > h.scaleMin) ||
        (0 != t && 1 != t && s < h.scaleMax && s > h.scaleMin)) &&
        (this.chart.viewBox = i);
    }
    updateMatchedShortcuts(t, e, i) {
      this.matchedShortcuts = [];
      var r = this.getActiveComponentTypes();
      for (var a in this.shortcuts)
        if (!this.matchedShortcuts.includes(a)) {
          var o = !0,
            s = !0,
            h = !0,
            l = this.shortcuts[a];
          if (l.keysPressed)
            for (var n = 0; n < l.keysPressed.length; n++) {
              var c,
                d = l.keysPressed[n];
              c = -1 != d.indexOf("|") ? d.split("|") : [d];
              var p = !1;
              for (var u of c)
                0 == u.indexOf("!")
                  ? ((u = u.substring(1)),
                    this.keysPressed.includes(u) || (p = !0))
                  : this.keysPressed.includes(u) && (p = !0);
              if (!p) {
                o = !1;
                break;
              }
              var f = !1;
              if (l.activeComponentType) {
                var y = l.activeComponentType.split("|");
                for (var m of y) r.includes(m) && (f = !0);
              } else f = !0;
              if (!f) {
                h = !1;
                break;
              }
            }
          else
            e && l.keyDown
              ? l.keyDown != e && (o = !1)
              : i && l.keyUp && l.keyUp != i && (o = !1);
          if (l.mouseActions)
            for (n = 0; n < l.mouseActions.length; n++)
              if (!this.mouseActions.includes(l.mouseActions[n])) {
                s = !1;
                break;
              }
          if (s && o && h) {
            this.matchedShortcuts.includes(a) || this.matchedShortcuts.push(a);
            var g = this.chart.selectedShapes,
              v = this.chart.selectedShapes.nodes;
            if ("move_selected_nodes_left" == a)
              (this.chart.selectedPortShape = null),
                this.chart.nodes._.move(v, FlowChart.move.left);
            else if ("move_selected_nodes_right" == a)
              (this.chart.selectedPortShape = null),
                this.chart.nodes._.move(v, FlowChart.move.right);
            else if ("move_selected_nodes_up" == a)
              (this.chart.selectedPortShape = null),
                this.chart.nodes._.move(v, FlowChart.move.up);
            else if ("move_selected_nodes_down" == a)
              (this.chart.selectedPortShape = null),
                this.chart.nodes._.move(v, FlowChart.move.down);
            else if ("align_tofirst_selected_nodes_bottom" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.bottom, !0);
            else if ("align_tofirst_selected_nodes_top" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.top, !0);
            else if ("align_tofirst_selected_nodes_left" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.left, !0);
            else if ("align_tofirst_selected_nodes_right" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.right, !0);
            else if ("align_tofirst_selected_nodes_horizontally" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.horizontally, !0);
            else if ("align_tofirst_selected_nodes_vertically" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.vertically, !0);
            else if ("align_tolast_selected_nodes_bottom" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.bottom, !1);
            else if ("align_tolast_selected_nodes_top" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.top, !1);
            else if ("align_tolast_selected_nodes_left" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.left, !1);
            else if ("align_tolast_selected_nodes_right" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.right, !1);
            else if ("align_tolast_selected_nodes_horizontally" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.horizontally, !1);
            else if ("align_tolast_selected_nodes_vertically" == a)
              t.preventDefault(),
                this.chart.alignShapes(g, FlowChart.align.vertically, !1);
            else if ("remove_selected_shapes" == a)
              this.chart.nodes.removeRange(this.chart.selectedShapes.nodes),
                this.chart.labels.removeRange(this.chart.selectedShapes.labels);
            else if ("select_all_nodes" == a)
              for (var w of (t.preventDefault(), this.chart.nodes))
                "label" != w.type && this.chart.selectedShapes.add(w);
            else if ("undo" == a)
              this.chart._.undo(),
                this.chart.menuBar._.simulateMouseClickOnKeydown("undo");
            else if ("redo" == a)
              this.chart._.redo(),
                this.chart.menuBar._.simulateMouseClickOnKeydown("redo");
            else if ("open_up_port" == a)
              this.showPortShapeBarUI(FlowChart.position.top);
            else if ("open_down_port" == a)
              this.showPortShapeBarUI(FlowChart.position.bottom);
            else if ("open_left_port" == a)
              this.showPortShapeBarUI(FlowChart.position.left);
            else if ("open_right_port" == a)
              this.showPortShapeBarUI(FlowChart.position.right);
            else if ("navigate_port_down" == a)
              t.preventDefault(),
                this.navigatePortShapeBarItems(FlowChart.position.bottom);
            else if ("navigate_port_left" == a)
              t.preventDefault(),
                this.navigatePortShapeBarItems(FlowChart.position.left);
            else if ("navigate_port_right" == a)
              t.preventDefault(),
                this.navigatePortShapeBarItems(FlowChart.position.right);
            else if ("navigate_port_up" == a)
              t.preventDefault(),
                this.navigatePortShapeBarItems(FlowChart.position.top);
            else if ("add_shape" == a)
              this.chart.editor.blur(),
                t.preventDefault(),
                this.chart._.createNodeFromPorsShapeBarItem();
            else if ("edit_next_field" == a)
              t.preventDefault(), this.chart.editor.selectNextField();
            else if ("exit_edit_field" == a) this.chart.editor.blur();
            else if ("close_port_shape_bar" == a)
              this.chart.selectedPort = null;
            else if ("deleselect_shapes" == a)
              this.chart.selectedShapes.clear();
            else if ("edit_shape" == a) {
              var C = this.chart.selectedShapes.last;
              t.preventDefault(), this.chart.editor.editFirstFieldIfAny(C);
            } else if ("select_node_above" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeAbove(!0);
            else if ("select_node_below" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeBelow(!0);
            else if ("select_node_left" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeLeft(!0);
            else if ("select_node_right" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeRight(!0);
            else if ("select_nodes_above" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeAbove(!1);
            else if ("select_nodes_below" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeBelow(!1);
            else if ("select_nodes_left" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeLeft(!1);
            else if ("select_nodes_right" == a)
              t.preventDefault(),
                this.chart.editor.blur(),
                this.chart.selectedShapes.selectNodeRight(!1);
            else if ("paint_node" == a) {
              if (null != e) {
                var x = parseInt(e) - 1;
                this.changeFill(x),
                  this.chart.colorBar._.simulateMouseClickOnKeydown(
                    `color-${x}`
                  );
              }
            } else if ("fit_to_page" == a)
              this.chart.reposition(FlowChart.startPosition.fit);
            else if ("replace_div_with_br_on_enter" == a) {
              for (
                var N = t.target;
                N && N.hasAttribute && !N.hasAttribute("data-shape-id");

              )
                N = N.parentNode;
              if (N) {
                var b = N.getAttribute("data-shape-id");
                if (this.chart.selectedShapes.contains(b)) {
                  if (13 == t.keyCode) {
                    t.preventDefault();
                    const e = window.getSelection(),
                      i = e.getRangeAt(0);
                    var F = document
                      .getSelection()
                      .anchorNode.parentNode.nodeName.toUpperCase();
                    switch (F) {
                      case "P":
                      case "DIV":
                      default:
                        F = "BR";
                        break;
                      case "SPAN":
                        F = "span";
                        break;
                      case "BR":
                        F = null;
                    }
                    const r = document.createElement(F);
                    i.deleteContents(),
                      i.insertNode(r),
                      "BR" === F
                        ? (i.setStartAfter(r), i.setEndAfter(r))
                        : (i.setStart(r, 0), i.setEnd(r, 0));
                    const a = document.createTextNode("​");
                    i.insertNode(a),
                      i.setStartBefore(a),
                      i.setEndBefore(a),
                      e.removeAllRanges(),
                      e.addRange(i),
                      t.stopPropagation();
                  }
                  t.target.value = t.target.innerHTML;
                }
              }
            }
            FlowChart.events.publish("shortcut", [
              this.chart,
              { name: a, event: t },
            ]);
          }
        }
    }
    changeFill(t) {
      t = parseInt(t) + 1;
      var e = this;
      -1 == this.changeFillPressedIndexes.indexOf(t) &&
        this.changeFillPressedIndexes.push(t),
        this.changeFillPressedTimeout &&
          (clearTimeout(this.changeFillPressedTimeout),
          (this.changeFillPressedTimeout = null)),
        (this.changeFillPressedTimeout = setTimeout(function () {
          e.changeFillPressedIndexes = [];
        }, 500));
      for (var i = "", r = 0; r < this.changeFillPressedIndexes.length; r++)
        i += this.changeFillPressedIndexes[r].toString();
      t = parseInt(i) - 1;
      for (var a = this.chart.options.colors[t]; !a && i.length; )
        (i = i.substring(1)),
          (t = parseInt(i) - 1),
          (a = this.chart.options.colors[t]);
      if (a)
        for (var o of this.chart.selectedShapes) o.fill != a && (o.fill = a);
    }
  }),
  void 0 === FlowChart && (FlowChart = {}),
  (FlowChart.position = Object.freeze({
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    topLeft: "topLeft",
    topRight: "topRight",
    bottomLeft: "bottomLeft",
    bottomRight: "bottomRight",
  })),
  (FlowChart.align = Object.freeze({
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    horizontally: "horizontally",
    vertically: "vertically",
  })),
  (FlowChart.move = Object.freeze({
    up: "up",
    down: "down",
    left: "left",
    right: "right",
  })),
  (FlowChart.direction = Object.freeze({
    vertical: "vertical",
    horizontal: "horizontal",
  })),
  (FlowChart.startPosition = Object.freeze({
    none: "none",
    fitHeight: "fitHeight",
    fitWidth: "fitWidth",
    fit: "fit",
    centerTop: "centerTop",
    centerBottom: "centerBottom",
    centerLeft: "centerLeft",
    centerRight: "centerRight",
    center: "center",
  })),
  (FlowChart.private.animate = function (t, e, i, r, a, o, s) {
    var h,
      l = 10,
      n = 1,
      c = r / l + 1;
    return (
      document.getElementsByTagName("g"),
      Array.isArray(t) || (t = [t]),
      Array.isArray(e) || (e = [e]),
      Array.isArray(i) || (i = [i]),
      (h = setInterval(function () {
        for (var d = 0; d < t.length; d++)
          for (var p in i[d]) {
            var u = [
              "top",
              "left",
              "right",
              "bottom",
              "width",
              "height",
            ].includes(p.toLowerCase())
              ? "px"
              : "";
            if ("node" == t[d].type || "label" == t[d].type) {
              var f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p];
              switch (p) {
                case "x":
                case "y":
                case "width":
                case "height":
                case "opacity":
                  t[d][p] = f;
                  break;
                default:
                  t[d].element.style[p] = f;
              }
            } else
              switch (p) {
                case "d":
                  var y =
                      a((n * l - l) / r) * (i[d][p][0] - e[d][p][0]) +
                      e[d][p][0],
                    m =
                      a((n * l - l) / r) * (i[d][p][1] - e[d][p][1]) +
                      e[d][p][1];
                  t[d].setAttribute(
                    "d",
                    t[d].getAttribute("d") + " L" + y + " " + m
                  );
                  break;
                case "r":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].setAttribute("r", f);
                  break;
                case "x1":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].setAttribute("x1", f);
                  break;
                case "x2":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].setAttribute("x2", f);
                  break;
                case "y1":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].setAttribute("y1", f);
                  break;
                case "y2":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].setAttribute("y2", f);
                  break;
                case "rotate3d":
                  if (i[d][p]) {
                    var g = e[d][p],
                      v = i[d][p],
                      w = [0, 0, 0, 0];
                    for (var C in g)
                      w[C] = a((n * l - l) / r) * (v[C] - g[C]) + g[C];
                    t[d].style.transform = "rotate3d(" + w.toString() + "deg)";
                  }
                  break;
                case "transform":
                  if (i[d][p]) {
                    for (var C in ((g = e[d][p]),
                    (v = i[d][p]),
                    (w = [0, 0, 0, 0, 0, 0]),
                    g))
                      w[C] = a((n * l - l) / r) * (v[C] - g[C]) + g[C];
                    t[d].hasAttribute("transform")
                      ? t[d].setAttribute(
                          "transform",
                          "matrix(" + w.toString() + ")"
                        )
                      : (t[d].style.transform = "matrix(" + w.toString() + ")");
                  }
                  break;
                case "viewBox":
                  if (i[d][p]) {
                    for (var C in ((g = e[d][p]),
                    (v = i[d][p]),
                    (w = [0, 0, 0, 0]),
                    g))
                      w[C] = a((n * l - l) / r) * (v[C] - g[C]) + g[C];
                    t[d].setAttribute("viewBox", w.toString());
                  }
                  break;
                case "margin":
                  if (i[d][p]) {
                    for (var C in ((g = e[d][p]),
                    (v = i[d][p]),
                    (w = [0, 0, 0, 0]),
                    g))
                      w[C] = a((n * l - l) / r) * (v[C] - g[C]) + g[C];
                    var x = "";
                    for (C = 0; C < w.length; C++) x += parseInt(w[C]) + "px ";
                    t[d] && t[d].style && (t[d].style[p] = x);
                  }
                  break;
                case "scrollY":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].scrollTo(0, f);
                  break;
                case "stdDeviation":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].setAttribute("stdDeviation", f);
                  break;
                case "baseFrequency":
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d].setAttribute("baseFrequency", f);
                  break;
                default:
                  (f = a((n * l - l) / r) * (i[d][p] - e[d][p]) + e[d][p]),
                    t[d] && t[d].style && (t[d].style[p] = f + u);
              }
          }
        s && s(), (n += 1) > c + 1 && (clearInterval(h), o && o(t));
      }, l))
    );
  }),
  (FlowChart.private.linkFromTo = function (t, e, i, r, a) {
    var o = [];
    if (
      i.position == FlowChart.position.right &&
      r.position == FlowChart.position.left
    )
      if (
        t.left + t.width + FlowChart.LINK_DITSNANCE <
        e.left - FlowChart.LINK_DITSNANCE
      ) {
        var s = t.left + t.width + (e.left - (t.left + t.width)) / 2;
        o.push({ x: i.x, y: i.y }),
          o.push({ x: s, y: i.y }),
          o.push({ x: s, y: r.y }),
          o.push({ x: r.x, y: r.y });
      } else if (
        t.top - FlowChart.LINK_DITSNANCE >
        e.top + e.height + FlowChart.LINK_DITSNANCE
      ) {
        var h = t.top + t.height + (e.top - (t.top + t.height)) / 2;
        o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y });
      } else if (
        t.top + t.height + FlowChart.LINK_DITSNANCE <
        e.top - FlowChart.LINK_DITSNANCE
      )
        (h = e.top + e.height + (t.top - (e.top + e.height)) / 2),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y });
      else if (
        i.y <= r.y &&
        t.left - FlowChart.LINK_DITSNANCE >
          e.left + e.width + FlowChart.LINK_DITSNANCE
      ) {
        var l = Math.min(t.top, e.top);
        o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({
            x: t.left + t.width + FlowChart.LINK_DITSNANCE,
            y: l - FlowChart.LINK_DITSNANCE,
          }),
          o.push({
            x: e.left - FlowChart.LINK_DITSNANCE,
            y: l - FlowChart.LINK_DITSNANCE,
          }),
          o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y });
      } else if (
        i.y > r.y &&
        t.left + FlowChart.LINK_DITSNANCE >
          e.left + e.width + FlowChart.LINK_DITSNANCE
      ) {
        var n = Math.max(t.top + t.height, e.top + e.height);
        o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({
            x: t.left + t.width + FlowChart.LINK_DITSNANCE,
            y: n + FlowChart.LINK_DITSNANCE,
          }),
          o.push({
            x: e.left - FlowChart.LINK_DITSNANCE,
            y: n + FlowChart.LINK_DITSNANCE,
          }),
          o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y });
      } else o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y });
    else if (
      i.position == FlowChart.position.left &&
      r.position == FlowChart.position.right
    )
      t.left - FlowChart.LINK_DITSNANCE >
      e.left + e.width + FlowChart.LINK_DITSNANCE
        ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: s, y: i.y }),
          o.push({ x: s, y: r.y }),
          o.push({ x: r.x, y: r.y }))
        : t.top - FlowChart.LINK_DITSNANCE >
          e.top + e.height + FlowChart.LINK_DITSNANCE
        ? ((h = e.top + e.height + (t.top - (e.top + e.height)) / 2),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y }))
        : t.top + t.height + FlowChart.LINK_DITSNANCE <
          e.top - FlowChart.LINK_DITSNANCE
        ? ((h = t.top + t.height + (e.top - (t.top + t.height)) / 2),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: h }),
          o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y }))
        : i.y <= r.y &&
          t.left + t.width + FlowChart.LINK_DITSNANCE <
            e.left - FlowChart.LINK_DITSNANCE
        ? ((l = Math.min(t.top, e.top)),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({
            x: t.left - FlowChart.LINK_DITSNANCE,
            y: l - FlowChart.LINK_DITSNANCE,
          }),
          o.push({
            x: e.left + e.width + FlowChart.LINK_DITSNANCE,
            y: l - FlowChart.LINK_DITSNANCE,
          }),
          o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y }))
        : i.y > r.y &&
          t.left + t.width + FlowChart.LINK_DITSNANCE <
            e.left - FlowChart.LINK_DITSNANCE
        ? ((n = Math.max(t.top + t.height, e.top + e.height)),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
          o.push({
            x: t.left - FlowChart.LINK_DITSNANCE,
            y: n + FlowChart.LINK_DITSNANCE,
          }),
          o.push({
            x: e.left + e.width + FlowChart.LINK_DITSNANCE,
            y: n + FlowChart.LINK_DITSNANCE,
          }),
          o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: r.y }),
          o.push({ x: r.x, y: r.y }))
        : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }));
    else if (
      i.position == FlowChart.position.bottom &&
      r.position == FlowChart.position.top
    )
      if (
        t.top + t.height + FlowChart.LINK_DITSNANCE <
        e.top - FlowChart.LINK_DITSNANCE
      )
        (h = t.top + t.height + (e.top - (t.top + t.height)) / 2),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: i.x, y: h }),
          o.push({ x: r.x, y: h }),
          o.push({ x: r.x, y: r.y });
      else if (
        t.left + t.width + FlowChart.LINK_DITSNANCE <
        e.left - FlowChart.LINK_DITSNANCE
      )
        (s = t.left + t.width + (e.left - (t.left + t.width)) / 2),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: i.x, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
          o.push({ x: s, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
          o.push({ x: s, y: e.top - FlowChart.LINK_DITSNANCE }),
          o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
          o.push({ x: r.x, y: r.y });
      else if (
        t.left - FlowChart.LINK_DITSNANCE >
        e.left + e.width + FlowChart.LINK_DITSNANCE
      )
        (s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
          o.push({ x: i.x, y: i.y }),
          o.push({ x: i.x, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
          o.push({ x: s, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
          o.push({ x: s, y: e.top - FlowChart.LINK_DITSNANCE }),
          o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
          o.push({ x: r.x, y: r.y });
      else if (
        i.x <= r.x &&
        t.top - FlowChart.LINK_DITSNANCE >
          e.top + e.height + FlowChart.LINK_DITSNANCE
      ) {
        var c = Math.min(t.left, e.left);
        o.push({ x: i.x, y: i.y }),
          o.push({ x: i.x, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
          o.push({
            x: c - FlowChart.LINK_DITSNANCE,
            y: t.top + t.height + FlowChart.LINK_DITSNANCE,
          }),
          o.push({
            x: c - FlowChart.LINK_DITSNANCE,
            y: e.top - FlowChart.LINK_DITSNANCE,
          }),
          o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
          o.push({ x: r.x, y: r.y });
      } else if (
        i.x > r.x &&
        t.top - FlowChart.LINK_DITSNANCE >
          e.top + e.height + FlowChart.LINK_DITSNANCE
      ) {
        var d = Math.max(t.left + t.width, e.left + e.width);
        o.push({ x: i.x, y: i.y }),
          o.push({ x: i.x, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
          o.push({
            x: d + FlowChart.LINK_DITSNANCE,
            y: t.top + t.height + FlowChart.LINK_DITSNANCE,
          }),
          o.push({
            x: d + FlowChart.LINK_DITSNANCE,
            y: e.top - FlowChart.LINK_DITSNANCE,
          }),
          o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
          o.push({ x: r.x, y: r.y });
      } else o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y });
    else
      i.position == FlowChart.position.top &&
      r.position == FlowChart.position.bottom
        ? t.top - FlowChart.LINK_DITSNANCE >
          e.top + e.height + FlowChart.LINK_DITSNANCE
          ? ((h = e.top + e.height + (t.top - (e.top + e.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: h }),
            o.push({ x: r.x, y: h }),
            o.push({ x: r.x, y: r.y }))
          : t.left + t.width + FlowChart.LINK_DITSNANCE <
            e.left - FlowChart.LINK_DITSNANCE
          ? ((s = t.left + t.width + (e.left - (t.left + t.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : t.left - FlowChart.LINK_DITSNANCE >
            e.left + e.width + FlowChart.LINK_DITSNANCE
          ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : i.x <= r.x &&
            t.top + t.height + FlowChart.LINK_DITSNANCE <
              e.top - FlowChart.LINK_DITSNANCE
          ? ((c = Math.min(t.left, e.left)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({
              x: c - FlowChart.LINK_DITSNANCE,
              y: t.top - FlowChart.LINK_DITSNANCE,
            }),
            o.push({
              x: c - FlowChart.LINK_DITSNANCE,
              y: e.top + e.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : i.x > r.x &&
            t.top + t.height + FlowChart.LINK_DITSNANCE <
              e.top - FlowChart.LINK_DITSNANCE
          ? ((d = Math.max(t.left + t.width, e.left + e.width)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({
              x: d + FlowChart.LINK_DITSNANCE,
              y: t.top - FlowChart.LINK_DITSNANCE,
            }),
            o.push({
              x: d + FlowChart.LINK_DITSNANCE,
              y: e.top + e.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.bottom &&
          r.position == FlowChart.position.left
        ? t.left + t.width + FlowChart.LINK_DITSNANCE >
            e.left - FlowChart.LINK_DITSNANCE &&
          t.left - FlowChart.LINK_DITSNANCE <
            e.left + e.width + FlowChart.LINK_DITSNANCE &&
          t.top + t.height + FlowChart.LINK_DITSNANCE >
            e.top - FlowChart.LINK_DITSNANCE &&
          t.top - FlowChart.LINK_DITSNANCE <
            e.top + e.height + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : i.y + FlowChart.LINK_DITSNANCE < r.y &&
            i.x < e.left - FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + t.height + FlowChart.LINK_DITSNANCE <
            e.top - FlowChart.LINK_DITSNANCE
          ? ((h = t.top + t.height + (e.top - (t.top + t.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: h }),
            o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: h }),
            o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + t.height + FlowChart.LINK_DITSNANCE >
              e.top - FlowChart.LINK_DITSNANCE &&
            t.left + t.width + FlowChart.LINK_DITSNANCE >
              e.left - FlowChart.LINK_DITSNANCE
          ? ((n = Math.max(t.top + t.height, e.top + e.height)),
            (c = Math.min(t.left, e.left)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: n + FlowChart.LINK_DITSNANCE }),
            o.push({
              x: c - FlowChart.LINK_DITSNANCE,
              y: n + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: c - FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + t.height + FlowChart.LINK_DITSNANCE > e.top
          ? ((s = t.left + t.width + (e.left - (t.left + t.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.bottom &&
          r.position == FlowChart.position.right
        ? t.left + t.width + FlowChart.LINK_DITSNANCE >
            e.left - FlowChart.LINK_DITSNANCE &&
          t.left - FlowChart.LINK_DITSNANCE <
            e.left + e.width + FlowChart.LINK_DITSNANCE &&
          t.top + t.height + FlowChart.LINK_DITSNANCE >
            e.top - FlowChart.LINK_DITSNANCE &&
          t.top - FlowChart.LINK_DITSNANCE <
            e.top + e.height + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : i.y < r.y && i.x > e.left + e.width + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + t.height + FlowChart.LINK_DITSNANCE <=
            e.top - FlowChart.LINK_DITSNANCE
          ? ((h = t.top + t.height + (e.top - (t.top + t.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: h }),
            o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: h }),
            o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + t.height + FlowChart.LINK_DITSNANCE >
              e.top - FlowChart.LINK_DITSNANCE &&
            t.left - FlowChart.LINK_DITSNANCE <
              e.left + e.width + FlowChart.LINK_DITSNANCE
          ? ((n = Math.max(t.top + t.height, e.top + e.height)),
            (d = Math.max(t.left + t.width, e.left + e.width)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: n + FlowChart.LINK_DITSNANCE }),
            o.push({
              x: d + FlowChart.LINK_DITSNANCE,
              y: n + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: d + FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + t.height + FlowChart.LINK_DITSNANCE > e.top
          ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.top &&
          r.position == FlowChart.position.left
        ? t.left + t.width + FlowChart.LINK_DITSNANCE >
            e.left - FlowChart.LINK_DITSNANCE &&
          t.left - FlowChart.LINK_DITSNANCE <
            e.left + e.width + FlowChart.LINK_DITSNANCE &&
          t.top + t.height + FlowChart.LINK_DITSNANCE >
            e.top - FlowChart.LINK_DITSNANCE &&
          t.top - FlowChart.LINK_DITSNANCE <
            e.top + e.height + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : i.y > r.y && i.x < e.left - FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top - FlowChart.LINK_DITSNANCE >=
            e.top + e.height + FlowChart.LINK_DITSNANCE
          ? ((h = t.top + t.height + (e.top - (t.top + t.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: h }),
            o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: h }),
            o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top - FlowChart.LINK_DITSNANCE <
              e.top + e.height + FlowChart.LINK_DITSNANCE &&
            t.left + t.width + FlowChart.LINK_DITSNANCE >
              e.left - FlowChart.LINK_DITSNANCE
          ? ((l = Math.min(t.top, e.top)),
            (c = Math.min(t.left, e.left)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: l - FlowChart.LINK_DITSNANCE }),
            o.push({
              x: c - FlowChart.LINK_DITSNANCE,
              y: l - FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: c - FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + FlowChart.LINK_DITSNANCE < e.top + e.height
          ? ((s = t.left + t.width + (e.left - (t.left + t.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.top &&
          r.position == FlowChart.position.right
        ? t.left + t.width + FlowChart.LINK_DITSNANCE >
            e.left - FlowChart.LINK_DITSNANCE &&
          t.left - FlowChart.LINK_DITSNANCE <
            e.left + e.width + FlowChart.LINK_DITSNANCE &&
          t.top + t.height + FlowChart.LINK_DITSNANCE >
            e.top - FlowChart.LINK_DITSNANCE &&
          t.top - FlowChart.LINK_DITSNANCE <
            e.top + e.height + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : i.y - FlowChart.LINK_DITSNANCE > r.y &&
            i.x > e.left + e.width + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top - FlowChart.LINK_DITSNANCE >
            e.top + e.height + FlowChart.LINK_DITSNANCE
          ? ((h = t.top + t.height + (e.top - (t.top + t.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: h }),
            o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: h }),
            o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top - FlowChart.LINK_DITSNANCE <
              e.top + e.height + FlowChart.LINK_DITSNANCE &&
            t.left - FlowChart.LINK_DITSNANCE <
              e.left + e.width + FlowChart.LINK_DITSNANCE
          ? ((l = Math.min(t.top, e.top)),
            (d = Math.max(t.left + t.width, e.left + e.width)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: l - FlowChart.LINK_DITSNANCE }),
            o.push({
              x: d + FlowChart.LINK_DITSNANCE,
              y: l - FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: d + FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.top + FlowChart.LINK_DITSNANCE < e.top + e.height
          ? ((s = t.left + t.width + (e.left - (t.left + t.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: s, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.right &&
          r.position == FlowChart.position.right
        ? r.x < i.x
          ? t.top - FlowChart.LINK_DITSNANCE > r.y ||
            t.top + t.height + FlowChart.LINK_DITSNANCE < r.y
            ? (o.push({ x: i.x, y: i.y }),
              o.push({
                x: t.left + t.width + FlowChart.LINK_DITSNANCE,
                y: i.y,
              }),
              o.push({
                x: t.left + t.width + FlowChart.LINK_DITSNANCE,
                y: r.y,
              }),
              o.push({ x: r.x, y: r.y }))
            : e.left + e.width + FlowChart.LINK_DITSNANCE <
              t.left - FlowChart.LINK_DITSNANCE
            ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
              o.push({ x: i.x, y: i.y }),
              o.push({
                x: t.left + t.width + FlowChart.LINK_DITSNANCE,
                y: i.y,
              }),
              o.push({
                x: t.left + t.width + FlowChart.LINK_DITSNANCE,
                y: t.top + t.height + FlowChart.LINK_DITSNANCE,
              }),
              o.push({ x: s, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
              o.push({ x: s, y: r.y }),
              o.push({ x: r.x, y: r.y }))
            : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : e.top - FlowChart.LINK_DITSNANCE > i.y ||
            e.top + e.height + FlowChart.LINK_DITSNANCE < i.y
          ? ((d = Math.max(t.left + t.width, e.left + e.width)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: d + FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({ x: d + FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : e.left + e.width - (t.left + t.width) > FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({
              x: t.left + t.width + FlowChart.LINK_DITSNANCE,
              y: e.top + e.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({
              x: e.left + e.width + FlowChart.LINK_DITSNANCE,
              y: e.top + e.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: e.left + e.width + FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.left &&
          r.position == FlowChart.position.left
        ? r.x > i.x
          ? t.top - FlowChart.LINK_DITSNANCE > r.y ||
            t.top + t.height + FlowChart.LINK_DITSNANCE < r.y
            ? (o.push({ x: i.x, y: i.y }),
              o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
              o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: r.y }),
              o.push({ x: r.x, y: r.y }))
            : e.left - FlowChart.LINK_DITSNANCE >
              t.left + t.width + FlowChart.LINK_DITSNANCE
            ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
              o.push({ x: i.x, y: i.y }),
              o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
              o.push({
                x: t.left - FlowChart.LINK_DITSNANCE,
                y: t.top + t.height + FlowChart.LINK_DITSNANCE,
              }),
              o.push({ x: s, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
              o.push({ x: s, y: r.y }),
              o.push({ x: r.x, y: r.y }))
            : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : e.top - FlowChart.LINK_DITSNANCE > i.y ||
            e.top + e.height + FlowChart.LINK_DITSNANCE < i.y
          ? ((c = Math.min(t.left, e.left)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: c - FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({ x: c - FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : t.left - (e.left + e.width) > FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({
              x: t.left - FlowChart.LINK_DITSNANCE,
              y: e.top + e.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({
              x: e.left - FlowChart.LINK_DITSNANCE,
              y: e.top + e.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: e.left - FlowChart.LINK_DITSNANCE, y: r.y }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.top &&
          r.position == FlowChart.position.top
        ? r.y < i.y
          ? t.left - FlowChart.LINK_DITSNANCE > r.x ||
            t.left + t.width + FlowChart.LINK_DITSNANCE < r.x
            ? (o.push({ x: i.x, y: i.y }),
              o.push({ x: i.x, y: e.top - FlowChart.LINK_DITSNANCE }),
              o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
              o.push({ x: r.x, y: r.y }))
            : e.top + e.height + FlowChart.LINK_DITSNANCE <
              t.top - FlowChart.LINK_DITSNANCE
            ? (o.push({ x: i.x, y: i.y }),
              o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
              o.push({
                x: e.left - FlowChart.LINK_DITSNANCE,
                y: t.top - FlowChart.LINK_DITSNANCE,
              }),
              o.push({
                x: e.left - FlowChart.LINK_DITSNANCE,
                y: e.top - FlowChart.LINK_DITSNANCE,
              }),
              o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
              o.push({ x: r.x, y: r.y }))
            : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : e.left - FlowChart.LINK_DITSNANCE > i.x ||
            e.left + e.width + FlowChart.LINK_DITSNANCE < i.x
          ? ((l = Math.min(t.top, e.top)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: l - FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: l - FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height - (t.top + t.height) > FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top - FlowChart.LINK_DITSNANCE }),
            o.push({
              x: t.left - FlowChart.LINK_DITSNANCE,
              y: t.top - FlowChart.LINK_DITSNANCE,
            }),
            o.push({
              x: t.left - FlowChart.LINK_DITSNANCE,
              y: e.top - FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.bottom &&
          r.position == FlowChart.position.bottom
        ? r.y < i.y
          ? t.left - FlowChart.LINK_DITSNANCE > r.x ||
            t.left + t.width + FlowChart.LINK_DITSNANCE < r.x
            ? (o.push({ x: i.x, y: i.y }),
              o.push({
                x: i.x,
                y: t.top + t.height + FlowChart.LINK_DITSNANCE,
              }),
              o.push({
                x: r.x,
                y: t.top + t.height + FlowChart.LINK_DITSNANCE,
              }),
              o.push({ x: r.x, y: r.y }))
            : e.top + e.height + FlowChart.LINK_DITSNANCE <
              t.top - FlowChart.LINK_DITSNANCE
            ? (o.push({ x: i.x, y: i.y }),
              o.push({
                x: i.x,
                y: t.top + t.height + FlowChart.LINK_DITSNANCE,
              }),
              o.push({
                x: t.left - FlowChart.LINK_DITSNANCE,
                y: t.top + t.height + FlowChart.LINK_DITSNANCE,
              }),
              o.push({
                x: t.left - FlowChart.LINK_DITSNANCE,
                y: t.top - FlowChart.LINK_DITSNANCE,
              }),
              o.push({ x: r.x, y: t.top - FlowChart.LINK_DITSNANCE }),
              o.push({ x: r.x, y: r.y }))
            : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : e.left - FlowChart.LINK_DITSNANCE > i.x ||
            e.left + e.width + FlowChart.LINK_DITSNANCE < i.x
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height - (t.top + t.height) > FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: i.x, y: t.top + t.height + FlowChart.LINK_DITSNANCE }),
            o.push({
              x: e.left - FlowChart.LINK_DITSNANCE,
              y: t.top + t.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({
              x: e.left - FlowChart.LINK_DITSNANCE,
              y: e.top + e.height + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.left &&
          r.position == FlowChart.position.bottom
        ? e.left + e.width + FlowChart.LINK_DITSNANCE >
            t.left - FlowChart.LINK_DITSNANCE &&
          e.left - FlowChart.LINK_DITSNANCE <
            t.left + t.width + FlowChart.LINK_DITSNANCE &&
          e.top + e.height + FlowChart.LINK_DITSNANCE >
            t.top - FlowChart.LINK_DITSNANCE &&
          e.top - FlowChart.LINK_DITSNANCE <
            t.top + t.height + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : r.y + FlowChart.LINK_DITSNANCE < i.y &&
            r.x < t.left - FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: r.x, y: i.y }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height + FlowChart.LINK_DITSNANCE <
            t.top - FlowChart.LINK_DITSNANCE
          ? ((h = e.top + e.height + (t.top - (e.top + e.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: h }),
            o.push({ x: r.x, y: h }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height + FlowChart.LINK_DITSNANCE >
              t.top - FlowChart.LINK_DITSNANCE &&
            e.left + e.width + FlowChart.LINK_DITSNANCE >
              t.left - FlowChart.LINK_DITSNANCE
          ? ((n = Math.max(e.top + e.height, t.top + t.height)),
            (c = Math.min(e.left, t.left)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: c - FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({
              x: c - FlowChart.LINK_DITSNANCE,
              y: n + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: r.x, y: n + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height + FlowChart.LINK_DITSNANCE > t.top
          ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: s, y: i.y }),
            o.push({ x: s, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.left &&
          r.position == FlowChart.position.top
        ? e.left + e.width + FlowChart.LINK_DITSNANCE >
            t.left - FlowChart.LINK_DITSNANCE &&
          e.left - FlowChart.LINK_DITSNANCE <
            t.left + t.width + FlowChart.LINK_DITSNANCE &&
          e.top + e.height + FlowChart.LINK_DITSNANCE >
            t.top - FlowChart.LINK_DITSNANCE &&
          e.top - FlowChart.LINK_DITSNANCE <
            t.top + t.height + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : r.y > i.y && r.x < t.left - FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: r.x, y: i.y }),
            o.push({ x: r.x, y: r.y }))
          : e.top - FlowChart.LINK_DITSNANCE >=
            t.top + t.height + FlowChart.LINK_DITSNANCE
          ? ((h = e.top + e.height + (t.top - (e.top + e.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({ x: t.left - FlowChart.LINK_DITSNANCE, y: h }),
            o.push({ x: r.x, y: h }),
            o.push({ x: r.x, y: r.y }))
          : e.top - FlowChart.LINK_DITSNANCE <
              t.top + t.height + FlowChart.LINK_DITSNANCE &&
            e.left + e.width + FlowChart.LINK_DITSNANCE >
              t.left - FlowChart.LINK_DITSNANCE
          ? ((l = Math.min(e.top, t.top)),
            (c = Math.min(e.left, t.left)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: c - FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({
              x: c - FlowChart.LINK_DITSNANCE,
              y: l - FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: r.x, y: l - FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : e.top + FlowChart.LINK_DITSNANCE < t.top + t.height
          ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: s, y: i.y }),
            o.push({ x: s, y: e.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.right &&
          r.position == FlowChart.position.bottom
        ? e.left + e.width + FlowChart.LINK_DITSNANCE >
            t.left - FlowChart.LINK_DITSNANCE &&
          e.left - FlowChart.LINK_DITSNANCE <
            t.left + t.width + FlowChart.LINK_DITSNANCE &&
          e.top + e.height + FlowChart.LINK_DITSNANCE >
            t.top - FlowChart.LINK_DITSNANCE &&
          e.top - FlowChart.LINK_DITSNANCE <
            t.top + t.height + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
          : r.y < i.y && r.x > t.left + t.width + FlowChart.LINK_DITSNANCE
          ? (o.push({ x: i.x, y: i.y }),
            o.push({ x: r.x, y: i.y }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height + FlowChart.LINK_DITSNANCE <=
            t.top - FlowChart.LINK_DITSNANCE
          ? ((h = e.top + e.height + (t.top - (e.top + e.height)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: h }),
            o.push({ x: r.x, y: h }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height + FlowChart.LINK_DITSNANCE >
              t.top - FlowChart.LINK_DITSNANCE &&
            e.left - FlowChart.LINK_DITSNANCE <
              t.left + t.width + FlowChart.LINK_DITSNANCE
          ? ((n = Math.max(e.top + e.height, t.top + t.height)),
            (d = Math.max(e.left + e.width, t.left + t.width)),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: d + FlowChart.LINK_DITSNANCE, y: i.y }),
            o.push({
              x: d + FlowChart.LINK_DITSNANCE,
              y: n + FlowChart.LINK_DITSNANCE,
            }),
            o.push({ x: r.x, y: n + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : e.top + e.height + FlowChart.LINK_DITSNANCE > t.top
          ? ((s = t.left + t.width + (e.left - (t.left + t.width)) / 2),
            o.push({ x: i.x, y: i.y }),
            o.push({ x: s, y: i.y }),
            o.push({ x: s, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: e.top + e.height + FlowChart.LINK_DITSNANCE }),
            o.push({ x: r.x, y: r.y }))
          : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
        : i.position == FlowChart.position.right &&
          r.position == FlowChart.position.top &&
          (e.left + e.width + FlowChart.LINK_DITSNANCE >
            t.left - FlowChart.LINK_DITSNANCE &&
          e.left - FlowChart.LINK_DITSNANCE <
            t.left + t.width + FlowChart.LINK_DITSNANCE &&
          e.top + e.height + FlowChart.LINK_DITSNANCE >
            t.top - FlowChart.LINK_DITSNANCE &&
          e.top - FlowChart.LINK_DITSNANCE <
            t.top + t.height + FlowChart.LINK_DITSNANCE
            ? (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y }))
            : r.y - FlowChart.LINK_DITSNANCE > i.y &&
              r.x > t.left + t.width + FlowChart.LINK_DITSNANCE
            ? (o.push({ x: i.x, y: i.y }),
              o.push({ x: r.x, y: i.y }),
              o.push({ x: r.x, y: r.y }))
            : e.top - FlowChart.LINK_DITSNANCE >
              t.top + t.height + FlowChart.LINK_DITSNANCE
            ? ((h = e.top + e.height + (t.top - (e.top + e.height)) / 2),
              o.push({ x: i.x, y: i.y }),
              o.push({
                x: t.left + t.width + FlowChart.LINK_DITSNANCE,
                y: i.y,
              }),
              o.push({ x: t.left + t.width + FlowChart.LINK_DITSNANCE, y: h }),
              o.push({ x: r.x, y: h }),
              o.push({ x: r.x, y: r.y }))
            : e.top - FlowChart.LINK_DITSNANCE <
                t.top + t.height + FlowChart.LINK_DITSNANCE &&
              e.left - FlowChart.LINK_DITSNANCE <
                t.left + t.width + FlowChart.LINK_DITSNANCE
            ? ((l = Math.min(e.top, t.top)),
              (d = Math.max(e.left + e.width, t.left + t.width)),
              o.push({ x: i.x, y: i.y }),
              o.push({ x: d + FlowChart.LINK_DITSNANCE, y: i.y }),
              o.push({
                x: d + FlowChart.LINK_DITSNANCE,
                y: l - FlowChart.LINK_DITSNANCE,
              }),
              o.push({ x: r.x, y: l - FlowChart.LINK_DITSNANCE }),
              o.push({ x: r.x, y: r.y }))
            : e.top + FlowChart.LINK_DITSNANCE < t.top + t.height
            ? ((s = e.left + e.width + (t.left - (e.left + e.width)) / 2),
              o.push({ x: i.x, y: i.y }),
              o.push({ x: s, y: i.y }),
              o.push({ x: s, y: e.top - FlowChart.LINK_DITSNANCE }),
              o.push({ x: r.x, y: e.top - FlowChart.LINK_DITSNANCE }),
              o.push({ x: r.x, y: r.y }))
            : (o.push({ x: i.x, y: i.y }), o.push({ x: r.x, y: r.y })));
    var p = { points: o, fromShape: t, toShape: e, fromPort: i, toPort: r };
    return FlowChart.events.publish("link-points", [a, p]), p.points;
  }),
  (FlowChart.private.prototype.handlerKeyup = function (t) {
    var e = FlowChart.private.replaceRightLeftKeyCodes(t.code),
      i = t.key.toLowerCase(),
      r = this.keysPressed.indexOf(e);
    -1 != r &&
      (this.keysPressed.splice(r, 1),
      this.updateMatchedShortcuts(t, void 0, i)),
      (this.matchedShortcuts.includes("move_selected_nodes_left") &&
        this.matchedShortcuts.includes("move_selected_nodes_right")) ||
        this.chart.nodes._.stopMoving(FlowChart.direction.horizontal),
      (this.matchedShortcuts.includes("move_selected_nodes_up") &&
        this.matchedShortcuts.includes("move_selected_nodes_down")) ||
        this.chart.nodes._.stopMoving(FlowChart.direction.vertical);
  }),
  (FlowChart.private.prototype.handlerKeydown = function (t) {
    var e = t.key.toLowerCase();
    "shift" == e &&
      (this.chart.selectedShapes._.arrayBeforeShiftPressed =
        this.chart.selectedShapes.slice());
    var i = FlowChart.private.replaceRightLeftKeyCodes(t.code);
    this.keysPressed.includes(i) ||
      (this.keysPressed.push(i), this.updateMatchedShortcuts(t, e, void 0));
  }),
  (FlowChart.private.prototype.handlerInput = function (t) {
    if (this.chart.editor.hasActiveField()) {
      for (var e = t.target; !e.hasAttribute("data-shape-id"); )
        e = e.parentNode;
      var i = e.getAttribute("data-shape-id"),
        r = this.chart.getShape(i);
      if (
        (this.chart.editor.edit(r),
        r.canWidthFitContent || r.canHeightFitContent)
      ) {
        for (
          var a = t.target;
          !a.hasAttribute || !a.hasAttribute("data-html-container");

        )
          a = a.parentNode;
        var o = this.chart._.getSizeOfHTML(a.innerHTML);
        r.canWidthFitContent &&
          ("label" == r.type
            ? this.chart.labels._.setWidth(r, o.width)
            : this.chart.nodes._.setWidth(r, o.width)),
          r.canHeightFitContent &&
            ("label" == r.type
              ? this.chart.labels._.setHeight(r, o.height)
              : this.chart.nodes._.setHeight(r, o.height));
      }
    }
  }),
  (FlowChart.private.prototype.handlerDblclick = function (t) {
    for (
      var e = t.target;
      e && e.hasAttribute && e != this.chart.svgElement;

    ) {
      if (e.hasAttribute("data-link-id")) {
        var i = e.getAttribute("data-link-id"),
          r = this.chart.links.getById(i),
          a = FlowChart.private.getFirstPointIndexByMousePosition(
            t,
            this.chart.svgElement,
            r
          );
        FlowChart.direction.horizontal,
          r.points[a].x == r.points[a + 1].x && FlowChart.direction.vertical;
        for (var o = 0, s = 0; s < a; s++) {
          var h = r.points[s],
            l = r.points[s + 1];
          o += Math.hypot(l.x - h.x, l.y - h.y);
        }
        var n = this.chart.svgElement.createSVGPoint();
        (n.x = t.clientX),
          (n.y = t.clientY),
          (n = n.matrixTransform(
            this.chart.svgElement.getScreenCTM().inverse()
          ));
        var c =
            (o += Math.hypot(n.x - r.points[a].x, n.y - r.points[a].y)) /
            (r.length / 100),
          d = {
            from: r.from,
            to: r.to,
            fromPort: r.fromPort,
            toPort: r.toPort,
            position: c,
            content: c,
          };
        return (
          (d = this.chart.labels.add(d)),
          this.chart.editor.edit(d.id),
          void (d.selected = !0)
        );
      }
      e = e.parentNode;
    }
  }),
  (FlowChart.private.prototype.handlerMousemove = function (t) {
    for (var e = t.target, i = null, r = null; e && e != this.element; ) {
      if (e && e.hasAttribute) {
        if (e.hasAttribute("data-link-id")) {
          (i = this.chart.links.getById(e.getAttribute("data-link-id"))),
            (r = "link");
          break;
        }
        if (e.hasAttribute("data-shape-id")) {
          (i = this.chart.getShape(e.getAttribute("data-shape-id"))),
            (r = "node");
          break;
        }
        if (e.hasAttribute("data-selector-shape-id")) {
          (i = this.chart.getShape(e.getAttribute("data-selector-shape-id"))),
            (r = "node");
          break;
        }
        if (e.hasAttribute("data-ports-s-id")) {
          (i = this.chart.nodes.get(e.getAttribute("data-ports-s-id"))),
            (r = "node");
          break;
        }
        if (e.hasAttribute("data-port-out-port")) {
          var a = e.getAttribute("data-port-out-port"),
            o = e.getAttribute("data-port-out-shape");
          (i = this.chart.ports.get(o, a)), (r = "port");
          break;
        }
        if (e.hasAttribute("data-portsb-shape")) {
          (i = e.getAttribute("data-portsb-shape")), (r = "portshapebart");
          break;
        }
      }
      e = e.parentNode;
    }
    null != this.mouseOverShapeType && null == i
      ? ("node" == this.mouseOverShapeType
          ? this.handlerMouseleaveOnShape(this.mouseOverShape)
          : "port" == this.mouseOverShapeType ||
            "link" == this.mouseOverShapeType ||
            ("portshapebart" == this.mouseOverShapeType &&
              this.handlerMouseleaveOnMiniShapeBar()),
        (this.mouseOverShape = null),
        (this.mouseOverShapeType = null))
      : JSON.stringify(this.mouseOverShape) !== JSON.stringify(i) &&
        (null != i
          ? "node" == r
            ? ("port" == this.mouseOverShapeType
                ? this.handlerMouseleaveOnMiniShapeBar()
                : "link" == this.mouseOverShapeType ||
                  ("portshapebart" == this.mouseOverShapeType &&
                    this.handlerMouseleaveOnMiniShapeBar()),
              this.handlerMouseenterOnShape(t, i))
            : "port" == r
            ? ("node" == this.mouseOverShapeType ||
                "link" == this.mouseOverShapeType ||
                this.mouseOverShapeType,
              this.handlerMouseenterOnPortOut(t, i))
            : "link" == r
            ? ("port" == this.mouseOverShapeType ||
                "node" == this.mouseOverShapeType ||
                this.mouseOverShapeType,
              this.handlerMouseenterOnLink(t, i))
            : "portshapebart" == r &&
              ("port" == this.mouseOverShapeType ||
                "node" == this.mouseOverShapeType ||
                this.mouseOverShapeType)
          : this.mouseOverShape,
        (this.mouseOverShape = i),
        (this.mouseOverShapeType = r));
  }),
  (FlowChart.private.prototype.handlerTouchstartMousedown = function (t, e, i) {
    for (var r = e.target; r && r != this.chart.element; ) {
      if (
        r &&
        r.classList &&
        r.classList.contains &&
        r.classList.contains("bfc-bar-move")
      )
        return void this.handlerTouchstartMousedownOnBarMove(t, e, i, r);
      if (r && r.hasAttribute && r.hasAttribute("data-selector-dot-2"))
        return void this.handlerTouchstartMousedownOnResizeDot(t, e, i, r);
      if (r && r.hasAttribute && r.hasAttribute("data-shapebar-item-id"))
        return void this.handlerDownOnShapeBarItem(e, i, r);
      if (r && r.hasAttribute && r.hasAttribute("data-shape-id")) {
        var a = this.chart.getShape(r.getAttribute("data-shape-id"));
        return void this.handlerTouchstartMousedownOnShape(e, i, a, !0);
      }
      if (r && r.hasAttribute && r.hasAttribute("data-link-id")) {
        var o = r.getAttribute("data-link-id");
        return void this.handlerTouchstartMousedownOnLink(e, i, o);
      }
      if (r && r.hasAttribute && r.hasAttribute("data-port-out-port"))
        return void this.handlerTouchstartMousedownOnPortOut(e, r, i);
      r == this.chart.svgElement &&
        this.handlerTouchstartMousedownOnSvg(t, e, i, r),
        (r = r.parentNode);
    }
  }),
  (FlowChart.private.prototype.handlerTouchendClick = function (t) {
    var e,
      i = t.target;
    if (
      (i.hasAttribute("data-field-selector") &&
        (e = i.getAttribute("data-field-selector")),
      this.chart.svgElement != i)
    )
      for (; i && i.hasAttribute; ) {
        if (i.hasAttribute("data-shape-id")) {
          var r = i.getAttribute("data-shape-id");
          if (e) {
            var a = this.chart.getShape(r);
            this.chart.editor.edit(a, e);
          } else
            (n = { event: t, shapeId: r }),
              FlowChart.events.publish("shape-click", [this.chart, n]),
              this.handlerShapeClick(r, t);
          return;
        }
        if (i.hasAttribute("data-menu-item")) {
          var o = i.getAttribute("data-menu-item");
          return (
            this.chart.menuBar._.handlerClick(t, o, i),
            void this.chart.colorBar._.handlerClick(t, o, i)
          );
        }
        if (i.hasAttribute("data-portshapebar-item-id")) {
          for (
            var s = i.getAttribute("data-portshapebar-item-id");
            !i.hasAttribute("data-portsb-shape");

          )
            i = i.parentNode;
          r = i.getAttribute("data-portsb-shape");
          var h = i.getAttribute("data-portsb-port"),
            l = this.chart.ports.get(r, h);
          return void this.addNodeWithLink(l, s);
        }
        i = i.parentNode;
      }
    else {
      this.chart.selectedShapes.clear();
      var n = { event: t };
      FlowChart.events.publish("svg-click", [this.chart, n]);
    }
  }),
  (FlowChart.private.prototype.handlerMouseenterOnLink = function (t, e) {
    var i = e,
      r = FlowChart.private.getFirstPointIndexByMousePosition(
        t,
        this.chart.svgElement,
        i
      ),
      a = FlowChart.direction.horizontal;
    i.points[r].x == i.points[r + 1].x && (a = FlowChart.direction.vertical),
      t.target.classList.remove("bfc-cursor-row-resize"),
      t.target.classList.remove("bfc-cursor-col-resize"),
      a == FlowChart.direction.vertical
        ? t.target.classList.add("bfc-cursor-col-resize")
        : a == FlowChart.direction.horizontal &&
          t.target.classList.add("bfc-cursor-row-resize");
  }),
  (FlowChart.private.prototype.handlerMouseenterOnShape = function (t, e) {
    var i = this;
    this.handlerMouseenterOnShapeTimeOut &&
      (clearTimeout(this.handlerMouseenterOnShapeTimeOut),
      (this.handlerMouseenterOnShapeTimeOut = null)),
      (this.handlerMouseenterOnShapeTimeOut = setTimeout(function () {
        i.chart.selectedPortShape = e;
      }, 700));
  }),
  (FlowChart.private.prototype.handlerMouseleaveOnLink = function (t) {}),
  (FlowChart.private.prototype.handlerMouseleaveOnShape = function (t) {
    (this.chart.selectedPortShape = null),
      this.handlerMouseenterOnShapeTimeOut &&
        (clearTimeout(this.handlerMouseenterOnShapeTimeOut),
        (this.handlerMouseenterOnShapeTimeOut = null));
  }),
  (FlowChart.private.prototype.handlerMouseenterOnPortOut = function (t, e) {
    this.chart.selectedPort = e;
  }),
  (FlowChart.private.prototype.handlerMouseleaveOnPortOut = function (
    t,
    e,
    i
  ) {}),
  (FlowChart.private.prototype.handlerMouseleaveOnMiniShapeBar = function () {
    (this.chart.selectedPort = null), (this.chart.selectedPortShape = null);
  }),
  (FlowChart.Menu = class {
    _;
    element;
    constructor(t) {
      (this._ = new FlowChart.Menu.private(t)), (this.element = null);
    }
    init() {}
    hide() {
      null != this.element &&
        (this.element.parentNode.removeChild(this.element),
        (this.element = null));
    }
    show(t, e, i, r) {
      var a = this;
      this.hide(), r || (r = this.menu);
      var o = "";
      for (var s in r) {
        var h = r[s].icon,
          l = r[s].text;
        void 0 === h &&
          (h = FlowChart.icon[s]
            ? FlowChart.icon[s](24, 24, "#7A7A7A", 0, 0)
            : ""),
          "function" == typeof l && (l = l()),
          "function" == typeof h && (h = h()),
          (o += `<div data-item="${s}">${h}<span>&nbsp;&nbsp;${l}</span></div>`);
      }
      if ("" != o) {
        if (
          ((this.element = document.createElement("div")),
          (this.element.className = "bfc-chart-menu"),
          (this.element.style.left = "-99999px"),
          (this.element.style.top = "-99999px"),
          (this.element.innerHTML = o),
          this._.chart.element.appendChild(this.element),
          null == e)
        ) {
          var n = FlowChart.private.stickPosition(
            t,
            this.element,
            this._.chart.svgElement
          );
          (t = n.x), (e = n.y);
        }
        var c = t + 45;
        (this.element.style.left = c + "px"),
          (this.element.style.top = e + "px"),
          (this.element.style.left = c - this.element.offsetWidth + "px");
        var d = t - this.element.offsetWidth;
        FlowChart.animate(
          this.element,
          { opacity: 0, left: c - this.element.offsetWidth },
          { opacity: 1, left: d },
          300,
          FlowChart.anim.inOutPow
        );
        for (
          var p = this.element.getElementsByTagName("div"), u = 0;
          u < p.length;
          u++
        )
          (s = p[u]).addEventListener("click", function (t) {
            var e,
              o = this.getAttribute("data-item");
            void 0 === r[o].onClick ||
              (e = r[o].onClick.call(a._.chart, { item: o, nodeId: i })),
              0 != e && a.hide();
          });
      }
    }
  }),
  (FlowChart.Menu.private = class {
    chart;
    constructor(t) {
      this.chart = t;
    }
  }),
  (FlowChart.private.prototype.handlerDownOnShapeBarItem = function (t, e, i) {
    var r = this;
    this.chart.selectedShapes.clear();
    var a = i.getAttribute("data-shapebar-item-id"),
      o = this.chart.element
        .querySelector(`[data-shapebar-item-id="${a}"]`)
        .querySelector("svg"),
      s = o.getBoundingClientRect(),
      h = r.chart.shapeBar.element.getBoundingClientRect(),
      l = FlowChart.private.getClientTouchesXY(t, 0),
      n = s.width / (l.x - s.x),
      c = s.height / (l.y - s.y),
      d = function (u) {
        var f = FlowChart.private.getClientTouchesXY(u, 0);
        if (
          h.x < f.x &&
          h.x + h.width > f.x &&
          h.y < f.y &&
          h.y + h.height > f.y
        )
          !(function (t) {
            var e = r.chart.element.querySelector(
                ".bfc-drag-inside-shapes-palette"
              ),
              i = r.chart.svgElement.querySelector(
                '[data-shape-id="drag-inside-canvas"]'
              );
            e ||
              (((e = o.cloneNode(!0)).style.position = "absolute"),
              (e.style.top = s.y + "px"),
              (e.style.left = s.x + "px"),
              (e.style.width = s.width + "px"),
              (e.style.height = s.height + "px"),
              e.classList.add("bfc-drag-inside-shapes-palette"),
              r.chart.element.appendChild(e)),
              (e.style.top = s.y + (t.y - l.y) + "px"),
              (e.style.left = s.x + (t.x - l.x) + "px"),
              i && i.parentNode.removeChild(i);
          })(f);
        else {
          var y = r.chart.svgElement.createSVGPoint();
          (y.x = f.x),
            (y.y = f.y),
            (function (o) {
              var s = r.chart.element.querySelector(
                ".bfc-drag-inside-shapes-palette"
              );
              if (
                !r.chart.svgElement.querySelector(
                  '[data-shape-id="drag-inside-canvas"]'
                )
              ) {
                var h = { templateId: a, x: o.x, y: o.y },
                  l = FlowChart.shapeTemplates[h.templateId],
                  u = "fit" == l.width ? l.minWidth : l.width,
                  f = "fit" == l.height ? l.minHeight : l.height,
                  y = u / n,
                  m = f / c;
                isNaN(y) && (y = i.offsetWidth / 2),
                  isNaN(m) && (m = i.offsetHeight / 2),
                  (h.x -= y - u / 2),
                  (h.y -= m - f / 2),
                  r.chart.nodes.add(h),
                  (h = r.chart.nodes.get(h.id)),
                  r.chart.element.removeEventListener(e.move, d),
                  r.chart.element.removeEventListener(e.up, p),
                  e.leave && r.chart.element.removeEventListener(e.leave, p),
                  r.handlerTouchstartMousedownOnShape(t, e, h);
              }
              s && s.parentNode.removeChild(s);
            })(y.matrixTransform(r.chart.svgElement.getScreenCTM().inverse()));
        }
      },
      p = function (t) {
        var i = r.chart.element.querySelector(
          ".bfc-drag-inside-shapes-palette"
        );
        i && i.parentNode.removeChild(i);
        var o = r.chart.svgElement.querySelector(
          '[data-shape-id="drag-inside-canvas"]'
        );
        if (o) {
          var s = FlowChart._getBox(o, r.nodes);
          o.parentNode.removeChild(o),
            r.addNode({ templateId: a, x: s.x1, y: s.y1 });
        }
        FlowChart.private.removeAlignmentLineElements(r.chart.svgElement),
          r.chart.element.removeEventListener(e.move, d),
          r.chart.element.removeEventListener(e.up, p),
          e.leave && r.chart.element.removeEventListener(e.leave, p);
      };
    this.chart.element.addEventListener(e.move, d, { passive: !0 }),
      this.chart.element.addEventListener(e.up, p);
  }),
  (FlowChart.private.prototype.handlerTouchstartMousedownOnLink = function (
    t,
    e,
    i
  ) {
    var r = this;
    (this.chart.selectedPortShape = null), this.chart.selectedShapes.clear();
    var a = this.chart.links.getById(i),
      o = this.chart.scale,
      s = JSON.parse(JSON.stringify(a.points)),
      h = FlowChart.private.getClientTouchesXY(t, 0),
      l = FlowChart.private.getFirstPointIndexByMousePosition(
        t,
        this.chart.svgElement,
        a
      ),
      n = FlowChart.direction.horizontal;
    a.points[l].x == a.points[l + 1].x && (n = FlowChart.direction.vertical);
    var c = function (t) {
        var e = FlowChart.private.getClientTouchesXY(t, 0);
        n == FlowChart.direction.horizontal
          ? ((a.points[l].y = (e.y - h.y + s[l].y * o) / o),
            (a.points[l + 1].y = (e.y - h.y + s[l + 1].y * o) / o))
          : n == FlowChart.direction.vertical &&
            ((a.points[l].x = (e.x - h.x + s[l].x * o) / o),
            (a.points[l + 1].x = (e.x - h.x + s[l + 1].x * o) / o));
      },
      d = function (t) {
        r.chart.element.removeEventListener(e.move, c),
          r.chart.element.removeEventListener(e.up, d),
          e.leave && r.chart.element.removeEventListener(e.leave, d);
      };
    this.chart.element.addEventListener(e.move, c, { passive: !0 }),
      this.chart.element.addEventListener(e.up, d);
  }),
  (FlowChart.private.prototype.handlerTouchstartMousedownOnPortOut = function (
    t,
    e,
    i
  ) {
    var r = e.getAttribute("data-port-out-port"),
      a = e.getAttribute("data-port-out-shape"),
      o = FlowChart.private.getClientTouchesXY(t, 0),
      s = this.chart.svgElement.createSVGPoint();
    (s.x = o.x),
      (s.y = o.y),
      (s = s.matrixTransform(this.chart.svgElement.getScreenCTM().inverse()));
    var h = {
      id: `psuedo${this.chart.generateId()}`,
      templateId: "psuedo",
      x: s.x,
      y: s.y,
    };
    this.chart.nodes.add(h);
    var l = this.chart.nodes.get(h.id);
    this.chart.links.add({
      from: a,
      fromPort: r,
      to: h.id,
      templateId: "psuedo",
    }),
      this.handlerTouchstartMousedownOnShape(t, i, l, !0);
  }),
  (FlowChart.private.prototype.handlerTouchstartMousedownOnShape = function (
    t,
    e,
    i,
    r
  ) {
    var a = this,
      o = this.chart.scale;
    if (i.selectable) {
      this.matchedShortcuts.includes("select_multiple_nodes")
        ? (i.selected = !i.selected)
        : i.selected ||
          (this.chart.selectedShapes.clear(),
          (i.selected = !0),
          r && this.makeShapesVisible([i]));
      var s = {};
      for (var h of this.chart.selectedShapes) {
        if (!h.movable) return;
        s[h.id] = { x: h.x * o, y: h.y * o };
      }
      var l = FlowChart.private.getClientTouchesXY(t, 0),
        n = 0,
        c = 0,
        d = null,
        p = function (t) {
          (a.chart.selectedPortShape = null), a.chart.selectedShapes._.hideUI();
          var e = FlowChart.private.getClientTouchesXY(t, 0);
          for (var r of a.chart.selectedShapes)
            (r.x = (e.x - l.x + s[r.id].x) / o),
              (r.y = (e.y - l.y + s[r.id].y) / o);
          if ("label" == i.type) (n = (e.x - l.x) / o), (c = (e.y - l.y) / o);
          else if ("psuedo-node" == i.type) {
            var h = a.chart.links.getByShape(i)[0],
              p = a.chart.ports.get(h.from, h.fromPort),
              u = Number.MAX_VALUE,
              f = null;
            for (var y of a.chart.ports)
              if (y.shape != i && y.shape != p.shape) {
                var m = Math.hypot(y.x - i.x, y.y - i.y);
                m < u && ((u = m), (f = y));
              }
            if (FlowChart.MAGNET_PORT > u) {
              if (((h.element.style.visibility = "hidden"), !d)) {
                var g = f.shape.id,
                  v = f.id;
                d = a.chart.links.add({
                  from: h.from,
                  fromPort: p.id,
                  to: g,
                  toPort: v,
                  templateId: "psuedo",
                });
              }
            } else
              (h.element.style.visibility = ""),
                d && (a.chart.links.remove(d), (d = null));
          }
          "node" == i.type &&
            FlowChart.private.magnet(
              a.chart.selectedShapes.nodes,
              a.chart.nodes,
              a.chart.svgElement,
              o
            );
        },
        u = function (t) {
          "label" == i.type
            ? (null == i.movex && (i.movex = 0),
              (i.movex += n),
              null == i.movey && (i.movey = 0),
              (i.movey += c))
            : "psuedo-node" == i.type &&
              (a.chart.nodes.remove(i), d && (d.templateId = "rounded")),
            a.chart.selectedShapes._.showUI(),
            (a.chart.selectedPortShape = i),
            FlowChart.private.removeAlignmentLineElements(a.chart.svgElement),
            a.chart.element.removeEventListener(e.move, p),
            a.chart.element.removeEventListener(e.up, u),
            e.leave && a.chart.element.removeEventListener(e.leave, u);
        };
      this.chart.element.addEventListener(e.move, p, { passive: !0 }),
        this.chart.element.addEventListener(e.up, u);
    }
  }),
  (FlowChart.private.prototype.handlerTouchstartMousedownOnResizeDot =
    function (t, e, i, r) {
      var a = this;
      if (
        (this.mouseActions.includes("resize-shape") ||
          (this.mouseActions.push("resize-shape"),
          this.updateMatchedShortcuts(e)),
        this.matchedShortcuts.includes("resize_node"))
      ) {
        for (var o = r.parentNode; !o.hasAttribute("data-selector-shape-id"); )
          o = o.parentNode;
        var s = o.getAttribute("data-selector-shape-id"),
          h = this.chart.getShape(s),
          l = h.left,
          n = h.top,
          c = h.width,
          d = h.height,
          p = this.chart.scale,
          u = FlowChart.private.getClientTouchesXY(e, 0),
          f = function (t) {
            (a.chart.selectedPortShape = null),
              a.chart.editor.clearFieldBorders();
            var e = FlowChart.private.getClientTouchesXY(t, 0),
              i = e.x - u.x,
              o = u.y - e.y;
            (i /= p), (o /= p);
            var s = function (t) {
                var e = h.height,
                  r = h.width,
                  s = h.top,
                  p = h.left;
                "top" == t
                  ? a.matchedShortcuts.includes("centered_resize_shape")
                    ? ((e = d + 2 * o), (s = n - o))
                    : ((e = d + o), (s = n - o))
                  : "bottom" == t
                  ? a.matchedShortcuts.includes("centered_resize_shape")
                    ? ((e = d - 2 * o), (s = n + o))
                    : (e = d - o)
                  : "left" == t
                  ? a.matchedShortcuts.includes("centered_resize_shape")
                    ? ((r = c - 2 * i), (p = l + i))
                    : ((r = c - i), (p = l + i))
                  : "right" == t &&
                    (a.matchedShortcuts.includes("centered_resize_shape")
                      ? ((r = c + 2 * i), (p = l - i))
                      : (r = c + i)),
                  "top" == t || "bottom" == t
                    ? a.matchedShortcuts.includes(
                        "maintain_aspect_ratio_resize_shape"
                      ) &&
                      ((r = (r / h.height) * e),
                      a.matchedShortcuts.includes("centered_resize_shape") &&
                        (p -= (r - h.width) / 2))
                    : ("left" != t && "right" != t) ||
                      (a.matchedShortcuts.includes(
                        "maintain_aspect_ratio_resize_shape"
                      ) &&
                        ((e = (e / h.width) * r),
                        a.matchedShortcuts.includes("centered_resize_shape") &&
                          (s -= (e - h.height) / 2)));
                var u = FlowChart.shapeTemplates[h.templateId];
                r >= u.minWidth &&
                  r >= u.minHeight &&
                  ((h.width = r),
                  (h.height = e),
                  (h.x = p + h.width / 2),
                  (h.y = s + h.height / 2));
              },
              f = r.getAttribute("data-selector-dot-2");
            f == FlowChart.position.left
              ? s("left")
              : f == FlowChart.position.right
              ? s("right")
              : f == FlowChart.position.top
              ? s("top")
              : f == FlowChart.position.bottom
              ? s("bottom")
              : f == FlowChart.position.topLeft
              ? (s("top"), s("left"))
              : f == FlowChart.position.topRight
              ? (s("top"), s("right"))
              : f == FlowChart.position.bottomLeft
              ? (s("bottom"), s("left"))
              : f == FlowChart.position.bottomRight &&
                (s("bottom"), s("right")),
              FlowChart.private.magnetWhenResize(
                h,
                a.chart.nodes,
                a.chart.svgElement,
                r.getAttribute("data-selector-dot-2"),
                p
              );
          },
          y = function (t) {
            var e = a.mouseActions.indexOf("resize-shape");
            -1 != e &&
              (a.mouseActions.splice(e, 1), a.updateMatchedShortcuts(t)),
              FlowChart.private.removeAlignmentLineElements(a.chart.svgElement),
              a.chart.element.removeEventListener(i.move, f),
              a.chart.element.removeEventListener(i.up, y),
              i.leave && a.chart.element.removeEventListener(i.leave, y);
          };
        this.chart.element.addEventListener(i.move, f, { passive: !0 }),
          this.chart.element.addEventListener(i.up, y);
      }
    }),
  (FlowChart.private.prototype.handlerTouchstartMousedownOnSvg = function (
    t,
    e,
    i,
    r
  ) {
    var a = this;
    this.chart.selectedPortShape = null;
    var o = this.chart.viewBox,
      s = this.chart.scale,
      h = FlowChart.private.getClientTouchesXY(e, 0),
      l = FlowChart.private.getClientTouchesXY(e, 1),
      n = {
        diffX: 0,
        diffY: 0,
        x0: h.x,
        y0: h.y,
        type: "pan",
        viewBoxLeft: o[0],
        viewBoxTop: o[1],
        viewBox: JSON.parse(JSON.stringify(o)),
      };
    e.touches &&
      e.touches.length > 1 &&
      ((n.type = "pinch"),
      (n.dist = Math.sqrt(
        (h.x - l.x) * (h.x - l.x) + (h.y - l.y) * (h.y - l.y)
      ))),
      "pan" == n.type && a.chart.svgElement.classList.add("bfc-pan-cursor");
    var c = function (t) {
        var e = FlowChart.private.getClientTouchesXY(t, 0);
        if (n && "pan" == n.type) {
          (n.diffX = e.x - n.x0), (n.diffY = e.y - n.y0);
          var i = -n.diffY / s + n.viewBoxTop,
            r = -n.diffX / s + n.viewBoxLeft;
          (o[0] = r), (o[1] = i), (a.chart.viewBox = o);
        } else if (n && "pinch" == n.type) {
          var h = FlowChart.private.getClientTouchesXY(t, 1),
            l = Math.sqrt(
              (e.x - h.x) * (e.x - h.x) + (e.y - h.y) * (e.y - h.y)
            ),
            c = 1 + (l - n.dist) / (n.dist / 100) / 100;
          n.dist = l;
          var d = FlowChart.private.pinchMiddlePointInPercent(
            a.element,
            a.width(),
            a.height(),
            t
          );
          a.zoom(c, d);
        }
      },
      d = function () {
        "pan" == n.type && a.chart.options.sticky,
          "pan" == n.type &&
            a.chart.svgElement.classList.remove("bfc-pan-cursor"),
          (n = null),
          a.chart.svgElement.removeEventListener(i.move, c),
          a.chart.svgElement.removeEventListener(i.up, d);
      };
    this.chart.svgElement.addEventListener(i.move, c, { passive: !0 }),
      this.chart.svgElement.addEventListener(i.up, d);
  }),
  (FlowChart.private.prototype.handlerTouchstartMousedownOnBarMove = function (
    t,
    e,
    i,
    r
  ) {
    var a,
      o,
      s = this,
      h = FlowChart.private.getClientTouchesXY(e, 0);
    r.parentNode.hasAttribute("data-shapebar")
      ? ((a = s.chart.shapeBar), (o = "shapebar-position"))
      : r.parentNode.hasAttribute("data-colorbar")
      ? ((a = s.chart.colorBar), (o = "colorbar-position"))
      : r.parentNode.hasAttribute("data-menubar") &&
        ((a = s.chart.menuBar), (o = "menubar-position"));
    var l = a.element.getBoundingClientRect(),
      n = function (t) {
        var e = FlowChart.private.getClientTouchesXY(t, 0),
          i = e.x - h.x + l.left,
          r = e.y - h.y + l.top,
          n = i - s.svgBCR.left;
        n < FlowChart.MAGNET_WIN_PIXELS &&
          n > -FlowChart.MAGNET_WIN_PIXELS &&
          (i = s.svgBCR.left);
        var c = s.svgBCR.right - (i + l.width);
        c < FlowChart.MAGNET_WIN_PIXELS &&
          c > -FlowChart.MAGNET_WIN_PIXELS &&
          (i = s.svgBCR.right - l.width);
        var d = r - s.svgBCR.top;
        d < FlowChart.MAGNET_WIN_PIXELS &&
          d > -FlowChart.MAGNET_WIN_PIXELS &&
          (r = s.svgBCR.top);
        var p = s.svgBCR.bottom - (r + l.height);
        p < FlowChart.MAGNET_WIN_PIXELS &&
          p > -FlowChart.MAGNET_WIN_PIXELS &&
          (r = s.svgBCR.bottom - l.height),
          (a.element.style.right = "unset"),
          (a.element.style.bottom = "unset"),
          (a.element.style.left = i + "px"),
          (a.element.style.top = r + "px");
        var u = { left: i, top: r };
        try {
          sessionStorage.setItem(o, JSON.stringify(u));
        } catch (t) {
          t.code == t.QUOTA_EXCEEDED_ERR && sessionStorage.clear(),
            console.error(t);
        }
      },
      c = function (t) {
        s.chart.element.removeEventListener(i.move, n),
          s.chart.element.removeEventListener(i.up, c),
          i.leave && s.chart.element.removeEventListener(i.leave, c);
      };
    this.chart.element.addEventListener(i.move, n, { passive: !0 }),
      this.chart.element.addEventListener(i.up, c);
  }),
  (FlowChart.private.prototype.handlerMousewheel = function (t) {
    if (
      (this.mouseActions.includes("wheel") ||
        (this.mouseActions.push("wheel"), this.updateMatchedShortcuts(t)),
      this.matchedShortcuts.includes("zoom"))
    ) {
      this.chart.selectedPort = null;
      var e = this,
        i = !1,
        r = this.chart.options.zoom.speed,
        a = this.chart.options.zoom.smooth,
        o = 0,
        s = this.chart.scale,
        h = FlowChart.private.centerPointInPercent(
          this.chart.svgElement,
          t.pageX,
          t.pageY
        ),
        l =
          window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function (t) {
            setTimeout(t, 20);
          };
      t.preventDefault();
      var n = t.delta || t.wheelDelta;
      void 0 === n && (n = -t.detail),
        (n = Math.max(-1, Math.min(1, n))),
        (o += -n * r),
        i ||
          (function t() {
            i = !0;
            var r = (o - s) / a;
            r > 0 ? r++ : r--,
              (s += r),
              e.zoom(1 - r / 12 / 50, h),
              parseInt(s) == parseInt(o) ? (i = !1) : l(t);
          })();
    }
  }),
  (FlowChart.private.prototype.handlerShapeClick = function (t, e) {}),
  (FlowChart.private.prototype.handlerResizeOnSvgElement = function () {
    var t = this.chart.viewBox,
      e = this.chart.svgElement.getBoundingClientRect(),
      i = FlowChart.private.getScale(
        this.chart.viewBox,
        this.svgBCR.width,
        this.svgBCR.height
      );
    (t[2] = e.width / i),
      (t[3] = e.height / i),
      this.setViewBox(t),
      (this.svgBCR = e);
  }),
  (FlowChart.private.prototype.addListeners = function () {
    var t = this;
    new ResizeObserver(function (e) {
      t.handlerResizeOnSvgElement(e);
    }).observe(t.chart.svgElement),
      this.chart.options.interactive &&
        (document.addEventListener("click", function (e) {
          if (
            e.target.hasAttribute &&
            e.target.hasAttribute("data-field-selector")
          )
            return t.chart.active;
          for (var i = e.target; i && i != t.chart.element; ) i = i.parentNode;
          t.chart.active = i == t.chart.element;
        }),
        this.chart.element.addEventListener(
          "touchstart",
          function (e) {
            (t.touchendEnabledDevice = !0),
              t.handlerTouchstartMousedown(this, e, {
                move: "touchmove",
                up: "touchend",
                touchstart: "touchstart",
              });
          },
          { passive: !0 }
        ),
        this.chart.element.addEventListener(
          "touchend",
          function (e) {
            (t.touchendEnabledDevice = !0), t.handlerTouchendClick(e);
          },
          { passive: !0 }
        ),
        this.chart.element.addEventListener("mousedown", function (e) {
          t.touchendEnabledDevice ||
            t.handlerTouchstartMousedown(this, e, {
              move: "mousemove",
              up: "mouseup",
              leave: "mouseleave",
            }),
            t.touchendEnabledDevice &&
              setTimeout(function () {
                t.touchendEnabledDevice = !1;
              }, 2e3);
        }),
        this.chart.element.addEventListener("wheel", function (e) {
          t.handlerMousewheel(e);
        }),
        this.chart.element.addEventListener("mousemove", function (e) {
          t.handlerMousemove(e);
        }),
        this.chart.element.addEventListener("click", function (e) {
          t.touchendEnabledDevice || t.handlerTouchendClick(e);
        }),
        this.chart.element.addEventListener("dragover", function (t) {
          FlowChart.private.getParentElementWithAttribute(
            t.target,
            "data-drop-field"
          ) && t.preventDefault();
        }),
        this.chart.element.addEventListener("drop", function (e) {
          var i = FlowChart.private.getParentElementWithAttribute(
            e.target,
            "data-drop-field"
          );
          if (i) {
            e.preventDefault();
            for (var r = e.dataTransfer.items, a = 0; a < r.length; a += 1)
              if ("file" === r[a].kind && r[a].type.match("^image/")) {
                var o = r[a].getAsFile(),
                  s = window.URL.createObjectURL(o);
                FlowChart.private.createImageElementForUpload(s, function (r) {
                  var a = i.getAttribute("data-drop-field"),
                    o = FlowChart.private.getParentElementWithAttribute(
                      e.target,
                      "data-shape-id"
                    );
                  o &&
                    ((shapeId = o.getAttribute("data-shape-id")),
                    (t.chart.getShape(shapeId)[a] = r));
                });
              }
          }
        }),
        this.chart.element.addEventListener("dblclick", function (e) {
          t.handlerDblclick(e);
        }),
        document.addEventListener("keydown", function (e) {
          !1 !== t.chart.active && t.handlerKeydown(e);
        }),
        document.addEventListener("input", function (e) {
          t.handlerInput(e);
        }),
        document.addEventListener("keyup", function (e) {
          t.handlerKeyup(e);
        }),
        document.addEventListener("contextmenu", function (t) {}));
  }),
  (FlowChart.private.magnet = function (t, e, i, r) {
    var a = FlowChart.MAGNET_MOVE_PIXELS / r;
    if (0 != t.length) {
      var o = !1,
        s = !1;
      for (var h of (FlowChart.private.removeAlignmentLineElements(i), e)) {
        var l = !1;
        for (var n of t)
          if (h == n) {
            l = !0;
            break;
          }
        if (!l)
          for (var n of t) {
            if (
              Math.abs(n.left - h.left) < a &&
              n.left >= h.left - a &&
              n.left <= h.left + a
            ) {
              if (!o) {
                var c = h.left + n.width / 2 - n.x;
                for (var d of t) d.x += c;
                o = !0;
              }
              Math.abs(n.left - h.left) < 0.5 &&
                ((p = n.top) > (u = h.top) ? (p += n.height) : (u += h.height),
                FlowChart.private.addAlignmentLineElement(
                  i,
                  "side",
                  h.left,
                  p,
                  h.left,
                  u,
                  r
                ));
            }
            if (Math.abs(n.x - h.x) < a && n.x >= h.x - a && n.x <= h.x + a) {
              if (!o) {
                for (var d of ((c = h.x - n.x), t)) d.x += c;
                o = !0;
              }
              Math.abs(n.x - h.x) < 0.5 &&
                ((p = n.top) > (u = h.top) ? (p += n.height) : (u += h.height),
                FlowChart.private.addAlignmentLineElement(
                  i,
                  "center",
                  h.x,
                  p,
                  h.x,
                  u,
                  r
                ));
            }
            if (
              Math.abs(n.right - h.right) < a &&
              n.right >= h.right - a &&
              n.right <= h.right + a
            ) {
              if (!o) {
                for (var d of ((c = h.right - n.width / 2 - n.x), t)) d.x += c;
                o = !0;
              }
              var p, u;
              Math.abs(n.right - h.right) < 0.5 &&
                ((p = n.top) > (u = h.top) ? (p += n.height) : (u += h.height),
                FlowChart.private.addAlignmentLineElement(
                  i,
                  "side",
                  h.right,
                  p,
                  h.right,
                  u,
                  r
                ));
            }
            if (
              Math.abs(n.top - h.top) < a &&
              n.top >= h.top - a &&
              n.top <= h.top + a
            ) {
              if (!s) {
                for (var d of ((c = h.top + n.height / 2 - n.y), t)) d.y += c;
                s = !0;
              }
              Math.abs(n.top - h.top) < 0.5 &&
                ((f = n.left) > (y = h.left) ? (f += n.width) : (y += h.width),
                FlowChart.private.addAlignmentLineElement(
                  i,
                  "side",
                  f,
                  h.top,
                  y,
                  h.top,
                  r
                ));
            }
            if (Math.abs(n.y - h.y) < a && n.y >= h.y - a && n.y <= h.y + a) {
              if (!s) {
                for (var d of ((c = h.y - n.y), t)) d.y += c;
                s = !0;
              }
              Math.abs(n.y - h.y) < 0.5 &&
                ((f = n.left) > (y = h.left) ? (f += n.width) : (y += h.width),
                FlowChart.private.addAlignmentLineElement(
                  i,
                  "center",
                  f,
                  h.y,
                  y,
                  h.y,
                  r
                ));
            }
            if (
              Math.abs(n.bottom - h.bottom) < a &&
              n.bottom >= h.bottom - a &&
              n.bottom <= h.bottom + a
            ) {
              if (!s) {
                for (var d of ((c = h.bottom - n.height / 2 - n.y), t))
                  d.y += c;
                s = !0;
              }
              var f, y;
              Math.abs(n.bottom - h.bottom) < 0.5 &&
                ((f = n.left) > (y = h.left) ? (f += n.width) : (y += h.width),
                FlowChart.private.addAlignmentLineElement(
                  i,
                  "side",
                  f,
                  h.bottom,
                  y,
                  h.bottom,
                  r
                ));
            }
          }
      }
    }
  }),
  (FlowChart.private.magnetWhenResize = function (t, e, i, r, a) {
    var o = !1,
      s = !1,
      h = FlowChart.MAGNET_RESIZE_PIXELS / a;
    for (var l of (FlowChart.private.removeAlignmentLineElements(i), e))
      if (t != l) {
        if (
          (Math.abs(t.left - l.left) < h &&
            t.left >= l.left - h &&
            t.left <= l.left + h &&
            (o ||
              ((t.width = t.right - l.left),
              (t.x = l.left + t.width / 2),
              (o = !0)),
            Math.abs(t.left - l.left) < 0.5 &&
              ((d = t.top) > (p = l.top) ? (d += t.height) : (p += l.height),
              FlowChart.private.addAlignmentLineElement(
                i,
                "side",
                l.left,
                d,
                l.left,
                p,
                a
              ))),
          Math.abs(t.x - l.x) < h && t.x >= l.x - h && t.x <= l.x + h)
        ) {
          if (
            r == FlowChart.position.left ||
            r == FlowChart.position.topLeft ||
            r == FlowChart.position.bottomLeft
          )
            o ||
              ((t.width = 2 * (t.right - l.x)),
              (t.x = l.x - t.width / 2 + t.width / 2),
              (o = !0));
          else if (!o) {
            var n = 2 * (l.x - t.left),
              c = t.width;
            (t.width = n), (t.x += (n - c) / 2), (o = !0);
          }
          Math.abs(t.x - l.x) < 0.5 &&
            ((d = t.top) > (p = l.top) ? (d += t.height) : (p += l.height),
            FlowChart.private.addAlignmentLineElement(
              i,
              "center",
              l.x,
              d,
              l.x,
              p,
              a
            ));
        }
        var d, p, u, f;
        if (
          Math.abs(t.right - l.right) < h &&
          t.right >= l.right - h &&
          t.right <= l.right + h
        )
          o ||
            ((n = l.right - t.left),
            (c = t.width),
            (t.width = n),
            (t.x += (n - c) / 2),
            (o = !0)),
            Math.abs(t.right - l.right) < 0.5 &&
              ((d = t.top) > (p = l.top) ? (d += t.height) : (p += l.height),
              FlowChart.private.addAlignmentLineElement(
                i,
                "side",
                l.right,
                d,
                l.right,
                p,
                a
              ));
        if (
          (Math.abs(t.top - l.top) < h &&
            t.top >= l.top - h &&
            t.top <= l.top + h &&
            (s ||
              ((t.height = t.bottom - l.top),
              (t.y = l.top + t.height / 2),
              (s = !0)),
            Math.abs(t.top - l.top) < 0.5 &&
              ((u = t.left) > (f = l.left) ? (u += t.width) : (f += l.width),
              FlowChart.private.addAlignmentLineElement(
                i,
                "side",
                u,
                l.top,
                f,
                l.top,
                a
              ))),
          Math.abs(t.y - l.y) < h && t.y >= l.y - h && t.y <= l.y + h)
        ) {
          if (
            r == FlowChart.position.top ||
            r == FlowChart.position.topLeft ||
            r == FlowChart.position.topRight
          )
            s ||
              ((t.height = 2 * (t.bottom - l.y)),
              (t.y = l.y - t.height / 2 + t.height / 2),
              (s = !0));
          else if (!s) {
            var y = 2 * (l.y - t.top),
              m = t.height;
            (t.height = y), (t.y += (y - m) / 2), (s = !0);
          }
          Math.abs(t.y - l.y) < 0.5 &&
            ((u = t.left) > (f = l.left) ? (u += t.width) : (f += l.width),
            FlowChart.private.addAlignmentLineElement(
              i,
              "center",
              u,
              l.y,
              f,
              l.y,
              a
            ));
        }
        if (
          Math.abs(t.bottom - l.bottom) < h &&
          t.bottom >= l.bottom - h &&
          t.bottom <= l.bottom + h
        )
          s ||
            ((y = l.bottom - t.top),
            (m = t.height),
            (t.height = y),
            (t.y += (y - m) / 2),
            (s = !0)),
            Math.abs(t.bottom - l.bottom) < 0.5 &&
              ((u = t.left) > (f = l.left) ? (u += t.width) : (f += l.width),
              FlowChart.private.addAlignmentLineElement(
                i,
                "side",
                u,
                l.bottom,
                f,
                l.bottom,
                a
              ));
      }
  }),
  (FlowChart.private.addAlignmentLineElement = function (t, e, i, r, a, o, s) {
    var h = document.createElementNS("http://www.w3.org/2000/svg", "line");
    return (
      h.setAttribute("x1", i),
      h.setAttribute("x2", a),
      h.setAttribute("y1", r),
      h.setAttribute("y2", o),
      h.setAttribute("stroke-width", 1 / s),
      h.classList.add("bfc-alignment-line"),
      "center" == e
        ? h.setAttribute(
            "stroke-dasharray",
            `${15 / s} ${15 / s} ${2 / s} ${15 / s}`
          )
        : "side" == e &&
          h.setAttribute("stroke-dasharray", `${10 / s} ${20 / s}`),
      t.appendChild(h),
      h
    );
  }),
  (FlowChart.private.removeAlignmentLineElements = function (t) {
    for (
      var e = t.querySelectorAll(".bfc-alignment-line"), i = 0;
      i < e.length;
      i++
    )
      e[i].parentNode.removeChild(e[i]);
  }),
  (FlowChart.anim = class {
    static inPow(t) {
      return t < 0 ? 0 : t > 1 ? 1 : Math.pow(t, 2);
    }
    static outPow(t) {
      return t < 0 ? 0 : t > 1 ? 1 : -1 * (Math.pow(t - 1, 2) + -1);
    }
    static inOutPow(t) {
      return t < 0
        ? 0
        : t > 1
        ? 1
        : (t *= 2) < 1
        ? FlowChart.anim.inPow(t, 2) / 2
        : -0.5 * (Math.pow(t - 2, 2) + -2);
    }
    static inSin(t) {
      return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.cos(t * (Math.PI / 2));
    }
    static outSin(t) {
      return t < 0 ? 0 : t > 1 ? 1 : Math.sin(t * (Math.PI / 2));
    }
    static inOutSin(t) {
      return t < 0 ? 0 : t > 1 ? 1 : -0.5 * (Math.cos(Math.PI * t) - 1);
    }
    static inExp(t) {
      return t < 0 ? 0 : t > 1 ? 1 : Math.pow(2, 10 * (t - 1));
    }
    static outExp(t) {
      return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    static inOutExp(t) {
      return t < 0
        ? 0
        : t > 1
        ? 1
        : t < 0.5
        ? 0.5 * Math.pow(2, 10 * (2 * t - 1))
        : 0.5 * (2 - Math.pow(2, 10 * (-2 * t + 1)));
    }
    static inCirc(t) {
      return t < 0 ? 0 : t > 1 ? 1 : -(Math.sqrt(1 - t * t) - 1);
    }
    static outCirc(t) {
      return t < 0 ? 0 : t > 1 ? 1 : Math.sqrt(1 - (t - 1) * (t - 1));
    }
    static inOutCirc(t) {
      return t < 0
        ? 0
        : t > 1
        ? 1
        : t < 1
        ? -0.5 * (Math.sqrt(1 - t * t) - 1)
        : 0.5 * (Math.sqrt(1 - (2 * t - 2) * (2 * t - 2)) + 1);
    }
    static rebound(t) {
      return t < 0
        ? 0
        : t > 1
        ? 1
        : t < 1 / 2.75
        ? 1 - 7.5625 * t * t
        : t < 2 / 2.75
        ? 1 - (7.5625 * (t - 1.5 / 2.75) * (t - 1.5 / 2.75) + 0.75)
        : t < 2.5 / 2.75
        ? 1 - (7.5625 * (t - 2.25 / 2.75) * (t - 2.25 / 2.75) + 0.9375)
        : 1 - (7.5625 * (t - 2.625 / 2.75) * (t - 2.625 / 2.75) + 0.984375);
    }
    static inBack(t) {
      return t < 0 ? 0 : t > 1 ? 1 : t * t * (2.70158 * t - 1.70158);
    }
    static outBack(t) {
      return t < 0
        ? 0
        : t > 1
        ? 1
        : (t - 1) * (t - 1) * (2.70158 * (t - 1) + 1.70158) + 1;
    }
    static inOutBack(t) {
      return t < 0
        ? 0
        : t > 1
        ? 1
        : t < 0.5
        ? 4 * t * t * (7.1898 * t - 2.5949) * 0.5
        : 0.5 *
          ((2 * t - 2) * (2 * t - 2) * (3.5949 * (2 * t - 2) + 2.5949) + 2);
    }
    static impulse(t) {
      var e = 2 * t;
      return e * Math.exp(1 - e);
    }
    static expPulse(t) {
      return Math.exp(-2 * Math.pow(t, 2));
    }
  }),
  (FlowChart.LinkCollection = class extends Array {
    _;
    constructor(t) {
      super(), (this._ = new FlowChart.LinkCollection.private(t));
    }
    get last() {
      return this.length ? this[this.length - 1] : null;
    }
    get first() {
      return this.length ? this[0] : null;
    }
    addRange(t) {
      this._.chart._.snap();
      var e = this._.addRange(t);
      return this.push(...e), this._.chart._.changed({ property: "links" }), e;
    }
    add(t) {
      return this.addRange([t])[0];
    }
    get(t, e, i, r) {
      for (var a of (null == i && (i = ""), null == r && (r = ""), this))
        if (a.from == t && a.to == e && a.fromPort == i && a.toPort == r)
          return a;
      return null;
    }
    getById(t) {
      for (var e of this) if (e.id == t) return e;
      return null;
    }
    getByShape(t) {
      var e = [];
      for (var i of this) (i.from != t.id && i.to != t.id) || e.push(i);
      return e;
    }
    clear() {
      this._.remove(this, this);
    }
    removeRange(t) {
      this._.remove(t, this);
    }
    remove(t) {
      this._.remove(t, this);
    }
    contains(t) {
      for (var e of this) if (e == t) return !0;
      return !1;
    }
  }),
  (FlowChart.LinkCollection.private = class {
    chart;
    metadata;
    constructor(t) {
      (this.chart = t), (this.metadata = {});
    }
    getProperty(t, e, i) {
      if (null == t[e]) {
        var r = FlowChart.linkTemplates[t.templateId];
        if (r[e] && "function" != typeof r[e]) return r[e];
      }
      if ("points" == e) {
        if (t[e]) return t[e];
        if (
          (this.metadata[i.id] || (this.metadata[i.id] = {}),
          null == this.metadata[i.id][e])
        ) {
          if ("length" == e) return 0;
          if ("points" == e) return [];
        }
        return this.metadata[i.id][e];
      }
      return Reflect.get(...arguments);
    }
    setProperty(t, e, i, r) {
      var a = FlowChart.linkTemplates[t.templateId];
      if (
        ("length" == e &&
          (this.metadata[r.id] || (this.metadata[r.id] = {}),
          (this.metadata[r.id].length = i)),
        "points" == e)
      ) {
        for (var o = this, s = i, h = 0; h < s.length; h++) {
          var l = s[h],
            n = new Proxy(l, {
              set(e, i, a) {
                for (var s of ((e[i] = a),
                null == t.points && (t.points = c),
                o.draw(r),
                o.chart.labels))
                  if (
                    s.from == r.from &&
                    s.to == r.to &&
                    s.fromPort == r.fromPort &&
                    s.toPort == r.toPort
                  ) {
                    var h = FlowChart.private.getLabelXY(s, r);
                    (s.x = h.x), (s.y = h.y);
                  }
                return !0;
              },
            });
          s[h] = n;
        }
        var c = new Proxy(s, {
          set: (t, e, i) => (console.log(e), (t[e] = i), o.draw(r), !0),
        });
        this.metadata[r.id] || (this.metadata[r.id] = {}),
          void 0 !== t.points && delete t.points,
          (this.metadata[r.id].points = c);
      } else
        a[e] && "function" != typeof a[e]
          ? (null != t[e] && a[e] == i && delete t[e],
            a[e] != i
              ? (t[e] = i)
              : a[e] == i || FlowChart.isNEU(t[e]) || (t[e] = i))
          : (t[e] = i);
    }
    addRange(t) {
      var e = this,
        i = [];
      t || console.error("links are: " + t);
      for (var r = 0; r < t.length; r++) {
        var a = t[r];
        a.from || console.error("link.from not defined!"),
          a.to || console.error("link.to not defined!"),
          a.templateId || (a.templateId = FlowChart.DEFAULT_LINK_SHAPE_ID);
        var o = {
            get(t, i, r) {
              return "type" == i
                ? "psuedo" == t.templateId
                  ? "psuedo-link"
                  : "link"
                : ("fromPort" == i && FlowChart.isNEU(t.fromPort)) ||
                  ("toPort" == i && FlowChart.isNEU(t.toPort))
                ? ""
                : "element" == i
                ? e.chart.svgElement.querySelector(`[data-link-id="${r.id}"]`)
                : "pathElement" == i
                ? e.chart.svgElement.querySelector(
                    `[data-link-id="${r.id}"] path`
                  )
                : "layer" == i && FlowChart.isNEU(t.layer)
                ? -2
                : "id" == i
                ? `${r.from}${FlowChart.SEPARATOR}${r.fromPort}${FlowChart.SEPARATOR}${r.to}${FlowChart.SEPARATOR}${r.toPort}`
                : e.getProperty(...arguments);
            },
            set(t, i, r, a) {
              if (t[i] == r) return !0;
              if (
                "to" == i ||
                "from" == i ||
                "fromPort" == i ||
                "toPort" == i ||
                "" == i ||
                "templateId" == i ||
                "points" != i
              ) {
                var o = a.element;
                o && o.parentNode.removeChild(o);
              }
              e.chart._.snap();
              var s = e.beforeIdChange(i, a);
              for (var h of (e.setProperty(t, i, r, a),
              e.afterIdChange(s, a),
              e.draw(a),
              e.chart.labels))
                if (
                  h.from == a.from &&
                  h.to == a.to &&
                  h.fromPort == a.fromPort &&
                  h.toPort == a.toPort
                ) {
                  var l = FlowChart.private.getLabelXY(h, a);
                  (h.x = l.x), (h.y = l.y);
                }
              return e.chart._.changed({ property: "links" }), !0;
            },
          },
          s = new Proxy(a, o),
          h = a.points;
        if (!h) {
          var l = this.chart.ports.getByLink(a);
          h = FlowChart.private.linkFromTo(
            l.fromShape,
            l.toShape,
            l.fromPort,
            l.toPort,
            this.chart
          );
        }
        for (var n = 0; n < h.length; n++) {
          var c = h[n],
            d = new Proxy(c, {
              set(t, i, r) {
                for (var a of ((t[i] = r), e.draw(s), e.chart.labels))
                  if (
                    a.from == s.from &&
                    a.to == s.to &&
                    a.fromPort == s.fromPort &&
                    a.toPort == s.toPort
                  ) {
                    var o = FlowChart.private.getLabelXY(a, s);
                    (a.x = o.x), (a.y = o.y);
                  }
                return !0;
              },
            });
          h[n] = d;
        }
        var p = new Proxy(h, {});
        this.setProperty(a, "points", p, s), this.draw(s), i.push(s);
      }
      return i;
    }
    beforeIdChange(t, e) {
      var i = null;
      return (
        ("to" != t && "from" != t && "fromPort" != t && "toPort" != t) ||
          (((i = {
            from: e.from,
            to: e.to,
            fromPort: e.fromPort,
            toPort: e.toPort,
            metadata: null,
          }).metadata = this.metadata[e.id]),
          delete this.metadata[e.id]),
        i
      );
    }
    afterIdChange(t, e) {
      if (t) {
        this.metadata[e.id] = t.metadata;
        var i = this.chart.ports.getByLink(e),
          r = FlowChart.private.linkFromTo(
            i.fromShape,
            i.toShape,
            i.fromPort,
            i.toPort,
            this.chart
          );
        for (var a of ((e.points = r), this.chart.labels))
          a.from == t.from &&
            a.to == t.to &&
            a.fromPort == t.fromPort &&
            a.toPort == t.toPort &&
            ((a.from = e.from),
            (a.to = e.to),
            (a.fromPort = e.fromPort),
            (a.toPort = e.toPort));
      }
    }
    remove(t, e) {
      var i = !1,
        r = [];
      if (Array.isArray(t)) r = t;
      else if (t.type) r = [t];
      else for (var a of e) (a.from != t && a.to != t) || r.push(a);
      for (var a of r)
        for (var o = e.length - 1; o >= 0; o--)
          if (e[o].from == a.from && e[o].to == a.to) {
            var s = a.element;
            for (var h of (s && s.parentNode.removeChild(s), this.chart.labels))
              h.from == a.from && h.to == a.to && this.chart.labels.remove(h);
            i || (this.chart._.snap(), (i = !0)), e.splice(o, 1);
            break;
          }
      i && this.chart._.changed({ property: "links" });
    }
    getPathElementByLinkElement(t) {
      var e = null;
      for (var i of t.children)
        if ("path" == i.nodeName) {
          e = i;
          break;
        }
      return e || console.error("Cannot find path Element!"), e;
    }
    draw(t) {
      var e = this.chart.svgElement.querySelector(`[data-link-id="${t.id}"]`),
        i = FlowChart.linkTemplates[t.templateId];
      if (!e) {
        var r = t.stroke.replace(/\W/g, "_"),
          a = `bfc_mstart_${t.templateId}_${r}`,
          o = `bfc_mend_${t.templateId}_${r}`;
        (e = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        )).setAttribute("data-link-id", t.id),
          e.classList.add("bfc-link"),
          e.classList.add(t.templateId),
          (e.innerHTML =
            i.svg(t, a, o) + '<path d="" class="bfc-link-invisible"></path>'),
          FlowChart.private
            .getLayer(this.chart.svgElement, t.layer)
            .appendChild(e),
          this.chart.svgElement.querySelector(
            `[data-markers="${t.templateId}"]`
          ) ||
            (this.chart.svgElement.querySelector(
              "defs"
            ).innerHTML += `<g data-markers="${t.templateId}">\n                        ${i.markerStart}\n                        ${i.markerMid}\n                        ${i.markerEnd}\n                    </g>`);
      }
      var s = this.getPathElementByLinkElement(e),
        h = i.path(t);
      s.setAttribute("d", h),
        e.querySelector(".bfc-link-invisible").setAttribute("d", h);
      for (var l = 0, n = 0; n < t.points.length - 1; n++) {
        var c = t.points[n],
          d = t.points[n + 1];
        l += Math.hypot(d.x - c.x, d.y - c.y);
      }
      this.setProperty(t, "length", l, t);
    }
  }),
  (FlowChart.PortCollection = class {
    _;
    constructor(t) {
      this._ = new FlowChart.PortCollection.private(t);
    }
    [Symbol.iterator]() {
      var t = this._.chart.nodes,
        e = this._.chart.labels,
        i = this,
        r = 0,
        a = 0,
        o = !1,
        s = null;
      return {
        next() {
          for (var h; !h && !o; )
            if (r > e.length + t.length - 1) o = !0;
            else {
              var l;
              l = r < t.length ? t[r] : e[r - t.length];
              var n = FlowChart.shapeTemplates[l.templateId].ports(l);
              n
                ? (null == s && (s = Object.keys(n)), (h = i.get(l.id, s[a])))
                : (s = []),
                ++a > s.length - 1 && ((s = null), (a = 0), r++);
            }
          return { value: h, done: o };
        },
      };
    }
    getElement(t) {
      return this._.getElement(t);
    }
    getByPosition(t, e) {
      return this._.getByPosition(t, e);
    }
    getByOpositeOfPosition(t, e) {
      return this._.getByOpositeOfPosition(t, e);
    }
    getByLink(t) {
      return this._.getByLink(t);
    }
    get(t, e) {
      return this._.get(t, e);
    }
  }),
  (FlowChart.PortCollection.private = class {
    chart;
    cachedPorts;
    constructor(t) {
      (this.chart = t), (this.cachedPorts = []);
    }
    getElement(t) {
      return this.chart.svgElement.querySelector(`[data-ports-s-id="${t}"]`);
    }
    getByPosition(t, e) {
      var i = FlowChart.shapeTemplates[t.templateId],
        r = [];
      for (var a in i.ports(t))
        FlowChart.private.getPortPosition(i.ports(t)[a], t) == e &&
          r.push(this.get(t.id, a));
      return r;
    }
    getByOpositeOfPosition(t, e) {
      var i = null;
      switch (e) {
        case FlowChart.position.topRight:
          i = FlowChart.position.bottomLeft;
          break;
        case FlowChart.position.bottomRight:
          i = FlowChart.position.topLeft;
          break;
        case FlowChart.position.bottomLeft:
          i = FlowChart.position.topRight;
          break;
        case FlowChart.position.topLeft:
          i = FlowChart.position.bottomRight;
          break;
        case FlowChart.position.left:
          i = FlowChart.position.right;
          break;
        case FlowChart.position.right:
          i = FlowChart.position.left;
          break;
        case FlowChart.position.top:
          i = FlowChart.position.bottom;
          break;
        case FlowChart.position.bottom:
          i = FlowChart.position.top;
      }
      var r = this.chart.getShape(t);
      return this.getByPosition(r, i);
    }
    getByLink(t) {
      var e, i, r, a, o;
      return (
        (e = this.chart.getShape(t.from)),
        FlowChart.isNEU(t.fromPort) || (r = this.get(t.from, t.fromPort)),
        (i = this.chart.getShape(t.to)),
        FlowChart.isNEU(t.toPort) || (a = this.get(t.to, t.toPort)),
        (r && a) ||
          ((o = FlowChart.private.findClosestPorts(e, i)),
          r || (r = this.get(t.from, o.fromPortName)),
          a || (a = this.get(t.to, o.toPortName))),
        { fromShape: e, toShape: i, fromPort: r, toPort: a }
      );
    }
    get(t, e) {
      var i = this.chart.getShape(t),
        r = FlowChart.shapeTemplates[i.templateId],
        a = FlowChart.private.getPortPosition(r.ports(i)[e], i),
        o = JSON.parse(JSON.stringify(r.ports(i)[e]));
      if (!o) return null;
      for (var s of ((o.id = e),
      (o.x += i.left),
      (o.y += i.top),
      (o.position = a),
      (o.shape = i),
      this.cachedPorts))
        if (s.id == o.id && s.shape == o.shape)
          return (s.x = o.x), (s.y = o.y), (s.position = o.position), s;
      return this.cachedPorts.push(o), o;
    }
  }),
  (FlowChart.css = function () {
    return '<style data-bfc-styles>.bfc-dark ::-webkit-scrollbar,.bfc-light ::-webkit-scrollbar{width:15px;height:15px}.bfc-dark ::-webkit-scrollbar-corner{background:#1e1e1e}.bfc-dark ::-webkit-scrollbar-track{background:#1e1e1e;border-left:1px solid #333;border-top:1px solid #333}.bfc-dark ::-webkit-scrollbar-thumb{background:#424242}.bfc-dark ::-webkit-scrollbar-thumb:hover{background:#4f4f4f}.bfc-dark ::-webkit-scrollbar-thumb:active{background:#5e5e5e}.bfc-light ::-webkit-scrollbar-corner{background:#fff}.bfc-light ::-webkit-scrollbar-track{background:#fff;border-left:1px solid #ddd;border-top:1px solid #ddd}.bfc-light ::-webkit-scrollbar-thumb{background:#c1c1c1}.bfc-light ::-webkit-scrollbar-thumb:hover{background:#929292}.bfc-light ::-webkit-scrollbar-thumb:active{background:#666}.frame{display:flex;flex-direction:column}.bfc-svg{overflow-y:scroll;flex-grow:1}.bfc-light .bfc-svg{background-color:#fff}.bfc-dark .bfc-svg{background-color:#1e1e1e}.bfc-light .bfc-statusbar{background-color:#ddd}.bfc-dark .bfc-statusbar{background-color:#3c3c3c}.bfc-statusbar{user-select:none;line-height:32px;padding:0 7px;white-space:nowrap}.bfc-content{overflow:hidden;position:relative;height:100%}.bfc-canvas{overflow:auto;height:100%}.bfc-light{color:#333}.bfc-dark{color:#cfcfcf}.bfc-menu-item{display:inline-block}.bfc-shapebar{position:absolute;top:64px;left:10px;max-width:60px;user-select:none}.bfc-dark .bfc-shapebar{background-color:#3c3c3c}.bfc-light .bfc-shapebar{background-color:#ddd}.bfc-shapebar-shapes{justify-content:flex-start;flex-wrap:wrap;display:flex;flex-wrap:wrap}.bfc-shapebar-shapes>[data-shapebar-item-id]{padding:7px 0;font-size:13px;text-align:center;user-select:none;cursor:move;flex:1 1 50px;min-height:50px;display:flex;flex-wrap:nowrap;flex-direction:column;justify-content:center}.bfc-colorbar{position:absolute;top:10px;right:10px;width:44px;user-select:none}.bfc-dark .bfc-colorbar{background-color:#3c3c3c}.bfc-light .bfc-colorbar{background-color:#ddd}.bfc-colorbar-colors{justify-content:flex-start;flex-wrap:wrap;display:flex;flex-wrap:wrap}.bfc-colorbar-colors>[data-colorbar-item-id]{padding:7px 0;font-size:13px;text-align:center;user-select:none;cursor:move;flex:1 1 50px;min-height:50px;display:flex;flex-wrap:nowrap;flex-direction:column;justify-content:center}.bfc-menubar{position:absolute;top:10px;left:10px;user-select:none}.bfc-dark .bfc-menubar{background-color:#3c3c3c}.bfc-light .bfc-menubar{background-color:#ddd}.bfc-menubar-colors{justify-content:flex-start;flex-wrap:wrap;display:flex;flex-wrap:wrap}.bfc-menubar-colors>[data-menubar-item-id]{padding:7px 0;font-size:13px;text-align:center;user-select:none;cursor:move;flex:1 1 50px;min-height:50px;display:flex;flex-wrap:nowrap;flex-direction:column;justify-content:center}.bfc-bar-move{cursor:move;height:10px;width:100%}.bfc-dark .bfc-bar-move{background-color:#3c3c3c}.bfc-light .bfc-bar-move{background-color:#ddd}.bfc-bar-move-line{border-top:1px solid #8b8b8b;border-bottom:1px solid #8b8b8b;height:5px;margin-top:3px;margin-left:3px;margin-right:3px}.bfc-dark .bfc-shapebar-shapes>[data-shapebar-item-id]:hover{background-color:#252526}.bfc-light .bfc-shapebar-shapes>[data-shapebar-item-id]:hover{background-color:#f3f3f3}.bfc-alignment-line{stroke:#ffca28}.bfc-selector .bfc-selector-rect{fill:none;stroke:#ffca28}[data-selector-dot-1]{fill:#ffca28;stroke:#ffca28;stroke-width:1;transform-origin:center;transform-box:fill-box}.bfc-c-resizer-dot{stroke:#ffca28;stroke-width:2}.bfc-light .bfc-c-resizer-dot{fill:#fff}.bfc-dark .bfc-c-resizer-dot{fill:#1e1e1e}[data-selector-dot-2=left]{cursor:ew-resize}[data-selector-dot-2=topRight]{cursor:nwse-resize}[data-selector-dot-2=top]{cursor:ns-resize}[data-selector-dot-2=topRight]{cursor:nesw-resize}[data-selector-dot-2=right]{cursor:ew-resize}[data-selector-dot-2=bottomRight]{cursor:nwse-resize}[data-selector-dot-2=bottom]{cursor:ns-resize}[data-selector-dot-2=bottomLeft]{cursor:nesw-resize}[data-selector-dot-2=topLeft]{cursor:nwse-resize}[data-selector-dot-2]{pointer-events:all;visibility:hidden;transform-origin:center;transform-box:fill-box}.bfc-flex-center{display:flex;justify-content:center;align-items:center;height:100%;color:#fff;text-align:center}.bfc-port-dot{cursor:default}.bfc-port-dot circle{stroke:#f57c00;stroke-width:1}.bfc-light .bfc-port-dot{fill:#fff}.bfc-dark .bfc-port-dot{fill:#151515}.bfc-port-dot rect{opacity:0}.bfc-html{user-select:none}.bfc-pan-cursor{cursor:move}.bfc-shapebar-svg{margin:0 5px;max-width:50px}.bfc-cursor-row-resize{cursor:row-resize}.bfc-cursor-col-resize{cursor:col-resize}.bfc-link-invisible{stroke-width:10;fill:none;stroke:#aeaeae;stroke-miterlimit:10;visibility:hidden;pointer-events:stroke}.bfc-link-resizer{cursor:row-resize}.bfc-s-ports>g{transform-box:fill-box;transform-origin:center}.bfc-port-out{opacity:.3}.bfc-port-out:hover{opacity:1}.bfc-portshapebar{position:absolute;top:500px;left:100px;justify-content:flex-start;flex-wrap:wrap;display:flex;gap:7px;padding:7px;border-radius:7px}.bfc-portshapebar>[data-portshapebar-item-id]{text-align:center;user-select:none;flex:1 1 25px;display:flex;flex-wrap:nowrap;flex-direction:column;justify-content:center;filter:grayscale(1)}.bfc-portshapebar>[data-portshapebar-item-id].bfc-portshapebar-selected,.bfc-portshapebar>[data-portshapebar-item-id]:hover{filter:grayscale(0)}.bfc-portshapebar-svg{width:25px}.bfc-light .bfc-portshapebar{background-color:#ddd}.bfc-dark .bfc-portshapebar{background-color:#3c3c3c}[contenteditable]{outline:0 solid transparent}.bfc-light .bfc-label{fill:#fff}.bfc-dark .bfc-label{fill:#1e1e1e}.bfc-ports-invisible .bfc-port-out{visibility:hidden}.bfc-ports-invisible .bfc-port-out.bfc-ports-visible{visibility:visible;opacity:1}.bfc-color-item{border-radius:3px;color:#fff;display:flex;justify-content:center;align-items:center;user-select:none}.bfc-menu-item{display:inline-block}.bfc-menu-item>*{margin:7px;width:30px;height:30px;vertical-align:middle}.bfc-dark .bfc-menu-item-selected,.bfc-dark :not(.bfc-disabled-grayscale):not(.bfc-disabled-opacity).bfc-menu-item:hover{background-color:#252526}.bfc-light .bfc-menu-item-selected,.bfc-light :not(.bfc-disabled-grayscale):not(.bfc-disabled-opacity).bfc-menu-item:hover{background-color:#fff}.bfc-disabled-opacity{opacity:.3}.bfc-disabled-grayscale{filter:grayscale(1)}[data-shape-id]{user-select:none}.bfc-field-border{fill:transparent;stroke:#ffca28;stroke-width:2px;stroke-dasharray:4;cursor:pointer}.bfc-horizontal-bar{display:flex}.bfc-horizontal-bar .bfc-bar-move{width:10px;height:44px;padding-bottom:0}.bfc-horizontal-bar .bfc-bar-content{flex-grow:1}.bfc-horizontal-bar .bfc-bar-move-line{border-top:none;border-bottom:none;border-left:1px solid #8b8b8b;border-right:1px solid #8b8b8b;height:calc(100% - 6px);margin-right:0;margin-left:3px;margin-top:3px;margin-bottom:3px}.bfc-dark,.bfc-light{position:relative;overflow:hidden}@-moz-keyframes bfc-ripple{to{opacity:0;transform:scale(2)}}@-webkit-keyframes bfc-ripple{to{opacity:0;transform:scale(2)}}@-o-keyframes bfc-ripple{to{opacity:0;transform:scale(2)}}@keyframes bfc-ripple{to{opacity:0;transform:scale(2)}}.bfc-chart-menu{opacity:0;display:inline-block;position:absolute;text-align:left;user-select:none;min-width:270px;box-shadow:rgba(0,0,0,.2) 0 4px 8px 0,rgba(0,0,0,.19) 0 6px 20px 0;font:13px/28px Helvetica,"Segoe UI",Arial,sans-serif;border-radius:10px}.bfc-chart-menu>div:hover img{filter:invert(100%)}.bfc-chart-menu [data-item]{text-align:start;padding:7px 10px}.bfc-dark .bfc-chart-menu [data-item]{background-color:#252526;color:#acacac;border-bottom:1px solid #333}.bfc-dark .bfc-chart-menu [data-item]:hover{background-color:#094771!important;color:#fff!important}.bfc-dark .bfc-chart-menu [data-item]:hover svg{filter:brightness(0) invert(1)}.bfc-light .bfc-chart-menu [data-item]{background-color:#fff;color:#333;border-bottom:1px solid #c7c7c7}.bfc-light .bfc-chart-menu [data-item]:hover{background-color:#0074e8!important;color:#fff!important}.bfc-light .bfc-chart-menu [data-item]:hover svg{filter:brightness(0) invert(1)}.bfc-chart-menu [data-item] svg{vertical-align:middle}.bfc-chart-menu [data-item]:first-child{border-top-left-radius:7px;border-top-right-radius:7px}.bfc-chart-menu [data-item]:last-child{border-bottom-width:0;border-bottom-style:none;border-bottom-left-radius:7px;border-bottom-right-radius:7px}</style>';
  }),
  (FlowChart.private.prototype.json = function (t) {
    return JSON.parse(this.text(t));
  }),
  (FlowChart.private.prototype.text = function (t) {
    t || (t = ["shapes", "links"]);
    var e = {};
    for (var i of t)
      switch (i) {
        case "shapes":
          (e.nodes = this.chart.nodes), (e.labels = this.chart.labels);
          break;
        case "nodes":
          e.nodes = this.chart.nodes;
          break;
        case "labels":
          e.labels = this.chart.labels;
          break;
        case "links":
          e.links = this.chart.links;
          break;
        case "selectedShapes":
          for (var r of ((e.selectedShapes = []), this.chart.selectedShapes))
            e.selectedShapes.push(r.id);
          break;
        case "viewBox":
          e.viewBox = this.chart.viewBox;
      }
    return JSON.stringify(e);
  }),
  (FlowChart.private.prototype.svg = function () {
    var t = document.createElement("div");
    t.innerHTML = this.chart.svgElement.outerHTML;
    var e = t.querySelector("svg"),
      i = this.chart.nodes,
      r = {
        left: i.left - FlowChart.PADDING,
        top: i.top - FlowChart.PADDING,
        right: i.right + FlowChart.PADDING,
        bottom: i.bottom + FlowChart.PADDING,
      };
    return (
      e.setAttribute("viewBox", [
        r.left,
        r.top,
        r.right - r.left,
        r.bottom - r.top,
      ]),
      e.setAttribute("width", r.right - r.left),
      e.setAttribute("height", r.bottom - r.top),
      t.innerHTML
    );
  }),
  (FlowChart.events = class {
    static topics = {};
    static on(t, e, i) {
      Array.isArray(FlowChart.events.topics[t]) ||
        (FlowChart.events.topics[t] = []),
        FlowChart.events.topics[t].push({ listener: e, uid: i });
    }
    static removeAll(t) {
      Array.isArray(FlowChart.events.topics[t]) ||
        (FlowChart.events.topics[t] = []),
        (FlowChart.events.topics[t] = []);
    }
    static has(t, e) {
      if (
        Array.isArray(FlowChart.events.topics[t]) &&
        FlowChart.events.topics[t].length > 0
      ) {
        if (FlowChart.isNEU(e)) return !0;
        for (var i = 0; i < FlowChart.events.topics[t].length; i++)
          if (FlowChart.events.topics[t][i].uid == e) return !0;
      }
      return !1;
    }
    static removeForEventId(t) {
      for (var e in FlowChart.events.topics)
        if (Array.isArray(FlowChart.events.topics[e]))
          for (var i = FlowChart.events.topics[e].length - 1; i >= 0; i--)
            FlowChart.events.topics[e][i].uid == t &&
              FlowChart.events.topics[e].splice(i, 1);
    }
    static publish(t, e) {
      if (FlowChart.events.topics[t]) {
        for (var i = [], r = 0; r < FlowChart.events.topics[t].length; r++) {
          var a = FlowChart.events.topics[t][r];
          (null != a._ && null != a._.uid && a._.uid != e[0]._.uid) ||
            i.push(a.listener);
        }
        if (i.length > 0) {
          var o = !0;
          for (
            r = 0;
            r < i.length &&
            (1 == e.length
              ? (o = i[r](e[0]) && o)
              : 2 == e.length
              ? (o = i[r](e[0], e[1]) && o)
              : 3 == e.length
              ? (o = i[r](e[0], e[1], e[2]) && o)
              : 4 == e.length
              ? (o = i[r](e[0], e[1], e[2], e[3]) && o)
              : 5 == e.length && (o = i[r](e[0], e[1], e[2], e[3], e[4]) && o),
            !1 !== o);
            r++
          );
          return o;
        }
      }
    }
  }),
  (FlowChart.icon = class {
    static fit(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 16 16">\n                    <path fill="${i}" d="m 4 1 c -1.660156 0 -3 1.339844 -3 3 v 8 c 0 1.660156 1.339844 3 3 3 h 8 c 1.660156 0 3 -1.339844 3 -3 v -8 c 0 -1.660156 -1.339844 -3 -3 -3 z m 0 2 h 3.011719 v 2 h -2 v 2 h -2 l -0.011719 -3 c 0 -0.128906 0.027344 -0.253906 0.074219 -0.375 c 0.003906 -0.003906 0.003906 -0.007812 0.007812 -0.011719 c 0.046875 -0.117187 0.117188 -0.21875 0.203125 -0.308593 c 0.007813 -0.007813 0.011719 -0.011719 0.019532 -0.019532 c 0.089843 -0.085937 0.191406 -0.15625 0.308593 -0.203125 c 0.003907 -0.003906 0.007813 -0.007812 0.015625 -0.007812 c 0.117188 -0.046875 0.242188 -0.074219 0.371094 -0.074219 z m 5 0 h 3.011719 c 0.125 0 0.253906 0.027344 0.371093 0.074219 c 0.003907 0.003906 0.011719 0.003906 0.015626 0.007812 c 0.113281 0.046875 0.21875 0.117188 0.304687 0.203125 c 0.007813 0.007813 0.015625 0.011719 0.019531 0.019532 c 0.089844 0.089843 0.160156 0.191406 0.207032 0.308593 c 0 0.003907 0.003906 0.007813 0.007812 0.015625 c 0.046875 0.117188 0.070312 0.242188 0.074219 0.371094 l -0.011719 3 h -2 v -2 h -2 z m -5.988281 6 h 2 v 2 h 2 v 2 h -3.011719 c -0.128906 0 -0.253906 -0.027344 -0.375 -0.074219 c -0.003906 -0.003906 -0.007812 -0.003906 -0.011719 -0.007812 c -0.117187 -0.046875 -0.21875 -0.117188 -0.308593 -0.203125 c -0.007813 -0.007813 -0.011719 -0.011719 -0.019532 -0.019532 c -0.085937 -0.089843 -0.15625 -0.191406 -0.203125 -0.308593 c -0.003906 -0.003907 -0.007812 -0.007813 -0.007812 -0.015625 c -0.046875 -0.117188 -0.074219 -0.242188 -0.074219 -0.371094 z m 7.988281 0 h 2 l 0.011719 3 c -0.003907 0.128906 -0.027344 0.253906 -0.074219 0.375 c -0.003906 0.003906 -0.003906 0.007812 -0.007812 0.011719 c -0.046876 0.117187 -0.117188 0.21875 -0.203126 0.308593 c -0.007812 0.007813 -0.015624 0.011719 -0.019531 0.019532 c -0.089843 0.085937 -0.195312 0.15625 -0.308593 0.203125 c -0.003907 0.003906 -0.011719 0.007812 -0.015626 0.007812 c -0.117187 0.046875 -0.246093 0.074219 -0.371093 0.074219 h -3.011719 v -2 h 2 z m 0 0" fill="#2e3436"/>\n                </svg>`;
    }
    static undo(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M6.507,17.508l20.963,-0.008c0.828,-0 1.5,-0.673 1.5,-1.501c-0.001,-0.827 -0.673,-1.499 -1.501,-1.499l-20.975,0.008c0.088,-0.119 0.188,-0.231 0.298,-0.334c0,0 9.705,-9.079 9.705,-9.079c0.605,-0.565 0.636,-1.515 0.071,-2.12c-0.566,-0.604 -1.516,-0.636 -2.12,-0.07c-0,-0 -5.9,5.519 -9.705,9.078c-1.118,1.045 -1.749,2.509 -1.743,4.038c0.006,1.53 0.649,2.989 1.774,4.025c3.848,3.543 9.829,9.05 9.829,9.05c0.609,0.56 1.559,0.521 2.119,-0.088c0.561,-0.609 0.522,-1.558 -0.087,-2.119c-0,-0 -5.98,-5.507 -9.828,-9.05c-0.111,-0.102 -0.211,-0.213 -0.3,-0.331Z"/>\n                </svg>`;
    }
    static redo(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M25.468,14.508l-20.967,-0.008c-0.828,-0 -1.501,0.672 -1.501,1.499c-0,0.828 0.672,1.501 1.499,1.501l21.125,0.009c-0.107,0.159 -0.234,0.306 -0.377,0.439c-3.787,3.502 -9.68,8.951 -9.68,8.951c-0.608,0.562 -0.645,1.511 -0.083,2.119c0.562,0.608 1.512,0.645 2.12,0.083c-0,0 5.892,-5.448 9.68,-8.95c1.112,-1.029 1.751,-2.47 1.766,-3.985c0.014,-1.515 -0.596,-2.968 -1.688,-4.018l-9.591,-9.221c-0.596,-0.574 -1.547,-0.556 -2.121,0.041c-0.573,0.597 -0.555,1.547 0.042,2.121l9.591,9.221c0.065,0.063 0.127,0.129 0.185,0.198Z"/>\n                </svg>`;
    }
    static cut(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M16,13.879l-10.939,-10.94c-0.586,-0.585 -1.536,-0.585 -2.122,0c-0.585,0.586 -0.585,1.536 0,2.122l10.94,10.939l-3.567,3.566c-0.692,-0.361 -1.478,-0.566 -2.312,-0.566c-2.76,0 -5,2.24 -5,5c0,2.76 2.24,5 5,5c2.76,0 5,-2.24 5,-5c0,-0.834 -0.205,-1.62 -0.566,-2.312l3.566,-3.567l3.566,3.567c-0.361,0.692 -0.566,1.478 -0.566,2.312c0,2.76 2.24,5 5,5c2.76,0 5,-2.24 5,-5c0,-2.76 -2.24,-5 -5,-5c-0.834,0 -1.62,0.205 -2.312,0.566l-3.567,-3.566l10.94,-10.939c0.585,-0.586 0.585,-1.536 -0,-2.122c-0.586,-0.585 -1.536,-0.585 -2.122,0l-10.939,10.94Z"/>\n                </svg>`;
    }
    static copy(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32"  style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" >\n                    <path fill="${i}" d="M9.101,7l8.899,0c1.857,-0 3.637,0.737 4.95,2.05c1.313,1.313 2.05,3.093 2.05,4.95l0,8.899c0.953,-0.195 1.837,-0.665 2.536,-1.363c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-2.977 0,-7.023 0,-10c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.698,0.699 -1.168,1.583 -1.363,2.536Z"/>\n                    <path fill="${i}" d="M23,14c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,2.977 0,7.023 0,10c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c2.977,-0 7.023,-0 10,-0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l0,-10Zm-15,10l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-4l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-4l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"/>\n                </svg>`;
    }
    static paste(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M23,14c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c-0,2.977 -0,7.023 -0,10c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c2.977,-0 7.023,-0 10,-0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-10Z"/>\n                    <path fill="${i}" d="M9.101,7l8.899,0c1.857,-0 3.637,0.737 4.95,2.05c1.313,1.313 2.05,3.093 2.05,4.95l-0,8.899c0.953,-0.195 1.837,-0.665 2.536,-1.363c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-2.977 0,-7.023 0,-10c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-2.977,0 -7.023,0 -10,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.698,0.699 -1.168,1.583 -1.363,2.536Z"/>\n                </svg>`;
    }
    static delete(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M11,4.5l10,0c0.828,-0 1.5,-0.672 1.5,-1.5c-0,-0.828 -0.672,-1.5 -1.5,-1.5l-10,0c-0.828,-0 -1.5,0.672 -1.5,1.5c-0,0.828 0.672,1.5 1.5,1.5Z"/>\n                    <path fill="${i}" d="M5,9.5l0,16.5c0,2.761 2.239,5 5,5l12,0c2.761,0 5,-2.239 5,-5l0,-16.5l1.645,0c0.748,-0 1.355,-0.672 1.355,-1.5c-0,-0.828 -0.607,-1.5 -1.355,-1.5l-25.29,0c-0.748,-0 -1.355,0.672 -1.355,1.5c-0,0.828 0.607,1.5 1.355,1.5l1.645,0Zm7,3.5l0,12c-0,0.552 0.448,1 1,1c0.552,0 1,-0.448 1,-1l0,-12c-0,-0.552 -0.448,-1 -1,-1c-0.552,0 -1,0.448 -1,1Zm6,-0l0,12c0,0.552 0.448,1 1,1c0.552,-0 1,-0.448 1,-1l0,-12c0,-0.552 -0.448,-1 -1,-1c-0.552,-0 -1,0.448 -1,1Z"/>\n                </svg>`;
    }
    static fill(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M4,29.987l24,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.827 -0.672,-1.5 -1.5,-1.5l-24,0c-0.828,0 -1.5,0.673 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/>\n                    <path fill="${i}" d="M9.138,22.244c1.323,0.328 2.775,0.118 3.995,-0.702l9.873,-6.712c0.458,-0.308 0.58,-0.929 0.273,-1.388l-6.717,-10c-0.308,-0.458 -0.929,-0.58 -1.388,-0.272c0,-0 -6.027,4.048 -9.961,6.691c-2.293,1.539 -2.903,4.646 -1.363,6.938c0.725,1.08 1.53,2.279 2.256,3.359c0.738,1.099 1.836,1.812 3.032,2.086Zm11.448,-9.223l-15.418,0c0.207,-0.591 0.599,-1.124 1.16,-1.5c-0,-0 9.131,-6.133 9.131,-6.133l5.127,7.633Z"/>\n                    <path fill="${i}" d="M26.339,15.455c-0.185,-0.284 -0.5,-0.455 -0.839,-0.455c-0.339,-0 -0.654,0.171 -0.839,0.455c0,0 -1.274,1.965 -2.039,3.732c-0.379,0.876 -0.622,1.717 -0.622,2.313c-0,1.932 1.568,3.5 3.5,3.5c1.932,0 3.5,-1.568 3.5,-3.5c-0,-0.596 -0.243,-1.437 -0.622,-2.313c-0.765,-1.767 -2.039,-3.732 -2.039,-3.732Z"/>\n                </svg>`;
    }
    static outlinePen(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M18.257,6.671l-9.679,9.679c-0.137,0.138 -0.232,0.312 -0.271,0.502l-1.487,7.085c-0.069,0.329 0.032,0.671 0.269,0.909c0.236,0.239 0.577,0.343 0.906,0.277l7.143,-1.428c0.194,-0.039 0.372,-0.134 0.511,-0.274l9.679,-9.679l-7.071,-7.071Zm1.414,-1.414l7.071,7.071l1.793,-1.792c1.953,-1.953 1.953,-5.119 0,-7.072c0,0 0,0 0,0c-0.938,-0.937 -2.209,-1.464 -3.535,-1.464c-1.327,0 -2.598,0.527 -3.536,1.464l-1.793,1.793Z"/>\n                    <path fill="${i}" d="M3.5,30l24,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-24,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/>\n                </svg>`;
    }
    static addPlusNew(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32">\n                    <path fill="${i}" d="M14.5,14.501l-10.502,0c-0.828,0 -1.5,0.673 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5l10.502,0l-0.001,10.502c0,0.828 0.672,1.5 1.5,1.501c0.828,-0 1.5,-0.673 1.5,-1.5l0.001,-10.503l10.502,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.827 -0.672,-1.5 -1.5,-1.5l-10.502,0l0.001,-10.501c-0,-0.828 -0.672,-1.501 -1.5,-1.501c-0.828,0 -1.5,0.672 -1.5,1.5l-0.001,10.502Z"/>    \n                </svg>`;
    }
    static adjustSettingTool(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M29,8c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-4.439,-0 -11.561,-0 -16,-0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c-0,4.439 -0,11.561 -0,16c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c4.439,-0 11.561,0 16,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-16Zm-12.829,12l-8.171,0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1l8.171,0c0.412,1.165 1.524,2 2.829,2c1.305,0 2.417,-0.835 2.829,-2l2.171,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-2.171,0c-0.412,-1.165 -1.524,-2 -2.829,-2c-1.305,0 -2.417,0.835 -2.829,2Zm-6,-10c0.412,-1.165 1.524,-2 2.829,-2c1.305,0 2.417,0.835 2.829,2l8.171,0c0.552,-0 1,0.448 1,1c0,0.552 -0.448,1 -1,1l-8.171,0c-0.412,1.165 -1.524,2 -2.829,2c-1.305,0 -2.417,-0.835 -2.829,-2l-2.171,0c-0.552,-0 -1,-0.448 -1,-1c0,-0.552 0.448,-1 1,-1l2.171,0Z"/>\n                </svg>`;
    }
    static barChartReport(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32">\n                    <path fill="${i}" d="M29,10c0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1l-0,18c0,0.552 0.448,1 1,1l4,0c0.552,0 1,-0.448 1,-1l-0,-18Zm-20,6c-0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1l-0,12c0,0.552 0.448,1 1,1l4,0c0.552,0 1,-0.448 1,-1l-0,-12Zm10,-12c0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1l-0,24c0,0.552 0.448,1 1,1l4,0c0.552,0 1,-0.448 1,-1l-0,-24Z"/>\n                </svg>`;
    }
    static bookmarkMarkPin(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32">\n                    <path fill="${i}" d="M27,6c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-3.486,0 -8.514,0 -12,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,7.738 0,24 0,24c0,0.404 0.244,0.769 0.617,0.924c0.374,0.155 0.804,0.069 1.09,-0.217l9.293,-9.293c0,0 9.293,9.293 9.293,9.293c0.286,0.286 0.716,0.372 1.09,0.217c0.373,-0.155 0.617,-0.52 0.617,-0.924l-0,-24Z"/>\n                </svg>`;
    }
    static calendarDateSchedule(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M29,11l-26,0l0,13.009c-0,1.326 0.527,2.598 1.464,3.535c0.938,0.938 2.21,1.465 3.536,1.465c4.439,-0 11.561,-0 16,-0c1.326,-0 2.598,-0.527 3.536,-1.465c0.937,-0.937 1.464,-2.209 1.464,-3.535l-0,-13.009Zm-20,13l2,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm6,0l2,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm6,0l2,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm-12,-4l2,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm6,0l2,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm6,0l2,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm-12,-4l2,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1Zm6,0l2,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1Zm6,0l2,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-2,0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1Zm-11,-12.991l0,2.991c-0,0.552 -0.448,1 -1,1c-0.552,-0 -1,-0.448 -1,-1l0,-2.991c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536l0,0.991l26,0l-0,-0.991c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464l0,2.991c-0,0.552 -0.448,1 -1,1c-0.552,-0 -1,-0.448 -1,-1l0,-2.991l-12,-0Z"/>\n                </svg>`;
    }
    static closeFolderData(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path  fill="${i}" d="M1,5.998l-0,16.002c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c5.322,0 14.678,-0 20,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-3.486 0,-8.514 0,-12c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-0,0 -10.586,0 -10.586,0c0,-0 -3.707,-3.707 -3.707,-3.707c-0.187,-0.188 -0.442,-0.293 -0.707,-0.293l-5.002,0c-2.76,0 -4.998,2.238 -4.998,4.998Z"/>\n                </svg>`;
    }
    static documentFilePaper(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n                    <path fill="${i}" d="M27,6c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-3.486,0 -8.514,0 -12,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,5.322 0,14.678 0,20c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c3.486,0 8.514,0 12,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-20Zm-16,20l5,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-5,0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1Zm0,-6l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm-0,-6l10,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1Zm0,-6l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"/>\n                </svg>`;
    }
    static editToolPencil(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M12.965,5.462c0,-0 -2.584,0.004 -4.979,0.008c-3.034,0.006 -5.49,2.467 -5.49,5.5l0,13.03c0,1.459 0.579,2.858 1.611,3.889c1.031,1.032 2.43,1.611 3.889,1.611l13.003,0c3.038,-0 5.5,-2.462 5.5,-5.5c0,-2.405 0,-5.004 0,-5.004c0,-0.828 -0.672,-1.5 -1.5,-1.5c-0.827,-0 -1.5,0.672 -1.5,1.5l0,5.004c0,1.381 -1.119,2.5 -2.5,2.5l-13.003,0c-0.663,-0 -1.299,-0.263 -1.768,-0.732c-0.469,-0.469 -0.732,-1.105 -0.732,-1.768l0,-13.03c0,-1.379 1.117,-2.497 2.496,-2.5c2.394,-0.004 4.979,-0.008 4.979,-0.008c0.828,-0.002 1.498,-0.675 1.497,-1.503c-0.001,-0.828 -0.675,-1.499 -1.503,-1.497Z"/>\n                    <path fill="${i}" d="M20.046,6.411l-6.845,6.846c-0.137,0.137 -0.232,0.311 -0.271,0.501l-1.081,5.152c-0.069,0.329 0.032,0.671 0.268,0.909c0.237,0.239 0.577,0.343 0.907,0.277l5.194,-1.038c0.193,-0.039 0.371,-0.134 0.511,-0.274l6.845,-6.845l-5.528,-5.528Zm1.415,-1.414l5.527,5.528l1.112,-1.111c1.526,-1.527 1.526,-4.001 -0,-5.527c-0.001,-0 -0.001,-0.001 -0.001,-0.001c-1.527,-1.526 -4.001,-1.526 -5.527,-0l-1.111,1.111Z"/>\n                </svg>`;
    }
    static emailInbox(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M31,10c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-5.322,0 -14.678,0 -20,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,3.486 0,8.514 0,12c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c5.322,-0 14.678,-0 20,-0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-3.486 0,-8.514 0,-12Zm-26.556,-0.221c-0,-0 5.145,4.237 8.372,6.894c1.849,1.523 4.519,1.52 6.365,-0.007c3.237,-2.677 8.413,-6.959 8.413,-6.959c0.425,-0.352 0.485,-0.983 0.133,-1.408c-0.351,-0.425 -0.982,-0.485 -1.408,-0.133c0,-0 -5.176,4.281 -8.412,6.959c-1.108,0.916 -2.71,0.918 -3.82,0.004c0,0 -8.372,-6.894 -8.372,-6.894c-0.426,-0.351 -1.056,-0.29 -1.407,0.136c-0.351,0.426 -0.29,1.057 0.136,1.408Z"/>\n                </svg>`;
    }
    static fileFormatFolder(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M17,1l-7,-0c-1.326,0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,5.322 0,14.678 0,20c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c3.486,-0 8.514,0 12,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-15l-5,0c-1.326,0 -2.598,-0.527 -3.536,-1.464c-0.937,-0.938 -1.464,-2.21 -1.464,-3.536l0,-5Zm-6,25l5,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-5,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-5l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-5l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm8,-14.407l-0,4.407c-0,0.796 0.316,1.559 0.879,2.121c0.562,0.563 1.325,0.879 2.121,0.879l4.416,0l-7.416,-7.407Z"/>\n                </svg>`;
    }
    static fullscreenArrowsExpand(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M7.539,26.475l6.849,-6.971c0.58,-0.591 0.572,-1.541 -0.019,-2.121c-0.591,-0.58 -1.541,-0.572 -2.121,0.019l-6.737,6.856c-0.007,-0.079 -0.011,-0.159 -0.011,-0.24c0,-0 -0,-7.018 -0,-7.018c-0,-0.828 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.672 -1.5,1.5l0,7.018c0,3.037 2.462,5.5 5.5,5.5c3.112,-0 6.905,-0 6.905,-0c0.828,-0 1.5,-0.673 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-6.905,-0c-0.157,-0 -0.311,-0.015 -0.461,-0.043Z"/>\n                    <path fill="${i}" d="M24.267,5.51l-7.056,7.181c-0.58,0.591 -0.571,1.541 0.019,2.122c0.591,0.58 1.541,0.571 2.121,-0.019l7.149,-7.277c0.031,0.156 0.047,0.318 0.047,0.483c-0,0 -0,6.977 -0,6.977c-0,0.828 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.672 1.5,-1.5l-0,-6.977c-0,-3.038 -2.463,-5.5 -5.5,-5.5c-3.162,0 -7.047,0 -7.047,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5c0,0 3.885,0 7.047,0c0.074,-0 0.147,0.003 0.22,0.01Z"/>\n                </svg>`;
    }
    static hideCloseEye(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M5.112,18.784l-2.153,2.156c-0.585,0.586 -0.585,1.536 0.001,2.121c0.586,0.585 1.536,0.585 2.121,-0.001l2.666,-2.668c1.898,0.983 4.19,1.806 6.773,2.041l0,3.567c0,0.828 0.672,1.5 1.5,1.5c0.828,-0 1.5,-0.672 1.5,-1.5l0,-3.571c2.147,-0.201 4.091,-0.806 5.774,-1.571l3.199,3.202c0.585,0.586 1.535,0.586 2.121,0.001c0.586,-0.585 0.586,-1.535 0.001,-2.121l-2.579,-2.581c2.59,-1.665 4.091,-3.369 4.091,-3.369c0.546,-0.622 0.485,-1.57 -0.137,-2.117c-0.622,-0.546 -1.57,-0.485 -2.117,0.137c0,-0 -4.814,5.49 -11.873,5.49c-7.059,0 -11.873,-5.49 -11.873,-5.49c-0.547,-0.622 -1.495,-0.683 -2.117,-0.137c-0.622,0.547 -0.683,1.495 -0.137,2.117c0,0 1.175,1.334 3.239,2.794Z"/><g id="Icon"/>\n                </svg>`;
    }
    static imagePictureGallery(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M29,8c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-4.439,-0 -11.561,-0 -16,-0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c-0,4.439 -0,11.561 -0,16c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c4.439,-0 11.561,0 16,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-16Zm-2.178,6.903l-0.676,-1.003c-0.929,-1.379 -2.483,-2.205 -4.146,-2.205c-1.663,-0 -3.217,0.826 -4.146,2.205c-0,0 -3.021,4.481 -3.021,4.481l-0.687,-1.019c-0.929,-1.379 -2.483,-2.206 -4.146,-2.206c-1.663,0 -3.217,0.827 -4.146,2.206c-0.246,0.365 -0.489,0.726 -0.723,1.072c-0.309,0.458 -0.187,1.08 0.27,1.388c0.458,0.309 1.08,0.188 1.388,-0.27l0.723,-1.072c0.558,-0.828 1.49,-1.324 2.488,-1.324c0.998,0 1.93,0.496 2.488,1.323c-0,0 1.516,2.25 1.516,2.25c0.186,0.276 0.497,0.441 0.829,0.441c0.333,0 0.644,-0.165 0.83,-0.441l3.849,-5.711c0.558,-0.827 1.49,-1.323 2.488,-1.323c0.998,-0 1.93,0.496 2.488,1.323c-0,-0 0.676,1.003 0.676,1.003c0.308,0.458 0.93,0.579 1.388,0.27c0.458,-0.308 0.579,-0.93 0.27,-1.388Zm-12.822,-7.903c-1.656,0 -3,1.344 -3,3c0,1.656 1.344,3 3,3c1.656,0 3,-1.344 3,-3c0,-1.656 -1.344,-3 -3,-3Z"/><g id="Icon"/>\n                </svg>`;
    }
    static linkChainConnect(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M24.787,19.13l2.122,-2.121c3.317,-3.317 3.317,-8.704 -0,-12.021c-3.318,-3.317 -8.704,-3.317 -12.021,0c-0,0 -2.122,2.122 -2.122,2.122c-0.585,0.585 -0.585,1.535 0,2.121c0.586,0.585 1.536,0.585 2.122,-0l2.121,-2.121c2.146,-2.147 5.632,-2.147 7.778,-0c2.147,2.146 2.147,5.631 0,7.778c0,-0 -2.121,2.121 -2.121,2.121c-0.586,0.585 -0.586,1.536 -0,2.121c0.585,0.586 1.536,0.586 2.121,0Z"/><path d="M7.11,12.766l-2.122,2.122c-3.317,3.317 -3.317,8.703 0,12.021c3.317,3.317 8.704,3.317 12.021,-0c0,-0 2.121,-2.122 2.121,-2.122c0.586,-0.585 0.586,-1.536 0,-2.121c-0.585,-0.586 -1.536,-0.586 -2.121,-0l-2.121,2.121c-2.147,2.147 -5.632,2.147 -7.778,0c-2.147,-2.146 -2.147,-5.632 -0,-7.778c-0,0 2.121,-2.121 2.121,-2.121c0.585,-0.586 0.585,-1.536 -0,-2.122c-0.586,-0.585 -1.536,-0.585 -2.121,0Z"/><path d="M11.352,22.666l11.314,-11.314c0.585,-0.585 0.585,-1.536 -0,-2.121c-0.586,-0.586 -1.536,-0.586 -2.121,-0l-11.314,11.314c-0.586,0.585 -0.586,1.535 -0,2.121c0.585,0.585 1.536,0.585 2.121,-0Z"/>\n                </svg>`;
    }
    static listMenuReport(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">\n                    <path fill="${i}" d="M10.427,4.003l16.999,-0.003" style="fill:none;stroke:#000000;stroke-width:3px;"/><path d="M10.002,10.003l16.999,-0.003" style="fill:none;stroke:#000000;stroke-width:2px;"/><path d="M10.423,27.994l17.04,-0.02" style="fill:none;stroke:#000000;stroke-width:3px;"/><path d="M10.425,15.998l17.001,0.003" style="fill:none;stroke:#000000;stroke-width:3px;"/><path d="M10.417,22.001l17.008,-0" style="fill:none;stroke:#000000;stroke-width:3px;"/><path d="M10.433,10.001l16.992,-0" style="fill:none;stroke:#000000;stroke-width:3px;"/><circle cx="5" cy="4" r="2"/><circle cx="5" cy="10" r="2"/><circle cx="5" cy="16" r="2"/><circle cx="5" cy="22" r="2"/><circle cx="5" cy="28" r="2"/>\n                </svg>`;
    }
    static logOutExit(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M25.229,14.5l-16.003,0c-0.828,-0 -1.5,0.672 -1.5,1.5c-0,0.828 0.672,1.5 1.5,1.5l16.038,0l-3.114,3.114c-0.585,0.585 -0.585,1.536 0,2.121c0.586,0.586 1.536,0.586 2.122,0c-0,0 2.567,-2.567 4.242,-4.242c1.367,-1.367 1.367,-3.583 0,-4.95l-4.242,-4.243c-0.586,-0.585 -1.536,-0.585 -2.122,0c-0.585,0.586 -0.585,1.536 0,2.122l3.079,3.078Z"/><path fill="${i}" d="M20,24l-0,-4.5l-10.774,0c-1.932,-0 -3.5,-1.568 -3.5,-3.5c-0,-1.932 1.568,-3.5 3.5,-3.5l10.774,0l-0,-4.5c-0,-2.761 -2.239,-5 -5,-5c-2.166,-0 -4.834,0 -7,-0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c-0,4.439 -0,11.561 0,16c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c2.166,0 4.834,0 7,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536Z"/>\n                </svg>`;
    }
    static marginPageBorder(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M20,31l-8,0l-0,-5l8,0l0,5Zm7,-5l-5,0l0,5c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536Zm-22,0c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464l0,-5l-5,0Zm22,-18l-0,16l-5,0l0,-16l5,0Zm-7,0l0,16l-8,0l-0,-16l8,0Zm-10,-0l0,16l-5,0l0,-16l5,-0Zm0,-7c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536l5,0l0,-5Zm10,5l-8,0l-0,-5l8,-0l0,5Zm2,-5l0,5l5,0c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464Z"/>\n                </svg>`;
    }
    static minimizeResizeDirection(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M11.21,18.511l-8.284,8.433c-0.58,0.59 -0.572,1.541 0.019,2.121c0.59,0.58 1.541,0.572 2.121,-0.019l8.378,-8.527c0.03,0.156 0.046,0.317 0.046,0.482c0,0 0,6.977 0,6.977c0,0.828 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.672 1.5,-1.5l0,-6.977c0,-3.037 -2.462,-5.5 -5.5,-5.5c-3.14,0 -6.984,0 -6.984,0c-0.828,0 -1.5,0.672 -1.5,1.5c-0,0.828 0.672,1.5 1.5,1.5l6.984,0c0.074,0 0.148,0.004 0.22,0.01Z"/><path d="M18.496,11.437c-0.012,-0.102 -0.019,-0.205 -0.019,-0.31c0,-0 0,-7.145 0,-7.145c0,-0.827 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.673 -1.5,1.5l0,7.145c0,3.038 2.463,5.5 5.5,5.5c3.139,0 6.981,0 6.981,0c0.828,0 1.5,-0.672 1.5,-1.5c-0,-0.828 -0.672,-1.5 -1.5,-1.5l-6.981,0c-0.135,0 -0.267,-0.011 -0.396,-0.031l8.421,-8.572c0.58,-0.591 0.572,-1.541 -0.019,-2.121c-0.59,-0.581 -1.541,-0.572 -2.121,0.018l-8.366,8.516Z"/>\n                </svg>`;
    }
    static openFolderStorage(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                    <path fill="${i}" d="M1,5.998l0,16.002c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c5.322,0 14.678,-0 20,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-3.486 0,-8.514 0,-12c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-0,0 -10.586,0 -10.586,0c0,-0 -3.707,-3.707 -3.707,-3.707c-0.187,-0.188 -0.442,-0.293 -0.707,-0.293l-5.002,0c-2.76,0 -4.998,2.238 -4.998,4.998Zm3.792,11.499l1.755,-3.009c0.537,-0.921 1.524,-1.488 2.591,-1.488c0,0 13.815,0 13.815,0c1.067,0 2.053,0.567 2.591,1.488c0.904,1.55 1.028,1.762 1.788,3.066c0.278,0.477 0.891,0.638 1.368,0.36c0.477,-0.278 0.638,-0.891 0.36,-1.368c-0.761,-1.304 -0.885,-1.516 -1.789,-3.065c-0.896,-1.536 -2.54,-2.481 -4.318,-2.481c-3.354,0 -10.462,0 -13.815,0c-1.778,0 -3.423,0.945 -4.319,2.481c0,-0 -1.755,3.009 -1.755,3.009c-0.278,0.476 -0.117,1.089 0.36,1.367c0.477,0.278 1.089,0.117 1.368,-0.36Z"/>\n                </svg>`;
    }
    static pasteClipboardfiles(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M10,1c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,5.322 -0,14.678 0,20c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c3.486,0 8.514,0 12,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-20c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464l-0,3c0,1.326 -0.527,2.598 -1.464,3.536c-0.938,0.937 -2.21,1.464 -3.536,1.464l-2,-0c-1.326,0 -2.598,-0.527 -3.536,-1.464c-0.937,-0.938 -1.464,-2.21 -1.464,-3.536l0,-3Zm1,25l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-6l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-6l10,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-10,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm9,-13l-0,3c0,0.796 -0.316,1.559 -0.879,2.121c-0.562,0.563 -1.325,0.879 -2.121,0.879l-2,0c-0.796,0 -1.559,-0.316 -2.121,-0.879c-0.563,-0.562 -0.879,-1.325 -0.879,-2.121l-0,-3l8,-0Z"/>\n            </svg>`;
    }
    static pencilToolPen(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M18.257,6.671l-12.664,12.664c-0.119,0.119 -0.206,0.266 -0.253,0.428l-2.3,7.899c-0.102,0.349 -0.006,0.725 0.25,0.984c0.256,0.258 0.631,0.357 0.981,0.258l7.957,-2.242c0.165,-0.047 0.315,-0.135 0.436,-0.256l12.664,-12.664l-7.071,-7.071Zm1.414,-1.414l7.071,7.071l1.793,-1.792c0.938,-0.938 1.465,-2.21 1.465,-3.536c-0,-1.326 -0.527,-2.598 -1.465,-3.536c0,0 0,0 0,0c-0.938,-0.937 -2.209,-1.464 -3.535,-1.464c-1.327,0 -2.598,0.527 -3.536,1.464l-1.793,1.793Z"/>\n            </svg>`;
    }
    static pieChartReport(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M15,2.142c0,-0.29 -0.126,-0.566 -0.345,-0.755c-0.219,-0.19 -0.51,-0.276 -0.797,-0.235c-7.266,1.042 -12.858,7.297 -12.858,14.848c0,8.279 6.721,15 15,15c7.551,-0 13.806,-5.592 14.848,-12.858c0.041,-0.287 -0.045,-0.578 -0.235,-0.797c-0.189,-0.219 -0.465,-0.345 -0.755,-0.345l-9.858,0c-1.326,0 -2.598,-0.527 -3.536,-1.464c-0.937,-0.938 -1.464,-2.21 -1.464,-3.536c0,-0 0,-9.858 0,-9.858Zm3.142,-0.99c-0.287,-0.041 -0.578,0.045 -0.797,0.235c-0.219,0.189 -0.345,0.465 -0.345,0.755l-0,9.858c-0,0.796 0.316,1.559 0.879,2.121c0.562,0.563 1.325,0.879 2.121,0.879c0,0 9.858,0 9.858,0c0.29,0 0.566,-0.126 0.755,-0.345c0.19,-0.219 0.276,-0.51 0.235,-0.797c-0.94,-6.565 -6.14,-11.765 -12.706,-12.706Z"/>\n            </svg>`;
    }
    static printInkjetPrinting(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" >\n                <path fill="${i}" d="M9,24l0,-7c0,-0.552 0.448,-1 1,-1l12,0c0.552,0 1,0.448 1,1l0,7l3,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536c0,-1.881 0,-4.119 0,-6c-0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-5.322,0 -14.678,0 -20,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c0,1.881 0,4.119 0,6c0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464l3,-0Zm11,-10l6,0c0.552,-0 1,-0.448 1,-1c-0,-0.552 -0.448,-1 -1,-1l-6,0c-0.552,-0 -1,0.448 -1,1c-0,0.552 0.448,1 1,1Z"/><path d="M9,6l14,0l-0,-0c-0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-1.287,0 -2.713,0 -4,0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536l-0,0Z"/><path d="M21,18l0,8c0,0.796 -0.316,1.559 -0.879,2.121c-0.562,0.563 -1.325,0.879 -2.121,0.879l-4,-0c-0.796,0 -1.559,-0.316 -2.121,-0.879c-0.563,-0.562 -0.879,-1.325 -0.879,-2.121l0,-8l10,0Zm-7,8l4,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Zm0,-4l4,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1Z"/>\n            </svg>`;
    }
    static researchChemistryEducation(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M13,9c4.967,0 9,4.033 9,9c0,4.642 -3.523,8.469 -8.038,8.949c0.91,1.244 2.379,2.051 4.038,2.051l5.967,0c2.758,0 4.995,-2.233 4.999,-4.992l0.027,-16c0.003,-1.327 -0.523,-2.601 -1.461,-3.541c-0.938,-0.939 -2.211,-1.467 -3.539,-1.467c-1.879,0 -4.114,0 -5.993,0c-2.761,0 -5,2.239 -5,5l0,1Z"/><path d="M7.522,22.356l-4.583,4.583c-0.585,0.586 -0.585,1.536 0,2.122c0.586,0.585 1.536,0.585 2.122,-0l4.802,-4.803c0.943,0.475 2.009,0.742 3.137,0.742c3.863,0 7,-3.137 7,-7c0,-3.863 -3.137,-7 -7,-7c-3.863,0 -7,3.137 -7,7c0,1.646 0.569,3.16 1.522,4.356Z"/>\n            </svg>`;
    }
    static resizeExpandScale(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M24.267,5.51l-6.941,7.064c-0.711,-0.374 -1.508,-0.574 -2.326,-0.574l-7,-0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536l0,7c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464l7,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-7c0,-0.807 -0.195,-1.594 -0.559,-2.297l7.059,-7.186c0.031,0.156 0.047,0.318 0.047,0.483c-0,0 -0,6.977 -0,6.977c-0,0.828 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.672 1.5,-1.5l-0,-6.977c-0,-3.038 -2.463,-5.5 -5.5,-5.5c-3.162,0 -7.047,0 -7.047,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5c0,0 3.885,0 7.047,0c0.074,-0 0.147,0.003 0.22,0.01Z"/>\n            </svg>`;
    }
    static saveStorageFolder(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M9,29l0,-8.25c0,-1.518 1.232,-2.75 2.75,-2.75l8.5,0c1.518,0 2.75,1.232 2.75,2.75l0,8.25l-14,-0Zm-2,-0.101c-0.953,-0.195 -1.837,-0.665 -2.536,-1.363c-0.937,-0.938 -1.464,-2.21 -1.464,-3.536c-0,-4.439 -0,-11.561 0,-16c-0,-1.326 0.527,-2.598 1.464,-3.536c0.938,-0.937 2.21,-1.464 3.536,-1.464l2,-0l0,5.083c0,2.201 1.613,3.917 3.5,3.917l5,0c1.887,0 3.5,-1.716 3.5,-3.917l0,-5.083l0.221,0c0.24,0 0.472,0.087 0.654,0.244l5.779,5c0.22,0.19 0.346,0.466 0.346,0.756c0,0 0,9.426 -0,15c0,1.326 -0.527,2.598 -1.464,3.536c-0.699,0.698 -1.583,1.168 -2.536,1.363l0,-8.149c0,-2.622 -2.128,-4.75 -4.75,-4.75c0,0 -8.5,0 -8.5,0c-2.622,0 -4.75,2.128 -4.75,4.75l0,8.149Zm13,-25.899l0,5.083c0,1.02 -0.626,1.917 -1.5,1.917c0,0 -5,0 -5,0c-0.874,0 -1.5,-0.897 -1.5,-1.917l0,-5.083l8,0Z"/>\n            </svg>`;
    }
    static searchGlassview(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M10.437,19.442l-7.498,7.497c-0.585,0.586 -0.585,1.536 0,2.122c0.586,0.585 1.536,0.585 2.122,-0l7.649,-7.65c1.544,0.976 3.373,1.542 5.333,1.542c5.52,-0 10,-4.481 10,-10c0,-5.52 -4.48,-10 -10,-10c-5.519,-0 -10,4.48 -10,10c0,2.475 0.902,4.741 2.394,6.489Z"/>\n            </svg>`;
    }
    static sendShareCommunication(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M11.499,19.173l5.801,-5.849c0.389,-0.392 1.022,-0.394 1.414,-0.006c0.392,0.389 0.395,1.022 0.006,1.414l-5.798,5.847l5.306,8.002c0.207,0.313 0.572,0.483 0.945,0.441c0.373,-0.042 0.691,-0.289 0.824,-0.64l9.024,-23.904c0.138,-0.366 0.05,-0.78 -0.226,-1.058c-0.276,-0.278 -0.689,-0.369 -1.057,-0.233l-24.004,8.892c-0.353,0.13 -0.602,0.448 -0.646,0.821c-0.044,0.373 0.125,0.74 0.438,0.948l7.973,5.325Z"/>\n            </svg>`;
    }
    static settingGearCogwheel(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M24.336,5.414l-0.003,0.001c-0.687,0.397 -1.535,0.397 -2.222,0c-0.687,-0.396 -1.111,-1.13 -1.111,-1.924l0,-0.003c-0,-0.622 -0.247,-1.218 -0.687,-1.658c-0.439,-0.439 -1.035,-0.686 -1.657,-0.686c-1.477,-0 -3.835,-0 -5.312,-0c-0.622,-0 -1.218,0.247 -1.657,0.686c-0.44,0.44 -0.687,1.036 -0.687,1.658l0,0.003c0,0.794 -0.424,1.528 -1.111,1.924c-0.687,0.397 -1.535,0.397 -2.222,0l-0.003,-0.001c-0.538,-0.311 -1.178,-0.395 -1.779,-0.234c-0.6,0.16 -1.112,0.553 -1.423,1.092c-0.738,1.279 -1.918,3.321 -2.656,4.6c-0.311,0.538 -0.395,1.178 -0.234,1.779c0.161,0.6 0.554,1.112 1.092,1.423l0.003,0.002c0.687,0.397 1.111,1.13 1.111,1.924c-0,0.794 -0.424,1.527 -1.111,1.924l-0.003,0.002c-0.538,0.311 -0.931,0.823 -1.092,1.423c-0.161,0.601 -0.077,1.241 0.234,1.779c0.738,1.279 1.918,3.321 2.656,4.6c0.311,0.539 0.823,0.932 1.423,1.092c0.601,0.161 1.241,0.077 1.779,-0.234l0.003,-0.001c0.687,-0.397 1.535,-0.397 2.222,-0c0.687,0.396 1.111,1.13 1.111,1.924l-0,0.003c0,0.622 0.247,1.218 0.687,1.658c0.439,0.439 1.035,0.686 1.657,0.686c1.477,0 3.835,0 5.312,0c0.622,0 1.218,-0.247 1.657,-0.686c0.44,-0.44 0.687,-1.036 0.687,-1.658l-0,-0.003c-0,-0.794 0.424,-1.528 1.111,-1.924c0.687,-0.397 1.535,-0.397 2.222,-0l0.003,0.001c0.538,0.311 1.178,0.395 1.779,0.234c0.6,-0.16 1.112,-0.553 1.423,-1.092c0.738,-1.279 1.918,-3.321 2.656,-4.6c0.311,-0.538 0.395,-1.178 0.234,-1.779c-0.161,-0.6 -0.554,-1.112 -1.092,-1.423l-0.003,-0.002c-0.687,-0.397 -1.111,-1.13 -1.111,-1.924c0,-0.794 0.424,-1.527 1.111,-1.924l0.003,-0.002c0.538,-0.311 0.931,-0.823 1.092,-1.423c0.161,-0.601 0.077,-1.241 -0.234,-1.779c-0.738,-1.279 -1.918,-3.321 -2.656,-4.6c-0.311,-0.539 -0.823,-0.932 -1.423,-1.092c-0.601,-0.161 -1.241,-0.077 -1.779,0.234Zm-8.336,3.586c-3.863,0 -7,3.137 -7,7c0,3.863 3.137,7 7,7c3.863,0 7,-3.137 7,-7c0,-3.863 -3.137,-7 -7,-7Z"/>\n            </svg>`;
    }
    static shareSendNetwork(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M29,8c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-4.439,-0 -11.561,-0 -16,-0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536c-0,4.439 -0,11.561 0,16c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464c4.439,-0 11.561,0 16,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-16Zm-9.835,2.983l-6.529,3.585c-0.509,-0.934 -1.499,-1.568 -2.636,-1.568c-1.656,-0 -3,1.344 -3,3c0,1.656 1.344,3 3,3c1.101,0 2.064,-0.594 2.586,-1.48l6.547,3.595c-0.086,0.28 -0.133,0.577 -0.133,0.885c0,1.656 1.344,3 3,3c1.656,0 3,-1.344 3,-3c0,-1.656 -1.344,-3 -3,-3c-0.612,0 -1.181,0.183 -1.655,0.498l-6.267,-3.44l6.364,-3.494c0.454,0.276 0.988,0.436 1.558,0.436c1.656,0 3,-1.344 3,-3c0,-1.656 -1.344,-3 -3,-3c-1.656,0 -3,1.344 -3,3c0,0.344 0.058,0.675 0.165,0.983Z"/>\n            </svg>`;
    }
    static spacingTextParagraph(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M6.5,8.276l0,15.448l-1.329,-1.661c-0.517,-0.647 -1.462,-0.751 -2.108,-0.234c-0.647,0.517 -0.751,1.462 -0.234,2.108l4,5c0.284,0.356 0.715,0.563 1.171,0.563c0.456,-0 0.887,-0.207 1.171,-0.563l4,-5c0.517,-0.646 0.413,-1.591 -0.234,-2.108c-0.646,-0.517 -1.591,-0.413 -2.108,0.234l-1.329,1.661l0,-15.448l1.329,1.661c0.517,0.647 1.462,0.751 2.108,0.234c0.647,-0.517 0.751,-1.462 0.234,-2.108l-4,-5c-0.284,-0.356 -0.715,-0.563 -1.171,-0.563c-0.456,-0 -0.887,0.207 -1.171,0.563l-4,5c-0.517,0.646 -0.413,1.591 0.234,2.108c0.646,0.517 1.591,0.413 2.108,-0.234l1.329,-1.661Z"/><path d="M28,8.5l-11,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5l11,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5Z"/><path d="M28,14.5l-11,0c-0.828,-0 -1.5,0.672 -1.5,1.5c-0,0.828 0.672,1.5 1.5,1.5l11,0c0.828,-0 1.5,-0.672 1.5,-1.5c-0,-0.828 -0.672,-1.5 -1.5,-1.5Z"/><path d="M28,20.5l-11,-0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5l11,-0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5Z"/><path d="M28,26.5l-11,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5l11,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5Z"/><path d="M28,2.5l-11,0c-0.828,-0 -1.5,0.672 -1.5,1.5c-0,0.828 0.672,1.5 1.5,1.5l11,0c0.828,-0 1.5,-0.672 1.5,-1.5c-0,-0.828 -0.672,-1.5 -1.5,-1.5Z"/>\n            </svg>`;
    }
    static tableCellsChart(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M29,23l-8,0l0,6l3,0c1.326,0 2.598,-0.527 3.536,-1.464c0.937,-0.938 1.464,-2.21 1.464,-3.536l-0,-1Zm-10,6l-6,-0l0,-6l6,0l-0,6Zm-16,-6l0,1c-0,1.326 0.527,2.598 1.464,3.536c0.938,0.937 2.21,1.464 3.536,1.464l3,-0l0,-6l-8,0Zm8,-6l0,4l-8,-0l0,-4l8,0Zm8,0l-0,4l-6,-0l0,-4l6,0Zm10,0l-0,4l-8,-0l0,-4l8,0Zm-18,-2l-8,-0l0,-4l8,0l0,4Zm8,-0l-6,-0l0,-4l6,0l-0,4Zm10,-0l-8,-0l0,-4l8,0l-0,4Zm-26,-6l26,0l-0,-1c0,-1.326 -0.527,-2.598 -1.464,-3.536c-0.938,-0.937 -2.21,-1.464 -3.536,-1.464c-4.439,-0 -11.561,-0 -16,-0c-1.326,-0 -2.598,0.527 -3.536,1.464c-0.937,0.938 -1.464,2.21 -1.464,3.536l0,1Z"/>\n            </svg>`;
    }
    static textAlignCenter(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M3.995,5.41l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.002,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.003 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.502 1.495,1.505Z"/><path d="M3.995,29.404l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.002,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.002 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.503 1.495,1.505Z"/><path d="M4.018,17.461l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.003,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.003 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.502 1.495,1.505Z"/><path d="M10,23.5l12,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-12,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/><path d="M10,11.5l12,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-12,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/>\n            </svg>`;
    }
    static textAlignLeft(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M3.95,5.41l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.003,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.827,-0.003 -1.502,0.667 -1.505,1.495c-0.002,0.828 0.667,1.502 1.495,1.505Z"/><path d="M3.95,29.404l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.003,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.827,-0.002 -1.502,0.667 -1.505,1.495c-0.002,0.828 0.667,1.503 1.495,1.505Z"/><path d="M3.973,17.461l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.003,-0.828 -0.667,-1.502 -1.495,-1.505l-24.037,-0.081c-0.828,-0.003 -1.503,0.667 -1.506,1.495c-0.002,0.828 0.668,1.502 1.495,1.505Z"/><path d="M4,23.5l12,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-12,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/><path d="M4,11.5l12,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-12,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/>\n            </svg>`;
    }
    static textAlignRight(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M3.995,5.41l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.002,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.003 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.502 1.495,1.505Z"/><path d="M3.995,29.404l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.002,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.002 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.503 1.495,1.505Z"/><path d="M4.018,17.461l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.003,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.003 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.502 1.495,1.505Z"/><path d="M16,23.5l12,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-12,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/><path d="M16,11.5l12,0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-12,0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/>\n            </svg>`;
    }
    static textBoxTool(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 32 32" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n                <path fill="${i}" d="M16,5.5l12,-0c0.828,0 1.5,-0.672 1.5,-1.5c0,-0.828 -0.672,-1.5 -1.5,-1.5l-12,-0c-0.828,0 -1.5,0.672 -1.5,1.5c0,0.828 0.672,1.5 1.5,1.5Z"/><path d="M3.995,29.4l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.002,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.002 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.503 1.495,1.505Z"/><path d="M4.018,17.457l24.038,0.081c0.828,0.003 1.502,-0.667 1.505,-1.495c0.003,-0.828 -0.667,-1.502 -1.495,-1.505l-24.038,-0.081c-0.828,-0.003 -1.502,0.667 -1.505,1.495c-0.003,0.828 0.667,1.502 1.495,1.505Z"/><path d="M4,23.496l24,0c0.828,0 1.5,-0.672 1.5,-1.5c-0,-0.828 -0.672,-1.5 -1.5,-1.5l-24,0c-0.828,0 -1.5,0.672 -1.5,1.5c-0,0.828 0.672,1.5 1.5,1.5Z"/><path d="M16,11.5l12,-0.004c0.828,-0 1.5,-0.673 1.5,-1.5c-0,-0.828 -0.673,-1.5 -1.5,-1.5l-12,0.004c-0.828,0 -1.5,0.673 -1.5,1.5c0,0.828 0.673,1.5 1.5,1.5Z"/><path d="M11,4.007c0,-0.552 -0.448,-1 -1,-1l-6.009,-0c-0.552,-0 -1,0.448 -1,1l-0,5.993c-0,0.552 0.448,1 1,1l6.009,0c0.552,0 1,-0.448 1,-1l0,-5.993Z"/>\n            </svg>`;
    }
    static rotate(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n            <path fill="${i}" fill-rule="evenodd" clip-rule="evenodd" d="M6.23706 2.0007C6.78897 2.02117 7.21978 2.48517 7.19931 3.03708L7.10148 5.67483C8.45455 4.62548 10.154 4.00001 12 4.00001C16.4183 4.00001 20 7.58174 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68631 15.3137 6.00001 12 6.00001C10.4206 6.00001 8.98317 6.60994 7.91098 7.60891L11.3161 8.00677C11.8646 8.07087 12.2573 8.56751 12.1932 9.11607C12.1291 9.66462 11.6325 10.0574 11.0839 9.99326L5.88395 9.38567C5.36588 9.32514 4.98136 8.87659 5.00069 8.35536L5.20069 2.96295C5.22116 2.41104 5.68516 1.98023 6.23706 2.0007Z" fill="#000000"/>\n        </svg>`;
    }
    static arrow(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}"  viewBox="0 0 24 24" >\n            <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="${i}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n        </svg>`;
    }
    static user(t, e, i, r, a) {
      return `<svg width="${t}" height="${e}" x="${r}" y="${a}" viewBox="0 0 24 24">\n                    <path fill="${i}" d="M12 11.796C14.7189 11.796 16.9231 9.60308 16.9231 6.89801C16.9231 4.19294 14.7189 2.00005 12 2.00005C9.28106 2.00005 7.07692 4.19294 7.07692 6.89801C7.07692 9.60308 9.28106 11.796 12 11.796Z" fill="#030D45"/>\n                    <path fill="${i}" d="M14.5641 13.8369H9.4359C6.46154 13.8369 4 16.2859 4 19.245C4 19.9593 4.30769 20.5716 4.92308 20.8777C5.84615 21.3879 7.89744 22.0001 12 22.0001C16.1026 22.0001 18.1538 21.3879 19.0769 20.8777C19.5897 20.5716 20 19.9593 20 19.245C20 16.1838 17.5385 13.8369 14.5641 13.8369Z" fill="#030D45"/>\n                </svg>`;
    }
  }),
  (FlowChart.ShapeCollection = class extends Array {
    _;
    constructor(t) {
      super(), (this._ = new FlowChart.ShapeCollection.private(t));
    }
    get last() {
      return this.length ? this[this.length - 1] : null;
    }
    get first() {
      return this.length ? this[0] : null;
    }
    get top() {
      return this._.minY;
    }
    get bottom() {
      return this._.maxY;
    }
    get left() {
      return this._.minX;
    }
    get right() {
      return this._.maxX;
    }
    addRange(t) {
      this._.chart._.snap();
      var e = this._.addRange(t);
      return this.push(...e), this._.chart._.changed({ property: "shapes" }), e;
    }
    add(t) {
      return this.addRange([t])[0];
    }
    get(t) {
      if (!(arguments.length >= 3)) {
        for (var e of this) if (e.id == t) return e;
        return null;
      }
      var i = arguments[0],
        r = arguments[1],
        a = arguments[2],
        o = arguments[3],
        s = arguments[4];
      for (var e of (null == o && (o = ""), null == s && (s = ""), this))
        if (
          e.from == i &&
          e.to == r &&
          e.position == a &&
          e.fromPort == o &&
          e.toPort == s
        )
          return e;
    }
    clear() {
      this._.remove(this, this);
    }
    removeRange(t) {
      this._.remove(t, this);
    }
    remove(t) {
      t && this._.remove([t], this);
    }
    contains(t) {
      return null != this.get(t);
    }
  }),
  (FlowChart.ShapeCollection.private = class {
    chart;
    moveHorizontallyInterval;
    moveVerticallyInterval;
    metadata;
    minX;
    minY;
    maxX;
    maxY;
    minShapeX;
    minShapeY;
    maxShapeX;
    maxShapeY;
    constructor(t) {
      (this.chart = t),
        (this.moveHorizontallyInterval = null),
        (this.moveVerticallyInterval = null),
        (this.metadata = {}),
        (this.minX = Number.MAX_SAFE_INTEGER),
        (this.minY = Number.MAX_SAFE_INTEGER),
        (this.maxX = Number.MIN_SAFE_INTEGER),
        (this.maxY = Number.MIN_SAFE_INTEGER);
    }
    getProperty(t, e, i) {
      if (null == t[e]) {
        var r = FlowChart.shapeTemplates[t.templateId];
        if (null != r[e] && "function" != typeof r[e]) return r[e];
      }
      if ("x" == e || "y" == e) {
        if ("label" == i.type) return this.metadata[i.id][e];
        if (null == t[e]) return 0;
      }
      return Reflect.get(...arguments);
    }
    setProperty(t, e, i, r) {
      var a = FlowChart.shapeTemplates[t.templateId];
      "label" != r.type || ("x" != e && "y" != e)
        ? a[e] && "function" != typeof a[e]
          ? ((t[e] == a[e]) == i && delete t[e],
            a[e] != i
              ? this.setPropertyAndCallFieldChange(t, e, i, r)
              : a[e] != i ||
                FlowChart.isNEU(t[e]) ||
                this.setPropertyAndCallFieldChange(t, e, i, r))
          : this.setPropertyAndCallFieldChange(t, e, i, r)
        : (this.metadata[r.id] || (this.metadata[r.id] = {}),
          (this.metadata[r.id][e] = i));
    }
    setPropertyAndCallFieldChange(t, e, i, r) {
      if (
        "width" != e &&
        "height" != e &&
        "opacity" != e &&
        "x" != e &&
        "y" != e
      ) {
        var a = { shape: r, newValue: i, fieldName: e };
        return (
          !1 !== FlowChart.events.publish("field-change", [this.chart, a]) &&
            (t[e] = i),
          !0
        );
      }
      t[e] = i;
    }
    setSelected(t, e) {
      0 == t.selectable && (e = !1);
      var i = t.selected,
        r = this.getMetadata(t.id);
      i != e &&
        ((r.selected = e),
        !i && e
          ? (this.chart.selectedShapes.add(t),
            this.chart.selectedShapes._.createSelectorElement(t))
          : i &&
            !e &&
            (this.chart.selectedShapes.remove(t),
            this.chart.selectedShapes._.removeSelectorElement(t)));
    }
    clearSelectedMetadata() {
      for (var t in this.metadata) {
        this.metadata[t].selected = !1;
        var e = this.chart.svgElement.querySelector(
          `[data-selector-shape-id="${t}"]`
        );
        e && e.parentNode.removeChild(e);
      }
    }
    setWidth(t, e) {
      if (t.canWidthFitContent) {
        var i = FlowChart.shapeTemplates[t.templateId],
          r = this.getMetadata(t.id);
        e < i.minWidth && (e = i.minWidth),
          r.width != e && ((r.width = e), (t.SYSTEM_CHANGE_SIZE = !0));
      } else t.width = e;
    }
    setHeight(t, e) {
      if (t.canHeightFitContent) {
        var i = FlowChart.shapeTemplates[t.templateId],
          r = this.getMetadata(t.id);
        e < i.minHeight && (e = i.minHeight),
          r.height != e && ((r.height = e), (t.SYSTEM_CHANGE_SIZE = !0));
      } else t.height = e;
    }
    addRange(t) {
      for (var e = [], i = 0; i < t.length; i++) {
        var r = t[i];
        if (FlowChart.private.isLabel(r)) {
          r.templateId || (r.templateId = FlowChart.DEFAULT_LABEL_SHAPE_ID);
          var a = "";
          FlowChart.isNEU(r.fromPort) || (a = r.fromPort);
          var o = "";
          FlowChart.isNEU(r.toPort) || (o = r.toPort);
          var s = this.chart.links.get(r.from, r.to, a, o),
            h = FlowChart.private.getLabelXY(r, s),
            l = `${r.from}${FlowChart.SEPARATOR}${a}${FlowChart.SEPARATOR}${r.to}${FlowChart.SEPARATOR}${o}${FlowChart.SEPARATOR}${r.position}`;
          (this.metadata[l] = {}),
            (this.metadata[l].x = h.x),
            (this.metadata[l].y = h.y);
        }
        var n = this.set(r);
        e.push(n);
      }
      return (this.chart.selectedPortShape = null), e;
    }
    set(t) {
      var e = this;
      FlowChart.shapeTemplates[t.templateId] ||
        console.error(`Shape template "${t.templateId}" does not exist!`),
        !FlowChart.private.isLabel(t) &&
          FlowChart.isNEU(t.id) &&
          (t.id = this.chart.generateId());
      var i = t.id;
      FlowChart.private.isLabel(t) ||
        "string" == typeof i ||
        (i = i.toString());
      var r = function (t, i) {
          if (e.chart.skip) return !0;
          var r = FlowChart.shapeTemplates[t.templateId];
          if (!(h = t.element)) {
            var a = r.html(t),
              o = r.svg(t),
              s = r.offset(t),
              h = document.createElementNS("http://www.w3.org/2000/svg", "g"),
              l = t.strokeWidth / 2,
              n = t.strokeWidth / 2,
              c = t.height - t.strokeWidth,
              d = t.width - t.strokeWidth;
            c < 0 && (c = 0),
              d < 0 && (d = 0),
              (h.innerHTML = `<g class="bfc-svg">${o}</g>\n                                             <foreignObject pointer-events="all" class="bfc-html" x="${l}" y="${n}" width="${d}" height="${c}"><div data-html-container class="bfc-flex-center">${a}</div></foreignObject>`),
              h.setAttribute("data-shape-id", t.id),
              h.setAttribute(
                "transform",
                `translate(${t.left + s.x},${t.top + s.y})`
              ),
              h.classList.add(t.templateId),
              null != t.opacity && (h.style.opacity = t.opacity),
              FlowChart.private
                .getLayer(e.chart.svgElement, t.layer)
                .appendChild(h);
          }
          if (null != i) {
            var p = h.querySelector("[data-html-container]"),
              u = h.querySelector(".bfc-html"),
              f = h.querySelector(".bfc-svg");
            if ("x" == i || "y" == i)
              (s = r.offset(t)),
                h.setAttribute(
                  "transform",
                  `translate(${t.left + s.x},${t.top + s.y})`
                );
            else if (
              "width" == i ||
              "height" == i ||
              "SYSTEM_CHANGE_SIZE" == i
            ) {
              (s = r.offset(t)), (f.innerHTML = r.svg(t));
              var y = t.width - t.strokeWidth,
                m = t.height - t.strokeWidth;
              y < 0 && (y = 0),
                m < 0 && (m = 0),
                u.setAttribute("width", y),
                u.setAttribute("height", m),
                h.setAttribute(
                  "transform",
                  `translate(${t.left + s.x},${t.top + s.y})`
                );
            }
            if (
              "x" == i ||
              "y" == i ||
              "width" == i ||
              "height" == i ||
              "SYSTEM_CHANGE_SIZE" == i
            ) {
              for (var g of (e.chart.selectedShapes._.update(t, e.chart.scale),
              e.chart._.updatePortsElement(e.chart.scale),
              e.chart.links))
                if (g.from == t.id || g.to == t.id) {
                  var v = e.chart.ports.getByLink(g),
                    w = FlowChart.private.linkFromTo(
                      v.fromShape,
                      v.toShape,
                      v.fromPort,
                      v.toPort,
                      e.chart
                    );
                  g.points = w;
                }
              e.minMax(t);
            }
            if (
              "selected" != i &&
              "x" != i &&
              "y" != i &&
              "width" != i &&
              "height" != i &&
              "SYSTEM_CHANGE_SIZE" != i &&
              ((a = (r = FlowChart.shapeTemplates[t.templateId]).html(t)),
              (p.innerHTML = a),
              (f.innerHTML = r.svg(t)),
              t.canWidthFitContent || t.canHeightFitContent)
            ) {
              var C = e.chart._.getSizeOfHTML(a);
              if (t.canWidthFitContent) {
                var x = C.width;
                x < r.minWidth && (x = r.minWidth), e.setWidth(t, x);
              }
              if (t.canHeightFitContent) {
                var N = C.height;
                N < r.minHeight && (N = r.minHeight), e.setHeight(t, N);
              }
            }
            "opacity" == i && (h.style.opacity = t[i]);
          }
        },
        a = new Proxy(t, {
          deleteProperty: (t, i, a) => (
            delete t[i], (a = e.chart.getShape(t.id)), r(a, i), !0
          ),
          get(t, i, r) {
            var a = FlowChart.shapeTemplates[t.templateId];
            return "top" == i
              ? r.y - r.height / 2
              : "bottom" == i
              ? r.y + r.height / 2
              : "left" == i
              ? r.x - r.width / 2
              : "right" == i
              ? r.x + r.width / 2
              : ("fromPort" == i && FlowChart.isNEU(t.fromPort)) ||
                ("toPort" == i && FlowChart.isNEU(t.toPort))
              ? ""
              : "layer" == i && FlowChart.isNEU(t.layer)
              ? "label" == r.type
                ? -1
                : -3
              : "id" == i && "label" == r.type
              ? `${r.from}${FlowChart.SEPARATOR}${r.fromPort}${FlowChart.SEPARATOR}${r.to}${FlowChart.SEPARATOR}${r.toPort}${FlowChart.SEPARATOR}${r.position}`
              : "width" == i && "fit" == a.width && null == t.width
              ? e.metadata[r.id] && null != e.metadata[r.id].width
                ? e.metadata[r.id].width
                : a.width
              : "height" == i && "fit" == a.height && null == t.height
              ? e.metadata[r.id] && null != e.metadata[r.id].height
                ? e.metadata[r.id].height
                : a.height
              : "selected" == i
              ? !(!e.metadata[r.id] || 1 != e.metadata[r.id].selected)
              : ("canWidthFitContent" == i &&
                  "fit" == a.width &&
                  null == t.width) ||
                ("canHeightFitContent" == i &&
                  "fit" == a.height &&
                  null == t.height) ||
                ("element" == i
                  ? e.getElement(r.id)
                  : "link" == i && "label" == r.type
                  ? e.chart.links.get(r.from, r.to, r.fromPort, r.toPort)
                  : e.getProperty(...arguments));
          },
          set(t, i, a, o) {
            if (o[i] == a) return !0;
            var s = FlowChart.shapeTemplates[t.templateId];
            if (
              ("width" == i && a < s.minWidth && (a = s.minWidth),
              "height" == i && a < s.minHeight && (a = s.minHeight),
              "selected" == i && e.setSelected(o, a),
              "to" == i ||
                "from" == i ||
                "fromPort" == i ||
                "toPort" == i ||
                "id" == i ||
                "templateId" == i)
            ) {
              var h = o.element;
              h && h.parentNode.removeChild(h);
            }
            if ("SYSTEM_CHANGE_SIZE" != i && "selected" != i) {
              e.chart._.snap();
              var l = e.beforeIdChange(i, o, t);
              e.setProperty(t, i, a, o), e.afterIdChange(l, o);
            }
            return (
              r(o, i),
              "SYSTEM_CHANGE_SIZE" != i &&
                "selected" != i &&
                e.chart._.changed({ property: "shapes" }),
              !0
            );
          },
        }),
        o = FlowChart.shapeTemplates[t.templateId];
      if ("fit" == o.width || "fit" == o.height) {
        var s = o.html(a),
          h = this.chart._.getSizeOfHTML(s);
        if ("fit" == o.width) {
          var l = h.width;
          l < o.minWidth && (l = o.minWidth),
            this.metadata[a.id] || (this.metadata[a.id] = {}),
            (this.metadata[a.id].width = l);
        }
        if ("fit" == o.height) {
          var n = h.height;
          n < o.minHeight && (n = o.minHeight),
            this.metadata[a.id] || (this.metadata[a.id] = {}),
            (this.metadata[a.id].height = n);
        }
      }
      return r(a), this.minMax(a), a;
    }
    beforeIdChange(t, e) {
      var i = null;
      return (
        ("to" != t &&
          "from" != t &&
          "fromPort" != t &&
          "toPort" != t &&
          "id" != t &&
          "templateId" != t) ||
          (((i = {
            from: e.from,
            to: e.to,
            fromPort: e.fromPort,
            toPort: e.toPort,
            id: e.id,
            metadata: null,
          }).metadata = this.metadata[e.id]),
          delete this.metadata[e.id]),
        i
      );
    }
    afterIdChange(t, e) {
      if (t)
        if (((this.metadata[e.id] = t.metadata), "label" == e.type))
          for (var i of this.chart.links)
            i.from == t.from &&
              i.to == t.to &&
              i.fromPort == t.fromPort &&
              i.toPort == t.toPort &&
              ((i.from = e.from),
              (i.to = e.to),
              (i.fromPort = e.fromPort),
              (i.toPort = e.toPort));
        else
          for (var i of this.chart.links)
            i.from == t.id && (i.from = e.id), i.to == t.id && (i.to = e.id);
    }
    getElement(t) {
      return this.chart.svgElement.querySelector(`[data-shape-id="${t}"]`);
    }
    remove(t, e) {
      var i = !1;
      t instanceof FlowChart.SelectedShapeCollection ||
        t instanceof FlowChart.ShapeCollection ||
        Array.isArray(t) ||
        (t = [t]);
      var r = [];
      for (var a of t) r.push(a.id);
      for (var o of r)
        for (var s = e.length - 1; s >= 0; s--)
          if (e[s].id == o) {
            ((a = e[s]).selected = !1), (this.chart.selectedPortShape = null);
            var h = this.getElement(o);
            h && h.parentNode.removeChild(h),
              this.chart.links.remove(o),
              i || (this.chart._.snap(), (i = !0)),
              this.metadata[a.id] && delete this.metadata[a.id],
              e.splice(s, 1);
            break;
          }
      i &&
        (this.minMaxIterateAll(e),
        this.chart._.changed({ property: "shapes" }));
    }
    move(t, e, i, r, a) {
      if (t.length)
        if (e) {
          if (
            ((e != FlowChart.move.left && e != FlowChart.move.right) ||
              !this.moveHorizontallyInterval) &&
            ((e != FlowChart.move.up && e != FlowChart.move.down) ||
              !this.moveVerticallyInterval)
          ) {
            var o = 1;
            FlowChart.isNEU(r) && (r = FlowChart.anim.inSin),
              FlowChart.isNEU(a) && (a = 1100),
              (e != FlowChart.move.left && e != FlowChart.move.right) ||
                (this.moveHorizontallyInterval = setInterval(s, 10)),
              (e != FlowChart.move.up && e != FlowChart.move.down) ||
                (this.moveVerticallyInterval = setInterval(s, 10));
          }
        } else console.error("movePosition parameter not defined");
      function s() {
        var s = r((10 * o - 10) / a);
        for (var h of t)
          e == FlowChart.move.left
            ? (h.x -= FlowChart.MOVE_NODE_STEP * s)
            : e == FlowChart.move.right
            ? (h.x += FlowChart.MOVE_NODE_STEP * s)
            : e == FlowChart.move.up
            ? (h.y -= FlowChart.MOVE_NODE_STEP * s)
            : e == FlowChart.move.down && (h.y += FlowChart.MOVE_NODE_STEP * s);
        i && i(), (o += 1);
      }
    }
    stopMoving(t) {
      t == FlowChart.direction.vertical
        ? this.moveVerticallyInterval &&
          (clearInterval(this.moveVerticallyInterval),
          (this.moveVerticallyInterval = null))
        : (t == FlowChart.direction.horizontal ||
            (this.moveVerticallyInterval &&
              (clearInterval(this.moveVerticallyInterval),
              (this.moveVerticallyInterval = null))),
          this.moveHorizontallyInterval &&
            (clearInterval(this.moveHorizontallyInterval),
            (this.moveHorizontallyInterval = null)));
    }
    minMax(t) {
      "node" == t.type &&
        (t.left < this.minX && ((this.minX = t.left), (this.minShapeX = t)),
        t.top < this.minY && ((this.minY = t.top), (this.minShapeY = t)),
        t.right > this.maxX && ((this.maxX = t.right), (this.maxShapeX = t)),
        t.bottom > this.maxY && ((this.maxY = t.bottom), (this.maxShapeY = t)));
    }
    minMaxIterateAll(t) {
      for (var e of t) this.minMax(e);
    }
    getMetadata(t) {
      return (
        this.metadata[t] ||
          (this.metadata[t] = { width: void 0, height: void 0 }),
        this.metadata[t]
      );
    }
  }),
  (FlowChart.linkTemplates = class {
    static rounded = class {
      static path(t) {
        return FlowChart.private.roundPathCorners(
          t.points,
          FlowChart.LINK_ROUNDED_CORENERS,
          !1
        );
      }
      static svg(t) {
        return `<path d="" style="fill: none; stroke: ${t.stroke}; stroke-width: ${t.strokeWidth}px;" marker-start="url(#rounded_start)" marker-end="url(#rounded_end)" ></path>`;
      }
      static markerStart = "";
      static markerEnd =
        '<marker id="rounded_end" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">\n                                <path d="M 0 0 L 5 2.5 L 0 5 z" fill="context-stroke"  />\n                            </marker>';
      static markerMid = "";
      static stroke = "#aeaeae";
      static strokeWidth = 4;
    };
  }),
  (FlowChart.linkTemplates.psuedo = class extends (
    FlowChart.linkTemplates.rounded
  ) {
    static stroke = "#FFCA28";
    static strokeWidth = 4;
  }),
  (FlowChart.shapeTemplates = class {
    static base = class {
      static offset(t) {
        return { x: 0, y: 0 };
      }
      static svg(t) {
        return `<rect rx="7" ry="7" x="0" y="0" width="${t.width}" height="${t.height}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};" ></rect>`;
      }
      static html(t) {
        return `<div style="padding: 10px;">\n                        <div data-field="text"> ${
          null == t.text ? `[${t.displayName}]` : t.text
        }</div>                       \n                    </div>`;
      }
      static ports(t) {
        return {
          top: { x: t.width / 2, y: 0 },
          right: { x: t.width, y: t.height / 2 },
          bottom: { x: t.width / 2, y: t.height },
          left: { x: 0, y: t.height / 2 },
        };
      }
      static type = "node";
      static displayInShapeBar = !1;
      static displayInPortShapeBar = !1;
      static fill = "#039BE5";
      static stroke = "#aeaeae";
      static strokeWidth = 4;
      static minWidth = 200;
      static minHeight = 90;
      static width = "fit";
      static height = "fit";
      static displayName = "Base";
      static resizable = !0;
      static selectable = !0;
      static movable = !0;
    };
  }),
  (FlowChart.shapeTemplates.startEnd = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = (t.height / 100) * 45;
      return `<rect rx="${e}" ry="${e}" x="0" y="0" width="${t.width}" height="${t.height}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};" ></rect>`;
    }
    static displayName = "Start/End";
    static displayInShapeBar = !0;
    static displayInPortShapeBar = !0;
  }),
  (FlowChart.shapeTemplates.process = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static displayName = "Process";
    static displayInShapeBar = !0;
    static displayInPortShapeBar = !0;
  }),
  (FlowChart.shapeTemplates.document = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = t.width / 10;
      return `<path d="M0,0 L0,${t.height} Q ${t.width / 4} ${t.height + e}, ${
        t.width / 2
      } ${t.height} T ${t.width} ${t.height} L${t.width},${t.height} L${
        t.width
      },0 Z" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${
        t.strokeWidth
      };"></path>`;
    }
    static displayName = "Document";
  }),
  (FlowChart.shapeTemplates.decision = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static displayName = "Decision";
    static svg(t) {
      return `<path  d="M${t.width / 2},0 L${t.width},${t.height / 2} L${
        t.width / 2
      },${t.height} L0,${t.height / 2} Z" style="stroke:${t.stroke}; fill:${
        t.fill
      }; stroke-width:${t.strokeWidth};" /></path>`;
    }
    static width = 200;
    static height = 180;
    static displayInShapeBar = !0;
    static displayInPortShapeBar = !0;
  }),
  (FlowChart.shapeTemplates.inOut = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = t.width / 10;
      return `<path d="M${e},0 L0,${t.height} L${t.width - e},${t.height} L${
        t.width
      },0 Z" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${
        t.strokeWidth
      };"></path>`;
    }
    static ports(t) {
      var e = t.width / 10 / 2;
      return {
        top: { x: t.width / 2, y: 0 },
        right: { x: t.width - e, y: t.height / 2 },
        bottom: { x: t.width / 2, y: t.height },
        left: { x: e, y: t.height / 2 },
      };
    }
    static displayName = "In/Out";
    static displayInShapeBar = !0;
    static displayInPortShapeBar = !0;
    static static = !1;
  }),
  (FlowChart.shapeTemplates.manualInput = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      return `<path d="M0,${t.width / 10} L0,${t.height} L${t.width},${
        t.height
      } L${t.width},0 Z" style="stroke:${t.stroke}; fill:${
        t.fill
      }; stroke-width:${t.strokeWidth};"></path>`;
    }
    static ports(t) {
      var e = t.width / 20;
      return {
        top: { x: t.width / 2, y: e },
        right: { x: t.width, y: t.height / 2 },
        bottom: { x: t.width / 2, y: t.height },
        left: { x: 0, y: t.height / 2 },
      };
    }
    static displayName = "Manual Input";
  }),
  (FlowChart.shapeTemplates.preparation = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = t.width / 10;
      return `<path d="M${e},0 L0,${t.height / 2} L${e},${t.height} L${
        t.width - e
      },${t.height} L${t.width},${t.height / 2} L${
        t.width - e
      },0 Z" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${
        t.strokeWidth
      };"></path>`;
    }
    static displayName = "Preparation";
  }),
  (FlowChart.shapeTemplates.connector = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = Math.max(t.width, t.height) / 2;
      return `<circle cx="${e}" cy="${e}" r="${e}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};"></circle>`;
    }
    static minWidth = 110;
    static minHeight = 110;
    static width = 110;
    static height = 110;
    static displayName = "Connector";
  }),
  (FlowChart.shapeTemplates.or = class extends (
    FlowChart.shapeTemplates.connector
  ) {
    static svg(t) {
      return (
        FlowChart.shapeTemplates.connector.svg(t) +
        `<line x1="${t.width / 2}" y1="0" x2="${t.width / 2}" y2="${
          t.height
        }" style="stroke:${t.stroke}; stroke-width:${
          t.strokeWidth
        };"></line>\n            <line x1="0" y1="${t.height / 2}" x2="${
          t.width
        }" y2="${t.height / 2}" style="stroke:${t.stroke}; stroke-width:${
          t.strokeWidth
        };"></line>`
      );
    }
    static html(t) {
      return "";
    }
    static displayName = "Or";
  }),
  (FlowChart.shapeTemplates.data = class extends FlowChart.shapeTemplates.base {
    static svg(t) {
      var e = t.width / 10;
      return `<path d="M0,${t.height} C${-e},${t.height} ${-e},0 0,0 L${
        t.width
      },0 C${t.width - e},0 ${t.width - e},${t.height} ${t.width},${
        t.height
      } Z" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${
        t.strokeWidth
      };"/>`;
    }
    static displayName = "Data";
  }),
  (FlowChart.shapeTemplates.delay = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = t.width / 4,
        i = t.width / 5;
      return `<path d="M0,${t.height} L0,0 L${t.width - i},0 C${
        t.width + e - i
      },0 ${t.width + e - i},${t.height} ${t.width - i},${
        t.height
      } Z" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${
        t.strokeWidth
      };"/>`;
    }
    static displayName = "Delay";
  }),
  (FlowChart.shapeTemplates.display = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = t.width / 4,
        i = t.width / 5,
        r = t.width / 10;
      return `<path d="M${r},${t.height} L0,${t.height / 2} L${r},0  L${
        t.width - i
      },0 C${t.width + e - i},0 ${t.width + e - i},${t.height} ${t.width - i},${
        t.height
      } Z" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${
        t.strokeWidth
      };"/>`;
    }
    static displayName = "Display";
  }),
  (FlowChart.shapeTemplates.manualLoop = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = t.width / 10;
      return `<path d="M0,0 L${t.width},0 L${t.width - e},${t.height} L${e},${
        t.height
      } Z" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${
        t.strokeWidth
      };"></path>`;
    }
    static displayName = "Manual Loop";
  }),
  (FlowChart.shapeTemplates.loopLimit = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static svg(t) {
      var e = t.width / 6;
      return `<path d="M0,${e} L${e},0 L${t.width - e},0 L${t.width},${e} L${
        t.width
      },${t.height} L0,${t.height} Z" style="stroke:${t.stroke}; fill:${
        t.fill
      }; stroke-width:${t.strokeWidth};"></path>`;
    }
    static displayName = "Loop Limit";
  }),
  (FlowChart.shapeTemplates.label = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static displayName = "Label";
    static svg(t) {
      return `<rect class="bfc-label" x="0" y="0" width="${t.width}" height="${t.height}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};" ></rect>`;
    }
    static html(t) {
      var e = t.text;
      return (
        null == e && (e = "[text]"),
        `<div style="padding: 2x;">\n                    <div data-field="text" style="color: #aeaeae;">${e}</div>\n                </div>`
      );
    }
    static ports(t) {
      return null;
    }
    static width = "fit";
    static height = "fit";
    static fill = "";
    static stroke = "";
    static strokeWidth = 0;
    static minWidth = 0;
    static minHeight = 0;
    static displayInShapeBar = !1;
    static displayInPortShapeBar = !1;
    static resizable = !1;
    static type = "label";
  }),
  (FlowChart.shapeTemplates.labelOverLink = class extends (
    FlowChart.shapeTemplates.label
  ) {
    static offset(t) {
      var e = 0,
        i = 0;
      return (
        FlowChart.private.getLabelXY(t, t.link).direction ==
        FlowChart.direction.vertical
          ? (e = -t.width / 2 - 10)
          : (i = -t.height / 2 - 10),
        { x: e, y: i }
      );
    }
  }),
  (FlowChart.shapeTemplates.psuedo = class extends (
    FlowChart.shapeTemplates.base
  ) {
    static displayName = "Psuedo";
    static svg(t) {
      return `<circle r="${t.width / 2}" cx="${t.width / 2}" cy="${
        t.height / 2
      }" style="stroke:${t.stroke}; fill:${
        t.fill
      }; stroke-width:1; opacity: 0;" ></circle>`;
    }
    static html(t) {
      return "";
    }
    static width = 10;
    static height = 10;
    static fill = "red";
    static stroke = "blue";
    static minWidth = 0;
    static minHeight = 0;
    static displayInShapeBar = !1;
    static displayInPortShapeBar = !1;
    static resizable = !1;
    static type = "psuedo-node";
  }),
  (FlowChart.MenuBar = class {
    _;
    get element() {
      return this._.getElement();
    }
    constructor(t) {
      this._ = new FlowChart.MenuBar.private(t);
    }
    init() {
      this._.init();
    }
    show() {
      this._.show();
    }
    hide() {
      this._.hide();
    }
    addItem(t) {
      return this._.addItem(t), this;
    }
    removeItem(t) {
      return this._.removeItem(t), this;
    }
  }),
  (FlowChart.MenuBar.private = class {
    chart;
    constructor(t) {
      this.chart = t;
    }
    refresh() {
      var t = this.chart.element.querySelector('[data-menu-item="undo"]');
      t &&
        (this.chart.options.interactive || 0 != this.chart._.undoStepsCount()
          ? t.classList.remove("bfc-disabled-opacity")
          : t.classList.add("bfc-disabled-opacity"));
      var e = this.chart.element.querySelector('[data-menu-item="redo"]');
      e &&
        (0 == this.chart._.redoStepsCount()
          ? e.classList.add("bfc-disabled-opacity")
          : e.classList.remove("bfc-disabled-opacity"));
    }
    simulateMouseClickOnKeydown(t) {
      var e = this.getElement().querySelector(`[data-menu-item="${t}"]`);
      if (e) {
        var i = function (t) {
          e.classList.remove("bfc-menu-item-selected"),
            document.removeEventListener("keyup", i);
        };
        e.classList.add("bfc-menu-item-selected"),
          document.addEventListener("keyup", i);
      }
    }
    getElement() {
      return this.chart.element.querySelector("[data-menubar]");
    }
    show() {
      this.getElement().style.display = "";
    }
    hide() {
      this.getElement().style.display = "none";
    }
    handlerClick(t, e, i) {
      var r = { event: t, name: e };
      !1 !== FlowChart.events.publish("menu-item-click", [this.chart, r]) &&
        ("undo" == e && this.chart._.undo(),
        "redo" == e && this.chart._.redo());
    }
    addItem(t) {
      this.getElement().querySelector(
        "[data-menu-items]"
      ).innerHTML += `<div class="bfc-menu-item" title="${t.title}" data-menu-item="${t.name}">${t.icon}</div>`;
    }
    removeItem(t) {
      var e = this.getElement().querySelector(`[data-menu-item="${t}"]`);
      e && e.parentElement.removeChild(e);
    }
    init() {
      var t = this.getElement(),
        e = sessionStorage.getItem("menubar-position");
      e &&
        ((e = JSON.parse(e)),
        (t.style.left = e.left + "px"),
        (t.style.top = e.top + "px")),
        (t.innerHTML =
          '<div class="bfc-bar-move">\n                        <div class="bfc-bar-move-line"></div>\n                    </div>\n                    <div class="bfc-bar-content" data-menu-items>\n                          \n                    </div>  '),
        this.addItem({
          title: "Undo",
          icon: FlowChart.icon.undo(26, 26, "#8B8B8B", 0, 0),
          name: "undo",
        }),
        this.addItem({
          title: "Redo",
          icon: FlowChart.icon.redo(26, 26, "#8B8B8B", 0, 0),
          name: "redo",
        });
    }
  }),
  (FlowChart.private.prototype.showPortsUI = function () {
    this.hidePortsUI();
    var t = this.chart.ports.getElement(this.selectedPortShape.id),
      e = this.selectedPortShape.element;
    !t &&
      e &&
      ((t = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      )).classList.add("bfc-s-ports"),
      t.setAttribute("data-ports-s-id", this.selectedPortShape.id),
      t.setAttribute(
        "transform",
        `translate(${this.selectedPortShape.left},${this.selectedPortShape.top})`
      ),
      (t.innerHTML = this.portHTMLUI(this.selectedPortShape, this.chart.scale)),
      e.parentNode.insertBefore(t, e));
  }),
  (FlowChart.private.prototype.hidePortsUI = function () {
    this.hidePortShapeBarUI();
    for (
      var t = this.chart.svgElement.querySelectorAll("[data-ports-s-id]"),
        e = 0;
      e < t.length;
      e++
    )
      t[e].parentNode.removeChild(t[e]);
  }),
  (FlowChart.private.prototype.updatePortsElement = function (t) {
    var e = this.chart.svgElement.querySelector("[data-ports-s-id]");
    if (e) {
      e.setAttribute(
        "transform",
        `translate(${this.selectedPortShape.left},${this.selectedPortShape.top})`
      );
      var i = e.getAttribute("data-ports-s-id"),
        r = this.chart.getShape(i);
      e.innerHTML = this.portHTMLUI(r, t);
    }
  }),
  (FlowChart.private.prototype.portHTMLUI = function (t, e) {
    var i = "",
      r = FlowChart.shapeTemplates[t.templateId].ports(t);
    if (!FlowChart.isNEU(r)) {
      for (var a in r) {
        var o = r[a],
          s = 40,
          h = 40,
          l = o.x,
          n = o.y,
          c = 0;
        switch (FlowChart.private.getPortPosition(o, t)) {
          case FlowChart.position.topRight:
            (n -= h / e), (c = 45);
            break;
          case FlowChart.position.bottomRight:
            c = 135;
            break;
          case FlowChart.position.bottomLeft:
            (l -= s / e), (c = 225);
            break;
          case FlowChart.position.topLeft:
            (l -= s / e), (n -= h / e), (c = -45);
            break;
          case FlowChart.position.left:
            (l -= s / e), (n -= h / 2 / e), (c = -90);
            break;
          case FlowChart.position.right:
            (n -= h / 2 / e), (c = 90);
            break;
          case FlowChart.position.top:
            (l -= s / 2 / e), (n -= h / e);
            break;
          case FlowChart.position.bottom:
            (l -= s / 2 / e), (c = -180);
        }
        i += `<g class="bfc-port-out" data-port-out-port="${a}" data-port-out-shape="${
          t.id
        }" transform="rotate(${c})"><rect style="opacity: 0" x="${l}" y="${n}" width="${
          s / e
        }" height="${h / e}"></rect>${FlowChart.icon.arrow(
          s / e,
          h / e,
          "#ffca28",
          l,
          n
        )}</g>`;
      }
      i =
        `<rect style="opacity: 0" x="${-s / e}" y="${-h / e}"  width="${
          t.width + (s / e) * 2
        }" height="${t.height + (h / e) * 2}"></rect>` + i;
    }
    return i;
  }),
  (FlowChart.private.prototype.hidePortShapeBarUI = function () {
    for (
      var t = this.chart.element.querySelectorAll("[data-portsb-shape]"), e = 0;
      e < t.length;
      e++
    )
      t[e].parentNode.removeChild(t[e]);
  }),
  (FlowChart.private.prototype.portShapeBarHTMLUI = function () {
    var t = "";
    for (var e in FlowChart.shapeTemplates) {
      var i = FlowChart.shapeTemplates[e];
      if (i.displayInPortShapeBar) {
        var r = { templateId: e };
        (r.width = "fit" == i.width ? i.minWidth : i.width),
          (r.height = "fit" == i.height ? i.minHeight : i.height),
          (r.fill = i.fill),
          (r.stroke = i.stroke),
          (r.strokeWidth = i.strokeWidth),
          (t += `<div data-portshapebar-item-id="${e}">\n                    <svg class="bfc-portshapebar-svg ${
            r.templateId
          }" viewBox="0 0 ${r.width} ${
            r.height
          }" preserveAspectRatio="xMidYMid meet" >\n                        ${i.svg(
            r
          )}\n                    </svg>                   \n                </div>`);
      }
    }
    return t;
  }),
  (FlowChart.private.prototype.showPortShapeBarUI = function (t) {
    var e = this.chart.ports.getByPosition(this.chart.selectedShapes.last, t);
    e &&
      e.length &&
      ((this.chart.selectedPort = e[0]),
      this.selectPortShapeShapeBarItem(
        !1,
        this.lastAddedTemplateIdFormPortShapeBar
      ));
  }),
  (FlowChart.private.prototype.navigatePortShapeBarItems = function (t) {
    var e = this.chart.element.querySelector("[data-portsb-shape]");
    if (e) {
      var i = e.getAttribute("data-portsb-shape"),
        r = e.getAttribute("data-portsb-port"),
        a = this.chart.ports.get(i, r),
        o = FlowChart.shapeTemplates[a.shape.templateId],
        s = FlowChart.private.getPortPosition(o.ports(a.shape)[a.id], a.shape);
      s == FlowChart.position.left &&
        (t == FlowChart.position.bottom && this.selectPortShapeShapeBarItem(!0),
        t == FlowChart.position.top && this.selectPortShapeShapeBarItem(!1),
        t == FlowChart.position.right && this.showPortShapeBarByPosition(t)),
        s == FlowChart.position.right &&
          (t == FlowChart.position.bottom &&
            this.selectPortShapeShapeBarItem(!0),
          t == FlowChart.position.top && this.selectPortShapeShapeBarItem(!1),
          t == FlowChart.position.left && this.showPortShapeBarByPosition(t)),
        s == FlowChart.position.top &&
          (t == FlowChart.position.right &&
            this.selectPortShapeShapeBarItem(!0),
          t == FlowChart.position.left && this.selectPortShapeShapeBarItem(!1),
          t == FlowChart.position.bottom && this.showPortShapeBarByPosition(t)),
        s == FlowChart.position.bottom &&
          (t == FlowChart.position.right &&
            this.selectPortShapeShapeBarItem(!0),
          t == FlowChart.position.left && this.selectPortShapeShapeBarItem(!1),
          t == FlowChart.position.top && this.showPortShapeBarByPosition(t));
    } else this.showPortShapeBarByPosition(t);
  }),
  (FlowChart.private.prototype.showPortShapeBarByPosition = function (t) {
    var e = this.chart.ports.getByPosition(t);
    if (e && e.length) {
      var i = e[0];
      this.showPortShapeBar(i), this.selectPortShapeShapeBarItem(!1);
    }
  }),
  (FlowChart.private.prototype.createNodeFromPorsShapeBarItem = function () {
    this.selectedPort;
    var t = this,
      e = this.selectedPort,
      i = this.chart.element.querySelector(
        `[data-portsb-shape="${e.shape.id}"][data-portsb-port="${e.id}"]`
      ),
      r = i.querySelector(".bfc-portshapebar-selected");
    if (r) {
      this.chart.editor.hasActiveField() && this.chart.editor.blur();
      var a = i.getAttribute("data-portsb-shape"),
        o = i.getAttribute("data-portsb-port"),
        s = this.chart.ports.get(a, o),
        h = r.getAttribute("data-portshapebar-item-id");
      (this.lastAddedTemplateIdFormPortShapeBar = h),
        this.addNodeWithLink(s, h, function (e, i) {
          t.chart.selectedShapes.clear(), t.chart.selectedShapes.add(e);
        });
    }
  }),
  (FlowChart.private.prototype.selectPortShapeShapeBarItem = function (t, e) {
    var i = this.chart.element.querySelector("[data-portsb-shape]");
    if (i) {
      for (
        var r = i.querySelectorAll("[data-portshapebar-item-id]"),
          a = -1,
          o = 0;
        o < r.length;
        o++
      )
        (s = r[o]).classList.contains("bfc-portshapebar-selected") &&
          ((a = o), s.classList.remove("bfc-portshapebar-selected"));
      if (e) {
        for (var s of r)
          if (s.getAttribute("data-portshapebar-item-id") == e) {
            s.classList.add("bfc-portshapebar-selected");
            break;
          }
      } else
        for (
          t ? a++ : a--,
            a >= r.length ? (a = 0) : a < 0 && (a = r.length - 1),
            o = 0;
          o < r.length;
          o++
        )
          (s = r[o]), a == o && s.classList.add("bfc-portshapebar-selected");
    }
  }),
  (FlowChart.private.prototype.showPortShapeBar = function () {
    for (
      var t = this.chart.element.querySelectorAll("[data-portsb-shape]"), e = 0;
      e < t.length;
      e++
    )
      t[e].parentNode.removeChild(t[e]);
    var i = this.portShapeBarHTMLUI(this.selectedPort),
      r = document.createElement("div");
    r.classList.add("bfc-portshapebar"),
      r.setAttribute("data-portsb-shape", `${this.selectedPort.shape.id}`),
      r.setAttribute("data-portsb-port", `${this.selectedPort.id}`),
      (r.innerHTML = i),
      this.chart.element.appendChild(r);
    var a = this.chart.svgElement.querySelector(
        `[data-port-out-shape="${this.selectedPort.shape.id}"][data-port-out-port="${this.selectedPort.id}"]`
      ),
      o = this.chart.svgElement.querySelector(
        `[data-ports-s-id="${this.selectedPort.shape.id}"]`
      ),
      s = this.chart.svgElement.querySelectorAll(".bfc-ports-visible");
    for (var h of s) h.classList.remove("bfc-ports-visible");
    o.classList.add("bfc-ports-invisible"),
      a.classList.add("bfc-ports-visible");
    var l = a.getBoundingClientRect(),
      n = this.chart.element.getBoundingClientRect(),
      c = r.getBoundingClientRect(),
      d = 0,
      p = 0,
      u = parseFloat(
        window.getComputedStyle(r, null).getPropertyValue("padding-top")
      ),
      f = parseFloat(
        window.getComputedStyle(r, null).getPropertyValue("padding-bottom")
      ),
      y = 0;
    switch (this.selectedPort.position) {
      case FlowChart.position.top:
        (d = l.left + l.width / 2 - n.left - c.width / 2),
          (p = l.top - n.top - c.height + 3);
        break;
      case FlowChart.position.bottom:
        (d = l.left + l.width / 2 - n.left - c.width / 2),
          (p = l.bottom - n.top - 3);
        break;
      case FlowChart.position.left:
        (r.style.width = c.height - (u + f) + "px"),
          (c = r.getBoundingClientRect()),
          (d = l.left - n.left - c.width + 3),
          (p = l.bottom - n.top - l.height / 2 - c.height / 2);
        break;
      case FlowChart.position.right:
        (r.style.width = c.height - (u + f) + "px"),
          (c = r.getBoundingClientRect()),
          (d = l.right - n.left - 3),
          (p = l.bottom - n.top - l.height / 2 - c.height / 2);
        break;
      case FlowChart.position.topLeft:
        (y = 135),
          (d = l.left - n.left - c.width / 2 + 3),
          (p = l.top - n.top - c.height / 2 + 3);
        break;
      case FlowChart.position.topRight:
        (y = 45),
          (d = l.right - n.left - c.width / 2 - 3),
          (p = l.top - n.top - c.height / 2 + 3);
        break;
      case FlowChart.position.bottomRight:
        (y = 135),
          (d = l.right - n.left - c.width / 2 - 3),
          (p = l.bottom - n.top - c.height / 2 - 3);
        break;
      case FlowChart.position.bottomLeft:
        (y = 45),
          (d = l.left - n.left - c.width / 2 + 3),
          (p = l.bottom - n.top - c.height / 2 - 3);
    }
    (r.style.left = d + "px"),
      (r.style.top = p + "px"),
      (r.style.transformOrigin = "center"),
      (r.style.transform = `rotate(${y}deg)`);
  }),
  (FlowChart.SelectedShapeCollection = class extends Array {
    _;
    constructor(t) {
      super(), (this._ = new FlowChart.SelectedShapeCollection.private(t));
    }
    get first() {
      return this.length ? this[0] : null;
    }
    get last() {
      return this.length ? this[this.length - 1] : null;
    }
    get nodes() {
      var t = [];
      for (var e of this) "label" != e.type && t.push(e);
      return t;
    }
    get labels() {
      var t = [];
      for (var e of this) "label" == e.type && t.push(e);
      return t;
    }
    add(t) {
      t.selected
        ? -1 == this.indexOf(t) &&
          (this._.chart._.snap(),
          this.push(t),
          this._.chart._.changed({ property: "selectedShapes" }))
        : (t.selected = !0);
    }
    remove(t) {
      if (t.selected) t.selected = !1;
      else
        for (var e = this.length - 1; e >= 0; e--)
          if (t == this[e])
            return (
              this._.chart._.snap(),
              this.splice(e, 1),
              void this._.chart._.changed({ property: "selectedShapes" })
            );
    }
    clear() {
      this.length &&
        (this._.chart._.snap(),
        this._.chart.nodes._.clearSelectedMetadata(),
        this._.chart.labels._.clearSelectedMetadata(),
        this._.removeSelectorElement(),
        this.splice(0, this.length),
        this._.chart._.changed({ property: "selectedShapes" }));
    }
    addRange(t) {
      for (var e of t) this.add(e);
    }
    get(t) {
      for (var e of this) if (e.id == t) return e;
      return null;
    }
    contains(t) {
      return null != this.get(t);
    }
    selectNodeRight(t) {
      this._.selectRight(this._.chart.nodes, t, this);
    }
    selectNodeLeft(t) {
      this._.selectLeft(this._.chart.nodes, t, this);
    }
    selectNodeAbove(t) {
      this._.selectAbove(this._.chart.nodes, t, this);
    }
    selectNodeBelow(t) {
      this._.selectBelow(this._.chart.nodes, t, this);
    }
  }),
  (FlowChart.SelectedShapeCollection.private = class {
    chart;
    arrayBeforeShiftPressed;
    constructor(t) {
      (this.chart = t), (this.arrayBeforeShiftPressed = []);
    }
    selectRight(t, e, i) {
      var r = i[i.length - 1],
        a = null;
      for (var o of t) {
        var s;
        o != r &&
          r.right - o.left <= 0 &&
          (null == a
            ? (a = {
                shape: o,
                hypot: (s = Math.hypot(o.y - r.y, o.left - r.right)),
              })
            : (s = Math.hypot(o.y - r.y, o.left - r.right)) < a.hypot &&
              (a = { shape: o, hypot: s }));
      }
      this.hideAndShowNext(a, e, i);
    }
    selectLeft(t, e, i) {
      var r = i[i.length - 1],
        a = null;
      for (var o of t) {
        var s;
        o != r &&
          r.left - o.right >= 0 &&
          (null == a
            ? (a = {
                shape: o,
                hypot: (s = Math.hypot(o.y - r.y, o.right - r.left)),
              })
            : (s = Math.hypot(o.y - r.y, o.right - r.left)) < a.hypot &&
              (a = { shape: o, hypot: s }));
      }
      this.hideAndShowNext(a, e, i);
    }
    selectAbove(t, e, i) {
      var r = i[i.length - 1],
        a = null;
      for (var o of t) {
        var s;
        o != r &&
          r.top - o.bottom >= 0 &&
          (null == a
            ? (a = {
                shape: o,
                hypot: (s = Math.hypot(o.x - r.x, o.bottom - r.top)),
              })
            : (s = Math.hypot(o.x - r.x, o.bottom - r.top)) < a.hypot &&
              (a = { shape: o, hypot: s }));
      }
      this.hideAndShowNext(a, e, i);
    }
    selectBelow(t, e, i) {
      var r = i[i.length - 1],
        a = null;
      for (var o of t) {
        var s;
        r.bottom - o.top <= 0 &&
          (null == a
            ? (a = {
                shape: o,
                hypot: (s = Math.hypot(o.x - r.x, o.top - r.bottom)),
              })
            : (s = Math.hypot(o.x - r.x, o.top - r.bottom)) < a.hypot &&
              (a = { shape: o, hypot: s }));
      }
      this.hideAndShowNext(a, e, i);
    }
    hideAndShowNext(t, e, i) {
      if (t) {
        for (var r of (e && i.clear(), i))
          -1 == this.arrayBeforeShiftPressed.indexOf(r) && (r.selected = !1);
        (t.shape.selected = !0), this.chart.makeShapeVisible(t.shape);
      }
    }
    update(t, e) {
      var i = this.chart.svgElement.querySelector(
        `[data-selector-shape-id="${t.id}"]`
      );
      if (i) {
        var r = FlowChart.shapeTemplates[t.templateId].offset(t),
          a = t.left + r.x,
          o = t.right + r.x,
          s = t.top + r.y,
          h = t.bottom + r.y,
          l = t.width,
          n = t.height,
          c = t.x + r.x,
          d = t.y + r.y,
          p = i.querySelector(".bfc-selector-rect");
        p.setAttribute("x", a),
          p.setAttribute("y", s),
          p.setAttribute("width", l),
          p.setAttribute("height", n),
          p.setAttribute("stroke-width", t.strokeWidth);
        for (var u = 1; u <= 2; u++) {
          var f = i.querySelector(`[data-selector-dot-${u}="topLeft"]`);
          f &&
            (f.setAttribute("cx", a),
            f.setAttribute("cy", s),
            f.setAttribute("transform", `scale(${1 / e})`));
          var y = i.querySelector(`[data-selector-dot-${u}="top"]`);
          y &&
            (y.setAttribute("cx", c),
            y.setAttribute("cy", s),
            y.setAttribute("transform", `scale(${1 / e})`));
          var m = i.querySelector(`[data-selector-dot-${u}="topRight"]`);
          m &&
            (m.setAttribute("cx", o),
            m.setAttribute("cy", s),
            m.setAttribute("transform", `scale(${1 / e})`));
          var g = i.querySelector(`[data-selector-dot-${u}="right"]`);
          g &&
            (g.setAttribute("cx", o),
            g.setAttribute("cy", d),
            g.setAttribute("transform", `scale(${1 / e})`));
          var v = i.querySelector(`[data-selector-dot-${u}="bottomRight"]`);
          v &&
            (v.setAttribute("cx", o),
            v.setAttribute("cy", h),
            v.setAttribute("transform", `scale(${1 / e})`));
          var w = i.querySelector(`[data-selector-dot-${u}="bottom"]`);
          w &&
            (w.setAttribute("cx", c),
            w.setAttribute("cy", h),
            w.setAttribute("transform", `scale(${1 / e})`));
          var C = i.querySelector(`[data-selector-dot-${u}="bottomLeft"]`);
          C &&
            (C.setAttribute("cx", a),
            C.setAttribute("cy", h),
            C.setAttribute("transform", `scale(${1 / e})`));
          var x = i.querySelector(`[data-selector-dot-${u}="left"]`);
          x &&
            (x.setAttribute("cx", a),
            x.setAttribute("cy", d),
            x.setAttribute("transform", `scale(${1 / e})`));
        }
      }
    }
    hideUI() {
      var t = this.chart.svgElement.querySelectorAll(
        "[data-selector-shape-id]"
      );
      for (var e of t) e.style.display = "none";
    }
    showUI() {
      var t = this.chart.svgElement.querySelectorAll(
        "[data-selector-shape-id]"
      );
      for (var e of t) e.style.display = "";
    }
    removeSelectorElement(t) {
      if (t)
        (i = this.chart.svgElement.querySelector(
          `[data-selector-shape-id="${t.id}"]`
        )) && i.parentNode.removeChild(i);
      else {
        var e = this.chart.svgElement.querySelectorAll(
          "[data-selector-shape-id]"
        );
        for (var i of e) i.parentNode.removeChild(i);
      }
    }
    createSelectorElement(t) {
      this.removeSelectorElement(t);
      var e = document.createElementNS("http://www.w3.org/2000/svg", "g");
      e.classList.add("bfc-selector"),
        e.setAttribute("data-selector-shape-id", t.id),
        (e.innerHTML = this.html(t, this.chart.scale)),
        FlowChart.private
          .getLayer(this.chart.svgElement, t.layer)
          .appendChild(e);
    }
    getBox() {
      var t = {
        x: void 0,
        y: void 0,
        top: Number.MAX_SAFE_INTEGER,
        bottom: Number.MIN_SAFE_INTEGER,
        right: Number.MIN_SAFE_INTEGER,
        left: Number.MAX_SAFE_INTEGER,
        width: void 0,
        height: void 0,
      };
      for (var e of this.chart.selectedShapes)
        FlowChart.shapeTemplates[e.templateId],
          e.left < t.left && (t.left = e.left),
          e.top < t.top && (t.top = e.top),
          e.right > t.right && (t.right = e.right),
          e.bottom > t.bottom && (t.bottom = e.bottom);
      return (
        (t.width = t.right - t.left),
        (t.height = t.bottom - t.top),
        (t.x = t.left + t.width / 2),
        (t.y = t.top + t.height / 2),
        t
      );
    }
    html(t, e) {
      var i = 1 / e,
        r = FlowChart.shapeTemplates[t.templateId].offset(t),
        a = t.left + r.x,
        o = t.right + r.x,
        s = t.top + r.y,
        h = t.bottom + r.y,
        l = t.width,
        n = t.height,
        c = t.x + r.x,
        d = t.y + r.y,
        p = `<rect stroke-width="${t.strokeWidth}" class="bfc-selector-rect" x="${a}" y="${s}" width="${l}" height="${n}"></rect>`;
      return (
        t.resizable &&
          this.chart.selectedShapes.nodes.length > 0 &&
          (p += `<circle transform="scale(${i})" data-selector-dot-1="topLeft" cx="${a}" cy="${s}" r="5"></circle>\n            <circle transform="scale(${i})" data-selector-dot-1="top"  cx="${c}" cy="${s}" r="5"></circle>\n            <circle transform="scale(${i})" data-selector-dot-1="topRight"  cx="${o}" cy="${s}" r="5"></circle>\n            <circle transform="scale(${i})" data-selector-dot-1="right"  cx="${o}" cy="${d}" r="5"></circle>\n            <circle transform="scale(${i})" data-selector-dot-1="bottomRight"  cx="${o}" cy="${h}" r="5"></circle>\n            <circle transform="scale(${i})" data-selector-dot-1="bottom"  cx="${c}" cy="${h}" r="5"></circle>\n            <circle transform="scale(${i})" data-selector-dot-1="bottomLeft"  cx="${a}" cy="${h}" r="5"></circle>\n            <circle transform="scale(${i})" data-selector-dot-1="left"  cx="${a}" cy="${d}" r="5"></circle>                   \n            \n            <circle transform="scale(${i})" data-selector-dot-2="topLeft" cx="${a}" cy="${s}" r="10"></circle>\n            <circle transform="scale(${i})" data-selector-dot-2="top"  cx="${c}" cy="${s}" r="10"></circle>\n            <circle transform="scale(${i})" data-selector-dot-2="topRight"  cx="${o}" cy="${s}" r="10"></circle>\n            <circle transform="scale(${i})" data-selector-dot-2="right"  cx="${o}" cy="${d}" r="10"></circle>\n            <circle transform="scale(${i})" data-selector-dot-2="bottomRight"  cx="${o}" cy="${h}" r="10"></circle>\n            <circle transform="scale(${i})" data-selector-dot-2="bottom"  cx="${c}" cy="${h}" r="10"></circle>\n            <circle transform="scale(${i})" data-selector-dot-2="bottomLeft"  cx="${a}" cy="${h}" r="10"></circle>\n            <circle transform="scale(${i})" data-selector-dot-2="left" cx="${a}" cy="${d}" r="10"></circle>`),
        p
      );
    }
  }),
  (FlowChart.Editor = class {
    _;
    element;
    constructor(t) {
      this._ = new FlowChart.Editor.private(t);
    }
    blur() {
      this._.blur();
    }
    clearFieldBorders() {
      this._.clearFieldBorders();
    }
    editFirstFieldIfAny(t) {
      this._.editFirstFieldIfAny(t);
    }
    getFieldNames(t) {
      return this._.getFieldNames(t);
    }
    hasActiveField() {
      return this._.hasActiveField();
    }
    edit(t, e) {
      this._.edit(t, e);
    }
    selectNextField() {
      this._.selectNextField();
    }
  }),
  (FlowChart.Editor.private = class {
    chart;
    constructor(t) {
      this.chart = t;
    }
    getFieldNames(t) {
      for (
        var e = [], i = t.element.querySelectorAll("[data-field]"), r = 0;
        r < i.length;
        r++
      ) {
        var a = i[r].getAttribute("data-field");
        e.push(a);
      }
      return e;
    }
    editFirstFieldIfAny(t) {
      var e = this.getFieldNames(t);
      e.length && this.edit(t, e[0]);
    }
    blur() {
      for (
        var t = this.chart.svgElement.querySelectorAll("[contenteditable]"),
          e = 0;
        e < t.length;
        e++
      )
        t[e].blur();
    }
    selectNextField() {
      for (
        var t = this.chart.svgElement.querySelector("[contenteditable]"),
          e = t.parentNode;
        e && e.hasAttribute && !e.hasAttribute("data-shape-id");

      )
        e = e.parentNode;
      if (e && e.hasAttribute && e.hasAttribute("data-shape-id")) {
        var i = t.getAttribute("data-field"),
          r = e.getAttribute("data-shape-id"),
          a = this.chart.getShape(r),
          o = this.getFieldNames(a),
          s = o.indexOf(i);
        ++s >= o.length && (s = 0), this.edit(a, o[s]);
      }
    }
    clearFieldBorders() {
      for (
        var t = this.chart.svgElement.querySelectorAll(".bfc-field-border"),
          e = t.length - 1;
        e >= 0;
        e--
      )
        t[e].parentNode.removeChild(t[e]);
    }
    hasActiveField() {
      return (
        null !=
        this.chart.svgElement.querySelector("[data-field][contenteditable]")
      );
    }
    edit(t, e) {
      t.element;
      for (
        var i = t.element.querySelectorAll("[data-field-selector]"), r = 0;
        r < i.length;
        r++
      )
        i[r].parentNode.removeChild(i[r]);
      var a = t.element.querySelectorAll("[data-field]");
      for (r = 0; r < a.length; r++) {
        var o = (m = a[r]).getAttribute("data-field"),
          s = o;
        m.hasAttribute("data-title") && (s = m.getAttribute("data-title"));
        var h = m.getBoundingClientRect(),
          l = h.left,
          n = h.top,
          c = h.width,
          d = h.height,
          p = l - t.left * this.chart.scale,
          u = n - t.top * this.chart.scale;
        const e = new DOMPoint(p, u);
        var f = this.chart.svgElement.getScreenCTM().inverse();
        const i = e.matrixTransform(f);
        var y = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        y.setAttribute("width", c / this.chart.scale),
          y.setAttribute("height", d / this.chart.scale),
          y.setAttribute("x", i.x),
          y.setAttribute("y", i.y),
          y.setAttribute("data-field-selector", o),
          y.classList.add("bfc-field-border"),
          (y.innerHTML = `<title>${s}</title>`),
          t.element.appendChild(y);
      }
      if (e) {
        var m,
          g = this,
          v = this.chart.svgElement.querySelectorAll("[contenteditable]");
        for (r = 0; r < v.length; r++) v[r].blur();
        (m = this.chart.svgElement.querySelector(
          `[data-shape-id="${t.id}"] [data-field="${e}"]`
        )).setAttribute("contenteditable", ""),
          m.addedPasteEventHandler ||
            (m.addEventListener("paste", function (t) {
              t.preventDefault();
              var e = t.clipboardData.getData("text/plain");
              document.execCommand("insertText", !1, e);
            }),
            (m.addedPasteEventHandler = !0));
        var w = document.createRange();
        w.selectNodeContents(m);
        var C = window.getSelection();
        C.removeAllRanges(),
          C.addRange(w),
          m.focus(),
          m.blurAdded ||
            (m.addEventListener("blur", function (t) {
              for (
                var e = g.chart.svgElement.querySelector("[contenteditable]"),
                  i = e.getAttribute("data-field"),
                  r = e.innerHTML.trim(),
                  a = e;
                !a.hasAttribute("data-shape-id");

              )
                a = a.parentNode;
              var o = a.getAttribute("data-shape-id");
              (g.chart.getShape(o)[i] = r),
                e.removeAttribute("contenteditable");
            }),
            (m.blurAdded = !0));
      }
    }
  }),
  (FlowChart.private.prototype.reposition = function (t) {
    if (this.chart.nodes.length) {
      t || (t = this.chart.options.startPosition);
      var e = this.svgBCR.width,
        i = this.svgBCR.height,
        r = e / 2,
        a = i / 2,
        o = this.chart.viewBox,
        s =
          this.chart.nodes.right -
          this.chart.nodes.left +
          2 * FlowChart.PADDING,
        h =
          this.chart.nodes.bottom -
          this.chart.nodes.top +
          2 * FlowChart.PADDING;
      switch (t) {
        case FlowChart.startPosition.center:
          (o[0] =
            this.chart.nodes.left +
            (this.chart.nodes.right - this.chart.nodes.left) / 2 -
            r / this.chart.scale),
            (o[1] =
              this.chart.nodes.top +
              (this.chart.nodes.bottom - this.chart.nodes.top) / 2 -
              a / this.chart.scale),
            (this.chart.viewBox = o);
          break;
        case FlowChart.startPosition.centerTop:
          var l = this.chart.nodes._.minShapeY;
          (o[0] = l.x - r / this.chart.scale),
            (o[1] = l.top - FlowChart.PADDING),
            (this.chart.viewBox = o);
          break;
        case FlowChart.startPosition.centerBottom:
          (l = this.chart.nodes._.maxShapeY),
            (o[0] = l.x - r / this.chart.scale),
            (o[1] = l.bottom + FlowChart.PADDING - i / this.chart.scale),
            (this.chart.viewBox = o);
          break;
        case FlowChart.startPosition.centerRight:
          (l = this.chart.nodes._.minShapeX),
            (o[0] = l.left - FlowChart.PADDING),
            (o[1] = l.y - a / this.chart.scale),
            (this.chart.viewBox = o);
          break;
        case FlowChart.startPosition.centerLeft:
          (l = this.chart.nodes._.maxShapeX),
            (o[0] = l.right + FlowChart.PADDING - e / this.chart.scale),
            (o[1] = l.y - a / this.chart.scale),
            (this.chart.viewBox = o);
          break;
        case FlowChart.startPosition.fitHeight:
        case FlowChart.startPosition.fitWidth:
        case FlowChart.startPosition.fit:
          var n = FlowChart.private.getFitScale(
            e,
            i,
            t,
            this.chart.options.maxScale,
            this.chart.options.minScale,
            s,
            h
          );
          (s =
            this.chart.nodes.right -
            this.chart.nodes.left +
            (2 * FlowChart.PADDING) / n),
            (h =
              this.chart.nodes.top -
              this.chart.nodes.left +
              (2 * FlowChart.PADDING) / n),
            (this.chart.scale = n),
            ((o = this.chart.viewBox)[0] =
              this.chart.nodes._.minShapeX.left -
              (e / n -
                (this.chart.nodes._.maxShapeX.right -
                  this.chart.nodes._.minShapeX.left)) /
                2),
            (o[1] =
              this.chart.nodes._.minShapeY.top -
              (i / n -
                (this.chart.nodes._.maxShapeY.bottom -
                  this.chart.nodes._.minShapeY.top)) /
                2),
            (this.chart.viewBox = o);
      }
    }
  }),
  (FlowChart.private.prototype.makeShapesVisible = function (t, e) {
    this.makeShapeVisibleInterval &&
      (clearInterval(this.makeShapeVisibleInterval),
      (this.makeShapeVisibleInterval = null));
    var i = {
        top: Number.MAX_SAFE_INTEGER,
        left: Number.MAX_SAFE_INTEGER,
        right: Number.MIN_SAFE_INTEGER,
        bottom: Number.MIN_SAFE_INTEGER,
      },
      r = this.svgBCR.width,
      a = this.svgBCR.height;
    for (var o of t)
      o.top < i.top && (i.top = o.top),
        o.bottom > i.bottom && (i.bottom = o.bottom),
        o.left < i.left && (i.left = o.left),
        o.right > i.right && (i.right = o.right);
    var s = this.chart.viewBox,
      h = s.slice();
    (s[0] = Math.max(i.right + FlowChart.PADDING - r / this.chart.scale, s[0])),
      (s[1] = Math.max(
        i.bottom + FlowChart.PADDING - a / this.chart.scale,
        s[1]
      )),
      (s[0] = Math.min(i.left - FlowChart.PADDING, s[0])),
      (s[1] = Math.min(i.top - FlowChart.PADDING, s[1])),
      h[0] != s[0] || h[1] != s[1]
        ? (this.makeShapeVisibleInterval = FlowChart.private.animate(
            this.chart.svgElement,
            { viewBox: h },
            { viewBox: s },
            300,
            FlowChart.anim.outPow,
            function () {
              e && e();
            }
          ))
        : e && e();
  }),
  (FlowChart.private.prototype.animateShapes = function (t, e, i, r) {
    FlowChart.private.animate(t, e, i, 300, FlowChart.anim.outPow, function () {
      r && r();
    });
  }),
  FlowChart.events.on("init", function (t) {
    t.menuBar._.refresh(), t.colorBar._.refresh(), t.statusBar._.refreshHint();
  }),
  FlowChart.events.on("changed", function (t, e) {
    t.colorBar._.refresh(), t.menuBar._.refresh(), t.statusBar._.refreshHint();
  }),
  FlowChart.events.on("undo-redo-changed", function (t) {
    t.colorBar._.refresh(), t.menuBar._.refresh(), t.statusBar._.refreshHint();
  }),
  FlowChart.events.on("selected-shapes-changed", function (t) {
    t.colorBar._.refresh(), t.menuBar._.refresh(), t.statusBar._.refreshHint();
  }),
  FlowChart.events.on("selected-port-change", function (t, e) {
    setTimeout(function () {
      t.colorBar._.refresh(),
        t.menuBar._.refresh(),
        t.statusBar._.refreshHint();
    }, 10);
  }),
  (FlowChart.StatusBar = class {
    _;
    constructor(t) {
      this._ = new FlowChart.StatusBar.private(t);
    }
    get element() {
      return this._.getElement();
    }
    get content() {
      return this._.getContent();
    }
    set content(t) {
      this._.setContent(t);
    }
    init() {
      this._.init();
    }
    show() {
      this._.show();
    }
    hide() {
      this._.hide();
    }
  }),
  (FlowChart.StatusBar.private = class {
    chart;
    useRefreshHint;
    constructor(t) {
      (this.chart = t), (this.useRefreshHint = !0);
    }
    init() {
      this.getElement().innerHTML = "<div data-status-hint>&nbsp;</div>";
    }
    show() {
      this.getElement().style.display = "";
    }
    hide() {
      this.getElement().style.display = "none";
    }
    getElement() {
      return this.chart.element.querySelector(".bfc-statusbar");
    }
    refreshHint() {
      if (this.useRefreshHint) {
        var t = this.chart._.getActiveComponentTypes();
        if (
          -1 != t.indexOf("shape") &&
          this.chart.selectedShapes.nodes.length == this.chart.nodes.length
        )
          this.setContent("Press F to fit to page and center.");
        else if (-1 != t.indexOf("node")) {
          for (
            var e = this.chart.selectedShapes.last, i = [], r = 0;
            r < this.chart.options.colors.length;
            r++
          ) {
            var a = this.chart.options.colors[r];
            e.fill != a && i.push(r + 1);
          }
          var o = "";
          for (r = 0; r < i.length; r++)
            0 == r
              ? (o += i[r])
              : r == i.length - 1
              ? (o += ` or ${i[r]}`)
              : (o += `, ${i[r]}`);
          this.setContent(
            `Press CTRL + Arrow to open port; Press Interval or Enter to edit; Press ${o} to change the color;`
          );
        } else
          -1 != t.indexOf("label")
            ? this.setContent("Press Interval or Edit to edit the label;")
            : -1 != t.indexOf("field")
            ? (this.chart.selectedShapes.last,
              this.setContent(
                "Press Escape to finish editing; Press CTRL + Arrow to open port;"
              ))
            : -1 != t.indexOf("port-shape-bar")
            ? this.setContent(
                "Select Shape with Arrows and press eneter to add new node;"
              )
            : -1 != t.indexOf("canvas") &&
              this.setContent(
                "Press CTRL + A to select all shapes and then press F to fit to page and center."
              );
      }
    }
    getContent() {
      var t = this.getElement().querySelector("[data-status-hint]");
      return t ? t.innerHTML : "";
    }
    setContent(t) {
      "" == t && (t = "&nbsp");
      var e = this.getElement().querySelector("[data-status-hint]");
      e && (e.innerHTML = t);
    }
  }),
  (FlowChart.ShapeBar = class {
    _;
    get element() {
      return this._.getElement();
    }
    constructor(t) {
      this._ = new FlowChart.ShapeBar.private(t);
    }
    init() {
      this._.init();
    }
    show() {
      this._.show();
    }
    hide() {
      this._.hide();
    }
  }),
  (FlowChart.ShapeBar.private = class {
    chart;
    constructor(t) {
      this.chart = t;
    }
    getElement() {
      return this.chart.element.querySelector("[data-shapebar]");
    }
    show() {
      this.getElement().style.display = "";
    }
    hide() {
      this.getElement().style.display = "none";
    }
    init() {
      var t = "";
      for (var e in FlowChart.shapeTemplates) {
        var i = FlowChart.shapeTemplates[e];
        if (i.displayInShapeBar) {
          var r = { templateId: e };
          (r.width = "fit" == i.width ? i.minWidth : i.width),
            (r.height = "fit" == i.width ? i.minHeight : i.height),
            (r.strokeWidth = i.strokeWidth),
            (r.fill = i.fill);
          var a = i.displayName;
          t += `<div data-shapebar-item-id="${e}">\n                        <svg  class="bfc-shapebar-svg ${
            r.templateId
          }" viewBox="0 0 ${r.width} ${
            r.height
          }" preserveAspectRatio="xMidYMid meet" >\n                            ${i.svg(
            r
          )}\n                        </svg>\n                        <div>${a}</div>              \n                    </div>`;
        }
      }
      var o = this.getElement(),
        s = sessionStorage.getItem("shapebar-position");
      s &&
        ((s = JSON.parse(s)),
        (o.style.left = s.left + "px"),
        (o.style.top = s.top + "px")),
        (o.innerHTML = `<div class="bfc-bar-move">\n                        <div class="bfc-bar-move-line"></div>\n                    </div>\n                    <div class="bfc-shapebar-shapes bfc-bar-content">\n                        ${t}  \n                    </div>  `);
    }
  }),
  (FlowChart.ColorBar = class {
    _;
    get element() {
      return this._.getElement();
    }
    constructor(t) {
      this._ = new FlowChart.ColorBar.private(t);
    }
    init() {
      this._.init();
    }
    show() {
      this._.show();
    }
    hide() {
      this._.hide();
    }
  }),
  (FlowChart.ColorBar.private = class {
    chart;
    constructor(t) {
      this.chart = t;
    }
    refresh() {
      var t = this.chart.element.querySelector("[data-color-palette]"),
        e = this.chart._.getActiveComponentTypes();
      for (var i of t.children)
        this.chart.options.interactive && -1 != e.indexOf("shape")
          ? i.classList.remove("bfc-disabled-grayscale")
          : i.classList.add("bfc-disabled-grayscale");
    }
    simulateMouseClickOnKeydown(t) {
      var e = this.getElement().querySelector(`[data-menu-item="${t}"]`);
      if (e) {
        var i = function (t) {
          e.classList.remove("bfc-menu-item-selected"),
            document.removeEventListener("keyup", i);
        };
        e.classList.add("bfc-menu-item-selected"),
          document.addEventListener("keyup", i);
      }
    }
    handlerClick(t, e, i) {
      var r = { event: t, name: e };
      if (
        !1 !== FlowChart.events.publish("menu-item-click", [this.chart, r]) &&
        0 == e.indexOf("color-")
      ) {
        var a = e.split("-")[1];
        this.chart._.changeFill(a);
      }
    }
    getElement() {
      return this.chart.element.querySelector("[data-colorbar]");
    }
    show() {
      this.getElement().style.display = "";
    }
    hide() {
      this.getElement().style.display = "none";
    }
    init() {
      for (var t = "", e = 0; e < this.chart.options.colors.length; e++)
        t += `<div class="bfc-menu-item" data-color-item="${e}" data-menu-item="color-${e}"><div class="bfc-color-item"  style="background-color: ${
          this.chart.options.colors[e]
        }">${e + 1}</div></div>`;
      t && (t = `<div data-color-palette class="bfc-color-palette">${t}</div>`);
      var i = this.getElement(),
        r = sessionStorage.getItem("colorbar-position");
      r &&
        ((r = JSON.parse(r)),
        (i.style.right = "unset"),
        (i.style.bottom = "unset"),
        (i.style.left = r.left + "px"),
        (i.style.top = r.top + "px")),
        (i.innerHTML = `<div class="bfc-bar-move">\n                        <div class="bfc-bar-move-line"></div>\n                    </div>\n                    <div class="bfc-colorbar-colors bfc-bar-content">\n                        ${t}  \n                    </div>  `);
    }
  }),
  (FlowChart.private.prototype.undo = function () {
    if (this.chart.options.useSession) {
      var t = this.undoStepsCount();
      if (0 != t) {
        this.putInRedoStack();
        var e = `${this.uid}_undo_` + (t - 1),
          i = sessionStorage.getItem(e);
        sessionStorage.removeItem(e);
        var r = JSON.parse(i);
        this.chart.load(r),
          FlowChart.events.publish("undo-redo-changed", [this.chart]);
      }
    }
  }),
  (FlowChart.private.prototype.redo = function () {
    if (this.chart.options.useSession) {
      var t = this.redoStepsCount();
      if (0 != t) {
        this.putInUndoStack();
        var e = `${this.uid}_redo_` + (t - 1),
          i = sessionStorage.getItem(e);
        sessionStorage.removeItem(e);
        var r = JSON.parse(i);
        this.chart.load(r),
          FlowChart.events.publish("undo-redo-changed", [this.chart]);
      }
    }
  }),
  (FlowChart.private.prototype.undoStepsCount = function () {
    if (!this.chart.options.useSession) return 0;
    for (
      var t = `${this.uid}_undo_`, e = Object.keys(sessionStorage), i = 0;
      -1 != e.indexOf(t + i);

    )
      i++;
    return i;
  }),
  (FlowChart.private.prototype.redoStepsCount = function () {
    if (!this.chart.options.useSession) return 0;
    for (
      var t = `${this.uid}_redo_`, e = Object.keys(sessionStorage), i = 0;
      -1 != e.indexOf(t + i);

    )
      i++;
    return i;
  }),
  (FlowChart.private.prototype.putInRedoStack = function () {
    if (this.chart.options.useSession) {
      var t = `${this.uid}_redo_` + this.redoStepsCount(),
        e = sessionStorage.getItem(`${this.uid}_state`);
      try {
        sessionStorage.setItem(t, e);
      } catch (t) {
        t.code == t.QUOTA_EXCEEDED_ERR && sessionStorage.clear(),
          console.error(t);
      }
    }
  }),
  (FlowChart.private.prototype.putInUndoStack = function () {
    if (this.chart.options.useSession) {
      var t = `${this.uid}_undo_` + this.undoStepsCount(),
        e = sessionStorage.getItem(`${this.uid}_state`);
      try {
        sessionStorage.setItem(t, e);
      } catch (t) {
        t.code == t.QUOTA_EXCEEDED_ERR && sessionStorage.clear(),
          console.error(t);
      }
    }
  }),
  (FlowChart.private.prototype.clearRedo = function () {
    if (this.chart.options.useSession) {
      for (
        var t = `${this.uid}_redo_`, e = Object.keys(sessionStorage), i = 0;
        -1 != e.indexOf(t + i);

      )
        sessionStorage.removeItem(t + i), i++;
      FlowChart.events.publish("undo-redo-changed", [this.chart]);
    }
  }),
  (FlowChart.private.prototype.clearUndo = function () {
    if (this.chart.options.useSession) {
      for (
        var t = `${this.uid}_undo_`, e = Object.keys(sessionStorage), i = 0;
        -1 != e.indexOf(t + i);

      )
        sessionStorage.removeItem(t + i), i++;
      FlowChart.events.publish("undo-redo-changed", [this.chart]);
    }
  }),
  (FlowChart.private.isObject = function (t) {
    return t && "object" == typeof t && !Array.isArray(t) && null !== t;
  }),
  (FlowChart.private.shadeColor = function (t, e) {
    var i = parseInt(t.substring(1, 3), 16),
      r = parseInt(t.substring(3, 5), 16),
      a = parseInt(t.substring(5, 7), 16);
    return (
      (i = (i = parseInt((i * (100 + e)) / 100)) < 255 ? i : 255),
      (r = (r = parseInt((r * (100 + e)) / 100)) < 255 ? r : 255),
      (a = (a = parseInt((a * (100 + e)) / 100)) < 255 ? a : 255),
      (i = Math.round(i)),
      (r = Math.round(r)),
      (a = Math.round(a)),
      "#" +
        (1 == i.toString(16).length ? "0" + i.toString(16) : i.toString(16)) +
        (1 == r.toString(16).length ? "0" + r.toString(16) : r.toString(16)) +
        (1 == a.toString(16).length ? "0" + a.toString(16) : a.toString(16))
    );
  }),
  (FlowChart.private.mergeDeep = function (t, e) {
    if (FlowChart.private.isObject(t) && FlowChart.private.isObject(e))
      for (var i in e)
        FlowChart.private.isObject(e[i])
          ? (t[i] || Object.assign(t, { [i]: {} }),
            FlowChart.private.mergeDeep(t[i], e[i]))
          : Object.assign(t, { [i]: e[i] });
    return t;
  }),
  (FlowChart.private.guid = function () {
    function t() {
      return Math.floor(65536 * (1 + Math.random()))
        .toString(16)
        .substring(1);
    }
    return (
      t() + t() + "-" + t() + "-" + t() + "-" + t() + "-" + t() + t() + t()
    );
  }),
  (FlowChart.private.rotate = function (t, e, i) {
    var r = (Math.PI / 180) * i,
      a = Math.cos(r),
      o = Math.sin(r);
    return {
      x: a * (e.x - t.x) + o * (e.y - t.y) + t.x,
      y: a * (e.y - t.y) - o * (e.x - t.x) + t.y,
    };
  }),
  (FlowChart.private.getScale = function (t, e, i) {
    var r = e / t[2],
      a = i / t[3];
    return r > a ? a : r;
  }),
  (FlowChart.private.pinchMiddlePointInPercent = function (t, e, i, r) {
    console.error("node implemented");
  }),
  (FlowChart.private.trim = function (t) {
    return t.replace(/^\s+|\s+$/g, "");
  }),
  (FlowChart.private.getClientTouchesXY = function (t, e) {
    return -1 != t.type.indexOf("touch")
      ? t.touches.length < e + 1
        ? { x: null, y: null }
        : { x: t.touches[e].clientX, y: t.touches[e].clientY }
      : { x: t.clientX, y: t.clientY };
  }),
  (FlowChart.private.roundPathCorners = function (t, e, i) {
    function r(t, e, i) {
      var r = e.x - t.x,
        o = e.y - t.y,
        s = Math.sqrt(r * r + o * o);
      return a(t, e, Math.min(1, i / s));
    }
    function a(t, e, i) {
      return { x: t.x + (e.x - t.x) * i, y: t.y + (e.y - t.y) * i };
    }
    function o(t, e) {
      t.length > 2 && ((t[t.length - 2] = e.x), (t[t.length - 1] = e.y));
    }
    function s(t) {
      return { x: parseFloat(t[t.length - 2]), y: parseFloat(t[t.length - 1]) };
    }
    if (Array.isArray(t) && t.length && !Array.isArray(t[0])) {
      for (var h = [], l = 0; l < t.length; l++) {
        var n = t[l];
        0 == l ? h.push(["M", n.x, n.y]) : h.push(["L", n.x, n.y]);
      }
      t = h;
    }
    if (Array.isArray(t)) {
      if (Array.isArray(t)) {
        var c = [];
        for (l = 0; l < t.length; l++) c[l] = t[l].slice(0);
        t = c;
      }
    } else
      t = (t = t.split(/[,\s]/).reduce(function (t, e) {
        var i = e.match("([a-zA-Z])(.+)");
        return i ? (t.push(i[1]), t.push(i[2])) : t.push(e), t;
      }, [])).reduce(function (t, e) {
        return (
          parseFloat(e) == e && t.length
            ? t[t.length - 1].push(e)
            : t.push([e]),
          t
        );
      }, []);
    var d = [];
    if (t.length > 1) {
      var p = s(t[0]),
        u = null;
      "Z" == t[t.length - 1][0] &&
        t[0].length > 2 &&
        ((u = ["L", p.x, p.y]), (t[t.length - 1] = u)),
        d.push(t[0]);
      for (var f = 1; f < t.length; f++) {
        var y = d[d.length - 1],
          m = t[f],
          g = m == u ? t[1] : t[f + 1];
        if (
          g &&
          y &&
          y.length > 2 &&
          "L" == m[0] &&
          g.length > 2 &&
          "L" == g[0]
        ) {
          var v,
            w,
            C = s(y),
            x = s(m),
            N = s(g);
          i
            ? ((v = a(x, y.origPoint || C, e)), (w = a(x, g.origPoint || N, e)))
            : ((v = r(x, C, e)), (w = r(x, N, e))),
            o(m, v),
            (m.origPoint = x),
            d.push(m);
          var b = a(v, x, 0.5),
            F = a(x, w, 0.5),
            I = ["C", b.x, b.y, F.x, F.y, w.x, w.y];
          (I.origPoint = x), d.push(I);
        } else d.push(m);
      }
      if (u) {
        var S = s(d[d.length - 1]);
        d.push(["Z"]), o(d[0], S);
      }
    } else d = t;
    return d.reduce(function (t, e) {
      return t + e.join(" ") + " ";
    }, "");
  }),
  (FlowChart.private.centerPointInPercent = function (t, e, i) {
    var r = t.getBoundingClientRect(),
      a = e - r.left,
      o = i - r.top;
    return [a / (r.width / 100), o / (r.height / 100)];
  }),
  (FlowChart.private.getPortPosition = function (t, e) {
    return t.x == e.width && 0 == t.y
      ? FlowChart.position.topRight
      : t.x == e.width && t.y == e.height
      ? FlowChart.position.bottomRight
      : 0 == t.x && t.y == e.height
      ? FlowChart.position.bottomLeft
      : 0 == t.x && 0 == t.y
      ? FlowChart.position.topLeft
      : t.x > 0 && t.x < e.width && t.y < e.height / 2
      ? FlowChart.position.top
      : t.x > e.width / 2 && t.y > 0 && t.y < e.height
      ? FlowChart.position.right
      : t.x > 0 && t.x < e.width && t.y > e.height / 2
      ? FlowChart.position.bottom
      : t.x < e.width / 2 && t.y > 0 && t.y < e.height
      ? FlowChart.position.left
      : null;
  }),
  (FlowChart.private.replaceRightLeftKeyCodes = function (t) {
    return t
      .replace("AltLeft", "alt")
      .replace("AltRight", "alt")
      .replace("ControlLeft", "control")
      .replace("ControlRight", "control")
      .replace("ShiftLeft", "shift")
      .replace("ShiftRight", "shift")
      .toLowerCase();
  }),
  (FlowChart.private.stickPosition = function (t, e, i) {
    var r = t.getBoundingClientRect(),
      a = i.getBoundingClientRect(),
      o = e.getBoundingClientRect(),
      s = r.left - a.left,
      h = r.top - a.top;
    return (
      r.top + o.height > a.top + a.height && (h -= o.height),
      r.left - o.width < a.left && (s += o.width),
      { x: s, y: h }
    );
  }),
  (FlowChart.private.printableKeyCode = function (t) {
    return (
      (t > 47 && t < 58) ||
      32 == t ||
      13 == t ||
      (t > 64 && t < 91) ||
      (t > 95 && t < 112) ||
      (t > 185 && t < 193) ||
      (t > 218 && t < 223)
    );
  }),
  (FlowChart.private.getFirstPointIndexByMousePosition = function (t, e, i) {
    var r = e.createSVGPoint();
    (r.x = t.clientX),
      (r.y = t.clientY),
      (r = r.matrixTransform(e.getScreenCTM().inverse()));
    for (var a = Number.MAX_VALUE, o = 0, s = 0; s < i.points.length - 1; s++) {
      var h = i.points[s],
        l = i.points[s + 1],
        n = Math.hypot(h.x - l.x, h.y - l.y),
        c = Math.hypot(r.x - h.x, r.y - h.y),
        d = Math.hypot(r.x - l.x, r.y - l.y);
      c + d - n < a && ((a = c + d - n), (o = s));
    }
    return o;
  }),
  (FlowChart.private.getLabelXY = function (t, e) {
    var i = (e.length / 100) * t.position,
      r = 0,
      a = 0,
      o = null == t.movex ? 0 : t.movex,
      s = null == t.movey ? 0 : t.movey;
    !e || !e.points || e.points.length;
    for (var h = 0; h < e.points.length - 1; h++) {
      var l = e.points[h],
        n = e.points[h + 1],
        c = Math.hypot(n.x - l.x, n.y - l.y);
      if (r + c >= i) {
        a = h;
        break;
      }
      r += c;
    }
    (l = e.points[a]), (n = e.points[a + 1]);
    var d,
      p,
      u = FlowChart.direction.horizontal;
    return (
      e.points[a].x == e.points[a + 1].x && (u = FlowChart.direction.vertical),
      u == FlowChart.direction.horizontal
        ? ((d = l.x < n.x ? l.x + (i - r) + o : l.x - (i - r) + o),
          (p = l.y + s))
        : ((p = l.y < n.y ? l.y + (i - r) + s : l.y - (i - r) + s),
          (d = l.x + o)),
      { x: d, y: p, direction: u }
    );
  }),
  (FlowChart.private.isLabel = function (t) {
    return !(
      FlowChart.isNEU(t.from) ||
      FlowChart.isNEU(t.to) ||
      FlowChart.isNEU(t.position)
    );
  }),
  (FlowChart.private.getFitScale = function (t, e, i, r, a, o, s) {
    var h = 1;
    if (i == FlowChart.startPosition.fit) {
      var l = t / o,
        n = e / s;
      h = l > n ? n : l;
    } else
      i == FlowChart.startPosition.fitWidth
        ? (h = t / o)
        : i == FlowChart.startPosition.fitHeight && (h = e / s);
    return h && h > r && (h = r), h && h < a && (h = a), h;
  }),
  (FlowChart.private.downloadFile = function (t, e, i, r, a) {
    var o = new Blob([e], { type: t });
    if (1 == r) {
      var s = URL.createObjectURL(o);
      window.open(s, "_blank").focus();
    } else if (navigator.msSaveBlob) navigator.msSaveBlob(o, i);
    else {
      var h = document.createElement("a");
      if (void 0 !== h.download) {
        (s = URL.createObjectURL(o)), h.setAttribute("href", s);
        var l = i;
        l.toLowerCase().endsWith(a.toLowerCase()) || (l = l + "." + a),
          h.setAttribute("download", l),
          (h.style.visibility = "hidden"),
          document.body.appendChild(h),
          h.click(),
          document.body.removeChild(h);
      }
    }
  }),
  (FlowChart.private.findClosestPorts = function (t, e) {
    var i = Number.MAX_SAFE_INTEGER,
      r = null,
      a = FlowChart.shapeTemplates[t.templateId].ports(t),
      o = FlowChart.shapeTemplates[e.templateId].ports(e);
    for (var s in a) {
      var h = a[s];
      for (var l in o) {
        var n = o[l],
          c = Math.hypot(t.x + h.x - (e.x + n.x), t.y + h.y - (e.y + n.y));
        c < i && ((i = c), (r = { fromPortName: s, toPortName: l }));
      }
    }
    return r;
  }),
  (FlowChart.private.rippleShape = function (t, e, i) {
    var r = t.height > t.width ? t.height : t.width;
    r /= 2;
    var a = document.createElementNS("http://www.w3.org/2000/svg", "g"),
      o = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"),
      s = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
      h = t.id + "_ripple";
    o.setAttribute("id", h);
    var l = FlowChart.shapeTemplates[t.templateId].svg(t);
    (o.innerHTML = l),
      s.setAttribute("clip-path", "url(#" + h + ")"),
      s.setAttribute("cx", t.width / 2),
      s.setAttribute("cy", t.height / 2),
      s.setAttribute("r", 0),
      s.setAttribute("fill", e),
      s.setAttribute("class", "bfc-ripple"),
      a.appendChild(o),
      a.appendChild(s),
      t.element.appendChild(a);
    var n = { r: r, opacity: 0 };
    FlowChart.private.animate(
      s,
      { r: 0, opacity: 1 },
      n,
      500,
      FlowChart.anim.outPow,
      function () {
        t.element.removeChild(a), i && i();
      }
    );
  }),
  (FlowChart.private.getLayer = function (t, e) {
    if (!(i = t.querySelector(`[data-layer="${e}"]`))) {
      var i;
      (i = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      )).setAttribute("data-layer", e);
      for (
        var r = t.querySelectorAll("[data-layer]"), a = [], o = 0;
        o < r.length;
        o++
      )
        a.push(parseFloat(r[o].getAttribute("data-layer")));
      a.push(e),
        a.sort(function (t, e) {
          return t - e;
        });
      var s = a.indexOf(e),
        h = t.querySelector(`[data-layer="${a[s + 1]}"]`);
      null == h ? t.appendChild(i) : h.parentNode.insertBefore(i, h);
    }
    return t.querySelector(`[data-layer="${e}"]`);
  }),
  (FlowChart.private.getParentElementWithAttribute = function (t, e) {
    for (; t && t.hasAttribute && !t.hasAttribute(e); ) t = t.parentNode;
    return t && t.hasAttribute && t.hasAttribute(e) ? t : null;
  }),
  (FlowChart.private.createImageElementForUpload = function (t, e) {
    var i = document.createElement("canvas");
    document.body.appendChild(i);
    var r = document.createElement("img");
    document.body.appendChild(r),
      r.addEventListener("load", function (t) {
        var a = r.offsetWidth,
          o = r.offsetHeight,
          s = 200,
          h = 200;
        a < o ? (h *= o / a) : a > o && (s *= a / o);
        var l = (h - 200) / 2,
          n = (s - 200) / 2;
        i.setAttribute("width", "200px"),
          i.setAttribute("height", "200px"),
          i.getContext("2d").drawImage(r, n, l, a, a, 0, 0, 200, 200);
        var c = i.toDataURL("image/jpeg", 0.7);
        e(c);
      }),
      (r.src = t);
  }),
  (FlowChart.remote = {}),
  (FlowChart.private.devin = function (t, e) {
    (t.v = "1.00.71"),
      FlowChart.remote.findRegion(function (i) {
        fetch(i, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t),
        })
          .then((t) => t.json())
          .then(function (t) {
            e(t);
          })
          .catch(function (t) {
            console.error(t);
          });
      });
  }),
  (FlowChart.remote.findRegion = function (t) {
    var e = localStorage.getItem("func-url-flowchartjs");
    if (e) t(e);
    else {
      var i = [];
      for (var r of [
        "defunc2",
        "cusfunc2",
        "bsfunc2",
        "acfunc2",
        "kcfunc2",
        "safunc2",
        "wifunc2",
      ]) {
        var a = new AbortController();
        fetch(`https://${r}.azurewebsites.net/api/FlowChartJS`, {
          method: "GET",
          signal: a.signal,
        })
          .then(function (e) {
            for (var r of i) r.abort("cancel_request");
            localStorage.setItem("func-url-flowchartjs", e.url), t(e.url);
          })
          .catch(function (t) {
            "cancel_request" != t && console.error(t);
          }),
          i.push(a);
      }
    }
  }),
  (FlowChart.private.logo = function (t) {
    return (
      t ||
      '<svg style="position: absolute; bottom: 8px; right: 7px; font-family: Verdana;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="160" height="27">      \n            <text fill="#039be5" style="font-size: 14px;font-weight:bold;" x="0" y="24">BALKAN</text>\n            <text fill="#f57c00" style="font-size: 14px;" x="70" y="24">FlowChart JS</text>\n        </svg>'
    );
  });
var FamilyTree = class {
  _;
  get element() {
    return this._.element;
  }
  get options() {
    return this._.options;
  }
  get focusId() {
    return this._.focusId;
  }
  set focusId(t) {
    this._.focusId = t;
  }
  get people() {
    return this._.people;
  }
  get mode() {
    return this._.chart.mode;
  }
  set mode(t) {
    this._.chart.mode = t;
  }
  get selectedId() {
    return this._.chart.selectedShapes.first;
  }
  set selectedId(t) {
    if (null == t || "" == t) this._.chart.selectedShapes.clear();
    else {
      var e = this._.chart.getShape(t);
      e && (e.selected = !0);
    }
  }
  get element() {
    return this._.chart.element;
  }
  constructor(t, e) {
    this._ = new FamilyTree.private(this, t, e);
  }
  load(t, e, i) {
    this._.load(t, e, i);
  }
  edit(t, e) {
    var i = this._.chart.getShape(t);
    i && this._.chart.editor.edit(i, e);
  }
  onPeopleChanged(t) {
    return this._.on("people-changed", function (e, i) {
      return t.call(e, i);
    });
  }
  onFocusChanged(t) {
    return this._.on("focus-changed", function (e, i) {
      return t.call(e, i);
    });
  }
};
(FamilyTree.private = class {
  familyTree;
  public;
  graph;
  chart;
  options;
  element;
  initialized;
  people;
  uid;
  static countFamilyTrees = 0;
  static buttonIds = [
    "btnParent",
    "btnPhoto",
    "btnChild",
    "btnSibling",
    "btnSpouse",
    "btnEdit",
    "btnDelete",
    "btnFocus",
    "btnCancel",
    "btnChildFromSpouse",
  ];
  constructor(t, e, i) {
    var r = this;
    (this.familyTree = t),
      (this.people = []),
      (this.element = e),
      (this.options = i),
      this.element.classList.add("bft-familytree"),
      (this.initialized = !1),
      (this.uid =
        window.location.pathname + "/" + FlowChart.private.countFamilyTrees),
      FlowChart.private.countFamilyTrees++,
      (this.focusId = null),
      (this.chart = new FlowChart(this.element, {
        colors: [
          "#DC4FAD",
          "#F57C00",
          "#008A17",
          "#039BE5",
          "#4617B4",
          "#8C0095",
          "#004B8B",
        ],
        mode: this.options.mode,
        scaleMax: 100,
        useSession: !1,
        logoSvg: FamilyTree.logo,
      })),
      delete this.chart._.shortcuts.replace_div_with_br_on_enter,
      this.chart._.shortcuts.edit_next_field &&
        (this.chart._.shortcuts.edit_next_field.keysPressed = [
          "tab|enter|numpadenter",
        ]),
      (this.chart.statusBar._.useRefreshHint = !1),
      (this.chart.statusBar.content = ""),
      this.chart.colorBar.show(),
      this.chart.onFieldChange(function (t) {
        if (!FamilyTree.private.buttonIds.includes(t.shape.id)) {
          for (var e of r.people)
            e.id == t.shape.id && (e[t.fieldName] = t.newValue);
          FamilyTree.events.publish("people-changed", [r.familyTree, {}]);
        }
      }),
      this.chart.onSelectedPortChange(function (t) {
        return !1;
      }),
      this.chart.onShapeDoubleClick(function (t) {}),
      this.chart.onSvgClick(function (t) {}),
      this.chart.onChanged(function (t) {}),
      this.chart.onShapeClick(function (t) {
        r.onShapeClickHandler(t);
      }),
      this.chart.onSelectedShapesChanged(function (t) {
        r.onSelectedChangedHandler();
      }),
      this.chart.onLinkPoints(function (t) {
        r.onLinkPoints(t);
      });
  }
  addChild(t, e) {
    this.people.push(t),
      FamilyTree.events.publish("people-changed", [this.familyTree, {}]),
      this.load(this.focusId, null, e);
  }
  addSpouse(t, e) {
    for (var i of ((t.spouses && t.spouses.length) ||
      console.error("spouse.spouses is empty"),
    t.spouses))
      for (var r of this.people)
        r.id == i &&
          (null == r.spouses && (r.spouses = []), r.spouses.push(t.id));
    this.people.push(t),
      FamilyTree.events.publish("people-changed", [this.familyTree, {}]),
      this.load(this.focusId, null, e);
  }
  addSibling(t, e) {
    for (var i of ((t.siblings && t.siblings.length) ||
      console.error("sibling.siblings is empty"),
    t.siblings))
      for (var r of this.people)
        r.id == i &&
          (null == r.siblings && (r.siblings = []), r.siblings.push(t.id));
    this.people.push(t),
      FamilyTree.events.publish("people-changed", [this.familyTree, {}]),
      this.load(this.focusId, null, e);
  }
  addParent(t, e, i) {
    for (var r of this.people)
      r.id == t &&
        (null == r.parents && (r.parents = []), r.parents.push(e.id));
    this.people.push(e),
      FamilyTree.events.publish("people-changed", [this.familyTree, {}]),
      this.load(this.focusId, null, i);
  }
  addChildWithParents(t, e) {
    this.people.push(t),
      FamilyTree.events.publish("people-changed", [this.familyTree, {}]),
      this.load(this.focusId, null, e);
  }
  addLabels() {
    for (var t of this.chart.links) {
      var e = this.chart.nodes.get(t.from),
        i = this.chart.nodes.get(t.to),
        r = "";
      (r = e.parents.includes(i.id) ? "parent" : r),
        (r = e.spouses.includes(i.id) ? "spouse" : r),
        (r = e.siblings.includes(i.id) ? "sibling" : r),
        (r = i.parents.includes(e.id) ? "child" : r) &&
          this.chart.labels.add({
            from: t.from,
            to: t.to,
            position: 0,
            iconName: r,
            title: r,
            templateId: "familyLabel",
          });
    }
  }
  remove(t) {
    for (var e = !1, i = this.people.length - 1; i >= 0; i--) {
      var r = this.people[i];
      if (r.id == t) (e = !0), this.people.splice(i, 1);
      else {
        var a;
        if (r.spouses)
          -1 != (a = r.spouses.indexOf(t)) &&
            ((e = !0), r.spouses.splice(a, 1));
        if (r.siblings)
          -1 != (a = r.siblings.indexOf(t)) &&
            ((e = !0), r.siblings.splice(a, 1));
        if (r.parents)
          -1 != (a = r.parents.indexOf(t)) &&
            ((e = !0), r.parents.splice(a, 1));
      }
    }
    e &&
      (FamilyTree.events.publish("people-changed", [this.familyTree, {}]),
      this.load(this.focusId, null, function () {}));
  }
  load(t, e, i) {
    e && (this.people = e);
    var r = JSON.parse(JSON.stringify(this.people)),
      a = {
        focusTemplate: this.options.focusTemplate,
        primaryTemplate: this.options.primaryTemplate,
        secondaryTemplate: this.options.secondaryTemplate,
      },
      o = {};
    for (var s in a) {
      var h = FlowChart.shapeTemplates[a[s]];
      o[a[s]] = { width: h.width, height: h.height };
    }
    var l = this.chart.nodes.get(t),
      n = this,
      c = {
        templates: a,
        sizeByTemplate: o,
        data: JSON.parse(JSON.stringify(r)),
        focusId: t,
      };
    FamilyTree.graphLayout(c, function (a) {
      n.graph = a;
      for (var o = r.length - 1; o >= 0; o--) {
        var s = r[o],
          h = n.graph.nodesWithPosition[s.id];
        h
          ? ((s.x = h.x),
            (s.y = h.y),
            (s.templateId = h.templateId),
            (s.level = h.level),
            (s.memberType = h.memberType),
            null == s.siblings && (s.siblings = []),
            null == s.spouses && (s.spouses = []),
            null == s.parents && (s.parents = []),
            null == s.children && (s.children = []))
          : r.splice(o, 1);
      }
      var c = [],
        d = [],
        p = [];
      if (!e) {
        var u = n.graph.nodesWithPosition[t],
          f = u.x - l.x,
          y = u.y - l.y;
        for (var s of r) {
          var m = n.chart.nodes.get(s.id);
          (s.x -= f),
            (s.y -= y),
            m &&
              (c.push({ x: m.x, y: m.y }),
              d.push({ x: s.x, y: s.y }),
              p.push(s.id));
        }
        for (var g in n.graph.childrenLevels)
          (n.graph.childrenLevels[g].top -= y),
            (n.graph.childrenLevels[g].bottom -= y),
            (n.graph.childrenLevels[g].left -= f),
            (n.graph.childrenLevels[g].right -= f);
        for (var g in n.graph.parentsLevels)
          (n.graph.parentsLevels[g].top -= y),
            (n.graph.parentsLevels[g].bottom -= y),
            (n.graph.parentsLevels[g].left -= f),
            (n.graph.parentsLevels[g].right -= f);
      }
      if (
        ((n.focusId = t),
        e || FamilyTree.events.publish("focus-changed", [n.familyTree, {}]),
        !e)
      )
        for (var s of r) {
          var v = !1;
          for (o = 0; o < p.length; o++) {
            var w = p[o],
              C = c[o];
            if (s.id == w) {
              (s.x = C.x),
                (s.y = C.y),
                null != C.width && (s.width = C.width),
                null != C.height && (s.height = C.height),
                (v = !0);
              break;
            }
          }
          if (!v) {
            var x = null;
            for (var N of n.graph.links)
              if (N.to == s.id) {
                if (null != x) {
                  x = null;
                  break;
                }
                x = N;
              }
            if (x) {
              var b = null;
              for (var F of r)
                if (F.id == x.from) {
                  b = F;
                  break;
                }
              p.push(s.id),
                b.parents.includes(s.id) &&
                  (c.push({ y: s.y + 10, opacity: 0 }),
                  d.push({ y: s.y, opacity: 1 }),
                  (s.y += 10)),
                s.parents.includes(b.id) &&
                  (c.push({ y: s.y - 10, opacity: 0 }),
                  d.push({ y: s.y, opacity: 1 }),
                  (s.y -= 10)),
                b.spouses.includes(s.id) &&
                  (c.push({ x: s.x - 10, opacity: 0 }),
                  d.push({ x: s.x, opacity: 1 }),
                  (s.x -= 10)),
                b.siblings.includes(s.id) &&
                  (c.push({ x: s.x + 10, opacity: 0 }),
                  d.push({ x: s.x, opacity: 1 }),
                  (s.x += 10)),
                (s.opacity = 0);
            }
          }
        }
      n.chart.labels.clear();
      var I = { nodes: r, links: [] };
      if (
        (r.length > 15 ? n.chart.links.clear() : (I.links = n.graph.links),
        n.chart.load(I),
        e)
      )
        r.length > 15 && n.chart.links.addRange(n.graph.links),
          n.addLabels(),
          i && i();
      else {
        var S = [];
        for (var _ of p) {
          s = n.chart.nodes.get(_);
          S.push(s);
        }
        n.chart._.animateShapes(S, c, d, function () {
          r.length > 15 && n.chart.links.addRange(n.graph.links),
            n.addLabels(),
            i && i();
        });
      }
    });
  }
  on(t, e) {
    return FamilyTree.events.on(t, e, this.uid), this.chart;
  }
}),
  (FamilyTree.events = class {
    static topics = {};
    static on(t, e, i) {
      Array.isArray(FamilyTree.events.topics[t]) ||
        (FamilyTree.events.topics[t] = []),
        FamilyTree.events.topics[t].push({ listener: e, uid: i });
    }
    static removeAll(t) {
      Array.isArray(FamilyTree.events.topics[t]) ||
        (FamilyTree.events.topics[t] = []),
        (FamilyTree.events.topics[t] = []);
    }
    static has(t, e) {
      if (
        Array.isArray(FamilyTree.events.topics[t]) &&
        FamilyTree.events.topics[t].length > 0
      ) {
        if (FamilyTree.isNEU(e)) return !0;
        for (var i = 0; i < FamilyTree.events.topics[t].length; i++)
          if (FamilyTree.events.topics[t][i].uid == e) return !0;
      }
      return !1;
    }
    static removeForEventId(t) {
      for (var e in FamilyTree.events.topics)
        if (Array.isArray(FamilyTree.events.topics[e]))
          for (var i = FamilyTree.events.topics[e].length - 1; i >= 0; i--)
            FamilyTree.events.topics[e][i].uid == t &&
              FamilyTree.events.topics[e].splice(i, 1);
    }
    static publish(t, e) {
      if (FamilyTree.events.topics[t]) {
        for (var i = [], r = 0; r < FamilyTree.events.topics[t].length; r++) {
          var a = FamilyTree.events.topics[t][r];
          (null != a._ && null != a._.uid && a._.uid != e[0]._.uid) ||
            i.push(a.listener);
        }
        if (i.length > 0) {
          var o = !0;
          for (
            r = 0;
            r < i.length &&
            (1 == e.length
              ? (o = i[r](e[0]) && o)
              : 2 == e.length
              ? (o = i[r](e[0], e[1]) && o)
              : 3 == e.length
              ? (o = i[r](e[0], e[1], e[2]) && o)
              : 4 == e.length
              ? (o = i[r](e[0], e[1], e[2], e[3]) && o)
              : 5 == e.length && (o = i[r](e[0], e[1], e[2], e[3], e[4]) && o),
            !1 !== o);
            r++
          );
          return o;
        }
      }
    }
  }),
  (FlowChart.shapeTemplates.baseFamily = class extends (
    FlowChart.shapeTemplates.base
  ) {}),
  (FlowChart.shapeTemplates.baseFamily.svg = function (t) {
    return `<rect rx="7" ry="7" x="0" y="0" width="${t.width}" height="${t.height}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};" ></rect>`;
  }),
  (FlowChart.shapeTemplates.baseFamily.minHeight = 1),
  (FlowChart.shapeTemplates.baseFamily.minWidth = 1),
  (FlowChart.linkTemplates.familyLink = class extends (
    FlowChart.linkTemplates.rounded
  ) {}),
  (FlowChart.linkTemplates.familyLink.markerEnd = ""),
  (FlowChart.linkTemplates.familyButtonLink = class extends (
    FlowChart.linkTemplates.rounded
  ) {}),
  (FlowChart.linkTemplates.familyButtonLink.markerEnd = ""),
  (FlowChart.linkTemplates.familyButtonLink.stroke = "#FFCA28"),
  (FlowChart.linkTemplates.familyButtonLink.strokeWidth = 4),
  (FlowChart.shapeTemplates.baseFamily.displayInShapeBar = !1),
  (FlowChart.shapeTemplates.baseFamily.displayInPortShapeBar = !1),
  (FlowChart.shapeTemplates.baseFamily.displayName = "Base Family"),
  (FlowChart.shapeTemplates.baseFamily.resizable = !1),
  (FlowChart.shapeTemplates.baseFamily.movable = !1),
  (FlowChart.shapeTemplates.baseFamily.html = function (t) {
    return `<div style="padding: 10px;">\n                        <div data-field="text"> ${t.id}</div>                       \n                    </div>`;
  }),
  (FlowChart.shapeTemplates.familyFocus = class extends (
    FlowChart.shapeTemplates.baseFamily
  ) {}),
  (FlowChart.shapeTemplates.familyFocus.width = 200),
  (FlowChart.shapeTemplates.familyFocus.height = 200),
  (FlowChart.shapeTemplates.familyFocus.svg = function (t) {
    return `<rect rx="7" ry="7" x="0" y="0" width="${t.width}" height="${t.height}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};" ></rect>`;
  }),
  (FlowChart.shapeTemplates.familyFocus.html = function (t) {
    var e = t.birt;
    null == e && (e = "&nbsp;");
    var i = t.deat;
    null == i && (i = "&nbsp;");
    var r = "";
    t.birt && t.deat && (r = "-");
    var a = t.occu;
    null == a && (a = "&nbsp;");
    var o = t.name;
    o || (o = "Name");
    return `<table data-drop-field="photo" style="width: 100%; height: 100%;">\n  <tr>  \n    <td>\n      <div data-field="name" data-title="Name" style="overflow: hidden; font-size: 16px;font-weight: bold;"> ${o}</div> \n    </td>\n  </tr>\n  <tr>\n    <td  style="height: 80px; text-align: center;">\n      ${
      t.photo
        ? `<img border="0" height="100%" style="border-radius:5px;" src="${t.photo}" />`
        : FlowChart.icon.user(50, 50, "#fff", 0, 0)
    }\n    </td>      \n  </tr>\n    <tr>  \n    <td>\n      <div data-field="occu" data-title="Occupation" style="overflow: hidden; font-size: 14px;">${a}</div> \n    </td>\n  </tr>\n  <tr>\n    <td style="vertical-align: bottom;">\n      <span data-field="birt" data-title="Birth date" style=" display: inline-block; overflow: hidden; font-size: 12px; padding: 3px 0;">${e}</span>\n      <span style="display: inline-block; overflow: hidden; font-size: 12px; padding: 3px 0;">${r}</span>      \n      <span data-field="deat" data-title="Death date" style=" display: inline-block; overflow: hidden; font-size: 12px; padding: 3px 0;">${i}</span>\n    </td>\n  </tr>\n</table>`;
  }),
  (FlowChart.shapeTemplates.familyPrimary = class extends (
    FlowChart.shapeTemplates.baseFamily
  ) {}),
  (FlowChart.shapeTemplates.familyPrimary.width = 280),
  (FlowChart.shapeTemplates.familyPrimary.strokeWidth = 4),
  (FlowChart.shapeTemplates.familyPrimary.height = 80),
  (FlowChart.shapeTemplates.familyPrimary.html = function (t) {
    var e = t.birt;
    null == e && (e = "&nbsp;");
    var i = t.deat;
    null == i && (i = "&nbsp;");
    var r = "";
    t.birt && t.deat && (r = "-");
    var a = t.occu;
    null == a && (a = "");
    var o = t.name;
    o || (o = "name");
    return `\n  <table data-drop-field="photo" border="0" cellpadding="0" cellspacing="0"  style="width: 100%; height: 100%;" title="${a}">\n  <tr>\n    <td rowspan="2"  width="28.571%">\n      ${
      t.photo
        ? `<img border="0" width="100%" height="100%" style="border-radius:5px; display: block;" src="${t.photo}" />`
        : FlowChart.icon.user(50, 50, "#fff", 0, 0)
    }\n    </td>\n    <td style="vertical-align: middle;">\n      <div data-field="name" data-title="Name" style="display: inline-block; overflow: hidden; font-size: 16px;font-weight: bold; padding: 0 3px;">${o}</div>\n    </td>\n  </tr>\n  <tr>\n    <td style="vertical-align: bottom; height: 23px;">\n      <span data-field="birt" data-title="Birth date" style="min-height: 16px; display: inline-block; overflow: hidden; font-size: 12px; padding: 3px 0;">${e}</span>\n      <span style="display: inline-block; overflow: hidden; font-size: 12px; padding: 3px 0;">${r}</span>      \n      <span data-field="deat" data-title="Death date" style="min-height: 16px; display: inline-block; overflow: hidden; font-size: 12px; padding: 3px 0;">${i}</span>\n    </td>\n  </tr>\n</table>\n`;
  }),
  (FlowChart.shapeTemplates.familySecondary = class extends (
    FlowChart.shapeTemplates.baseFamily
  ) {}),
  (FlowChart.shapeTemplates.familySecondary.width = 250),
  (FlowChart.shapeTemplates.familySecondary.height = 60),
  (FlowChart.shapeTemplates.familySecondary.minHeight = 1),
  (FlowChart.shapeTemplates.familySecondary.minWidth = 1),
  (FlowChart.shapeTemplates.familySecondary.html = function (t) {
    var e = t.occu;
    null == e && (e = "");
    var i = t.name;
    i || (i = "Name");
    return `\n  <table data-drop-field="photo" border="0" cellpadding="0" cellspacing="0"  style="width: 100%; height: 100%;" title="${e}">\n  <tr>\n    <td  width="24%">\n      ${
      t.photo
        ? `<img border="0" width="100%" height="100%" style="border-radius:5px; display: block;" src="${t.photo}" />`
        : FlowChart.icon.user(50, 50, "#fff", 0, 0)
    }\n    </td>\n    <td style=" vertical-align: middle;">\n      <div data-field="name" data-title="Edit name" style="overflow: hidden; font-size: 16px;font-weight: bold; padding: 0 3px;">${i}</div>\n    </td>\n  </tr>\n</table>\n`;
  }),
  (FlowChart.shapeTemplates.familyButton = class extends (
    FlowChart.shapeTemplates.base
  ) {}),
  (FlowChart.shapeTemplates.familyButton.svg = function (t) {
    var e = "";
    t.icon && (e = t.icon);
    var i = Math.max(t.width, t.height) / 2;
    return (
      `<circle cx="${i}" cy="${i}" r="${i}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};">\n  </circle>` +
      e
    );
  }),
  (FlowChart.shapeTemplates.familyButton.selectable = !1),
  (FlowChart.shapeTemplates.familyButton.minWidth = 0),
  (FlowChart.shapeTemplates.familyButton.minHeight = 0),
  (FlowChart.shapeTemplates.familyButton.width = 50),
  (FlowChart.shapeTemplates.familyButton.height = 50),
  (FlowChart.shapeTemplates.familyButton.displayName =
    "FlowChart.shapeTemplates.familyButton"),
  (FlowChart.shapeTemplates.familyButton.resizable = !1),
  (FlowChart.shapeTemplates.familyButton.static = !0),
  (FlowChart.shapeTemplates.familyButton.fill = "#FFCA28"),
  (FlowChart.shapeTemplates.familyButton.stroke = "#FFCA28"),
  (FlowChart.shapeTemplates.familyButton.html = function (t) {
    return `<div style="width: 100%;height: 100%;" title="${t.title}"></div>`;
  }),
  (FlowChart.shapeTemplates.familyLabel = class extends (
    FlowChart.shapeTemplates.label
  ) {}),
  (FlowChart.shapeTemplates.familyLabel.width = 24),
  (FlowChart.shapeTemplates.familyLabel.height = 24),
  (FlowChart.shapeTemplates.familyLabel.fill = "#aeaeae"),
  (FlowChart.shapeTemplates.familyLabel.svg = function (t) {
    return (
      `<rect rx="${t.width}" ry="${t.height}" class="bfc-label" x="0" y="0" width="${t.width}" height="${t.height}" style="stroke:${t.stroke}; fill:${t.fill}; stroke-width:${t.strokeWidth};" ></rect>` +
      FamilyTree.icon[t.iconName](18, 18, "#fff", 3, 3)
    );
  }),
  (FlowChart.shapeTemplates.familyLabel.html = function (t) {
    return `<div style="width: 100%;height: 100%;" title="${t.title}"></div>`;
  }),
  (FamilyTree.private.prototype.onShapeClickHandler = function (t) {
    var e = this,
      i = this.chart.nodes.get(t.shapeId),
      r = this.chart.selectedShapes.first;
    if ("btnFocus" == i.id) {
      if (i.nodeId == this.focusId) return;
      return (
        (this.selectedSpouseLink = null),
        void this.load(i.nodeId, null, function () {})
      );
    }
    if ("btnPhoto" != i.id)
      if ("btnDelete" != i.id)
        if ("btnChild" != i.id)
          if ("btnSpouse" != i.id)
            if ("btnSibling" != i.id)
              if ("btnParent" != i.id)
                if ("btnChildFromSpouse" != i.id)
                  "btnEdit" != i.id &&
                    ("btnCancel" != i.id || this.chart.selectedShapes.clear());
                else {
                  var a;
                  r = this.chart.nodes.get(r.id);
                  for (var o of r.spouses)
                    if (this.graph.childTree[o]) {
                      a = o;
                      break;
                    }
                  n = { id: this.chart.generateId(), parents: [a, r.id] };
                  this.addChildWithParents(n, function () {
                    var t = e.chart.nodes.get(n.id);
                    e.chart.makeShapeVisible(t),
                      (e.chart.nodes.get(i.nodeId).selected = !0),
                      e.chart.editor.editFirstFieldIfAny(t);
                  });
                }
              else {
                var s = { id: this.chart.generateId() };
                this.addParent(r.id, s, function () {
                  var t = e.chart.nodes.get(s.id);
                  e.chart.makeShapeVisible(t),
                    (e.chart.nodes.get(i.nodeId).selected = !0),
                    e.chart.editor.editFirstFieldIfAny(t);
                });
              }
            else {
              var h = { id: this.chart.generateId(), siblings: [r.id] };
              this.addSibling(h, function () {
                var t = e.chart.nodes.get(h.id);
                e.chart.makeShapeVisible(t),
                  (e.chart.nodes.get(i.nodeId).selected = !0),
                  e.chart.editor.editFirstFieldIfAny(t);
              });
            }
          else {
            var l = { id: this.chart.generateId(), spouses: [r.id] };
            this.addSpouse(l, function () {
              var t = e.chart.nodes.get(l.id);
              e.chart.makeShapeVisible(t),
                (e.chart.nodes.get(i.nodeId).selected = !0),
                e.chart.editor.editFirstFieldIfAny(t);
            });
          }
        else {
          var n = { id: this.chart.generateId(), parents: [r.id] };
          this.addChild(n, function () {
            var t = e.chart.nodes.get(n.id);
            e.chart.makeShapeVisible(t),
              (e.chart.nodes.get(i.nodeId).selected = !0),
              e.chart.editor.editFirstFieldIfAny(t);
          });
        }
      else this.remove(i.nodeId);
    else
      FamilyTree.private.photoDialog(function (t) {
        e.chart.nodes.get(i.nodeId).photo = t;
      });
  }),
  (FamilyTree.private.photoDialog = function (t) {
    var e = document.createElement("input");
    (e.type = "file"),
      (e.id = "fileElement"),
      (e.accept = "image/*"),
      (e.style.display = "none"),
      document.body.appendChild(e),
      e.addEventListener(
        "change",
        function () {
          var e = this.files,
            i = window.URL.createObjectURL(e[0]);
          FlowChart.private.createImageElementForUpload(i, t);
        },
        !1
      ),
      e && e.click();
  }),
  (FamilyTree.private.prototype.onSelectedChangedHandler = function () {
    if ((this.clearSelectedButtons(), this.chart.selectedShapes.length)) {
      if (this.chart.selectedShapes.length > 1)
        for (var t = this.chart.selectedShapes.length - 2; t >= 0; t--)
          this.chart.selectedShapes[t].select = !1;
      var e = this.chart.selectedShapes.first.spouses;
      if (e)
        for (var i of e)
          if (this.graph.childTree[i]) {
            spouseNode = this.chart.nodes.get(i);
            break;
          }
      this.addButtons(this.chart.selectedShapes.first);
    }
  }),
  (FamilyTree.private.prototype.addButtons = function (t) {
    var e = this;
    for (var i of this.chart.labels)
      i.from == t.id && (i.element.style.display = "none");
    var r = [],
      a = [],
      o = [],
      s = this.getParentButton(t);
    s && (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      (s = this.getChildButton(t)) &&
        (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      (s = this.getSibblingButton(t)) &&
        (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      (s = this.getSpouseButton(t)) &&
        (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      (s = this.getButtonPhoto(t)) &&
        (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      this.focusId != t.id &&
        (s = this.getButtonDelete(t)) &&
        (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      this.focusId != t.id &&
        (s = this.getButtonFocus(t)) &&
        (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      (s = this.getButtonChildFromSpouse(t)) &&
        (r.push(s.newNode), a.push(s.end), o.push(s.start)),
      this.chart._.animateShapes(r, o, a, function () {
        if (((btnNode = e.chart.nodes.get("btnDelete")), btnNode)) {
          var t = btnNode.width / 2 - 16,
            i = btnNode.height / 2 - 16;
          (btnNode.icon = FlowChart.icon.delete(32, 32, "#FFCA28", t, i)),
            (btnNode.fill = "#fff");
        }
        if (((btnNode = e.chart.nodes.get("btnFocus")), btnNode)) {
          (t = btnNode.width / 2 - 16), (i = btnNode.height / 2 - 16);
          (btnNode.icon = FlowChart.icon.fit(32, 32, "#FFCA28", t, i)),
            (btnNode.fill = "#fff");
        }
        if (((btnNode = e.chart.nodes.get("btnPhoto")), btnNode)) {
          (t = btnNode.width / 2 - 16), (i = btnNode.height / 2 - 16);
          (btnNode.icon = `<svg x="${t}" y="${i}" width="32" height="32" viewBox="0 0 24 24">\n      <path fill="#FFCA28" fill-rule="evenodd" clip-rule="evenodd" d="M9.77778 21H14.2222C17.3433 21 18.9038 21 20.0248 20.2646C20.51 19.9462 20.9267 19.5371 21.251 19.0607C22 17.9601 22 16.4279 22 13.3636C22 10.2994 22 8.76721 21.251 7.6666C20.9267 7.19014 20.51 6.78104 20.0248 6.46268C19.3044 5.99013 18.4027 5.82123 17.022 5.76086C16.3631 5.76086 15.7959 5.27068 15.6667 4.63636C15.4728 3.68489 14.6219 3 13.6337 3H10.3663C9.37805 3 8.52715 3.68489 8.33333 4.63636C8.20412 5.27068 7.63685 5.76086 6.978 5.76086C5.59733 5.82123 4.69555 5.99013 3.97524 6.46268C3.48995 6.78104 3.07328 7.19014 2.74902 7.6666C2 8.76721 2 10.2994 2 13.3636C2 16.4279 2 17.9601 2.74902 19.0607C3.07328 19.5371 3.48995 19.9462 3.97524 20.2646C5.09624 21 6.65675 21 9.77778 21ZM12 9.27273C9.69881 9.27273 7.83333 11.1043 7.83333 13.3636C7.83333 15.623 9.69881 17.4545 12 17.4545C14.3012 17.4545 16.1667 15.623 16.1667 13.3636C16.1667 11.1043 14.3012 9.27273 12 9.27273ZM12 10.9091C10.6193 10.9091 9.5 12.008 9.5 13.3636C9.5 14.7192 10.6193 15.8182 12 15.8182C13.3807 15.8182 14.5 14.7192 14.5 13.3636C14.5 12.008 13.3807 10.9091 12 10.9091ZM16.7222 10.0909C16.7222 9.63904 17.0953 9.27273 17.5556 9.27273H18.6667C19.1269 9.27273 19.5 9.63904 19.5 10.0909C19.5 10.5428 19.1269 10.9091 18.6667 10.9091H17.5556C17.0953 10.9091 16.7222 10.5428 16.7222 10.0909Z" fill="#1C274C"/>\n    </svg>`),
            (btnNode.fill = "#fff");
        }
        e.chart._.makeShapesVisible(r);
      });
  }),
  (FamilyTree.private.prototype.clearSelectedButtons = function () {
    for (var t of this.chart.labels) t.element.style.display = "";
    this.selectedSpouseLink && (this.selectedSpouseLink.stroke = "#aeaeae");
    var e = [];
    for (var i of FamilyTree.private.buttonIds) {
      var r = this.chart.nodes.get(i);
      r && e.push(r);
    }
    this.chart.nodes.removeRange(e);
  }),
  (FamilyTree.private.prototype.getParentButton = function (t) {
    if (
      (this.graph.parentTree[t.id] || t.id == this.focusId) &&
      t.parents.length < 2
    ) {
      var e = {
          x: t.x,
          y: t.top - FlowChart.shapeTemplates.familyButton.height / 2 - 20,
        },
        i = this.chart.nodes.add({
          id: "btnParent",
          templateId: "familyButton",
          nodeId: t.id,
          layer: 10,
          title: "Add parent",
          x: e.x,
          y: e.y,
          opacity: 0,
          icon: FamilyTree.icon.parent(
            40,
            40,
            "#fff",
            FlowChart.shapeTemplates.familyButton.width / 2 - 20,
            FlowChart.shapeTemplates.familyButton.height / 2 - 20,
            "Parents"
          ),
        });
      return (
        this.chart.links.add({
          from: t.id,
          to: i.id,
          fromPort: "top",
          toPort: "bottom",
          templateId: "familyButtonLink",
          opacity: 0,
        }),
        {
          newNode: i,
          start: { opacity: 0, x: e.x, y: e.y + 20 },
          end: { opacity: 1, x: e.x, y: e.y },
        }
      );
    }
    return null;
  }),
  (FamilyTree.private.prototype.getChildButton = function (t) {
    if (this.graph.childTree[t.id] || t.id == this.focusId) {
      var e = {
          x: t.x,
          y: t.bottom + FlowChart.shapeTemplates.familyButton.height / 2 + 20,
        },
        i = this.chart.nodes.add({
          id: "btnChild",
          templateId: "familyButton",
          nodeId: t.id,
          layer: 10,
          title: "Add child",
          x: e.x,
          y: e.y,
          icon: FamilyTree.icon.child(
            40,
            40,
            "#fff",
            FlowChart.shapeTemplates.familyButton.width / 2 - 20,
            FlowChart.shapeTemplates.familyButton.height / 2 - 20
          ),
          opacity: 0,
        });
      return (
        this.chart.links.add({
          from: t.id,
          to: i.id,
          fromPort: "bottom",
          toPort: "top",
          templateId: "familyButtonLink",
        }),
        {
          newNode: i,
          start: { opacity: 0, x: e.x, y: e.y - 20 },
          end: { opacity: 1, x: e.x, y: e.y },
        }
      );
    }
    return null;
  }),
  (FamilyTree.private.prototype.getSibblingButton = function (t) {
    if (t.id == this.focusId) {
      var e = {
          x: t.left - FlowChart.shapeTemplates.familyButton.width / 2 - 20,
          y: t.y,
        },
        i = this.chart.nodes.add({
          id: "btnSibling",
          templateId: "familyButton",
          title: "Add sibling",
          nodeId: t.id,
          layer: 10,
          x: e.x,
          y: e.y,
          icon: FamilyTree.icon.sibling(
            40,
            40,
            "#fff",
            FlowChart.shapeTemplates.familyButton.width / 2 - 20,
            FlowChart.shapeTemplates.familyButton.height / 2 - 20
          ),
          opacity: 0,
        });
      return (
        this.chart.links.add({
          from: t.id,
          to: i.id,
          fromPort: "left",
          toPort: "right",
          templateId: "familyButtonLink",
        }),
        {
          newNode: i,
          start: { opacity: 0, x: e.x + 20, y: e.y },
          end: { opacity: 1, x: e.x, y: e.y },
        }
      );
    }
    return null;
  }),
  (FamilyTree.private.prototype.getSpouseButton = function (t) {
    if (this.graph.childTree[t.id] || t.id == this.focusId) {
      var e = {
          x: t.right + FlowChart.shapeTemplates.familyButton.width / 2 + 20,
          y: t.y,
        },
        i = this.chart.nodes.add({
          id: "btnSpouse",
          templateId: "familyButton",
          nodeId: t.id,
          layer: 10,
          title: "Add spouse",
          x: e.x,
          y: e.y,
          icon: FamilyTree.icon.spouse(
            40,
            40,
            "#fff",
            FlowChart.shapeTemplates.familyButton.width / 2 - 20,
            FlowChart.shapeTemplates.familyButton.height / 2 - 20
          ),
          opacity: 0,
        });
      return (
        this.chart.links.add({
          from: t.id,
          to: i.id,
          fromPort: "right",
          toPort: "left",
          templateId: "familyButtonLink",
        }),
        {
          newNode: i,
          start: { opacity: 0, x: e.x - 20, y: e.y },
          end: { opacity: 1, x: e.x, y: e.y },
        }
      );
    }
    return null;
  }),
  (FamilyTree.private.prototype.getButtonPhoto = function (t) {
    var e = { x: t.left, y: t.top };
    t.id == this.focusId &&
      (e = { x: t.left + t.width / 4, y: t.top + t.height / 2 });
    var i = this.chart.nodes.add({
      id: "btnPhoto",
      nodeId: t.id,
      templateId: "familyButton",
      layer: 10,
      title: "Photo",
      x: e.x,
      y: e.y,
      stroke: "#FFCA28",
      opacity: 0,
    });
    return {
      newNode: i,
      start: { opacity: 0, width: 0, height: 0 },
      end: { opacity: 1, width: i.width, height: i.height },
    };
  }),
  (FamilyTree.private.prototype.getButtonEdit = function (t) {
    var e = { x: t.right, y: t.bottom },
      i = this.chart.nodes.add({
        id: "btnEdit",
        nodeId: t.id,
        templateId: "familyButton",
        layer: 10,
        title: "Edit",
        x: e.x,
        y: e.y,
        stroke: "#FFCA28",
        opacity: 0,
      });
    return {
      newNode: i,
      start: { opacity: 0, width: 0, height: 0 },
      end: { opacity: 1, width: i.width, height: i.height },
    };
  }),
  (FamilyTree.private.prototype.getButtonDelete = function (t) {
    var e = { x: t.left, y: t.bottom },
      i = this.chart.nodes.add({
        id: "btnDelete",
        nodeId: t.id,
        templateId: "familyButton",
        layer: 10,
        title: "Delete",
        x: e.x,
        y: e.y,
        stroke: "#FFCA28",
        opacity: 0,
      });
    return {
      newNode: i,
      start: { opacity: 0, width: 0, height: 0 },
      end: { opacity: 1, width: i.width, height: i.height },
    };
  }),
  (FamilyTree.private.prototype.getButtonFocus = function (t) {
    var e = { x: t.right, y: t.top },
      i = this.chart.nodes.add({
        id: "btnFocus",
        nodeId: t.id,
        templateId: "familyButton",
        layer: 10,
        title: "Fucus",
        x: e.x,
        y: e.y,
        stroke: "#FFCA28",
        opacity: 0,
      });
    return {
      newNode: i,
      start: { opacity: 0, width: 0, height: 0 },
      end: { opacity: 1, width: i.width, height: i.height },
    };
  }),
  (FamilyTree.private.prototype.getButtonCancel = function (t) {
    var e = { x: t.right, y: t.top },
      i = this.chart.nodes.add({
        id: "btnCancel",
        nodeId: t.id,
        templateId: "familyButton",
        layer: 10,
        title: "Cancel",
        x: e.x,
        y: e.y,
        stroke: "#FFCA28",
        opacity: 0,
      });
    return {
      newNode: i,
      start: { opacity: 0, width: 0, height: 0 },
      end: { opacity: 1, width: i.width, height: i.height },
    };
  }),
  (FamilyTree.private.prototype.getButtonChildFromSpouse = function (t) {
    var e = null;
    for (var i of t.spouses)
      if (this.graph.childTree[i]) {
        e = this.chart.nodes.get(i);
        break;
      }
    if (e) {
      (this.selectedSpouseLink = this.chart.links.get(e.id, t.id)),
        (this.selectedSpouseLink.stroke = "#FFCA28");
      var r = {
          x: t.x,
          y: t.bottom + FlowChart.shapeTemplates.familyButton.height / 2 + 20,
        },
        a = this.chart.nodes.add({
          id: "btnChildFromSpouse",
          nodeId: t.id,
          templateId: "familyButton",
          layer: 10,
          title: "Add child from spouse",
          x: r.x,
          y: r.y + 20,
          icon: `<svg x="${
            FlowChart.shapeTemplates.familyButton.width / 2 - 20
          }" y="${
            FlowChart.shapeTemplates.familyButton.height / 2 - 20
          }" fill="#fff" width="40" height="40" viewBox="-64 0 512 512" ><path d="M120 72c0-39.765 32.235-72 72-72s72 32.235 72 72c0 39.764-32.235 72-72 72s-72-32.236-72-72zm254.627 1.373c-12.496-12.497-32.758-12.497-45.254 0L242.745 160H141.254L54.627 73.373c-12.496-12.497-32.758-12.497-45.254 0-12.497 12.497-12.497 32.758 0 45.255L104 213.254V480c0 17.673 14.327 32 32 32h16c17.673 0 32-14.327 32-32V368h16v112c0 17.673 14.327 32 32 32h16c17.673 0 32-14.327 32-32V213.254l94.627-94.627c12.497-12.497 12.497-32.757 0-45.254z"/></svg>`,
          stroke: "#FFCA28",
          opacity: 0,
        });
      return (
        this.chart.links.add({
          from: t.id,
          to: a.id,
          fromPort: "bottom",
          toPort: "top",
          templateId: "familyButtonLink",
        }),
        {
          newNode: a,
          start: { opacity: 0, x: r.x, y: r.y - 20 },
          end: { opacity: 1, x: r.x, y: r.y },
        }
      );
    }
    return null;
  }),
  (FamilyTree.private.prototype.onLinkPoints = function (t) {
    var e = {};
    if (
      this.graph &&
      this.graph.nodesWithPosition &&
      this.graph.nodesWithPosition[t.fromShape.id] &&
      this.graph.nodesWithPosition[t.toShape.id]
    ) {
      var i = t.fromShape,
        r = t.toShape,
        a = [];
      a = [
        { x: i.x, y: i.top },
        { x: i.x, y: r.bottom + 25 },
        { x: r.x, y: r.bottom + 25 },
        { x: r.x, y: r.bottom },
      ];
      var o = i.siblings.includes(r.id),
        s = i.spouses.includes(r.id);
      if (o)
        a = [
          { x: i.left, y: i.y },
          { x: i.left - 25, y: i.y },
          { x: i.left - 25, y: r.y },
          { x: r.right, y: r.y },
        ];
      else if (s)
        a =
          (i.id != this.focusId && this.graph.parentTree[i.id],
          [
            { x: i.right, y: i.y },
            { x: i.right + 25, y: i.y },
            { x: i.right + 25, y: r.y },
            { x: r.left, y: r.y },
          ]);
      else if (this.graph.parentTree[r.id]) {
        var h = this.graph.parentsLevels[this.graph.parentTree[r.id].level];
        a = [
          { x: i.x, y: i.top },
          { x: i.x, y: h.bottom + 25 },
          { x: r.x, y: h.bottom + 25 },
          { x: r.x, y: r.bottom },
        ];
      } else if (this.graph.childTree[r.id]) {
        var l = this.graph.childTree[r.id],
          n = this.graph.childTree[l.parent],
          c = this.graph.nodesWithPosition[l.parent];
        for (var d of n.children) {
          (y = this.graph.nodesWithPosition[d]).x < c.x && 0;
        }
        var p = 0;
        for (var d of n.children) {
          var u = null;
          for (var f of this.chart.nodes.get(d).parents) {
            if (f != l.parent)
              if ((v = this.chart.nodes.get(f))) {
                u = v.id;
                break;
              }
          }
          var y = this.graph.nodesWithPosition[d];
          e[(w = `${l.parent}~${u}`)] ||
            ((e[w] = { isLeft: y.x < c.x, index: p }), p++);
        }
        var m = this.chart.nodes.get(l.parent),
          g = null;
        for (var f of r.parents) {
          var v;
          if (f != l.parent)
            if ((v = this.chart.nodes.get(f))) {
              g = v;
              break;
            }
        }
        h = this.graph.childrenLevels[l.level];
        var w,
          C = e[(w = `${l.parent}~${g ? g.id : "null"}`)];
        if (
          (g ||
            (a = [
              { x: i.x, y: i.bottom },
              { x: i.x, y: h.top - 25 },
              { x: r.x, y: h.top - 25 },
              { x: r.x, y: r.top },
            ]),
          g && m)
        ) {
          var x = m.right + (g.left - m.right) / 2,
            N = h.top - 25;
          x > r.x
            ? ((N += 8 * C.index), (x += 8 * C.index))
            : ((N -= 8 * C.index), (x += 8 * C.index)),
            (a = [
              { x: x, y: g.y },
              { x: x, y: N },
              { x: r.x, y: N },
              { x: r.x, y: r.top },
            ]);
        }
      }
      "spouse" == r.memberType
        ? (a = [
            { x: i.right, y: i.y },
            { x: i.right + 25, y: i.y },
            { x: i.right + 25, y: r.y },
            { x: r.left, y: r.y },
          ])
        : "sibling" == r.memberType &&
          (a = [
            { x: i.left, y: i.y },
            { x: i.left - 25, y: i.y },
            { x: i.left - 25, y: r.y },
            { x: r.right, y: r.y },
          ]),
        (t.points = a);
    }
  }),
  (FamilyTree.icon = {}),
  (FamilyTree.icon.parent = function (t, e, i, r, a) {
    return `<svg x="${r}" y="${a}" fill="${i}" height="${t}" width="${e}"  \n\t viewBox="0 0 449.358 449.358" title="222">\n\t \n\t<path d="M301.94,102.856c22.987,0,41.613-18.628,41.613-41.613c0-22.986-18.626-41.613-41.613-41.613\n\t\tc-22.988,0-41.614,18.627-41.614,41.613C260.327,84.228,278.952,102.856,301.94,102.856z"/>\n\t<path d="M111.319,102.856c22.986,0,41.612-18.628,41.612-41.613c0-22.986-18.626-41.613-41.612-41.613\n\t\tc-22.988,0-41.614,18.627-41.614,41.613C69.705,84.228,88.331,102.856,111.319,102.856z"/>\n\t<path d="M430.84,237.059c1.314-5.792-0.644-12.088-5.595-16.046l-37.676-30.12l-34.865-84.748\n\t\tc-2.13-5.178-6.667-8.623-11.782-9.606c-9.633,10.629-23.541,17.317-38.982,17.317c-15.441,0-29.349-6.688-38.983-17.317\n\t\tc-5.117,0.982-9.656,4.427-11.787,9.606l-44.544,108.277l-44.544-108.277c-2.13-5.178-6.666-8.624-11.782-9.606\n\t\tc-9.633,10.63-23.541,17.317-38.982,17.317c-15.441,0-29.349-6.688-38.983-17.317c-5.118,0.982-9.657,4.427-11.788,9.606\n\t\tL1.207,250.389c-3.362,8.172,0.538,17.523,8.71,20.884c1.992,0.819,4.053,1.207,6.082,1.207c6.292,0,12.26-3.737,14.803-9.917\n\t\tl30.068-73.09v20.243l-29.849,93.252c-5.02,15.683,6.68,31.713,23.146,31.713h6.702v73.99c0,11.883,9.846,21.467,21.824,21.041\n\t\tc11.409-0.406,20.286-10.129,20.286-21.546v-73.485h16.671v73.99c0,11.883,9.844,21.466,21.822,21.041\n\t\tc11.41-0.405,20.288-10.13,20.288-21.547v-73.484h6.702c16.467,0,28.167-16.03,23.146-31.713l-29.849-93.252v-20.244l24.062,58.492\n\t\tc3.47,8.436,11.69,13.943,20.812,13.943h0c9.124,0,17.345-5.509,20.814-13.948l24.042-58.486v219.199\n\t\tc0,11.883,9.845,21.467,21.824,21.041c11.409-0.406,20.287-10.129,20.287-21.546V294.542c0-4.44,3.35-8.316,7.781-8.603\n\t\tc4.855-0.314,8.889,3.53,8.889,8.317v114.418c0,11.883,9.845,21.467,21.823,21.041c11.41-0.406,20.287-10.13,20.287-21.547V189.474\n\t\tl7.166,17.419c1.033,2.51,2.687,4.716,4.807,6.411l38.057,30.425c-4.899,4.959-7.93,11.767-7.93,19.271v158.417\n\t\tc0,4.073,3.138,7.624,7.209,7.746c4.212,0.126,7.667-3.251,7.667-7.435v-158.36c0-6.537,4.842-12.26,11.35-12.873\n\t\tc7.469-0.704,13.773,5.178,13.773,12.504v18.697c0,4.073,3.138,7.624,7.209,7.746c4.212,0.126,7.667-3.251,7.667-7.434V263\n\t\tC449.358,250.993,441.602,240.77,430.84,237.059z"/>\n</svg>`;
  }),
  (FamilyTree.icon.child = function (t, e, i, r, a) {
    return `<svg x="${r}" y="${a}" fill="${i}" height="${t}" width="${e}"  \n       viewBox="-64 0 512 512" ><path d="M120 72c0-39.765 32.235-72 72-72s72 32.235 72 72c0 39.764-32.235 72-72 72s-72-32.236-72-72zm254.627 1.373c-12.496-12.497-32.758-12.497-45.254 0L242.745 160H141.254L54.627 73.373c-12.496-12.497-32.758-12.497-45.254 0-12.497 12.497-12.497 32.758 0 45.255L104 213.254V480c0 17.673 14.327 32 32 32h16c17.673 0 32-14.327 32-32V368h16v112c0 17.673 14.327 32 32 32h16c17.673 0 32-14.327 32-32V213.254l94.627-94.627c12.497-12.497 12.497-32.757 0-45.254z"/></svg>`;
  }),
  (FamilyTree.icon.sibling = function (t, e, i, r, a) {
    return `<svg x="${r}" y="${a}" fill="${i}" height="${t}" width="${e}"  viewBox="0 0 457.254 457.254">\n\t<circle cx="333.6" cy="69.265" r="47.409"/>\n\t<path d="M454.413,260.338l-72.963-125.237c-3.495-5.999-10.592-10.239-15.94-10.239c-1.283,0-60.824,0-62.106,0\n\t\tc-5.348,0-12.445,4.24-15.94,10.239l-54.973,94.358l-61.025-104.746c-3.884-6.668-10.897-10.364-18.098-10.351\n\t\tc-0.132-0.008-0.263-0.02-0.397-0.02H94.3c-0.134,0-0.265,0.012-0.397,0.02c-7.201-0.014-14.213,3.682-18.098,10.351L2.841,249.949\n\t\tc-5.804,9.961-2.433,22.741,7.528,28.545c3.306,1.926,6.921,2.841,10.489,2.841c7.185,0,14.178-3.714,18.056-10.369l32.182-55.239\n\t\tv23.65L56.693,343.162c-1.213,8.742,5.578,16.541,14.404,16.541h0v63.527c0,11.944,9.288,22.117,21.224,22.542\n\t\tc12.532,0.446,22.833-9.581,22.833-22.014v-64.056h17.404v63.527c0,11.945,9.288,22.118,21.226,22.542\n\t\tc12.532,0.445,22.83-9.581,22.83-22.014v-64.056h0c8.826,0,15.617-7.799,14.404-16.541l-14.404-103.787v-22.89l31.74,54.481\n\t\tc1.08,1.852,8.574,14.946,13.673,17.917c3.306,1.925,6.921,2.841,10.489,2.841c7.185,0,14.178-3.713,18.056-10.369l31.275-53.683\n\t\tl-0.301,184.769c0,12.166,9.861,22.028,22.027,22.028c0.051,0,0.1-0.007,0.151-0.008c0.051,0,0.1,0.008,0.152,0.008\n\t\tc12.166,0,22.029-9.862,22.029-22.028l-0.302-111.487c0-4.635,3.497-8.682,8.123-8.981c5.068-0.328,9.281,3.685,9.281,8.683\n\t\tl0,111.256c0,11.944,9.288,22.117,21.224,22.543c12.532,0.446,22.833-9.581,22.833-22.014V227.671l31.275,53.683\n\t\tc3.878,6.656,10.871,10.369,18.056,10.369c3.568,0,7.184-0.916,10.489-2.841C456.846,283.078,460.216,270.298,454.413,260.338z"/>\n\t<path d="M49.541,105.344l11.735-1.046c6.748-0.601,11.504-6.909,10.183-13.555c-2.014-10.156-2.71-24.251,5.722-32.967\n\t\tc-0.009,0.367-0.028,0.731-0.028,1.099c0,26.182,21.226,47.408,47.408,47.408c26.181,0,47.407-21.226,47.407-47.408\n\t\tc0-0.368-0.019-0.732-0.029-1.099c8.433,8.717,7.736,22.811,5.721,32.967c-1.318,6.646,3.436,12.954,10.184,13.555l11.734,1.046\n\t\tc6.203,0.553,11.701-3.961,12.365-10.153c1.615-15.035,1.334-37.592-7.169-46.549c-12.551-13.221-28.074-13.355-38.102-11.532\n\t\tc-7.886-15.229-23.777-25.644-42.11-25.644c-18.333,0-34.225,10.414-42.112,25.644c-10.027-1.822-25.553-1.689-38.102,11.532\n\t\tc-8.501,8.957-8.782,31.515-7.171,46.549C37.842,101.383,43.339,105.897,49.541,105.344z"/>\n</svg>`;
  }),
  (FamilyTree.icon.spouse = function (t, e, i, r, a) {
    return `<svg x="${r}" y="${a}" fill="${i}" height="${t}" width="${e}"\n        viewBox="0 0 465.227 465.227">\n       <path d="M184.324,102.514l-73.268,0.42c-6.975-0.153-13.649,3.913-16.462,10.751L30.126,270.394\n         c-3.652,8.878,0.584,19.036,9.462,22.689c2.164,0.891,4.403,1.312,6.606,1.312c6.836,0,13.32-4.06,16.082-10.774l32.667-79.406\n         v238.139c0,12.91,10.695,23.322,23.709,22.859c12.395-0.441,22.039-11.004,22.039-23.407V318.36c0-4.823,3.641-9.035,8.454-9.346\n         c5.274-0.341,9.657,3.836,9.657,9.036v124.304c0,12.91,10.695,23.322,23.708,22.859c12.395-0.44,22.041-11.005,22.041-23.408\n         V122.741C204.552,111.57,195.496,102.514,184.324,102.514z"/>\n       <path d="M283.375,45.208C283.375,20.236,263.141,0,238.168,0c-22.384,0-40.949,16.26-44.562,37.613\n         c-4.91-19.656-22.676-34.214-43.856-34.214c-24.974,0-45.209,20.236-45.209,45.208c0,24.971,20.235,45.209,45.209,45.209\n         c22.384,0,40.949-16.262,44.561-37.613c4.91,19.656,22.675,34.215,43.857,34.215C263.141,90.418,283.375,70.18,283.375,45.208z"/>\n       <path d="M435.601,350.543c-3.238-11.554-15.233-18.296-26.787-15.054l-52.495,14.72l-1.793-10.052l18.349-5.475\n         c17.143-5.115,24.342-25.439,14.244-40.205l-60.043-87.807l-6.289-21.077l54.009,66.751c3.435,4.246,8.457,6.449,13.523,6.449\n         c3.84,0,7.705-1.266,10.923-3.87c7.463-6.039,8.618-16.984,2.579-24.447L295.236,98.746c-4.65-5.749-12.21-7.737-18.851-5.594\n         c-1.351,0.117-41.855,12.051-41.855,12.051c-9.238,2.756-15.557,11.271-15.516,20.913l0.926,218.249\n         c-0.355,17.885,16.805,30.939,33.947,25.823l5.43-1.62v73.669c0,12,9.728,21.728,21.728,21.728s21.729-9.728,21.729-21.728v-86.636\n         l9.839-2.936l5.127,28.746c1.076,6.033,4.649,11.332,9.841,14.589c3.494,2.193,7.503,3.324,11.551,3.324\n         c1.964,0,3.938-0.266,5.865-0.807l75.548-21.185C432.101,374.091,438.841,362.098,435.601,350.543z"/>\n     </svg>`;
  }),
  void 0 === FamilyTree && (FamilyTree = {}),
  (FamilyTree.VERSION = "2.00.10"),
  "undefined" != typeof module && (module.exports = FamilyTree),
  (FamilyTree.remote = {}),
  (FamilyTree.graphLayout = function (t, e) {
    (t.v = "2.00.00"),
      FamilyTree.remote.findRegion(function (i) {
        fetch(i, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t),
        })
          .then((t) => t.json())
          .then(function (t) {
            e(t);
          })
          .catch(function (t) {
            console.error(t);
          });
      });
  }),
  (FamilyTree.remote.findRegion = function (t) {
    var e = localStorage.getItem("func-url-ft");
    if (e) t(e);
    else {
      var i = [];
      for (var r of [
        "defunc2",
        "cusfunc2",
        "bsfunc2",
        "acfunc2",
        "kcfunc2",
        "safunc2",
        "wifunc2",
      ]) {
        var a = new AbortController();
        fetch(`https://${r}.azurewebsites.net/api/ft`, {
          method: "GET",
          signal: a.signal,
        })
          .then(function (e) {
            for (var r of i) r.abort("cancel_request");
            localStorage.setItem("func-url-ft", e.url), t(e.url);
          })
          .catch(function (t) {
            "cancel_request" != t && console.error(t);
          }),
          i.push(a);
      }
    }
  }),
  (FamilyTree.logo =
    '<svg style="position: absolute; bottom: 8px; right: 7px; font-family: Verdana;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="195" height="27">      \n            <text fill="#039be5" style="font-size: 14px;font-weight:bold;" x="0" y="24">BALKAN</text>\n            <text fill="#f57c00" style="font-size: 14px;" x="70" y="24">FamilyTree Maker</text>\n        </svg>');
