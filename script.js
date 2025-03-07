window.onload = function() {
  const container = document.getElementById('circle-container');
  const images = container.getElementsByClassName('circle-image');
  const totalImages = images.length;
  const radius = container.offsetWidth / 2 - images[0].offsetWidth / 2;
  const centerX = container.offsetWidth / 2;
  const centerY = container.offsetHeight / 2;

  let angleOffset = 0;

  function arrangeImages() {
    for (let i = 0; i < totalImages; i++) {
      const angle = (i / totalImages) * (2 * Math.PI) + angleOffset;
      const x = centerX + radius * Math.cos(angle) - images[i].offsetWidth / 2;
      const y = centerY + radius * Math.sin(angle) - images[i].offsetHeight / 2;

      images[i].style.left = `${x}px`;
      images[i].style.top = `${y}px`;

      const distanceFromHorizontalCenter = Math.abs(x - centerX);
      const scale = 1 + (1.5 * (distanceFromHorizontalCenter / radius));
      images[i].style.transform = `scale(${Math.max(1, Math.min(scale, 2.5))})`;
    }
  }

  arrangeImages();

  window.addEventListener('wheel', function(event) {
    const delta = event.deltaY > 0 ? 0.1 : -0.1;
    angleOffset += delta;
    arrangeImages();
  });
};
