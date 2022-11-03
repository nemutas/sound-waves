struct TextureData {
  sampler2D texture;
  vec2 uvScale;
};

uniform TextureData u_image;
uniform float u_time;
uniform float u_noiseTime;
uniform float u_uvOffset;
uniform float u_split;
uniform float u_progress;
varying vec2 v_uv;
varying vec3 v_normal;

const vec3 LightPos = vec3(-5, 10, 5);
const float PI = 3.14159265358979;

#include '../glsl/math.glsl'

vec4 getTexture(TextureData data) {
  vec2 uv = (v_uv - 0.5) * data.uvScale + 0.5;

  float distortion = step(0.0, sin(uv.x * PI * u_split)) * 2.0 - 1.0;
  uv.y += distortion * 0.05 * step(0.5, u_split) * u_progress;

  uv.y += u_uvOffset;
  uv.y -= u_time * 0.05;

  float r = texture2D(data.texture, uv + v_normal.xy * 0.05).r;
  float g = texture2D(data.texture, uv + v_normal.xy * 0.07).g;
  float b = texture2D(data.texture, uv + v_normal.xy * 0.09).b;
  return vec4(r, g, b, 1.0);
}

void main() {
  vec4 tex = getTexture(u_image);

  float light = dot(normalize(LightPos), v_normal);
  vec3 color = vec3(light - 0.5);
  tex.rgb += color;

  float noise = rand(v_uv + sin(u_noiseTime));
  tex.rgb += noise * 0.2;

  gl_FragColor = tex;
}