import * as THREE from 'three';
import fragment from "./fragment.glsl";
import vertex from "./vertex.glsl";

export function run(video) {
  const canvas = document.querySelector('#c');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('webgl');

  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 75; // field of view
  const aspect = video.videoWidth / video.videoHeight;  // the canvas default
  console.log('aspect', aspect);
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  window.addEventListener('resize', () => {
    ctx.canvas.height = ctx.canvas.width / aspect;
  });

  let videoMesh;
  {
    const texture = new THREE.VideoTexture(video);
    // const material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

    // const videoBox = new THREE.BoxBufferGeometry();
    // videoMesh = new THREE.Mesh(videoBox, material);
    scene.background = texture;
  }


  let uniforms;
  const startTime = Date.now();
  {
    uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
  }

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
  ];

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  let line;
  let points = [];
  {
    const material = new THREE.LineBasicMaterial({
      color: 0xa4a832
    });

    points.push(new THREE.Vector3(-1.5, -1, 0));
    points.push(new THREE.Vector3(0, 1.5, 0));
    points.push(new THREE.Vector3(1.5, -1, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  let curve;
  let curveObject;
  // const clock = new THREE.Clock();
  // let time = 0;
  {
    curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(-1, 1.5, 0),
      new THREE.Vector3(1.5, 1.5, 0),
      new THREE.Vector3(1, 0, 0)
    );

    // curve = new THREE.CatmullRomCurve3([
    //   new THREE.Vector3(-1.5, 0, 1.5),
    //   new THREE.Vector3(-1, 1, 1),
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(1, -1, 1),
    //   new THREE.Vector3(1.5, 0, 1.5)
    // ]);

    const points = curve.getPoints(50);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff
    });

    curveObject = new THREE.Line(geometry, material);

    scene.add(curveObject);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }


  function render(time) {
    time *= 0.001;  // convert time to seconds

    // points = points.map((point) => [point[0], point[1] * (1 + amountToAdd), point[2]]);
    // line.setPoints(points.flat());

    if (resizeRendererToDisplaySize(renderer)) {
      // const canvas = renderer.domElement;
      // camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // line.rotateX(time);

    curve.v1 = new THREE.Vector3(-1 * time % 10, 0, 0);
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
    curveObject.geometry.dispose();
    curveObject.geometry = curveGeometry;

    // curve.points[1].y = Math.sin(time);
    // const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
    // curveObject.geometry.dispose();
    // curveObject.geometry = curveGeometry;

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    const elapsedMilliseconds = Date.now() - startTime;
    const elapsedSeconds = elapsedMilliseconds / 1000.;
    uniforms.time.value = 60. * elapsedSeconds;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}