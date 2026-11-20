/* Liquid Glass 交互增强层 (JTW360 · 借鉴自 order-calculator 设计系统)
 * 1. 指针跟随高光：给卡片写入 --lg-x / --lg-y，由 CSS 渲染 Apple 拟物级镜面反光
 * 2. Chromium 折射：注入 SVG 位移滤镜，让悬浮导航 / 工具栏边缘产生液体微折射效果
 */
(function () {
    "use strict";
    var root = document.documentElement;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reduceTransparency = window.matchMedia && window.matchMedia("(prefers-reduced-transparency: reduce)").matches;

    // ---- 1. 指针跟随高光（在支持精细指针的设备上启用） ----
    if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        var pending = null;
        var frame = 0;
        var targetSelector = ".place-card, .food-card, .guide-card, .resource-card, .quick-action, .quick-actions, .detail-card, .stat-box, .guide-place, .itinerary-day, .search-capsule, .glass-card, .gemini-card";

        document.addEventListener("pointermove", function (event) {
            var card = event.target && event.target.closest ? event.target.closest(targetSelector) : null;
            if (!card) return;
            pending = { card: card, x: event.clientX, y: event.clientY };
            if (frame) return;
            frame = requestAnimationFrame(function () {
                frame = 0;
                if (!pending) return;
                var rect = pending.card.getBoundingClientRect();
                pending.card.style.setProperty("--lg-x", (pending.x - rect.left) + "px");
                pending.card.style.setProperty("--lg-y", (pending.y - rect.top) + "px");
                pending = null;
            });
        }, { passive: true });
    }

    // ---- 2. 折射滤镜：只有 Chromium 支持 backdrop-filter: url(#svg) ----
    var isChromium = Boolean(window.chrome) || Boolean(navigator.userAgentData && navigator.userAgentData.brands &&
        navigator.userAgentData.brands.some(function (b) { return b.brand === "Chromium"; }));
    if (!isChromium || reduceTransparency || reduceMotion) return;
    if (!(window.CSS && CSS.supports && CSS.supports("backdrop-filter", "url(#lg-refract)"))) return;

    // 位移贴图：R 通道管左右、G 通道管上下；中间 50% 灰 = 不位移，越靠边位移越大（模拟厚玻璃边缘）
    var map = "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' preserveAspectRatio='none'>" +
        "<defs>" +
        "<linearGradient id='x' x1='0' x2='1' y1='0' y2='0'>" +
        "<stop offset='0' stop-color='#ff0000'/><stop offset='.16' stop-color='#800000'/>" +
        "<stop offset='.84' stop-color='#800000'/><stop offset='1' stop-color='#000000'/></linearGradient>" +
        "<linearGradient id='y' x1='0' x2='0' y1='0' y2='1'>" +
        "<stop offset='0' stop-color='#00ff00'/><stop offset='.22' stop-color='#008000'/>" +
        "<stop offset='.78' stop-color='#008000'/><stop offset='1' stop-color='#000000'/></linearGradient>" +
        "</defs>" +
        "<rect width='200' height='200' fill='url(#x)'/>" +
        "<rect width='200' height='200' fill='url(#y)' style='mix-blend-mode:screen'/>" +
        "</svg>";

    function install() {
        if (document.getElementById("lg-refract-svg")) return;
        var holder = document.createElement("div");
        holder.id = "lg-refract-svg";
        holder.setAttribute("aria-hidden", "true");
        holder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
        holder.innerHTML =
            "<svg width='0' height='0'><filter id='lg-refract' x='0' y='0' width='100%' height='100%' primitiveUnits='objectBoundingBox' color-interpolation-filters='sRGB'>" +
            "<feImage href=\"data:image/svg+xml;utf8," + encodeURIComponent(map) + "\" x='0' y='0' width='1' height='1' preserveAspectRatio='none' result='map'/>" +
            "<feDisplacementMap in='SourceGraphic' in2='map' scale='0.22' xChannelSelector='R' yChannelSelector='G'/>" +
            "</filter></svg>";
        document.body.appendChild(holder);
        root.classList.add("lg-refract");
    }
    if (document.body) install();
    else document.addEventListener("DOMContentLoaded", install);
})();
