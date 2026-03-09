import './style.css';

const btn = document.querySelector<HTMLButtonElement>('#action-btn');

btn?.addEventListener('click', (e) => {
  const rect = btn.getBoundingClientRect();
  
  // Create a sparkle effect
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    
    // Randomize position around the button click
    const x = e.clientX - rect.left + (Math.random() - 0.5) * 40;
    const y = e.clientY - rect.top + (Math.random() - 0.5) * 40;
    
    const size = Math.random() * 8 + 4;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    
    btn.appendChild(sparkle);
    
    // Clean up
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }
  
  const subtitle = document.querySelector<HTMLParagraphElement>('#greeting-subtitle');
  if (subtitle) {
    subtitle.innerHTML = 'You clicked the button! ✨';
    
    // Add a bounce animation class and remove it
    subtitle.style.transform = 'scale(1.1)';
    setTimeout(() => {
      subtitle.style.transform = 'scale(1)';
    }, 200);
  }
});
