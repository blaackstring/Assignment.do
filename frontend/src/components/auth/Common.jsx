import React from 'react'

import Particles from '../bg/Particles'



const Common = ({children}) => {
  return (
 

     
 
<div className='relative'>
<div style={{ width: '100%', height: '700px',  }}>
  <Particles
    particleColors={['#ffffff', '#ffffff']}
    particleCount={400}
    particleSpread={20}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover={true}
    alphaParticles={true}
    disableRotation={false}
  />

<div className=''>
{children}
</div>

</div>

</div>
  
  )
}

export default Common
