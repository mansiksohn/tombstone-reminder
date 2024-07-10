import React from 'react';

function GroundSection() {
  return (
    <div className="ground-container">
      <img src={`${process.env.PUBLIC_URL}/assets/images/ground.jpg`} alt="Ground" className="ground-image" />
    </div>
  );
}

export default GroundSection;
