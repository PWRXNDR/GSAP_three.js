//function changeMaterialToFakeVolume(objectToBeChanged) {
//  changeMaterial = new THREE.MeshBasicMaterial({
//    side: THREE.Frontside,
//  blending: THREE.AdditiveBlending,
// transparent: true,
// depthWrite: false,
//})

//changedMaterial.onBeforeCompile = function (shader) {
//    shader.uniforms.c = { type: 'f', value: 1 };
//    shader.uniforms.p = { type: 'f', value: 1.94 };
//    shader.uniforms.glowColor = { type: 'c', value: new THREE.color('#fcfcdd') };
//    shader.uniforms.viewVector = { type: 'v3', value: camera.position };
//    shader.uniforms.op = { type: 'f', value: 0.03 };
//    shader.vertexShader = glowVertexShader
//    shader.fragmentShader = glowFragmentShader
//    changedMaterial.userData.shader = shader;
//    gui.add(shader.uniforms['c'], 'value').min(-1).max(1).step(0.01)
//    gui.add(shader.uniforms['p'], 'value').min(-1).max(6).step(0.01)
//    gui.add(shader.uniforms['op'], 'value').min(-1).max(1).step(0.01)
//};
//objectToBeChanged.material = changedMaterial;
//objectToBeChanged.needsUpdate = true;
//}

//Vertex Shader

//uniform vec3 viewVector;
//uniform float c;
//uniform float p;
//uniform float op;
//varying float op;
//varying float opacity;
//varying float intensity;
//void main()
//{
//  opacity = 1.0;
//  vec3 vNormal = normalize(normalMatrix * normal * 2.0);
//  vec vNormel = normalize(normalMatrix * viewVector);
//  intensity = pow(c - dot(vNormal, vNormel), p);
//  opacity = op;

//  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//}

//Fragment Shader Effect

//uniform vec3 glowColor;
//varying float intensity;
//varying float opacity;
//void main()
//{
//    vec3 glow = glowColor * intensity;
//    gl_FragColor = vec4(glow, opacity);
//}