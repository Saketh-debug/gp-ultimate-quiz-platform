import React, { useEffect, useRef } from "react";

const TRUST_BADGE_ICON_CLASSES = [
    "text-red-400",
    "text-orange-500",
    "text-orange-400",
];

class WebGLRenderer {
    constructor(canvas, scale, shaderSource) {
        this.canvas = canvas;
        this.scale = scale;
        this.gl = canvas.getContext("webgl2");
        this.program = null;
        this.vs = null;
        this.fs = null;
        this.buffer = null;
        this.shaderSource = shaderSource;
        this.mouseMove = [0, 0];
        this.mouseCoords = [0, 0];
        this.pointerCoords = [0, 0];
        this.nbrOfPointers = 0;
        this.vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;
        this.vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

        if (this.gl) {
            this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
        }
    }

    updateShader(source) {
        this.reset();
        this.shaderSource = source;
        this.setup();
        this.init();
    }

    updateMove(deltas) {
        this.mouseMove = deltas;
    }

    updateMouse(coords) {
        this.mouseCoords = coords;
    }

    updatePointerCoords(coords) {
        this.pointerCoords = coords;
    }

    updatePointerCount(count) {
        this.nbrOfPointers = count;
    }

    updateScale(scale) {
        if (!this.gl) return;
        this.scale = scale;
        this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }

    compile(shader, source) {
        if (!this.gl) return;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Shader compilation error:", this.gl.getShaderInfoLog(shader));
        }
    }

    test(source) {
        if (!this.gl) return "WebGL2 not supported";

        let result = null;
        const shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if (!shader) return "Unable to create fragment shader";

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            result = this.gl.getShaderInfoLog(shader);
        }

        this.gl.deleteShader(shader);
        return result;
    }

    reset() {
        if (!this.gl || !this.program) return;

        if (!this.gl.getProgramParameter(this.program, this.gl.DELETE_STATUS)) {
            if (this.vs) {
                this.gl.detachShader(this.program, this.vs);
                this.gl.deleteShader(this.vs);
            }

            if (this.fs) {
                this.gl.detachShader(this.program, this.fs);
                this.gl.deleteShader(this.fs);
            }

            this.gl.deleteProgram(this.program);
        }

        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            this.buffer = null;
        }
    }

    setup() {
        if (!this.gl) return;

        this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        if (!this.vs || !this.fs) return;

        this.compile(this.vs, this.vertexSrc);
        this.compile(this.fs, this.shaderSource);

        this.program = this.gl.createProgram();
        if (!this.program) return;

        this.gl.attachShader(this.program, this.vs);
        this.gl.attachShader(this.program, this.fs);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error(this.gl.getProgramInfoLog(this.program));
        }
    }

    init() {
        if (!this.gl || !this.program) return;

        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);

        const position = this.gl.getAttribLocation(this.program, "position");
        this.gl.enableVertexAttribArray(position);
        this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0);

        this.program.resolution = this.gl.getUniformLocation(this.program, "resolution");
        this.program.time = this.gl.getUniformLocation(this.program, "time");
        this.program.move = this.gl.getUniformLocation(this.program, "move");
        this.program.touch = this.gl.getUniformLocation(this.program, "touch");
        this.program.pointerCount = this.gl.getUniformLocation(this.program, "pointerCount");
        this.program.pointers = this.gl.getUniformLocation(this.program, "pointers");
    }

    render(now = 0) {
        if (!this.gl || !this.program || !this.buffer) return;

        if (this.gl.getProgramParameter(this.program, this.gl.DELETE_STATUS)) return;

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.uniform2f(this.program.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.program.time, now * 1e-3);
        this.gl.uniform2f(this.program.move, ...this.mouseMove);
        this.gl.uniform2f(this.program.touch, ...this.mouseCoords);
        this.gl.uniform1i(this.program.pointerCount, this.nbrOfPointers);
        this.gl.uniform2fv(this.program.pointers, this.pointerCoords);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}

class PointerHandler {
    constructor(element, scale) {
        this.scale = scale;
        this.active = false;
        this.pointers = new Map();
        this.lastCoords = [0, 0];
        this.moves = [0, 0];

        const map = (x, y) => [x * this.getScale(), element.height - y * this.getScale()];

        element.addEventListener("pointerdown", (event) => {
            this.active = true;
            this.pointers.set(event.pointerId, map(event.clientX, event.clientY));
        });

        element.addEventListener("pointerup", (event) => {
            if (this.count === 1) {
                this.lastCoords = this.first;
            }

            this.pointers.delete(event.pointerId);
            this.active = this.pointers.size > 0;
        });

        element.addEventListener("pointerleave", (event) => {
            if (this.count === 1) {
                this.lastCoords = this.first;
            }

            this.pointers.delete(event.pointerId);
            this.active = this.pointers.size > 0;
        });

        element.addEventListener("pointermove", (event) => {
            if (!this.active) return;

            this.lastCoords = [event.clientX, event.clientY];
            this.pointers.set(event.pointerId, map(event.clientX, event.clientY));
            this.moves = [this.moves[0] + event.movementX, this.moves[1] + event.movementY];
        });
    }

    getScale() {
        return this.scale;
    }

    updateScale(scale) {
        this.scale = scale;
    }

    get count() {
        return this.pointers.size;
    }

    get move() {
        return this.moves;
    }

    get coords() {
        return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0];
    }

    get first() {
        return this.pointers.values().next().value || this.lastCoords;
    }
}

// Martian Orange shader — deep red-orange dust-storm atmosphere
// Original cloud structure preserved; color palette shifted to Mars tones:
//   warm deep reds (#c1440e → 0.757, 0.267, 0.055)
//   bright Martian orange (#e8541a → 0.910, 0.329, 0.102)
//   dusty ochre highlights (#ff6b35 → 1.0, 0.420, 0.208)
const defaultShaderSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
* Recolored to Martian Orange palette
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(1.2+.05*i, .08)+i*i+T*1.2+.1*uv.x);
    // 5 visible streaks: short cycle, staggered so they spread across the screen
    // Phase offsets (i*0.8) ensure streaks are already on-screen at T=0
    float drift = mod(T*0.3 + i*0.8, 3.5) - 2.0;
    vec2 p=uv+vec2(drift, 0.0);
    float d=length(p);
    // Martian orange color palette
    vec3 marsColor = vec3(
      0.757 + 0.243*cos(sin(i)*1.0),
      0.180 + 0.149*cos(sin(i)*2.0),
      0.040 + 0.060*cos(sin(i)*3.0)
    );
    // Brighter streaks so multiple are clearly visible
    col+=.002/d*marsColor;
    float b=noise(i+p+bg*1.731);
    col+=.003*b/length(max(p,vec2(b*p.x*.02,p.y)));
    // Clamp d to [0,1] to prevent color blowout when streaks exit viewport
    col=mix(col,vec3(bg*.30,bg*.08,bg*.02),clamp(d,0.0,1.0));
  }
  O=vec4(col,1);
}`;

export const useShaderBackground = () => {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const rendererRef = useRef(null);
    const pointersRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return undefined;

        const canvas = canvasRef.current;
        const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

        const resize = () => {
            const nextScale = Math.max(1, 0.5 * window.devicePixelRatio);

            canvas.width = window.innerWidth * nextScale;
            canvas.height = window.innerHeight * nextScale;

            if (rendererRef.current) {
                rendererRef.current.updateScale(nextScale);
            }

            if (pointersRef.current) {
                pointersRef.current.updateScale(nextScale);
            }
        };

        const loop = (now) => {
            if (!rendererRef.current || !pointersRef.current) return;

            rendererRef.current.updateMouse(pointersRef.current.first);
            rendererRef.current.updatePointerCount(pointersRef.current.count);
            rendererRef.current.updatePointerCoords(pointersRef.current.coords);
            rendererRef.current.updateMove(pointersRef.current.move);
            rendererRef.current.render(now);
            animationFrameRef.current = window.requestAnimationFrame(loop);
        };

        rendererRef.current = new WebGLRenderer(canvas, dpr, defaultShaderSource);
        if (!rendererRef.current.gl) return undefined;

        pointersRef.current = new PointerHandler(canvas, dpr);
        rendererRef.current.setup();
        rendererRef.current.init();
        resize();

        if (rendererRef.current.test(defaultShaderSource) === null) {
            rendererRef.current.updateShader(defaultShaderSource);
        }

        loop(0);
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);

            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }

            if (rendererRef.current) {
                rendererRef.current.reset();
            }
        };
    }, []);

    return canvasRef;
};

export default function AnimatedShaderHero({
    trustBadge = {
        icons: ["🔥", "🚀", "⚡"],
        text: "Powered by Martian technology",
    },
    headline = {
        line1: "Explore The",
        line2: "Red Planet",
    },
    subtitle = "Journey beyond the horizon into the vast Martian frontier.",
    buttons = {
        primary: { text: "Get Started", onClick: () => { } },
        secondary: { text: "Learn More", onClick: () => { } },
    },
    className = "",
    contentClassName = "",
    children,
}) {
    const canvasRef = useShaderBackground();

    return (
        <div className={`relative h-screen w-full overflow-hidden bg-black ${className}`}>
            <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full touch-none object-contain"
                style={{ background: "black" }}
            />

            <div className={`absolute inset-0 z-10 text-white ${contentClassName}`}>
                {children ? (
                    children
                ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                        {trustBadge ? (
                            <div className="animate-fade-in-down mb-8">
                                {/* Trust badge: Martian orange border/bg instead of amber */}
                                <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-700/10 px-6 py-3 text-sm backdrop-blur-md">
                                    {trustBadge.icons?.length ? (
                                        <div className="flex gap-1">
                                            {trustBadge.icons.map((icon, index) => (
                                                <span
                                                    key={`${icon}-${index}`}
                                                    className={TRUST_BADGE_ICON_CLASSES[index] || "text-orange-500"}
                                                >
                                                    {icon}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                    <span className="text-orange-200">{trustBadge.text}</span>
                                </div>
                            </div>
                        ) : null}

                        <div className="mx-auto max-w-5xl space-y-6 px-4 text-center">
                            <div className="space-y-2">
                                {/* Headline line 1: deep crimson → bright Martian orange */}
                                <h1 className="animate-fade-in-up animation-delay-200 bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 bg-clip-text text-5xl font-bold text-transparent md:text-7xl lg:text-8xl">
                                    {headline.line1}
                                </h1>
                                {/* Headline line 2: orange → red-orange dust */}
                                <h1 className="animate-fade-in-up animation-delay-400 bg-gradient-to-r from-orange-400 via-red-500 to-red-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl lg:text-8xl">
                                    {headline.line2}
                                </h1>
                            </div>

                            <div className="animate-fade-in-up animation-delay-600 mx-auto max-w-3xl">
                                {/* Subtitle: warm off-white with orange tint */}
                                <p className="text-lg font-light leading-relaxed text-orange-100/85 md:text-xl lg:text-2xl">
                                    {subtitle}
                                </p>
                            </div>

                            {buttons ? (
                                <div className="animate-fade-in-up animation-delay-800 mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                                    {buttons.primary ? (
                                        /* Primary CTA: Martian orange → deep red gradient */
                                        <button
                                            onClick={buttons.primary.onClick}
                                            className="rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-orange-600 hover:shadow-xl hover:shadow-red-600/30"
                                        >
                                            {buttons.primary.text}
                                        </button>
                                    ) : null}
                                    {buttons.secondary ? (
                                        /* Secondary CTA: ghost with Martian orange tint */
                                        <button
                                            onClick={buttons.secondary.onClick}
                                            className="rounded-full border border-red-500/30 bg-red-700/10 px-8 py-4 text-lg font-semibold text-orange-100 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-red-500/50 hover:bg-red-700/20"
                                        >
                                            {buttons.secondary.text}
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}