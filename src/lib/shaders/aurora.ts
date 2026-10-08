// GLSL Fragment Shader for Aurora/Fog effect
export const auroraFragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uMouseX;
uniform float uMouseY;
uniform float uIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

#define PI 3.14159265359
#define TAU 6.28318530718

// Noise functions
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// Voronoi noise for cellular patterns
float voronoi(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float minDist = 1.0;
  
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash(i + neighbor) * 2.0 - 1.0;
      float dist = length(f - neighbor - point);
      minDist = min(minDist, dist);
    }
  }
  
  return minDist;
}

// Flow field
vec2 flowField(vec2 p, float t) {
  float n = fbm(p * 2.0 + t * 0.1, 4);
  float angle = n * TAU * 2.0;
  return vec2(cos(angle), sin(angle));
}

// Main aurora function
vec3 aurora(vec2 uv, float t) {
  vec3 color = vec3(0.0);
  
  // Multiple layers of aurora
  for (int i = 0; i < 3; i++) {
    float layer = float(i) + 1.0;
    vec2 p = uv * (3.0 + layer) + vec2(t * 0.02 * (1.0 + layer * 0.3), t * 0.01 * (1.0 + layer * 0.2));
    
    // Flow distortion
    vec2 flow = flowField(p, t);
    p += flow * 0.3 / layer;
    
    // FBM for organic shape
    float n = fbm(p, 4);
    n = smoothstep(0.3, 0.7, n);
    
    // Color bands
    vec3 layerColor = mix(uColor1, uColor2, float(i) / 2.0);
    layerColor = mix(layerColor, uColor3, n * 0.5);
    
    // Vertical gradient
    float vGrad = smoothstep(1.0, 0.0, uv.y);
    n *= vGrad;
    
    // Add some horizontal variation
    n *= 0.5 + 0.5 * sin(uv.x * PI * 4.0 + t * 0.5 + layer);
    
    color += layerColor * n * (1.0 / layer) * uIntensity;
  }
  
  // Add subtle sparkles
  vec2 sparkleUV = uv * 50.0;
  float sparkles = 0.0;
  for (int i = 0; i < 3; i++) {
    vec2 s = fract(sparkleUV + vec2(float(i) * 17.0, float(i) * 23.0));
    sparkles += step(0.995, hash(s + vec2(t * 0.1, t * 0.05))) * (1.0 - uv.y);
  }
  color += vec3(1.0, 1.0, 0.9) * sparkles * 0.3 * uIntensity;
  
  return color;
}

// Vignette
float vignette(vec2 uv) {
  float dist = length(uv - 0.5) * 1.5;
  return smoothstep(1.0, 0.5, dist);
}

// Film grain
float filmGrain(vec2 uv, float t) {
  return hash(floor(uv * 1000.0 + t * 10.0)) - 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 centeredUV = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  
  // Mouse influence
  vec2 mouseUV = vec2(uMouseX, 1.0 - uMouseY);
  float mouseDist = length(centeredUV - (mouseUV - 0.5) * 2.0);
  float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * 0.3;
  
  // Aurora
  vec3 color = aurora(centeredUV, uTime);
  
  // Base darkness
  vec3 baseColor = vec3(0.02, 0.03, 0.06);
  color = mix(baseColor, color, 0.8);
  
  // Mouse interaction
  color += vec3(0.1, 0.15, 0.2) * mouseInfluence;
  
  // Vignette
  float vig = vignette(uv);
  color *= vig;
  
  // Film grain
  float grain = filmGrain(uv, uTime) * 0.02;
  color += vec3(grain);
  
  // Subtle scanlines
  float scanlines = sin(gl_FragCoord.y * 2.0 + uTime * 0.1) * 0.01;
  color += vec3(scanlines);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

export const particleVertexShader = `
attribute float aSize;
attribute vec3 aColor;
attribute float aOpacity;
attribute float aRotation;
attribute float aSpeed;
attribute float aDelay;

uniform float uTime;
uniform float uProgress;

varying vec3 vColor;
varying float vOpacity;

void main() {
  vColor = aColor;
  vOpacity = aOpacity;
  
  float t = uTime * aSpeed + aDelay;
  
  vec3 pos = position;
  
  // Spiral motion
  float angle = t + position.x * 10.0;
  float radius = 0.5 + position.y * 0.5;
  pos.x = cos(angle) * radius;
  pos.y = sin(angle) * radius + t * 0.1;
  pos.z = position.z;
  
  // Drift
  pos.x += sin(t * 0.5 + position.x) * 0.1;
  pos.y += cos(t * 0.3 + position.y) * 0.1;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const particleFragmentShader = `
varying vec3 vColor;
varying float vOpacity;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
  
  // Soft glow
  vec3 color = vColor * (1.0 + (1.0 - dist) * 2.0);
  
  gl_FragColor = vec4(color, alpha);
}
`;