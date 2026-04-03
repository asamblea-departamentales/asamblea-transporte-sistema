@props(['statePath'])

<div
    x-data="{
        canvas: null,
        ctx: null,
        drawing: false,
        lastX: 0,
        lastY: 0,

        init() {
            this.canvas = this.$refs.sigCanvas;
            this.ctx    = this.canvas.getContext('2d');
            this.ctx.strokeStyle = '#1e3a5f';
            this.ctx.lineWidth   = 2;
            this.ctx.lineCap     = 'round';
            this.ctx.lineJoin    = 'round';
        },

        getPos(e) {
            const rect = this.canvas.getBoundingClientRect();
            const src  = e.touches ? e.touches[0] : e;
            return {
                x: (src.clientX - rect.left) * (this.canvas.width  / rect.width),
                y: (src.clientY - rect.top)  * (this.canvas.height / rect.height),
            };
        },

        start(e) {
            e.preventDefault();
            this.drawing = true;
            const p = this.getPos(e);
            this.lastX = p.x;
            this.lastY = p.y;
        },

        draw(e) {
            if (!this.drawing) return;
            e.preventDefault();
            const p = this.getPos(e);
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
            this.lastX = p.x;
            this.lastY = p.y;
        },

        stop() {
            if (!this.drawing) return;
            this.drawing = false;
            const dataUrl = this.canvas.toDataURL('image/png');
            $wire.set('{{ $statePath }}', dataUrl);
        },

        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            $wire.set('{{ $statePath }}', null);
        }
    }"
    class="w-full"
>
    <div
        class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white"
        style="touch-action: none;"
    >
        <canvas
            x-ref="sigCanvas"
            width="600"
            height="180"
            style="width:100%; height:180px; cursor:crosshair; display:block;"
            @mousedown="start"
            @mousemove="draw"
            @mouseup="stop"
            @mouseleave="stop"
            @touchstart="start"
            @touchmove="draw"
            @touchend="stop"
        ></canvas>
    </div>

    <div class="mt-2 flex items-center gap-3">
        <button
            type="button"
            @click="clear"
            class="text-xs text-red-500 hover:text-red-700 underline"
        >
            ✕ Limpiar firma
        </button>
        <span class="text-xs text-gray-400">Dibuje su firma dentro del recuadro</span>
    </div>
</div>