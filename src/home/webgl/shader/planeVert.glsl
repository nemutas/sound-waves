struct WaveData {
  float progress;
  vec2 center;
  float frequency;
  float amplitude;
  float speed;
};

uniform WaveData[WAVE_AMOUNT] u_waves;
uniform float u_aspect;
uniform float u_time;
varying vec2 v_uv;
varying vec3 v_normal;

const float PI = 3.1415926535;

float wave(vec3 v, WaveData data) {
  // calc wave
  vec2 p = v.xy * vec2(u_aspect, 1.0);
  float dist = distance(p, data.center);
  float wave = sin(dist * PI * 2.0 * data.frequency - u_time * data.speed) * data.amplitude;
  // calc decay
  float radius = 0.1 + data.amplitude;
  float spread = 1.0 + data.amplitude * 2.0;
  float decay = 1.0 - smoothstep(data.progress * spread, data.progress * spread + radius, dist);
  float decayFromCenter = smoothstep(-0.3 + data.progress, data.progress * 2.0, dist);
  wave *= decay; // 端に行くほど減衰する
  wave *= decayFromCenter; // 中心から徐々に減衰する
  wave *= smoothstep(0.0, 0.5, 1.0 - data.progress); // 全体の振幅を減衰する
  float edge = step(0.001, data.progress); // progress ≒ 0 のときは、waveを発生させない

  return wave * edge;
}

vec3 displace(vec3 v) {
  vec3 result = v;

  for(int i = 0; i < WAVE_AMOUNT; i++) {
    float wave = wave(v, u_waves[i]);
    result.z += normal.z * wave;
  }

  return result;
}

#include '../glsl/recalcNormal.glsl'

void main() {
  vec3 pos = displace(position);
  vec3 norm = recalcNormal(pos);

  v_uv = uv;
  v_normal = normalize(normalMatrix * norm);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}