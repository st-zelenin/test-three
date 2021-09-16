uniform float time;
uniform vec2 resolution;

void main()	{
    float x = mod(time + gl_FragCoord.x, 20.) < 10. ? 1. : 0.;
    float y = mod(time + gl_FragCoord.y, 20.) < 10. ? 1. : 0.;
    gl_FragColor = vec4(vec3(min(x, y)), 0.1);
    // gl_FragColor.a = 0.0;
}